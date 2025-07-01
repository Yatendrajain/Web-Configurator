import { RowData } from "@/interfaces/table";

export interface ProductOrdersTableProps {
  search?: string;
}

export interface ProductOrderData extends RowData {
  id: string;
  itemNumber: string;
  version: string;
  productType: string;
  finalizedDate: string;
  submissionVersion: string;
  productFamilyFromOriginProduct: string;
}

export interface ReqBody {
  filters: {
    productTypeCode?: string;
    itemNumber?: string;
  };
  excludeFields: string[];
  orderBy: "asc" | "desc";
  sortBy: string;
  maxPageLimit: boolean;
  pageLimit: number;
  page: number;
}
