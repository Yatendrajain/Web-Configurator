import { NextRequest, NextResponse } from "next/server";
import { ListOrderHistoriesRequestSchema } from "./models";
import { ExecuteListOrderHistories } from "./list_order_histories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListOrderHistoriesRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListOrderHistories(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = "Error fetching Order Histories!";

    console.error(message, error);

    return NextResponse.json(
      {
        message: message,
        error: error,
        traceback: error instanceof Error ? error.stack : null,
      },
      { status: 400 },
    );
  }
}
