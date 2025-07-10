import { CustomAPIError } from "@/utils/api/custom_error";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";

export const validateIdentifersCode = (
  newCFCOs: CFCODataArraySchemaType,
  identifierCode: string,
) => {
  const improperIdentifiers: Array<string> = [];

  newCFCOs.forEach((row) => {
    if (!row.Identifier.startsWith(identifierCode))
      improperIdentifiers.push(row.Identifier);
  });

  if (improperIdentifiers.length === 0) return;

  throw new CustomAPIError({
    clientMessage: `${improperIdentifiers.length} Identifiers doesnt start with ${identifierCode}`,
    innerError: `${improperIdentifiers.length} Identifiers doesnt start with ${identifierCode} => improperIdentifiers: ${improperIdentifiers}`,
    statusCode: 400,
  });
};
