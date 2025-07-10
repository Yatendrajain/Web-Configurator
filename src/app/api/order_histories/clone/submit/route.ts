import { NextRequest, NextResponse } from "next/server";
import { applyCustomMiddlewares } from "@/app/api/middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";
import { SubmitCloneOrderSchema } from "./models";
import { ExecuteSubmitCloneOrder } from "./submit_clone_order";

export async function POST(request: NextRequest) {
  try {
    const session = await applyCustomMiddlewares(request);

    const body = await request.json();

    const reqJson = SubmitCloneOrderSchema.parse(body);

    const [res, statusCode] = await ExecuteSubmitCloneOrder(reqJson, session);

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
        clientMessage: "Submission failed!",
        innerError: error,
        statusCode: 500,
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
