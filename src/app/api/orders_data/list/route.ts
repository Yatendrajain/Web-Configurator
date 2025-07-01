import { NextRequest, NextResponse } from "next/server";
import { ListOrdersDataRequestSchema } from "./models";
import { ExecuteListOrdersData } from "./list_orders_data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListOrdersDataRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListOrdersData(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = `Error fetching Orders data!`;

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
