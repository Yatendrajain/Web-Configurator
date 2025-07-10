import { z } from "zod";

export const GetCloneOrderDataSchema = z.object({
  orderHistoryId: z.string().uuid(),
  includeMappingAndDictionary: z.boolean().optional().default(false),
  includeDecodedData: z.boolean().optional().default(false),
  includeEncodedData: z.boolean().optional().default(false),
});

export type GetCloneOrderDataRequest = z.infer<typeof GetCloneOrderDataSchema>;
