import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const validateMissingCOForCF = (cfcos: CFCODataArraySchemaType) => {
  const optionMapping: Record<string, Array<string>> = {};
  const CFWithNoCO: Array<string> = [];

  cfcos.forEach((row) => {
    if (row.Type === LOOKUP_ENTRY_TYPES.CF) optionMapping[row.Identifier] = [];
  });

  cfcos.forEach((row) => {
    if (row.Type === LOOKUP_ENTRY_TYPES.CO) {
      if (!optionMapping[row.Parent]) {
        optionMapping[row.Parent] = [];
      }
      optionMapping[row.Parent].push(row.Identifier);
    }
  });

  for (const cf in optionMapping) {
    if (optionMapping[cf].length === 0) CFWithNoCO.push(cf);
  }

  if (CFWithNoCO.length === 0) return;

  throw new CustomAPIError({
    clientMessage: `${CFWithNoCO.length} CF's doesnt have any CO`,
    innerError: `${CFWithNoCO.length} CF's doesnt have any CO => CFWithNoCO: ${CFWithNoCO}`,
    statusCode: 400,
  });
};
