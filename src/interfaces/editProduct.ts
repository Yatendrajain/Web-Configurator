import { Option } from "./dropDown";

export type FieldItem = {
  label?: string;
  key?: string;
  value?: string;
  submitted?: string;
  original?: string;
  options?: Option[];
  editable?: boolean;
  disabled?: boolean;
  source?: "mapped" | "unmapped";
  placeholder?: string;
};

export interface Props {
  mode: string;
  orderFields: FieldItem[];
  systemFields: FieldItem[];
  paxVersion?: PaxVersion;
  onChange: (key: string, value: string) => void;
  onPaxChange: (key: "major" | "minor", value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  handleOrderFieldChange: (key: string, value: string) => void;
}

export interface PaxVersion {
  major: string;
  minor: string;
}

export interface ProductDetailData {
  productType: string;
  orderId: string;
  version: number;
  cfcoVersion: string;
  finalizedAt?: string;
  submissionHistory: string;
  submittedAt?: string;
}
