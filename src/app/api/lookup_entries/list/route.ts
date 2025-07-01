import { NextRequest, NextResponse } from "next/server";
import { ListLookupEntriesRequestSchema } from "./models";
import { ExecuteListLookEntries } from "./list_lookup_entries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListLookupEntriesRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListLookEntries(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = `Error fetching CF-CO's!`;

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
