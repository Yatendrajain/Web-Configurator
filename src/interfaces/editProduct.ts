import { Option } from "./dropDown";

export type FieldItem = {
  label: string;
  key: string;
  value: string;
  original?: string;
  options?: Option[];
  editable?: boolean;
};

export interface Props {
  mode: string;
  orderFields: FieldItem[];
  systemFields: FieldItem[];
  paxVersion: { major: string; minor: string };
  onChange: (key: string, value: string) => void;
  onPaxChange: (key: "major" | "minor", value: string) => void;
}
