import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const validateDuplicateCFDescs = (cfcos: CFCODataArraySchemaType) => {
  const duplicateMapping: Record<string, number> = {};
  const duplicateDescs: Array<string> = [];

  cfcos.forEach((row) => {
    if (row.Type === LOOKUP_ENTRY_TYPES.CF) {
      const currCount = duplicateMapping[row.Description] || 0;

      duplicateMapping[row.Description] = currCount + 1;
    }
  });

  for (const desc in duplicateMapping) {
    if (duplicateMapping[desc] > 1) duplicateDescs.push(desc);
  }

  if (duplicateDescs.length === 0) return;

  throw new CustomAPIError({
    clientMessage: `${duplicateDescs.length} descriptions are repeated!`,
    innerError: `${duplicateDescs.length} descriptions are repeated => duplicateMapping: ${duplicateDescs}`,
    statusCode: 400,
  });
};
