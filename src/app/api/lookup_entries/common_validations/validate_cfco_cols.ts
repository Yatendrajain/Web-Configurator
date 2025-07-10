import { ZodIssueCode } from "zod";
import { CFCODataArraySchema } from "../common_models/cfco_file_entries_schema";
import { CustomAPIError } from "@/utils/api/custom_error";

export const validateCFCOsColumns = (newCFCOs: object) => {
  const res = CFCODataArraySchema.safeParse(newCFCOs);

  if (res.success) return res.data;
  let errMsg = "";
  res.error.issues.forEach((issue) => {
    switch (issue.code) {
      case ZodIssueCode.unrecognized_keys:
        // extra column(s)
        // issue.keys is an array of unknown keys at top‑level
        errMsg = `Excel Issue: Unexpected column${issue.keys.length > 1 ? "s" : ""}: ${issue.keys.join(", ")}`;

      case ZodIssueCode.invalid_type:
        // missing or wrong type
        // Only access 'received' if it exists on the issue
        if ("received" in issue && issue.received === "undefined") {
          errMsg = `Excel Issue: Missing column: ${issue.path.join(".")}`;
        }
        // Otherwise it's a type mismatch
        if (issue.code === ZodIssueCode.invalid_type && "expected" in issue) {
          errMsg = `Excel Issue: Column ${issue.path.join(".")} should be of type ${issue.expected}`;
        }
      default:
        // fallback for any other Zod errors
        errMsg = `Excel Issue: ${issue.path.join(".")}: ${issue.message}`;
    }
  });

  throw new CustomAPIError({
    clientMessage: errMsg,
    innerError: errMsg,
    statusCode: 400,
  });
};
