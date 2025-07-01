export const lookup_version_payload = {
  filters: {},
  includeFields: {
    lookupVersions: ["id", "versionName"],
    // "productTypes": ["id", "name", "isActive"],
    users: ["name"],
  },
  sortBy: "createdAt",
  orderBy: "desc",
  pageLimit: 10,
  page: 1,
};

export const productType_payload = {
  filters: {
    // "id": "9fda47c4-fbd9-4269-801e-de5b1791826d",
    // "name": "a"
    isActive: true,
  },
  includeFields: {
    productTypes: [
      // "id",
      "name",
      // "isActive",
      "productTypeCode",
    ],
    users: ["name", "azureUserId"],
  },
  sortBy: "updatedAt",
  orderBy: "desc",
  includeUserDetails: true,
  maxPageLimit: true,
  pageLimit: 1,
  page: 1,
};
