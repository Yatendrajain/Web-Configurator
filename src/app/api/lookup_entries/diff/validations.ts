import * as XLSX from "xlsx";
import { CFCODataArraySchema, CFCODataRow } from "./models";
import { VersionEntry } from "../../lookup_versions/interfaces";
import { ProductTypeEntry } from "../../product_types/interfaces";

export type ValidationError = { type: string; message: string };

export function validateFileType(fileName?: string): void {
  const validExtensions = [".xlsx"];
  if (
    !fileName ||
    !validExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  ) {
    throw new Error("Only Excel (.xlsx) files are allowed.");
  }
  validateFileNameFormat(fileName);
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

export function validateFileNameFormat(fileName?: string): void {
  if (!fileName) throw new Error("Missing file name");

  const baseName = decodeURIComponent(fileName).split(".")[0];

  const parts = baseName.split("_");

  const version = parts.find((p) => /^[A-Z]{2}$/.test(p));
  const productTypeIndex = version ? parts.indexOf(version) + 1 : -1;

  if (!version || productTypeIndex === -1 || !parts[productTypeIndex]) {
    throw new Error(
      "File name must include a 2-letter version code followed by product type (e.g., *_AC_XPlatform_*)",
    );
  }
}

export function parseVersionAndProductType(fileName: string): {
  version: string;
  productType: string;
} {
  const baseName = decodeURIComponent(fileName).split(".")[0];
  const parts = baseName.split("_");

  const version = parts.find((p) => /^[A-Z]{2}$/.test(p));
  const productTypeIndex = version ? parts.indexOf(version) + 1 : -1;

  if (!version || productTypeIndex === -1 || !parts[productTypeIndex]) {
    throw new Error(
      "Unable to extract version and product type from file name",
    );
  }

  return {
    version,
    productType: parts[productTypeIndex],
  };
}

export function validateVersionUniqueness(
  version: string,
  productType: string,
  existingList: VersionEntry[],
): void {
  const exists = existingList.some(
    (entry) =>
      entry.versionName === version &&
      entry.productTypeDetails?.name?.toLowerCase().replace(/\s+/g, "") ===
        productType.toLowerCase().replace(/\s+/g, ""),
  );

  if (exists) {
    throw new Error(
      `Version '${version}' already exists for product type '${productType}'`,
    );
  }
}

export function validateProductTypePresent(
  productType: string,
  existingProductType: ProductTypeEntry[],
): void {
  const isProductTypeExists = existingProductType.some(
    (type) => type.name === productType,
  );

  if (!isProductTypeExists)
    throw new Error(
      `${productType} is not exists plesase contact your admin to add this product type.`,
    );
}
