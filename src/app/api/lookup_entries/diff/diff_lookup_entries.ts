import { CFCODataRow } from "./models";
import { ExecuteListLookEntries } from "../list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "../list/models";
import { ChangeType } from "@/constants/common/lookup_entries_upload";
import {
  extractCFCOData,
  parseVersionAndProductType,
  validateFileSize,
  validateFileType,
  validateProductTypePresent,
  validateVersionUniqueness,
} from "./validations";
import {
  ComparedRow,
  ExcelRow,
  FlattenedEntry,
  ResponseData,
} from "./interfaces";
import { ExecuteListLookupVersions } from "../../lookup_versions/list/list_lookup_versions";
import { ListLookupVersionsRequestSchema } from "../../lookup_versions/list/models";
import {
  lookup_version_payload,
  productType_payload,
} from "@/constants/common/payloads";
import { ListProductTypesRequestSchema } from "../../product_types/list/models";
import { ExecuteListProductTypes } from "../../product_types/list/list_product_types";

// ---------------------- Main Logic ----------------------

export async function processUploadedCFCOFile(
  file: Blob,
  lookupVersionId: string,
  fileName: string,
) {
  if (!file || !(file instanceof Blob)) {
    return {
      error: true,
      status: 400,
      response: { message: "Invalid file" },
    };
  }
  // validate file type
  debugger;
  validateFileType(fileName);
  const VersionAndProductType = parseVersionAndProductType(fileName);

  //   get all the versions from DB
  const [versions] = await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(lookup_version_payload),
  );
  const versionList = (versions as { list: [] }).list;

  validateVersionUniqueness(
    VersionAndProductType.version,
    VersionAndProductType.productType,
    versionList,
  );

  //   get all the productType form DB

  const [productTypes] = await ExecuteListProductTypes(
    ListProductTypesRequestSchema.parse(productType_payload),
  );
  const productTypesList = (productTypes as { list: [] }).list;
  validateProductTypePresent(
    VersionAndProductType.productType,
    productTypesList as [],
  );

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  validateFileSize(buffer);

  const payload = {
    filters: {
      type: "CF",
      productTypeId: lookupVersionId,
    },
    includeFields: {
      lookupVersions: ["id", "versionName"],
      availableIdentifiers: ["id", "identifier", "description"],
      lookupEntries: ["identifier", "description"],
    },
    showMapping: true,
    maxPageLimit: true,
    getLatestVersionData: true,
  };

  const [res] = await ExecuteListLookEntries(
    ListLookupEntriesRequestSchema.parse(payload),
  );

  let parsedData: CFCODataRow[];
  try {
    parsedData = extractCFCOData(buffer);
  } catch (err) {
    return {
      error: true,
      status: 400,
      response: { message: (err as Error).message },
    };
  }

  const compareData = await compareDescriptions(
    parsedData as ExcelRow[],
    res as ResponseData,
  );

  return {
    error: false,
    status: 200,
    response: {
      data: compareData,
    },
  };
}

// ---------------------- Async Comparison Logic ----------------------

async function compareDescriptions(
  excelData: ExcelRow[],
  responseData: ResponseData,
): Promise<ComparedRow[]> {
  const flattened: FlattenedEntry[] = await flatternData(responseData);

  const result: ComparedRow[] = [];
  const seenIdentifiers = new Set<string>();

  for (const excelEntry of excelData) {
    const match = flattened.find(
      (item) =>
        item.Identifier === excelEntry.Identifier &&
        item.Type === excelEntry.Type,
    );

    seenIdentifiers.add(excelEntry.Identifier);

    if (!match) {
      // New entry in Excel, not found in DB
      result.push({
        "Change Type": ChangeType.ADDED,
        ...excelEntry,
        "Old Value": "",
        "New Value": excelEntry.Description,
      });
      continue;
    }

    const isChanged =
      match.Description.trim() !== excelEntry.Description.trim();

    result.push({
      "Change Type": isChanged ? ChangeType.MODIFIED : ChangeType.UNCHANGED,
      ...excelEntry,
      "Old Value": match.Description,
      "New Value": isChanged ? excelEntry.Description : "--",
    });
  }

  // Find deleted items (present in DB but not in Excel)
  for (const dbEntry of flattened) {
    if (!seenIdentifiers.has(dbEntry.Identifier)) {
      result.push({
        "Change Type": ChangeType.REMOVED,
        Type: dbEntry.Type,
        Identifier: dbEntry.Identifier,
        Description: "",
        Parent: "",
        "Comment 1": "",
        "Comment 2": "",
        "Old Value": dbEntry.Description,
        "New Value": "",
      });
    }
  }

  return result;
}

const flatternData = async (responseData: ResponseData) => {
  const flattened: FlattenedEntry[] = [];
  for (const group of responseData.list) {
    // Add CF
    flattened.push({
      Type: "CF",
      Identifier: group.identifier,
      Description: group.description || "",
      versionName: group.lookupVersionDetails?.versionName || "",
    });

    // Add COs
    for (const co of group.availableIdentifiers || []) {
      flattened.push({
        Type: "CO",
        Identifier: co.identifier,
        Description: co.description || "",
        versionName: group.lookupVersionDetails?.versionName || "",
      });
    }
  }
  return flattened;
};
