export interface Option {
  value: string;
  label: string;
  productTypeCode?: string;
}

export interface ApiProductType {
  id: string;
  name: string;
  isActive?: boolean;
  productTypeCode?: string;
}

export interface ProductTypePopupProps {
  open: boolean;
  onClose: () => void;
  originProduct?: string; // optional filter
  onProductTypeSelected?: (type: Option) => void; // optional callback
}
