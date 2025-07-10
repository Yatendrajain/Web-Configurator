import { sql, eq, and, inArray } from "drizzle-orm";
import db from "@/db/client";
import { PERMISSION_MAPPING } from "@/constants/api/constants/api_permissions_mapping";
import { permissions, roleMappings, rolePermissions } from "@/db/schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const verifyPermissions = async (
  route: string,
  azureAdRoles: Array<string>,
) => {
  const reqPermissions = PERMISSION_MAPPING[route];

  if (!reqPermissions)
    throw new CustomAPIError({
      clientMessage: "Route not found!",
      innerError: "Route not found!",
      statusCode: 404,
    });

  const permissionTuples = reqPermissions.map(
    (p) => [p.moduleName, p.action] as const,
  );

  const res = await db
    .select({
      distinctCount: sql<number>`
      CAST(COUNT(DISTINCT ${permissions.id}) AS INTEGER)
    `.as("distinctCount"),
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

  const count = (res[0]?.distinctCount ?? 0) as number;

  if (reqPermissions.length !== count) {
    throw new CustomAPIError({
      clientMessage: "Insufficient permissions to access this page!",
      innerError: "Insufficient permissions to access this page!",
      statusCode: 403,
    });
  }
};
