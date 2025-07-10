import { CustomAPIError } from "@/utils/api/custom_error";
import { CFCODataArraySchemaType } from "../common_models/cfco_file_entries_schema";
export const validateEmptyCFCOs = (newCFCOs: CFCODataArraySchemaType) => {
  if (newCFCOs.length == 0)
    throw new CustomAPIError({
      clientMessage: "CFCO's Cant be empty!",
      innerError: "CFCO's Cant be empty!",
      statusCode: 400,
    });
};
