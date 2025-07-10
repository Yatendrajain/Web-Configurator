import { NextRequest, NextResponse } from "next/server";
import { SubmitEditOrderSchema } from "./models";
import { ExecuteSubmitEditOrder } from "./submit_edit_order";
import { applyCustomMiddlewares } from "@/app/api/middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";

export async function POST(request: NextRequest) {
  try {
    const session = await applyCustomMiddlewares(request);

    const body = await request.json();

    const reqJson = SubmitEditOrderSchema.parse(body);

    const [res, statusCode] = await ExecuteSubmitEditOrder(reqJson, session);

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
