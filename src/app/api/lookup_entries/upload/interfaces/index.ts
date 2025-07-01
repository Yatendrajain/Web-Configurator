import { ChangeType } from "@/constants/common/lookup_entries_upload";

export interface ExcelRow {
  Type: "CF" | "CO";
  Identifier: string;
  Description: string;
  Parent: string;
  "Comment 1": string;
  "Comment 2": string;
  NewData: string | null;
}

export interface IdentifierEntry {
  id: string;
  identifier: string;
  description: string;
}

export interface ResponseGroup {
  availableIdentifiers: IdentifierEntry[];
  identifier: string;
  description: string;
  lookupVersionDetails: {
    id: string;
    versionName: string;
  };
}

export interface ResponseData {
  list: ResponseGroup[];
}
export interface FlattenedEntry {
  Type: "CF" | "CO";
  Identifier: string;
  Description: string;
  versionName: string;
}

export type ComparedRow = {
  Type: "CF" | "CO";
  Identifier: string;
  Description: string;
  Parent?: string;
  "Comment 1"?: string;
  "Comment 2"?: string;
  "Old Value": string;
  "New Value": string;
  "Change Type": ChangeType;
};
