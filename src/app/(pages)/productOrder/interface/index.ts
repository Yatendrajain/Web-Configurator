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
export interface ItemData {
  itemNumber: string;
  itemNumberVersion: string;
  lookupVersionId: string;
  productTypeId: string;
  systemFields?: SystemFields;
  changedOrderData?: {
    mappedSection: Record<string, string>[];
    unmappedSection: Record<string, string>[];
  };
}

export interface SystemFields {
  productNo: string;
  unitId: number;
  dataServerArea: string;
  alarmServerArea: string;
  processArea: string;
  paxMajor: number;
  paxMinor: number;
}
export type AlertType = "success" | "error" | "info" | "warning";
