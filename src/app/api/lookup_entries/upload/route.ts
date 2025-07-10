import { NextRequest, NextResponse } from "next/server";
import { executeUploadLookupEntries } from "./upload_lookup_entries";
import { DiffAndUploadLookupEntriesRequestSchema } from "../common_models/diff_and_upload_req_body";
import { applyCustomMiddlewares } from "../../middlewares/apply_middlewares";
import { CustomAPIError } from "@/utils/api/custom_error";

export async function POST(request: NextRequest) {
  try {
    const session = await applyCustomMiddlewares(request);

    const rawFormData = await request.formData();
    const payload = {
      productTypeId: rawFormData.get("productTypeId")?.toString(),
      file: rawFormData.get("file") as File | null,
    };

    const parsedFormData =
      DiffAndUploadLookupEntriesRequestSchema.parse(payload);

    const [res, statusCode] = await executeUploadLookupEntries(
      parsedFormData,
      session,
    );

    return NextResponse.json(res, { status: statusCode });
  } catch (error) {
    const { clientMessage, innerError, statusCode, traceback } = (() => {
      if (error instanceof CustomAPIError) {
        return {
          clientMessage: error.clientMessage,
          innerError: error.innerError,
          statusCode: error.statusCode,
          traceback: error.stack,
        };
      }
      return {
        clientMessage: "Error uploading the CFCO's!",
        innerError: error,
        statusCode: 500,
        traceback: error instanceof Error ? error.stack : null,
      };
    })();

    console.error(clientMessage, error);

    return NextResponse.json(
      {
        message: clientMessage,
        error: innerError,
        traceback: traceback,
      },
      { status: statusCode },
    );
  }
}
