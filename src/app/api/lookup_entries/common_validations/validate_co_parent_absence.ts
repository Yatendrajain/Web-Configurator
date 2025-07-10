import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const validateCOParentAbsence = (cfcos: CFCODataArraySchemaType) => {
  const cfDictionary: Record<string, boolean> = {};
  const absentCFs: Array<string> = [];

  cfcos.forEach((row) => {
    if (row.Type === LOOKUP_ENTRY_TYPES.CF) cfDictionary[row.Identifier] = true;
  });

  cfcos.forEach((row) => {
    if (row.Type === LOOKUP_ENTRY_TYPES.CO && !cfDictionary[row.Parent])
      absentCFs.push(row.Parent);
  });

  if (absentCFs.length === 0) return;

  throw new CustomAPIError({
    clientMessage: `${absentCFs.length} Parents are not present as CF Identifiers!`,
    innerError: `${absentCFs.length} Parents are not present as CF Identifiers! => absentCFs: ${absentCFs}`,
    statusCode: 400,
  });
};
