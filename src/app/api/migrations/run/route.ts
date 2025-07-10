import { runMigrations } from "@/db/migrate";
import { CustomAPIError } from "@/utils/api/custom_error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    //todo: it is temp, need to be removed if not found any good solution
    const { dbMigrationSecret } = await request.json();

    if (!process.env.DB_MIGRATION_SECRET) {
      throw new CustomAPIError({
        clientMessage: "DB Migration Secret is not set!",
        innerError: "DB_MIGRATION_SECRET environment variable is missing",
        statusCode: 400,
      });
    }

    if (dbMigrationSecret !== process.env.DB_MIGRATION_SECRET) {
      throw new CustomAPIError({
        clientMessage: "Unauthorized!",
        innerError: "Invalid DB Migration Secret",
        statusCode: 403,
      });
    }

    await runMigrations();

    return NextResponse.json({ status: 200 });
  } catch (error) {
    const message = "Error Migrating Database!";

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
