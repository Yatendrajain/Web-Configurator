import { NextRequest, NextResponse } from "next/server";
import { ListLookupVersionsRequestSchema } from "./models";
import { ExecuteListLookupVersions } from "./list_lookup_versions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListLookupVersionsRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListLookupVersions(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = "Error fetching CF-CO Versions!";

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
