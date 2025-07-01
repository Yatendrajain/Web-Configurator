export interface ProductTypeEntry {
  id: string;
  name: string;
  productTypeCode: string;
  createdByUserId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userDetails?: {
    name?: string;
    azureUserId?: string;
  };
}

export interface ProductTypeListResponse {
  list: ProductTypeEntry[];
  page?: number;
  pageLimit?: number;
  totalCount?: number;
  totalPages?: number;
}
