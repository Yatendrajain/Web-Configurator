export type RowData = Record<string, unknown>;

export interface ColumnDefinition<T = RowData> {
  id: string;
  label: string;
  align?: string;
  sortable?: boolean;
  sortByName?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DynamicTableProps<T = RowData> {
  columns: ColumnDefinition<T>[];
  data: T[];
  onEdit?: (id: string) => void;
  showEditAction?: boolean;
  loading?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (columnId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export interface ProductOrder extends RowData {
  itemNumber: string;
  version?: string;
  productType: string;
  finalizedDate: string;
  submissionVersion: string;
  productFamilyFromOriginProduct: string;
}

export interface ApiOrder {
  id: string;
  attributes?: {
    itemNumber?: string;
    version?: string;
    productType?: string;
    finalizedDate?: string;
    submissionVersion?: string;
    productFamilyFromOriginProduct?: string;
  };
}

export interface MemoizedTableRowProps<T extends RowData> {
  row: T;
  columns: ColumnDefinition<T>[];
  onEdit?: (id: string) => void;
  showEditAction: boolean;
}
