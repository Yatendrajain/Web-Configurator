import { eq, desc, type InferInsertModel } from "drizzle-orm";
import db from "@/db/client";
import type { TxType } from "@/constants/api/types/db_types";
import { ExecuteListLookupVersions } from "@/app/api/lookup_versions/list/list_lookup_versions";
import { SubmitEditOrderRequest } from "./models";
import {
  lookupEntriesColNames,
  lookupVersionsColNames,
  productTypesColNames,
} from "@/constants/api/constants/column_names";
import { ListLookupVersionsRequestSchema } from "@/app/api/lookup_versions/list/models";
import { CustomAPIError } from "@/utils/api/custom_error";
import { ExecuteListOrdersData } from "../../list/list_orders_data";
import { ListOrdersDataRequestSchema } from "../../list/models";
import { SessionSchemaDetails } from "@/app/api/middlewares/models";
import { orderHistories } from "@/db/schema";
import { BASE_SUBM_VERSION } from "@/constants/api/constants/submission_versions";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookEntries } from "@/app/api/lookup_entries/list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "@/app/api/lookup_entries/list/models";
import { getCFCOMappings, MappingItem } from "@/utils/common/get_cfco_mappings";
import { incrementNumericString } from "@/utils/api/increment_numric_string";
import { submitToPipeline } from "@/utils/api/submit_to_azure_pipeline";

interface ListLookupVersionsResponse {
  list: Array<{
    productTypeDetails: {
      productTypeCode: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface ListLookupEntriesResponse {
  list: Array<MappingItem>;
  [key: string]: unknown;
}

interface ListOrdersDataResponse {
  list: Array<{
    attributes: {
      configurationString: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}
//todo: check individual functions functionality on different scenarios
//todo: optimize
export const ExecuteSubmitEditOrder = async (
  req: SubmitEditOrderRequest,
  session: SessionSchemaDetails,
): Promise<[object, number]> => {
  const [res, statusCode] = await db.transaction(async (tx) => {
    try {
      const res = await SubmitEditOrder(req, session, tx);
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

export const SubmitEditOrder = async (
  req: SubmitEditOrderRequest,
  session: SessionSchemaDetails,
  tx: TxType,
): Promise<[object, number]> => {
  req.productTypeCode = await validateProductTypeAndLookupVersionCombo(
    req.productTypeId,
    req.lookupVersionId,
  );

  const [tactonOrderDetails, configurationString] =
    await verifyCFsAndGetTactonData(req);

  const submissionVersion = await getNewSubmissionNumber(req.itemNumber, tx);

  const [decodedChangedOrderData, decodedTactonOrderData] =
    await decodeOrderData(
      req.productTypeId,
      req.changedOrderData,
      configurationString,
    );

  const [pipelineStatus, pipelineStatusUrl] = await submitToPipeline();

  const orderHistoryId = await createOrderHistory({
    req: req,
    session: session,
    tx: tx,
    submissionVersion: submissionVersion,
    decodedChangedOrderData: decodedChangedOrderData,
    decodedTactonOrderData: decodedTactonOrderData,
    tactonOrderDetails: tactonOrderDetails,
    pipelineStatus: pipelineStatus,
    pipelineStatusUrl: pipelineStatusUrl,
  });

  return [
    { message: "Successfully submitted", orderHistoryId: orderHistoryId },
    200,
  ];
};

const validateProductTypeAndLookupVersionCombo = async (
  productTypeId: string,
  lookupVersionId: string,
) => {
  const payload = {
    filters: {
      id: lookupVersionId,
      productTypeId: productTypeId,
    },
    includeFields: {
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
      ],
      productTypes: [
        productTypesColNames.id,
        productTypesColNames.name,
        productTypesColNames.productTypeCode,
      ],
    },
    includeProductTypeDetails: true,
    includeUserDetails: false,
    maxPageLimit: false,
    pageLimit: 1,
    page: 1,
  };

  const [versions] = await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(payload),
  );

  const versionList = (versions as ListLookupVersionsResponse).list;

  if (versionList.length === 0) {
    throw new CustomAPIError({
      clientMessage: "Invalid product type and lookup version combination!",
      innerError: `Invalid product type and lookup version combination => productTypeId: ${productTypeId}, lookupVersionId: ${lookupVersionId}`,
      statusCode: 400,
    });
  }

  return versionList[0].productTypeDetails.productTypeCode;
};

const verifyCFsAndGetTactonData = async (
  req: SubmitEditOrderRequest,
): Promise<[ListOrdersDataResponse, string]> => {
  const payload = {
    filters: {
      productTypeCode: req.productTypeCode,
      itemNumber: req.itemNumber,
      version: req.itemNumberVersion,
    },
    excludeFields: [],
    includeResourceDetails: true,
  };

  const [orderDetails] = (await ExecuteListOrdersData(
    ListOrdersDataRequestSchema.parse(payload),
  )) as [ListOrdersDataResponse, number];

  if (orderDetails.list.length === 0) {
    throw new CustomAPIError({
      clientMessage: "Order not found!",
      innerError: `Order not found in tacton for itemNumber: ${req.itemNumber}, itemNumberVersion: ${req.itemNumberVersion}`,
      statusCode: 404,
    });
  }

  const configurationString =
    orderDetails.list[0].attributes.configurationString;

  if (
    !haveSameKeys(
      {
        ...req.changedOrderData.mappedSection,
        ...req.changedOrderData.unmappedSection,
      },
      JSON.parse(configurationString),
    )
  ) {
    throw new CustomAPIError({
      clientMessage: "Invalid Order data!",
      innerError:
        "The provided configuration data does not match the tacton order data.",
      statusCode: 400,
    });
  }

  return [orderDetails, configurationString];
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

export function haveSameKeys<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(obj1: T, obj2: U): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => keys2.includes(key));
}

const decodeOrderData = async (
  productTypeId: string,
  changedOrderData: SubmitEditOrderRequest["changedOrderData"],
  tactonConfigString: string,
) => {
  const payload = {
    filters: {
      type: LOOKUP_ENTRY_TYPES.CF,
      productTypeId: productTypeId,
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
    getLatestVersionData: true,
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
  const decodedTactonOrderData: Record<string, unknown> = {};

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

  const tactonConfigJSON = JSON.parse(tactonConfigString);
  for (const originalKey in tactonConfigJSON) {
    let key = originalKey,
      value = tactonConfigJSON[originalKey];
    if (originalKey in dictionary) key = dictionary[originalKey];
    if (value in dictionary) value = dictionary[value];

    decodedTactonOrderData[key] = value;
  }

  return [decodedChangedOrderData, decodedTactonOrderData];
};

const createOrderHistory = async ({
  req,
  session,
  tx,
  submissionVersion,
  decodedChangedOrderData,
  decodedTactonOrderData,
  tactonOrderDetails,
  pipelineStatus,
  pipelineStatusUrl,
}: {
  req: SubmitEditOrderRequest;
  session: SessionSchemaDetails;
  tx: TxType;
  submissionVersion: string;
  decodedChangedOrderData: Record<string, unknown>;
  decodedTactonOrderData: Record<string, unknown>;
  tactonOrderDetails: ListOrdersDataResponse;
  pipelineStatus: string;
  pipelineStatusUrl: string;
}) => {
  type OrderHistoryInsert = InferInsertModel<typeof orderHistories>;
  const insertData: OrderHistoryInsert = {
    submissionVersion: submissionVersion,
    itemNumber: req.itemNumber,
    itemNumberVersion: req.itemNumberVersion,
    orderName:
      (tactonOrderDetails.list[0].attributes?.productType as string) ||
      "Unknown",
    clonedFromVersion: "NA",
    productTypeId: req.productTypeId,
    lookupVersionId: req.lookupVersionId,
    encodedOrderData: tactonOrderDetails,
    decodedOrderData: decodedTactonOrderData,
    paxMajor: req.systemFields.paxMajor.toString(),
    paxMinor: req.systemFields.paxMinor.toString(),
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
