export interface VersionEntry {
  id: string;
  versionName: string;
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

export interface VersionListResponse {
  list: VersionEntry[];
  page: number;
  pageLimit: number;
  totalCount: number;
  totalPages: number;
}
