import { z } from "zod";

export const GetCloneOrderDataSchema = z.object({
  orderHistoryId: z.string().uuid(),
});

export type GetCloneOrderDataRequest = z.infer<typeof GetCloneOrderDataSchema>;
