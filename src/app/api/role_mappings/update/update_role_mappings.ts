import { UpdateRoleMappingsRequest } from "./models";
import db from "@/db/client";
import { sql } from "drizzle-orm";
import type { TxType } from "@/constants/api/types/db_types";
import { CustomAPIError } from "@/utils/api/custom_error";
import { roleMappings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { giveDiffArr } from "@/utils/api/diff_arr";
import { SessionSchemaDetails } from "../../middlewares/models";

export const ExecuteUpdateRoleMappings = async (
  req: UpdateRoleMappingsRequest,
  session: SessionSchemaDetails,
): Promise<[object, number]> => {
  const [res, statusCode] = await db.transaction(async (tx) => {
    try {
      const res = await UpdateRoleMappings(req, session, tx);
      return [res, 200];
    } catch (error) {
      try {
        tx.rollback();
      } finally {
        throw error;
      }
    }
  });

  return [res, statusCode];
};

const UpdateRoleMappings = async (
  req: UpdateRoleMappingsRequest,
  session: SessionSchemaDetails,
  tx: TxType,
) => {
  const systemRoleIds = Object.keys(req.roleMappings);

  if (systemRoleIds.length === 0) {
    throw new CustomAPIError({
      clientMessage: "No role mappings provided",
      innerError: "No role mappings provided",
      statusCode: 400,
    });
  }

  const existingMappings = await tx
    .select({ id: roleMappings.id, azureAdRole: roleMappings.azureAdRole })
    .from(roleMappings)
    .where(inArray(roleMappings.id, systemRoleIds))
    .for("update");

  if (systemRoleIds.length !== existingMappings.length) {
    const existingMappingsIds = existingMappings.map((item) => item.id);
    throw new CustomAPIError({
      clientMessage: "Some role mappings do not exist!",
      innerError: `Some role mappings do not exist => ${giveDiffArr(systemRoleIds, existingMappingsIds)}`,
      statusCode: 404,
    });
  }

  const toBeUpdated: Array<{
    id: string;
    azureAdRole: string;
    createdBy: string;
  }> = [];

  existingMappings.forEach((item) => {
    if (req.roleMappings[item.id] != item.azureAdRole) {
      toBeUpdated.push({
        id: item.id,
        azureAdRole: req.roleMappings[item.id],
        createdBy: session.id,
      });
    }
  });

  if (toBeUpdated.length === 0) {
    throw new CustomAPIError({
      clientMessage: "No role mappings to be updated!",
      innerError: "No role mappings to be updated!",
      statusCode: 400,
    });
  }

  const caseExpr = sql`CASE ${roleMappings.id}
  ${sql.join(
    toBeUpdated.map((m) => sql`WHEN ${m.id} THEN ${m.azureAdRole}`),
    sql` `,
  )}
  END`;

  const res = await tx
    .update(roleMappings)
    .set({ azureAdRole: caseExpr })
    .where(
      inArray(
        roleMappings.id,
        toBeUpdated.map((m) => m.id),
      ),
    )
    .returning({
      id: roleMappings.id,
      appRole: roleMappings.appRole,
      azureAdRole: roleMappings.azureAdRole,
    });

  return res;
};
