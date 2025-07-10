import db from "@/db/client";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const findOrInitUser = async (
  azureUserId: string,
  name: string,
): Promise<object> => {
  const res = await db.transaction(async (tx) => {
    try {
      const reqFields = {
        id: users.id,
        azureUserId: users.azureUserId,
        name: users.name,
        isActive: users.isActive,
      };
      let res = await tx
        .select(reqFields)
        .from(users)
        .where(eq(users.azureUserId, azureUserId))
        .limit(1);

      if (res.length === 0) {
        res = await tx
          .insert(users)
          .values({ name: name, azureUserId: azureUserId, isActive: true })
          .returning(reqFields);
      } else if (res[0].isActive !== true) {
        const extras = res[0].name === name ? {} : { name: name };
        res = await tx
          .update(users)
          .set({ isActive: true, updatedAt: new Date(), ...extras })
          .where(eq(users.id, res[0].id))
          .returning(reqFields);
      }

      if (name !== res[0].name) {
        res = await tx
          .update(users)
          .set({ name: name, updatedAt: new Date() })
          .where(eq(users.id, res[0].id))
          .returning(reqFields);
      }

      return res[0];
    } catch (error) {
      try {
        tx.rollback();
      } finally {
        throw new CustomAPIError({
          clientMessage: "Something went wrong!",
          innerError: error,
          statusCode: 500,
        });
      }
    }
  });

  return res;
};
