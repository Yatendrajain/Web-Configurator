import { tactonApiRequest } from "@/app/lib/api/tacton_client";
import { ListOrdersDataRequest } from "./models";
import { REQUEST_METHODS } from "@/constants/common/enums/request_methods";
import { xmlStringToJson } from "@/utils/api/xml_to_json";
import {
  normalizeAttributes,
  NormalizeAttributesType,
} from "@/utils/api/normalize_attributes";
import {
  ListOrderHistoriesRequest,
  ListOrderHistoriesRequestSchema,
} from "../../order_histories/list/models";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { orderHistoriesColNames as OHCN } from "@/constants/api/constants/column_names";
import { ExecuteListOrderHistories } from "../../order_histories/list/list_order_histories";
import { BASE_SUBM_VERSION } from "@/constants/api/constants/submission_versions";

interface Attr {
  name: string;
  value?: string;
}

interface ResourceItem {
  attributes?: { attribute: Attr[] } | NormalizeAttributesType;
  [key: string]: unknown;
}

interface TactonJSONData {
  list?: {
    resource?: ResourceItem[];
  };
}

interface OrderHistoryItem {
  itemNumber: string;
  createdAt: string;
  submissionVersion: string;
}

interface OrderHistoryResponse {
  list: Array<OrderHistoryItem>;
  [key: string]: unknown;
}

export const ExecuteListOrdersData = async (
  req: ListOrdersDataRequest,
): Promise<[object, number]> => {
  let queryString = `?`;

  queryString = applyFiltersForData(queryString, req.filters);

  queryString = applyExcludeFields(queryString, req.excludeFields);

  queryString = applySortingAndOrdering(req, queryString);

  queryString = applyPagination(req, queryString);

  const result = await getData(req, queryString);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const applyFiltersForData = (
  queryString: string,
  reqFilters: ListOrdersDataRequest["filters"],
): string => {
  for (const key in reqFilters) {
    if (Object.prototype.hasOwnProperty.call(reqFilters, key)) {
      queryString += `&where=${key}=${(reqFilters as Record<string, string>)[key]}`;
    }
  }

  return queryString;
};

const applyExcludeFields = (
  queryString: string,
  excludeFields: string[],
): string => {
  for (const field of excludeFields) {
    queryString += `&excludeAttribute=${field}`;
  }

  return queryString;
};

const applySortingAndOrdering = (
  req: ListOrdersDataRequest,
  queryString: string,
): string => {
  return `${queryString}&order=${req.orderBy}&sort=${req.sortBy}`;
};

const applyPagination = (
  req: ListOrdersDataRequest,
  queryString: string,
): string => {
  return `${queryString}&limit=${req.pageLimit}&offset=${req.pageLimit * (req.page - 1)}`;
};

const getData = async (
  req: ListOrdersDataRequest,
  queryString: string,
): Promise<object> => {
  const url = `${process.env.TACTON_BASE_URL}/${process.env.TACTON_API_VERSION}/InstalledBase/list${queryString}`;

  const res = await tactonApiRequest(REQUEST_METHODS.GET, url, {
    headers: {
      "Content-Type": "application/xml",
    },
  });

  const resXML = await res.text();

  const resJSON = (await xmlStringToJson(resXML)) as object;

  return await normalizeResDataAndAddSubVersions(
    resJSON,
    req.includeResourceDetails,
  );
};

const normalizeResDataAndAddSubVersions = async (
  data: TactonJSONData,
  includeResourceDetails: boolean,
) => {
  const rawData: Array<ResourceItem> | ResourceItem =
    data?.list?.resource || [];
  const result: { list: Array<ResourceItem> } = { list: [] };
  const itemNumbers: Array<string> = [];

  if (!Array.isArray(rawData)) {
    result.list = [rawData];
  } else {
    result.list = rawData;
  }

  result.list.forEach((item) => {
    item.attributes = normalizeAttributes(
      (item.attributes?.attribute as Attr[]) || [],
    ) as NormalizeAttributesType;
    if (item.attributes?.itemNumber)
      itemNumbers.push(item.attributes.itemNumber);
  });

  if (!includeResourceDetails) {
    result.list = result.list.map(({ id, attributes }) => ({ id, attributes }));
  }

  const req = getOrderHistoriesParsedParams(itemNumbers);

  const [res, statusCode] = await ExecuteListOrderHistories(req);

  if (statusCode === 200) {
    const orderHistoryRes = res as OrderHistoryResponse;
    const itemNumbersmp = mapItemNumbers(
      orderHistoryRes.list as Array<OrderHistoryItem>,
    );

    result.list.forEach((item) => {
      if (
        item.attributes &&
        item.attributes.constructor === Object &&
        OHCN.itemNumber in item.attributes &&
        item.attributes.itemNumber
      ) {
        item.attributes.submissionVersion =
          itemNumbersmp[
            (item.attributes as Record<string, string | null>)
              .itemNumber as string
          ] || BASE_SUBM_VERSION;
      } else if (item.attributes && item.attributes.constructor === Object) {
        (item.attributes as Record<string, string | null>).submissionVersion =
          BASE_SUBM_VERSION;
      }
    });
  }

  return result;
};

const getPaginationData = async (req: ListOrdersDataRequest) => {
  return {
    page: req.page,
    pageLimit: req.pageLimit,
  };
};

const getOrderHistoriesParsedParams = (
  itemNumbers: Array<string>,
): ListOrderHistoriesRequest => {
  const reqBody = {
    filters: { itemNumbers: itemNumbers },
    includeFields: {
      orderHistories: [OHCN.itemNumber, OHCN.submissionVersion, OHCN.createdAt],
    },
    includeUserDetails: false,
    includeProductTypeDetails: false,
    includeLookupVersionDetails: false,
    paginationDataRequired: false,
    maxPageLimit: true,
    orderBy: ORDER_BY.ASC,
    sortBy: OHCN.createdAt,
  };

  return ListOrderHistoriesRequestSchema.parse(reqBody);
};

const mapItemNumbers = (list: Array<OrderHistoryItem>) => {
  const mp: Record<string, string> = {};

  list.forEach((historyItem) => {
    mp[historyItem.itemNumber] = historyItem.submissionVersion;
  });

  return mp;
};
