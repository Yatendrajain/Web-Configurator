import { z } from "zod";

export const GetEditPageOrderDataSchema = z.object({
  productTypeCode: z.string().optional(),
  productTypeId: z.string().uuid(),
  itemNumber: z.string(),
  version: z.string(),
});

export type GetEditPageOrderDataRequest = z.infer<
  typeof GetEditPageOrderDataSchema
>;
