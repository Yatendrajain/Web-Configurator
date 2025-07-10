import {
  lookupVersionsColNames,
  productTypesColNames,
} from "@/constants/api/constants/column_names";
import { ExecuteListLookupVersions } from "../../lookup_versions/list/list_lookup_versions";
import { ListLookupVersionsRequestSchema } from "../../lookup_versions/list/models";
import { CustomAPIError } from "@/utils/api/custom_error";

interface ListLookupVersionsResponse {
  list: Array<{
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const validateVersionNameUniqueness = async (
  versionName: string,
  productTypeId: string,
) => {
  const payload = {
    filters: {
      versionName: versionName,
      productTypeId: productTypeId,
    },
    includeFields: {
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
      ],
      productTypes: [productTypesColNames.id],
    },
    includeProductTypeDetails: true,
    includeUserDetails: false,
    maxPageLimit: false,
    pageLimit: 1,
    page: 1,
  };

  const [res] = (await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(payload),
  )) as [ListLookupVersionsResponse, number];

  if (res.list.length > 0) {
    throw new CustomAPIError({
      clientMessage: `CFCO's Already exists with version ${versionName}`,
      innerError: `CFCO's Already exists with version ${versionName} with product type id ${productTypeId}`,
      statusCode: 400,
    });
  }
};
