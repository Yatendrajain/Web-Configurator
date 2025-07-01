import { z } from "zod";

export const CFCODataSchema = z.object({
  Type: z.string(),
  Identifier: z.string() || z.number(),
  Description: z.string(),
  Parent: z.string(),
  // "Comment 1": z.string().optional(),
  // "Comment 2": z.string().optional(),
});

export const CFCODataArraySchema = z.array(CFCODataSchema);

export type CFCODataRow = z.infer<typeof CFCODataSchema>;
