import { z } from "zod";
import { CFCOFileFieldsSchema } from "./cfco_file_fields_schema";

export const CFCODataArraySchema = z.array(CFCOFileFieldsSchema);
export type CFCODataArraySchemaType = z.infer<typeof CFCODataArraySchema>;
