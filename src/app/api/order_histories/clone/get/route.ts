import { NextRequest, NextResponse } from "next/server";
import { GetCloneOrderDataSchema } from "./models";
import { ExecuteGetCloneOrderData } from "./get_clone_order_data";
import { applyCustomMiddlewares } from "@/app/api/middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";

export async function GET(request: NextRequest) {
  try {
    await applyCustomMiddlewares(request);
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = GetCloneOrderDataSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteGetCloneOrderData(reqJson);

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
        clientMessage: "Error fetching Order Data!",
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
