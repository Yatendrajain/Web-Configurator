import { NextRequest, NextResponse } from "next/server";
import { processUploadedCFCOFile } from "./upload_lookup_entries";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const lookup_version = formData.get("lookup_version");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No valid file uploaded." },
        { status: 400 },
      );
    }

    const fileName = file.name;

    const result = await processUploadedCFCOFile(
      file,
      lookup_version as string,
      fileName,
    );

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error uploading CFCO file:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error uploading CFCO file",
        traceback: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    );
  }
}
