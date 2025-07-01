import { NextRequest, NextResponse } from "next/server";
import { GetEditPageOrderDataSchema } from "./models";
import { ExecuteGetEditPageOrderData } from "./get_edit_page_order_data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = GetEditPageOrderDataSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteGetEditPageOrderData(reqJson);

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
