import { ApiProductType, Option } from "@/interfaces/productType";
import { ApiVersion } from "@/interfaces";

export const fetchProductTypes = async (
  originProduct?: string,
): Promise<Option[]> => {
  const requestBody = {
    filters: originProduct ? { productTypeCode: originProduct } : {},
    includeFields: {
      productTypes: ["id", "name", "isActive", "productTypeCode"],
      users: ["name", "azureUserId"],
    },
    sortBy: "updatedAt",
    orderBy: "desc",
    includeUserDetails: true,
    maxPageLimit: true,
    pageLimit: 1,
    page: 1,
  };

  const encoded = encodeURIComponent(JSON.stringify(requestBody));
  const res = await fetch(`/api/product_types/list?data=${encoded}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product types");
  }

  const responseData = await res.json();
  const productTypes: ApiProductType[] = responseData?.list || [];

  return productTypes.map((type) => ({
    value: type.id,
    label: type.name,
    productTypeCode: type.productTypeCode,
  }));
};

export const fetchLookupVersions = async () => {
  const requestBody = {
    filters: {},
    includeFields: {
      lookupVersions: ["id", "versionName", "createdAt"],
    },
    orderBy: "desc",
    pageLimit: 100,
    page: 1,
  };

  const encodedData = encodeURIComponent(JSON.stringify(requestBody));
  const res = await fetch(`/api/lookup_versions/list?data=${encodedData}`);
  const data = await res.json();

  if (!res.ok) throw new Error("Failed to fetch versions");
  return data.list as ApiVersion[];
};
