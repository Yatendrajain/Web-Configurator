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
import { FIRST_SUBM_VERSION } from "@/constants/api/constants/submission_versions";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookEntries } from "@/app/api/lookup_entries/list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "@/app/api/lookup_entries/list/models";
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
  changedOrderData: {
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
  const orderHistory = await getOrderHistory(req.orderHistoryId);

  let encodedOrderData = orderHistory.encodedOrderData;

  if (orderHistory.submissionVersion != FIRST_SUBM_VERSION)
    encodedOrderData = await getFirstSubmission(orderHistory.itemNumber);

  const mappings = await getRespectiveCFCOs(orderHistory, encodedOrderData);
  const [dictionary, optionsMap] = getCFCOMappings(mappings);

  return [
    {
      metadata: getOrderMetadata(orderHistory),
      originalData: encodedOrderData,
      orderHistory,
      dictionary,
      optionsMap,
    },
    200,
  ];
};

const getOrderHistory = async (orderHistoryId: string) => {
  const payload = {
    filters: {
      id: orderHistoryId,
    },
    includeFields: {
      orderHistories: giveDiffArr(Object.keys(OHCN), [OHCN.decodedOrderData]),
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

  if (res.list.length === 0) throw new Error("Invalid Order History!");

  return res.list[0];
};

const getFirstSubmission = async (itemNumber: string) => {
  const payload = {
    filters: {
      itemNumber: itemNumber,
      submissionVersion: FIRST_SUBM_VERSION,
    },
    includeFields: {
      orderHistories: [OHCN.encodedOrderData],
    },
    includeLookupVersionDetails: false,
    includeUserDetails: false,
    includeProductTypeDetails: false,
    pageLimit: 1,
    page: 1,
  };

  const [res] = (await ExecuteListOrderHistories(
    ListOrderHistoriesRequestSchema.parse(payload),
  )) as [ListOrderHistoriesResponse, number];

  if (res.list.length === 0) throw new Error("Invalid First Order History!");

  return res.list[0].encodedOrderData;
};

const getRespectiveCFCOs = async (
  orderHistory: OrderHistoryItem,
  encodedOrderData: TactonItem,
) => {
  const identifiers = [
    ...Object.keys(JSON.parse(encodedOrderData.attributes.configurationString)),
    ...Object.keys(orderHistory.changedOrderData.mappedSection || {}),
    ...Object.keys(orderHistory.changedOrderData.unmappedSection || {}),
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
      finalizedDate: orderHistory.encodedOrderData.attributes.finalizedDate,
      submittedAt: orderHistory.createdAt,
    },
  };
};
