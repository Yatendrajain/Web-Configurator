import { ChangeTypes } from "./lookup_entries_upload";

export interface DiffEntry {
  changeType: ChangeTypes;
  type: string;
  identifier: string;
  description: string;
  parent: string;
  comment?: string;
  changedField?: "parent" | "type" | "description" | string;
  oldValue?: string;
  newValue?: string;
}
