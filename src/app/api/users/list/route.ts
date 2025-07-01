import { NextRequest, NextResponse } from "next/server";
import { ListUsersRequestSchema } from "./models";
import { ExecuteListUsers } from "./list_users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsedParams = JSON.parse(
      decodeURIComponent(searchParams.get("data")!),
    );

    const reqJson = ListUsersRequestSchema.parse(parsedParams);

    const [res, statusCode] = await ExecuteListUsers(reqJson);

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const message = "Error fetching Users data!";

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
