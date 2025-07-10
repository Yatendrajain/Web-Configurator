import { SessionSchemaDetails } from "@/app/api/middlewares/models";
import { SubmitCloneOrderRequest } from "./models";
import db from "@/db/client";
import { orderHistories } from "@/db/schema";
import { desc, eq, InferInsertModel } from "drizzle-orm";
import { BASE_SUBM_VERSION } from "@/constants/api/constants/submission_versions";
import { incrementNumericString } from "@/utils/api/increment_numric_string";
import { TxType } from "@/constants/api/types/db_types";
import { submitToPipeline } from "@/utils/api/submit_to_azure_pipeline";
import { ExecuteListOrderHistories } from "../../list/list_order_histories";
import { ListOrderHistoriesRequestSchema } from "../../list/models";
import { CustomAPIError } from "@/utils/api/custom_error";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import {
  lookupEntriesColNames,
  lookupVersionsColNames,
} from "@/constants/api/constants/column_names";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookEntries } from "@/app/api/lookup_entries/list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "@/app/api/lookup_entries/list/models";
import { getCFCOMappings, MappingItem } from "@/utils/common/get_cfco_mappings";

interface ListLookupEntriesResponse {
  list: Array<MappingItem>;
  [key: string]: unknown;
}

interface OrderHistoryItem {
  id: string;
  submissionVersion: string;
  itemNumber: string;
  itemNumberVersion: string;
  orderName: string;
  clonedFromVersion?: string;
  productTypeId: string;
  lookupVersionId: string;
  encodedOrderData: Record<string, unknown>;
  decodedOrderData: Record<string, unknown>;
  paxMajor: string;
  paxMinor: string;
  pipelineStatus?: string;
  pipelineStatusUrl?: string;
  productNo?: string;
  unitId?: number;
  dataServerArea?: string;
  alarmServerArea?: string;
  processArea?: string;
  encodedChangedOrderData?: Record<string, unknown>;
  decodedChangedOrderData?: Record<string, unknown>;
  createdByUserId: string;
  createdAt: Date;
  [key: string]: unknown;
}

interface ListOrderHistoriesResponse {
  list: Array<OrderHistoryItem>;
  [key: string]: unknown;
}

export const ExecuteSubmitCloneOrder = async (
  req: SubmitCloneOrderRequest,
  session: SessionSchemaDetails,
): Promise<[object, number]> => {
  const [res, statusCode] = await db.transaction(async (tx) => {
    try {
      const res = await SubmitCloneOrder(req, session, tx);
      return [res, 200];
    } catch (error) {
      try {
        tx.rollback();
      } finally {
        throw error;
      }
    }
  });

  return [res, statusCode];
};

export const SubmitCloneOrder = async (
  req: SubmitCloneOrderRequest,
  session: SessionSchemaDetails,
  tx: TxType,
): Promise<object> => {
  const orderHistory = await getOrderHistoryById(req.clonedFromOrderHistoryId);

  verifyChangedCFKeys(
    orderHistory.encodedChangedOrderData,
    req.changedOrderData,
  );

  const newSubmissionVersion = await getNewSubmissionNumber(
    orderHistory.itemNumber,
    tx,
  );

  const decodedChangedOrderData = await decodeOrderData(
    req.changedOrderData,
    orderHistory.lookupVersionId as string,
  );

  const [pipelineStatus, pipelineStatusUrl] = await submitToPipeline();

  const orderHistoryId = await createOrderHistory({
    req: req,
    session: session,
    tx: tx,
    submissionVersion: newSubmissionVersion,
    decodedChangedOrderData: decodedChangedOrderData,
    orderHistory: orderHistory,
    pipelineStatus: pipelineStatus,
    pipelineStatusUrl: pipelineStatusUrl,
  });

  return { orderHistoryId, message: "Order successfully submitted!" };
};

const getOrderHistoryById = async (orderHistoryId: string) => {
  const payload = {
    filters: {
      id: orderHistoryId,
    },
    includeFields: {
      orderHistories: [],
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

  if (res.list.length === 0) {
    throw new CustomAPIError({
      clientMessage: "Order history not found!",
      innerError: `Order history with ID ${orderHistoryId} does not exist.`,
      statusCode: 404,
    });
  }

  return res.list[0];
};

const verifyChangedCFKeys = (
  encodedChangedOrderData: OrderHistoryItem["encodedChangedOrderData"],
  changedOrderData: SubmitCloneOrderRequest["changedOrderData"],
) => {
  if (
    Object.keys(encodedChangedOrderData?.mappedSection || {}).length !==
      Object.keys(changedOrderData.mappedSection).length ||
    Object.keys(encodedChangedOrderData?.unmappedSection || {}).length !==
      Object.keys(changedOrderData.unmappedSection).length
  ) {
    throw new CustomAPIError({
      clientMessage: "Invalid changed order data!",
      innerError:
        "The number of keys in the changed order data does not match the expected keys.",
      statusCode: 400,
    });
  }

  for (const key in changedOrderData.mappedSection) {
    if (!(encodedChangedOrderData?.mappedSection || {}).hasOwnProperty(key)) {
      throw new CustomAPIError({
        clientMessage: "Invalid changed order data!",
        innerError: `The key "${key}" in the mapped section does not exist in the original order data.`,
        statusCode: 400,
      });
    }
  }

  for (const key in changedOrderData.unmappedSection) {
    if (!(encodedChangedOrderData?.unmappedSection || {}).hasOwnProperty(key)) {
      throw new CustomAPIError({
        clientMessage: "Invalid changed order data!",
        innerError: `The key "${key}" in the mapped section does not exist in the original order data.`,
        statusCode: 400,
      });
    }
  }
};

const getNewSubmissionNumber = async (itemNumber: string, tx: TxType) => {
  const result = await tx
    .select({ submissionVersion: orderHistories.submissionVersion })
    .from(orderHistories)
    .where(eq(orderHistories.itemNumber, itemNumber))
    .orderBy(desc(orderHistories.submissionVersion))
    .limit(1);

  const currLatestSubmissionVersion =
    result.length > 0 ? result[0].submissionVersion : BASE_SUBM_VERSION;

  return incrementNumericString(currLatestSubmissionVersion);
};

const decodeOrderData = async (
  changedOrderData: SubmitCloneOrderRequest["changedOrderData"],
  lookupVersionId: string,
) => {
  const payload = {
    filters: {
      type: LOOKUP_ENTRY_TYPES.CF,
      lookupVersionId: lookupVersionId,
      identifiers: Object.keys({
        ...changedOrderData.mappedSection,
        ...changedOrderData.unmappedSection,
      }),
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
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
      ],
    },
    getLatestVersionData: false,
    includeLookupVersionInfo: true,
    showMapping: true,
    maxPageLimit: true,
    sortBy: lookupEntriesColNames.identifier,
    orderBy: ORDER_BY.ASC,
  };

  const [res] = (await ExecuteListLookEntries(
    ListLookupEntriesRequestSchema.parse(payload),
  )) as [ListLookupEntriesResponse, number];

  const [dictionary] = getCFCOMappings(res.list);

  const decodedChangedOrderData: Record<string, unknown> = {};
  for (const originalKey in changedOrderData.unmappedSection) {
    let key = originalKey,
      value = changedOrderData.unmappedSection[originalKey];
    if (originalKey in dictionary) key = dictionary[originalKey];
    if (value in dictionary) value = dictionary[value];

    decodedChangedOrderData[key] = value;
  }

  for (const originalKey in changedOrderData.mappedSection) {
    let key = originalKey,
      value = changedOrderData.mappedSection[originalKey];
    if (originalKey in dictionary) key = dictionary[originalKey];
    if (value in dictionary) value = dictionary[value];

    decodedChangedOrderData[key] = value;
  }

  return decodedChangedOrderData;
};

const createOrderHistory = async ({
  req,
  session,
  tx,
  submissionVersion,
  decodedChangedOrderData,
  orderHistory,
  pipelineStatus,
  pipelineStatusUrl,
}: {
  req: SubmitCloneOrderRequest;
  session: SessionSchemaDetails;
  tx: TxType;
  submissionVersion: string;
  decodedChangedOrderData: Record<string, unknown>;
  orderHistory: OrderHistoryItem;
  pipelineStatus: string;
  pipelineStatusUrl: string;
}) => {
  type OrderHistoryInsert = InferInsertModel<typeof orderHistories>;
  const insertData: OrderHistoryInsert = {
    submissionVersion: submissionVersion,
    itemNumber: orderHistory.itemNumber,
    itemNumberVersion: orderHistory.itemNumberVersion,
    orderName: orderHistory.orderName,
    clonedFromVersion: orderHistory.submissionVersion,
    productTypeId: orderHistory.productTypeId,
    lookupVersionId: orderHistory.lookupVersionId,
    encodedOrderData: orderHistory.encodedChangedOrderData,
    decodedOrderData: orderHistory.decodedChangedOrderData,
    paxMajor: req.systemFields.paxMajor.toString(), //todo
    paxMinor: req.systemFields.paxMinor.toString(), //todo
    pipelineStatus: pipelineStatus,
    pipelineStatusUrl: pipelineStatusUrl,
    productNo: req.systemFields.productNo,
    unitId: req.systemFields.unitId,
    dataServerArea: req.systemFields.dataServerArea,
    alarmServerArea: req.systemFields.alarmServerArea,
    processArea: req.systemFields.processArea,
    encodedChangedOrderData: req.changedOrderData,
    decodedChangedOrderData: decodedChangedOrderData,
    createdByUserId: session.id,
  };

  const [{ orderHistoryId }] = await tx
    .insert(orderHistories)
    .values(insertData)
    .returning({
      orderHistoryId: orderHistories.id,
    });

  return orderHistoryId;
};
