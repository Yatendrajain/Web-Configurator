import { NextRequest, NextResponse } from "next/server";
import { UpdateRoleMappingsRequestSchema } from "./models";
import { ExecuteUpdateRoleMappings } from "./update_role_mappings";
import { applyCustomMiddlewares } from "../../middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";

export async function POST(request: NextRequest) {
  try {
    const session = await applyCustomMiddlewares(request);

    const rawBody = await request.json();

    const reqJson = UpdateRoleMappingsRequestSchema.parse(rawBody);

    const [res, statusCode] = await ExecuteUpdateRoleMappings(reqJson, session);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const { clientMessage, innerError, statusCode, traceback } = (() => {
      if (error instanceof CustomAPIError) {
        return {
          clientMessage: error.clientMessage,
          innerError: error.innerError,
          statusCode: error.statusCode,
          traceback: error.stack,
        };
      }
      return {
        clientMessage: "Error updating role mappings!",
        innerError: error,
        statusCode: 400,
        traceback: error instanceof Error ? error.stack : null,
      };
    })();

    console.error(clientMessage, error);

    return NextResponse.json(
      {
        message: clientMessage,
        error: innerError,
        traceback: traceback,
      },
      { status: statusCode },
    );
  }
}
