import { PROMISE_STATUS } from "@/constants/common/enums/promise_statuses";
import { GetEditPageOrderDataRequest } from "./models";
import {
  lookupEntriesColNames,
  lookupVersionsColNames,
  productTypesColNames,
} from "@/constants/api/constants/column_names";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookupVersions } from "@/app/api/lookup_versions/list/list_lookup_versions";
import { ListLookupVersionsRequestSchema } from "@/app/api/lookup_versions/list/models";
import { INSTALLED_BASE_ATTRIBUTES as IBA } from "@/constants/api/enums/tacton_attributes";
import { INSTALLED_BASE_ATTRIBUTES_LIST } from "@/constants/api/constants/tacton_attributs_list";
import { giveDiffArr } from "@/utils/api/diff_arr";
import { ExecuteListOrdersData } from "../../list/list_orders_data";
import { ListOrdersDataRequestSchema } from "../../list/models";
import { ExecuteListProductTypes } from "@/app/api/product_types/list/list_product_types";
import { ListProductTypesRequestSchema } from "@/app/api/product_types/list/models";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { ExecuteListLookEntries } from "@/app/api/lookup_entries/list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "@/app/api/lookup_entries/list/models";
import { BASE_SUBM_VERSION } from "@/constants/api/constants/submission_versions";
import { getCFCOMappings, MappingItem } from "@/utils/common/get_cfco_mappings";

interface ListProductTypesResponse {
  list: Array<{
    productTypeCode: string;
    id: string;
  }>;
  page: number;
  pageLimit: number;
  totalCount: number;
  totalPages: number;
}

interface ListLookupVersionsResponse {
  list: Array<{
    productTypeDetails: object;
    [key: string]: unknown;
  }>;
  page: number;
  pageLimit: number;
  totalCount: number;
  totalPages: number;
}

interface ListLookupEntriesResponse {
  list: Array<MappingItem>;
  [key: string]: unknown;
}

interface TactonItem {
  attributes: {
    configurationString: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ListOrdersDataResponse {
  list: Array<TactonItem>;
  page: number;
  pageLimit: number;
}

interface MetadataStructure {
  lookupVersionDetails: object;
  productTypeDetails: object;
  orderDetails: object;
}

export const ExecuteGetEditPageOrderData = async (
  req: GetEditPageOrderDataRequest,
): Promise<[object, number]> => {
  req.productTypeCode = await getProductTypeCode(req.productTypeId);

  const metadataPromise = getAvailableMetadata(req);
  const tactonPromise = getDataFromTacton(req);

  const mappingsPromise = tactonPromise.then(async (tactonData) => {
    const mapping = await getRespectiveCFCOs(req.productTypeId, tactonData);
    return [tactonData, mapping] as const;
  });

  const [mappingRes, metadataRes] = await Promise.allSettled([
    mappingsPromise,
    metadataPromise,
  ]);

  if (mappingRes.status === PROMISE_STATUS.REJECTED) throw mappingRes.reason;
  if (metadataRes.status === PROMISE_STATUS.REJECTED) throw metadataRes.reason;

  const [tactonData, mappings] = mappingRes.value;
  const metadata = metadataRes.value;
  const [dictionary, optionsMap] = getCFCOMappings(mappings);

  return [
    {
      metadata: updateMetadata(metadata, tactonData),
      originalData: tactonData,
      dictionary,
      optionsMap,
    },
    200,
  ];
};

const getProductTypeCode = async (productTypeId: string) => {
  const payload = {
    filters: {
      id: productTypeId,
      isActive: true,
    },
    includeFields: {
      productTypes: [
        productTypesColNames.id,
        productTypesColNames.productTypeCode,
      ],
    },
    includeUserDetails: false,
    page: 1,
    pageLimit: 1,
  };

  const [res] = (await ExecuteListProductTypes(
    ListProductTypesRequestSchema.parse(payload),
  )) as [ListProductTypesResponse, number];

  if (res.list.length === 0) throw new Error("Invalid Product Type!");

  return res.list[0].productTypeCode;
};

const getAvailableMetadata = async (
  req: GetEditPageOrderDataRequest,
): Promise<MetadataStructure> => {
  const payload = {
    filters: {
      productTypeId: req.productTypeId,
      productTypeIsActive: true,
    },
    includeFields: {
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
        lookupVersionsColNames.createdAt,
      ],
      productTypes: [
        productTypesColNames.id,
        productTypesColNames.name,
        productTypesColNames.isActive,
      ],
    },
    includeUserDetails: false,
    sortBy: lookupVersionsColNames.createdAt,
    orderBy: ORDER_BY.DESC,
    pageLimit: 1,
    page: 1,
  };

  const [data] = (await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(payload),
  )) as [ListLookupVersionsResponse, number];

  if (data.totalCount === 0 || data.list.length === 0)
    throw new Error("No Valid Lookup Version available!");

  const { productTypeDetails, ...rest } = data.list[0];

  return {
    lookupVersionDetails: rest,
    productTypeDetails: productTypeDetails,
    orderDetails: {},
  };
};

const getDataFromTacton = async (req: GetEditPageOrderDataRequest) => {
  const includeFields = [
    IBA.ITEM_NUMBER,
    IBA.VERSION,
    IBA.NAME,
    IBA.PRODUCT_FAMILY_FROM_ORIGIN_PRODUCT,
    IBA.ORIGIN_PRODUCT,
    IBA.CONFIGURATION_STRING,
    IBA.FINALIZED_DATE,
  ];

  const payload = {
    filters: {
      productTypeCode: req.productTypeCode,
      itemNumber: req.itemNumber,
      version: req.version,
    },
    includeResourceDetails: false,
    excludeFields: giveDiffArr(INSTALLED_BASE_ATTRIBUTES_LIST, includeFields),
    pageLimit: 1,
    page: 1,
  };

  const [res] = (await ExecuteListOrdersData(
    ListOrdersDataRequestSchema.parse(payload),
  )) as [ListOrdersDataResponse, number];

  if (res.list.length === 0) throw new Error("No Valid Order Data available!");

  return res.list[0];
};

const getRespectiveCFCOs = async (
  productTypeId: string,
  tactonData: TactonItem,
) => {
  const payload = {
    filters: {
      type: LOOKUP_ENTRY_TYPES.CF,
      productTypeId: productTypeId,
      identifiers: Object.keys(
        JSON.parse(tactonData.attributes.configurationString),
      ),
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

  return res.list;
};

const updateMetadata = (
  metadata: MetadataStructure,
  tactonData: TactonItem,
) => {
  metadata.orderDetails = {
    itemNumber: tactonData.attributes.itemNumber,
    version: tactonData.attributes.version,
    submissionVersion:
      tactonData.attributes.submissionVersion || BASE_SUBM_VERSION,
    finalizedDate: tactonData.attributes.finalizedDate,
  };

  return metadata;
};
