import { CustomAPIError } from "@/utils/api/custom_error";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";

export const validateDuplicateIdentifiers = (
  cfcos: CFCODataArraySchemaType,
) => {
  const dictionary: Record<string, number> = {};
  const repeatedIdentifiers: Array<string> = [];

  cfcos.forEach((row) => {
    const currCount = dictionary[row.Identifier];
    let count = 1;
    if (currCount) count = currCount + 1;

    dictionary[row.Identifier] = count;
  });

  for (const record in dictionary) {
    if (dictionary[record] > 1) repeatedIdentifiers.push(record);
  }

  if (repeatedIdentifiers.length > 0)
    throw new CustomAPIError({
      clientMessage: `${repeatedIdentifiers.length} Identifiers are repeated in CFCO's!`,
      innerError: `${repeatedIdentifiers.length} Identifiers are repeated in CFCO's, repeatedIdentifiers: ${repeatedIdentifiers}`,
      statusCode: 400,
    });
};
