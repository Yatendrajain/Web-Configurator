export type FieldItem = {
  label: string;
  key: string;
  original?: string;
  submitted?: string | number;
  visibleIn?: string;
};

export interface Props {
  productDetails: FieldItem[];
  mode: string;
}
