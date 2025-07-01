export interface Option {
  value: string;
  label: string;
}

export interface CustomDropdownProps {
  defaultOption?: string;
  allOptions?: Option[];
  style?: React.CSSProperties;
  originProduct?: string;
  width?: number | string;
  productTypeCode?: string;
}
