import { CustomAPIError } from "@/utils/api/custom_error";

export const validateFileNameAndGetInfo = (
  filename: string,
): [string, string] => {
  // regex breakdown:
  // ^\d+_           — start, 1+ digits, underscore
  // ([A-Z]{2})_     — capture 2 uppercase letters, underscore
  // ([A-Za-z0-9_]+) — capture 1+ alphanum or underscore
  // _FBOM           — literal “_FBOM”
  // (?:\.xlsx)?$    — optional “.xlsx” at end
  const re = /^\d+_([A-Z]{2})_([A-Za-z0-9_]+)_FBOM(?:\.xlsx)?$/;

  const m = filename.match(re);
  if (!m) {
    throw new CustomAPIError({
      clientMessage: `Invalid file name format: ${filename}. Expected format: <version>_<product_type>_<file_name>_FBOM.xlsx`,
      innerError: `Invalid file name format: ${filename}. Expected format: <version>_<product_type>_<file_name>_FBOM.xlsx`,
      statusCode: 400,
    });
  }

  return [m[1], m[2]];
};
