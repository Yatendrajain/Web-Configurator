import { NextRequest, NextResponse } from "next/server";
import { ListOrdersDataRequestSchema } from "./models";
import { ExecuteListOrdersData } from "./list_orders_data";
import { applyCustomMiddlewares } from "../../middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";

export async function GET(request: NextRequest) {
  try {
    await applyCustomMiddlewares(request);
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListOrdersDataRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListOrdersData(reqJson);

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
        clientMessage: "Error fetching Orders data!",
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
