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
  name?: string;
  id: string;
  lastSubmitted?: string;
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

export interface HistoryDetails {
  metadata: {
    lookupVersionDetails: {
      versionName: string;
    };
    productTypeDetails: {
      name: string;
      productTypeCode: string;
    };
    orderDetails: {
      itemNumber: string;
      version: string;
      submissionVersion: string;
      finalizedDate: string;
      submittedAt: string;
    };
    orderHistory: {
      id: string;
      submissionVersion: string;
      itemNumber: string;
      itemNumberVersion: string;
      orderName: string;
      clonedFromVersion: string | null;
      productTypeId: string;
      lookupVersionId: string;
      paxMajor: string;
      paxMinor: string;
      pipelineStatus: string;
      pipelineStatusUrl: string;
      productNo: number;
      unitId: number;
      dataServerArea: string;
      alarmServerArea: string;
      processArea: string;
      decodedOrderData: Record<string, string>;
      decodedChangedOrderData: Record<string, string>;
      remarks: string | null;
      createdByUserId: string;
      createdAt: string;
      productTypeDetails: {
        id: string;
        name: string;
        productTypeCode: string;
      };
      userDetails: {
        id: string;
        name: string;
      };
      lookupVersionDetails: {
        id: string;
        versionName: string;
      };
    };
  };
}

export interface HistoryViewOrderFields {
  label: string;
  key: string;
  original: string;
  submitted: string;
}

export interface SystemFieldData {
  productNo: number;
  unitId: number;
  dataServerArea: string;
  alarmServerArea: string;
  processArea: string;
}
