import { DiffAndUploadLookupEntriesRequest } from "../common_models/diff_and_upload_req_body";
import db from "@/db/client";
import { SessionSchemaDetails } from "../../middlewares/models";
import { TxType } from "@/constants/api/types/db_types";
import { validateFileNameAndGetInfo } from "../common_validations/validate_file_name";
import { validateProductType } from "../common_validations/validate_product_type";
import { validateVersionNameUniqueness } from "../common_validations/validate_version_name_uniqueness";
import { validateAndGetDataFromCFCOExcelTab } from "../common_validations/validate_cfco_tab_excel";
import { validateCFCOsColumns } from "../common_validations/validate_cfco_cols";
import { validateEmptyCFCOs } from "../common_validations/validate_empty_cfcos";
import { validateIdentifersCode } from "../common_validations/validate_identifiers_code";
import { validateDuplicateIdentifiers } from "../common_validations/validate_duplicate_identifiers";
import { validateMissingCOForCF } from "../common_validations/validate_missing_co_for_cf";
import { validateDuplicateCFDescs } from "../common_validations/validate_duplicate_cf_desc";
import { validateCOParentAbsence } from "../common_validations/validate_co_parent_absence";
import { lookupEntries, lookupVersions } from "@/db/schema";
import { InferInsertModel } from "drizzle-orm";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";

export const executeUploadLookupEntries = async (
  req: DiffAndUploadLookupEntriesRequest,
  session: SessionSchemaDetails,
): Promise<[object, number]> => {
  const [res, statusCode] = await db.transaction(async (tx) => {
    try {
      const res = await uploadLookupEntries(req, session, tx);
      return [res, 200];
    } catch (error) {
      try {
        tx.rollback();
      } finally {
        throw error;
      }
    }
  });

  return [res, statusCode];
};

const uploadLookupEntries = async (
  req: DiffAndUploadLookupEntriesRequest,
  session: SessionSchemaDetails,
  tx: TxType,
): Promise<object> => {
  const [cfcos, versionName, fileName] = await applyValidations(req);

  type LookupVersionInsert = InferInsertModel<typeof lookupVersions>;
  type LookupEntryInsert = InferInsertModel<typeof lookupEntries>;

  const lookupVersionInsertData: LookupVersionInsert = {
    productTypeId: req.productTypeId,
    versionName: versionName as string,
    uploadedByUserId: session.id,
    fileName: fileName as string,
  };

  const [{ lookupVersionId }] = await tx
    .insert(lookupVersions)
    .values(lookupVersionInsertData)
    .returning({ lookupVersionId: lookupVersions.id });

  const lookupEntriesInsertData: Array<LookupEntryInsert> = cfcos.map((row) => {
    return {
      lookupVersionId: lookupVersionId,
      parent: row.Parent,
      identifier: row.Identifier,
      type: row.Type,
      inputType: LOOKUP_ENTRY_TYPES.CO,
      description: row.Description,
    };
  });

  await tx.insert(lookupEntries).values(lookupEntriesInsertData);

  return {
    lookupVersionId: lookupVersionId,
    versionName: versionName,
    productTypeId: req.productTypeId,
    message: "Lookup entries uploaded successfully!",
  };
};

const applyValidations = async (
  req: DiffAndUploadLookupEntriesRequest,
): Promise<[CFCODataArraySchemaType, string, string]> => {
  const [versionName, productTypeFileName] = validateFileNameAndGetInfo(
    req.file.name,
  );
  const identifierCode = await validateProductType(
    req.productTypeId,
    productTypeFileName,
  );
  await validateVersionNameUniqueness(versionName, req.productTypeId);

  //todo: convert it to class to avoid copying data for every call
  const rawCFCOs = await validateAndGetDataFromCFCOExcelTab(req.file);
  const cfcos = validateCFCOsColumns(rawCFCOs);
  validateEmptyCFCOs(cfcos);
  validateIdentifersCode(cfcos, identifierCode);
  validateDuplicateIdentifiers(cfcos);
  validateMissingCOForCF(cfcos);
  validateDuplicateCFDescs(cfcos);
  validateCOParentAbsence(cfcos);

  return [cfcos, versionName, req.file.name];
};
