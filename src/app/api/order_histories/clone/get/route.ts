import { NextRequest, NextResponse } from "next/server";
import { GetCloneOrderDataSchema } from "./models";
import { ExecuteGetCloneOrderData } from "./get_clone_order_data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = GetCloneOrderDataSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteGetCloneOrderData(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = "Error fetching Order Data!";

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
