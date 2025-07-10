import { productTypesColNames } from "@/constants/api/constants/column_names";
import { ExecuteListProductTypes } from "../../product_types/list/list_product_types";
import { ListProductTypesRequestSchema } from "../../product_types/list/models";
import { CustomAPIError } from "@/utils/api/custom_error";

interface ListProductTypeResponse {
  list: Array<{
    id: string;
    fileNameUsed: string;
    identifierCode: string;
    isActive: boolean;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const validateProductType = async (
  productTypeId: string,
  productTypeFileName: string,
) => {
  const payload = {
    filters: {
      id: productTypeId,
    },
    includeFields: {
      productTypes: [
        productTypesColNames.id,
        productTypesColNames.fileNameUsed,
        productTypesColNames.identifierCode,
        productTypesColNames.isActive,
      ],
    },
    includeUserDetails: false,
    maxPageLimit: false,
    pageLimit: 1,
    page: 1,
  };

  const [res] = (await ExecuteListProductTypes(
    ListProductTypesRequestSchema.parse(payload),
  )) as [ListProductTypeResponse, number];

  if (res.list.length === 0) {
    throw new CustomAPIError({
      clientMessage: "Invalid product type ID.",
      innerError: `Product type with ID ${productTypeId} not found.`,
      statusCode: 400,
    });
  }

  const productType = res.list[0];

  if (productType.fileNameUsed !== productTypeFileName) {
    throw new CustomAPIError({
      clientMessage: `Expected file name ${productType.fileNameUsed}, but got ${productTypeFileName}!`,
      innerError: `Expected file name ${productType.fileNameUsed}, but got ${productTypeFileName}!`,
      statusCode: 400,
    });
  }

  if (!productType.isActive) {
    throw new CustomAPIError({
      clientMessage: "Product type is not active!",
      innerError: `Product type with ID ${productTypeId} is not active.`,
      statusCode: 400,
    });
  }

  return res.list[0].identifierCode;
};
