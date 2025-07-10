import { and, eq, inArray, sql } from "drizzle-orm";
import db from "@/db/client";
import { permissions, roleMappings, rolePermissions } from "@/db/schema";
import { FEAT_PERMISSION_MAPPING } from "@/constants/api/constants/feat_permissions_mapping";

export const getFeaturePermissions = async (
  pathname: string,
  azureAdRoles: Array<string>,
) => {
  const featPermissions = FEAT_PERMISSION_MAPPING[pathname];

  if (!featPermissions) return {};

  const allFeatPermissions = Object.values(featPermissions).flat();

  const uniqueFeatPermissions = Array.from(new Set(allFeatPermissions));

  const permissionTuples = uniqueFeatPermissions.map(
    (p) => [p.moduleName, p.action] as const,
  );

  const res = await db
    .selectDistinct({
      id: permissions.id,
      moduleName: permissions.moduleName,
      action: permissions.action,
    })
    .from(roleMappings)
    .innerJoin(
      rolePermissions,
      eq(roleMappings.id, rolePermissions.roleMappingId),
    )
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        inArray(roleMappings.azureAdRole, azureAdRoles),
        inArray(
          sql`(${permissions.moduleName}, ${permissions.action})`,
          permissionTuples,
        ),
      ),
    );

  return res;
};
