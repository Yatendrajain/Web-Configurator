import { z } from "zod";

export const UpdateRoleMappingsRequestSchema = z.object({
  roleMappings: z.record(z.string().uuid(), z.string()),
});

export type UpdateRoleMappingsRequest = z.infer<
  typeof UpdateRoleMappingsRequestSchema
>;
