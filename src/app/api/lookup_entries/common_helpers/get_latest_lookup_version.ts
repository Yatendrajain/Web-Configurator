import {
  lookupVersionsColNames,
  productTypesColNames,
} from "@/constants/api/constants/column_names";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookupVersions } from "../../lookup_versions/list/list_lookup_versions";
import { ListLookupVersionsRequestSchema } from "../../lookup_versions/list/models";
import { CustomAPIError } from "@/utils/api/custom_error";

interface LookupVersionResponse {
  list: Array<{
    id: string;
    versionName: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const getLatestLookupVersion = async (productTypeId: string) => {
  const payload = {
    filters: {
      productTypeId: productTypeId,
    },
    includeFields: {
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
      ],
      productTypes: [productTypesColNames.id],
    },
    orderBy: ORDER_BY.DESC,
    sortBy: lookupVersionsColNames.createdAt,
    includeProductTypeDetails: true,
    includeUserDetails: false,
    page: 1,
    pageLimit: 1,
  };

  const [res] = (await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(payload),
  )) as [LookupVersionResponse, number];

  if (res.list.length === 0)
    throw new CustomAPIError({
      clientMessage: "Invalid Product Type!",
      statusCode: 400,
      innerError: "Invalid Product Type!",
    });

  return res.list[0].id;
};
