import {
  lookupEntriesColNames,
  lookupVersionsColNames,
  orderHistoriesColNames as OHCN,
  productTypesColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";
import { GetCloneOrderDataRequest } from "./models";
import { giveDiffArr } from "@/utils/api/diff_arr";
import { ExecuteListOrderHistories } from "@/app/api/order_histories/list/list_order_histories";
import { ListOrderHistoriesRequestSchema } from "@/app/api/order_histories/list/models";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookEntries } from "@/app/api/lookup_entries/list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "@/app/api/lookup_entries/list/models";
import { CustomAPIError } from "@/utils/api/custom_error";
import { getCFCOMappings, MappingItem } from "@/utils/common/get_cfco_mappings";

interface TactonItem {
  attributes: {
    configurationString: string;
    finalizedDate: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface OrderHistoryItem {
  itemNumber: string;
  itemNumberVersion: string;
  lookupVersionId: string;
  encodedOrderData: TactonItem;
  submissionVersion: string;
  encodedChangedOrderData: {
    mappedSection: Record<string, string>;
    unmappedSection: Record<string, string>;
  };
  productTypeDetails: Record<string, string>;
  lookupVersionDetails: Record<string, string>;
  createdAt: string;
}

interface ListOrderHistoriesResponse {
  list: Array<OrderHistoryItem>;
  page: number;
  pageLimit: number;
}

interface ListLookupEntriesResponse {
  list: Array<MappingItem>;
  [key: string]: unknown;
}

export const ExecuteGetCloneOrderData = async (
  req: GetCloneOrderDataRequest,
): Promise<[object, number]> => {
  const orderHistory = await getOrderHistory(
    req.orderHistoryId,
    req.includeDecodedData,
    req.includeEncodedData,
  );

  let mappings: Array<MappingItem> = [];
  let dictionary: Record<string, string> = {};
  let optionsMap: Record<string, string[]> = {};
  if (req.includeMappingAndDictionary) {
    mappings = await getRespectiveCFCOs(
      orderHistory,
      orderHistory.encodedOrderData,
    );

    [dictionary, optionsMap] = getCFCOMappings(mappings);
  }

  return [
    {
      metadata: getOrderMetadata(orderHistory),
      orderHistory,
      ...(req.includeMappingAndDictionary ? { dictionary, optionsMap } : {}),
    },
    200,
  ];
};

const getOrderHistory = async (
  orderHistoryId: string,
  includeDecodedData: boolean,
  includeEncodedData: boolean,
) => {
  const notInclude = [];
  if (!includeDecodedData) {
    notInclude.push(OHCN.decodedOrderData);
    notInclude.push(OHCN.decodedChangedOrderData);
  }

  if (!includeEncodedData) {
    notInclude.push(OHCN.encodedOrderData);
    notInclude.push(OHCN.encodedChangedOrderData);
  }

  const payload = {
    filters: {
      id: orderHistoryId,
    },
    includeFields: {
      orderHistories: giveDiffArr(Object.keys(OHCN), notInclude),
      users: [usersColNames.id, usersColNames.name],
      productTypes: [
        productTypesColNames.id,
        productTypesColNames.name,
        productTypesColNames.productTypeCode,
      ],
      lookupVersions: [
        lookupEntriesColNames.id,
        lookupVersionsColNames.versionName,
      ],
    },
    includeLookupVersionDetails: true,
    includeUserDetails: true,
    includeProductTypeDetails: true,
    pageLimit: 1,
    page: 1,
  };

  const [res] = (await ExecuteListOrderHistories(
    ListOrderHistoriesRequestSchema.parse(payload),
  )) as [ListOrderHistoriesResponse, number];

  if (res.list.length === 0)
    throw new CustomAPIError({
      clientMessage: "Order history not found!",
      innerError: "Order history not found!",
      statusCode: 404,
    });

  return res.list[0];
};

const getRespectiveCFCOs = async (
  orderHistory: OrderHistoryItem,
  encodedOrderData: TactonItem,
) => {
  let encodedOrderDataObject: Record<string, string> = {};
  if (encodedOrderData?.attributes?.configurationString)
    encodedOrderDataObject = JSON.parse(
      encodedOrderData.attributes.configurationString,
    );
  else {
    if (encodedOrderData?.mappedSection)
      encodedOrderDataObject = {
        ...encodedOrderData.mappedSection,
        ...encodedOrderDataObject,
      };
    if (encodedOrderData?.unmappedSection)
      encodedOrderDataObject = {
        ...encodedOrderData.unmappedSection,
        ...encodedOrderDataObject,
      };
  }

  const identifiers = [
    ...Object.keys(encodedOrderDataObject),
    ...Object.keys(orderHistory.encodedChangedOrderData.mappedSection || {}),
    ...Object.keys(orderHistory.encodedChangedOrderData.unmappedSection || {}),
  ];

  const uniqueIdentifiers = Array.from(
    new Set(identifiers.filter((item) => item != null)),
  );

  const payload = {
    filters: {
      lookupVersionId: orderHistory.lookupVersionId,
      type: LOOKUP_ENTRY_TYPES.CF,
      identifiers: uniqueIdentifiers,
    },
    includeFields: {
      lookupEntries: [
        lookupEntriesColNames.identifier,
        lookupEntriesColNames.description,
      ],
      availableIdentifiers: [
        lookupEntriesColNames.identifier,
        lookupEntriesColNames.description,
      ],
    },
    getLatestVersionData: false,
    includeLookupVersionInfo: false,
    showMapping: true,
    maxPageLimit: true,
    sortBy: lookupEntriesColNames.identifier,
    orderBy: ORDER_BY.ASC,
  };

  const [res] = (await ExecuteListLookEntries(
    ListLookupEntriesRequestSchema.parse(payload),
  )) as [ListLookupEntriesResponse, number];

  return res.list;
};

const getOrderMetadata = (orderHistory: OrderHistoryItem) => {
  return {
    lookupVersionDetails: orderHistory.lookupVersionDetails,
    productTypeDetails: orderHistory.productTypeDetails,
    orderDetails: {
      itemNumber: orderHistory.itemNumber,
      version: orderHistory.itemNumberVersion,
      submissionVersion: orderHistory.submissionVersion,
      finalizedDate:
        orderHistory.encodedOrderData?.attributes?.finalizedDate || "NA",
      submittedAt: orderHistory.createdAt,
    },
  };
};
