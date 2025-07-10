export * from "./search";

export interface ApiVersion {
  id: string;
  versionName: string;
  createdAt: string;
  productTypeDetails: {
    id: string;
    name: string;
    isActive: boolean;
    productTypeCode: string;
  };
  userDetails: {
    name: string;
  };
}
