import { NextRequest, NextResponse } from "next/server";
import { ListProductTypesRequestSchema } from "./models";
import { ExecuteListProductTypes } from "./list_product_types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListProductTypesRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListProductTypes(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = "Error fetching product types!";

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
