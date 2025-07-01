import { RowData } from "@/interfaces/table";
import { DecodedOrderDataKeys } from "../enum";

export interface HistoryTableProps {
  search: string;
}

export interface HistoryData extends RowData {
  itemNumber: string;
  createdAt: string;
  submissionVersion: string;
  itemNumberVersion: string;
  pipelineStatus: string;
  productTypeId: string;
  alarmServerArea?: string;
  dataServerArea?: string;
  decodedOrderData?: DecodedOrderData;
  orderName?: string;
  productNo?: number;
  unitId?: number;
  // systemFields?: SystemFields;
  userDetails: {
    name: string;
  };
}

export interface DecodedOrderData {
  [DecodedOrderDataKeys.VOLTAGE]?: string;
  [DecodedOrderDataKeys.FREQUENCY]?: string;
  [DecodedOrderDataKeys.SYSTEM_TYPE]?: string;
  [DecodedOrderDataKeys.VESSEL_SIZE]?: string;
  [DecodedOrderDataKeys.PROCESS_TYPE]?: string;
  [DecodedOrderDataKeys.SEISMIC_OPTION]?: string;
  [DecodedOrderDataKeys.VESSEL_JACKET_DRAIN_KIT]?: string;
  [DecodedOrderDataKeys.PERSONAL_ELEVATION_ASSISTANCE_DEVICE]?: string;
}

export interface ReqBody {
  includeFields: IncludeFields;
  paginationDataRequired?: boolean;
  includeUserDetails: boolean;
  includeProductTypeDetails: boolean;
  includeLookupVersionDetails: boolean;
  orderBy?: "asc" | "desc";
  sortBy?: string;
  pageLimit?: number;
  page?: number;
  filters?: Filters;
}

export interface IncludeFields {
  orderHistories: string[];
  users: string[];
}

export interface Filters {
  globalSearch?: string;
  productTypeCode?: string;
  itemNumber?: string;
  submissionVersion?: string;
}

export interface ActionProps {
  orderIdVersion: string;
}

interface ViewParams {
  historyOrderId: string;
}

export interface ViewProps {
  params: Promise<ViewParams>;
}

// export interface SystemFields {
//   alarmServerArea: string;
//   unitId: string;
//   dataServerArea: string;
//   processArea: string;
// }
