import * as XLSX from "xlsx";
import { CFCODataArraySchema, CFCODataRow } from "./models";

export type ValidationError = { type: string; message: string };

export function validateFileType(fileName?: string): void {
  const validExtensions = [".xlsx"];
  if (
    !fileName ||
    !validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  ) {
    throw new Error("Only Excel (.xlsx) files are allowed.");
  }
}

export function validateFileSize(buffer: Buffer, maxSizeMB = 9): void {
  if (buffer.byteLength > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxSizeMB}MB.`);
  }
}

export function extractCFCOData(fileBuffer: Buffer): CFCODataRow[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const cfcoSheet = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === "cfco",
  );
  if (!cfcoSheet) throw new Error("CFCO sheet not found");

  const sheet = workbook.Sheets[cfcoSheet];
  const jsonData = XLSX.utils.sheet_to_json<CFCODataRow>(sheet, { defval: "" });

  validateRequiredColumns(jsonData);

  const validation = CFCODataArraySchema.safeParse(jsonData);
  if (!validation.success) {
    throw new Error("Validation failed: Required Columns/Fields are missing");
  }

  return validation.data;
}

export function validateRequiredColumns(rawData: unknown[]): void {
  const requiredKeys = ["Type", "Identifier", "Description", "Parent"];
  if (
    !Array.isArray(rawData) ||
    rawData.length === 0 ||
    typeof rawData[0] !== "object" ||
    rawData[0] === null
  ) {
    throw new Error("Invalid or empty data provided for column validation");
  }

  const keys = Object.keys(rawData[0] as object);
  const missingKeys = requiredKeys.filter((key) => !keys.includes(key));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required column(s): ${missingKeys.join(", ")}`);
  }
}
