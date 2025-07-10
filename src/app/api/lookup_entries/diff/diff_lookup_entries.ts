import { DiffAndUploadLookupEntriesRequest } from "../common_models/diff_and_upload_req_body";
import { validateFileNameAndGetInfo } from "../common_validations/validate_file_name";
import { validateProductType } from "../common_validations/validate_product_type";
import { validateVersionNameUniqueness } from "../common_validations/validate_version_name_uniqueness";
import { validateAndGetDataFromCFCOExcelTab } from "../common_validations/validate_cfco_tab_excel";
import { validateCFCOsColumns } from "../common_validations/validate_cfco_cols";
import { validateEmptyCFCOs } from "../common_validations/validate_empty_cfcos";
import { validateIdentifersCode } from "../common_validations/validate_identifiers_code";
import { validateMissingCOForCF } from "../common_validations/validate_missing_co_for_cf";
import { validateDuplicateIdentifiers } from "../common_validations/validate_duplicate_identifiers";
import { validateDuplicateCFDescs } from "../common_validations/validate_duplicate_cf_desc";
import { validateCOParentAbsence } from "../common_validations/validate_co_parent_absence";
import { getLatestLookupVersion } from "../common_helpers/get_latest_lookup_version";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { ExecuteListLookEntries } from "../list/list_lookup_entries";
import { ListLookupEntriesRequestSchema } from "../list/models";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
import { lookupEntriesColNames } from "@/constants/api/constants/column_names";
import { ChangeTypes } from "@/constants/common/enums/lookup_entries_upload";
import { DiffEntry } from "@/constants/common/enums/diff_entry";

interface ListLookupEntriesResponse {
  list: Array<{
    availableIdentifiers: Array<{
      identifier: string;
      description: string;
      [key: string]: unknown;
    }>;
    identifier: string;
    description: string;
    comment: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const executeDiffLookupEntries = async (
  req: DiffAndUploadLookupEntriesRequest,
): Promise<[object, number]> => {
  //todo: optimize
  const newCFCOs = await applyReqValidationsAndExtractCFCOs(req);

  const latestLookupVersionId = await getLatestLookupVersion(req.productTypeId);

  const currLatestCFCOs = await getCurrLookupEntries(latestLookupVersionId);

  const res = getGeneratedDiff(currLatestCFCOs, newCFCOs);

  return [res, 200];
};

const applyReqValidationsAndExtractCFCOs = async (
  req: DiffAndUploadLookupEntriesRequest,
) => {
  const [versionName, productTypeFileName] = validateFileNameAndGetInfo(
    req.file.name,
  );
  const identifierCode = await validateProductType(
    req.productTypeId,
    productTypeFileName,
  );
  await validateVersionNameUniqueness(versionName, req.productTypeId);

  //todo: convert it to class to avoid copying data for every call
  const rawNewCFCOs = await validateAndGetDataFromCFCOExcelTab(req.file);
  const newCFCOs = validateCFCOsColumns(rawNewCFCOs);
  validateEmptyCFCOs(newCFCOs);
  validateIdentifersCode(newCFCOs, identifierCode);
  validateDuplicateIdentifiers(newCFCOs);
  validateMissingCOForCF(newCFCOs);
  validateDuplicateCFDescs(newCFCOs);
  validateCOParentAbsence(newCFCOs);

  return newCFCOs;
};

const getCurrLookupEntries = async (latestLookupVersionId: string) => {
  const payload = {
    filters: {
      lookupVersionId: latestLookupVersionId,
      type: LOOKUP_ENTRY_TYPES.CF,
    },
    includeFields: {
      lookupEntries: [
        lookupEntriesColNames.identifier,
        lookupEntriesColNames.description,
      ],
      availableIdentifiers: [
        lookupEntriesColNames.identifier,
        lookupEntriesColNames.description,
      ],
    },
    getLatestVersionData: false,
    includeLookupVersionInfo: false,
    maxPageLimit: true,
  };

  const [res] = (await ExecuteListLookEntries(
    ListLookupEntriesRequestSchema.parse(payload),
  )) as [ListLookupEntriesResponse, number];

  return res.list;
};

const getGeneratedDiff = (
  unflattenedCurrCFCOs: ListLookupEntriesResponse["list"],
  newCFCOs: CFCODataArraySchemaType,
) => {
  const currCFCOs = flattenData(unflattenedCurrCFCOs);
  const diffs: DiffEntry[] = [];
  const currMap = new Map(currCFCOs.map((c) => [c.Identifier, c]));
  const newMap = new Map(newCFCOs.map((n) => [n.Identifier, n]));

  // 1) Handle ADDED, MODIFIED, UNCHANGED
  for (const n of newCFCOs) {
    const c = currMap.get(n.Identifier);
    if (!c) {
      // entirely new row
      diffs.push({
        changeType: ChangeTypes.ADDED,
        type: n.Type,
        identifier: n.Identifier,
        description: n.Description,
        comment: n.Comment,
        parent: n.Parent,
      });
    } else {
      // existed before — compare the three fields
      if (c.Type !== n.Type) {
        diffs.push({
          changeType: ChangeTypes.MODIFIED,
          type: n.Type,
          identifier: n.Identifier,
          description: n.Description,
          comment: n.Comment,
          parent: n.Parent,
          changedField: "type",
          oldValue: c.Type,
          newValue: n.Type,
        });
      } else if (c.Description !== n.Description) {
        diffs.push({
          changeType: ChangeTypes.MODIFIED,
          type: n.Type,
          identifier: n.Identifier,
          description: n.Description,
          parent: n.Parent,
          comment: n.Comment,
          changedField: "description",
          oldValue: c.Description,
          newValue: n.Description,
        });
      } else if (c.Parent !== n.Parent) {
        diffs.push({
          changeType: ChangeTypes.MODIFIED,
          type: n.Type,
          identifier: n.Identifier,
          description: n.Description,
          parent: n.Parent,
          comment: n.Comment,
          changedField: "parent",
          oldValue: c.Parent,
          newValue: n.Parent,
        });
      } else if (c.Comment !== n.Comment) {
        diffs.push({
          changeType: ChangeTypes.MODIFIED,
          type: n.Type,
          identifier: n.Identifier,
          description: n.Description,
          parent: n.Parent,
          comment: n.Comment,
          changedField: "comment",
          oldValue: c.Comment,
          newValue: n.Comment,
        });
      } else {
        diffs.push({
          changeType: ChangeTypes.UNCHANGED,
          type: n.Type,
          identifier: n.Identifier,
          description: n.Description,
          comment: n.Comment,
          parent: n.Parent,
        });
      }
    }
  }

  // 2) Handle REMOVED
  for (const c of currCFCOs) {
    if (!newMap.has(c.Identifier)) {
      diffs.push({
        changeType: ChangeTypes.REMOVED,
        type: c.Type,
        identifier: c.Identifier,
        description: c.Description,
        parent: c.Parent,
      });
    }
  }

  return diffs;
};

const flattenData = (currCfcos: ListLookupEntriesResponse["list"]) => {
  const flattened: CFCODataArraySchemaType = [];
  for (const group of currCfcos) {
    flattened.push({
      Type: LOOKUP_ENTRY_TYPES.CF,
      Identifier: group.identifier,
      Description: group.description,
      Parent: LOOKUP_ENTRY_TYPES.CF,
      Comment: group.comment || "",
    });

    for (const co of group.availableIdentifiers || []) {
      flattened.push({
        Type: LOOKUP_ENTRY_TYPES.CO,
        Identifier: co.identifier,
        Description: co.description,
        Parent: group.identifier,
        Comment: "",
      });
    }
  }

  return flattened;
};
