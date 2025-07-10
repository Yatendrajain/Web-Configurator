import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { CustomAPIError } from "@/utils/api/custom_error";

export const validateToken = async (req: NextRequest) => {
  try {
    const res =
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      })) || {};

    if (!res?.sub || !res?.name) {
      throw new Error("Invalid or expired session token!");
    }

    res.roles = res?.roles || ["dev"]; //todo : to be removed

    return res;
  } catch (err) {
    throw new CustomAPIError({
      statusCode: 401,
      clientMessage: "Invalid or expired session token!",
      innerError: err,
    });
  }
};
