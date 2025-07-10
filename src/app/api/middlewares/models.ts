import { z } from "zod";

export const PermissionSchema = z.object({
  moduleName: z.string(),
  action: z.string(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  azureUserId: z.string(),
  isActive: z.boolean(),
  featPermissions: z.record(PermissionSchema).optional(),
});

export type SessionSchemaDetails = z.infer<typeof SessionSchema>;
