import { z } from "zod";

export const CFCOFileFieldsSchema = z
  .object({
    Type: z.string(),
    Identifier: z.string(),
    Description: z.string(),
    Parent: z.string(),
    Comment: z.string().optional().default(""),
  })
  .strip();

export type CFCOFileFieldsSchemaType = z.infer<typeof CFCOFileFieldsSchema>;
