import { CustomAPIError } from "@/utils/api/custom_error";
import * as XLSX from "xlsx";
import { CFCOFileFieldsSchemaType } from "../common_models/cfco_file_fields_schema";

export const validateAndGetDataFromCFCOExcelTab = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const cfcoSheet = workbook.SheetNames.find(
    (name) => name.trim().toLowerCase() === "cfco",
  );
  if (!cfcoSheet)
    throw new CustomAPIError({
      clientMessage: "CFCO sheet doesnt exists!",
      innerError: "CFCO sheet doesnt exists!",
      statusCode: 400,
    });

  const sheet = workbook.Sheets[cfcoSheet];
  const raw = XLSX.utils.sheet_to_json<CFCOFileFieldsSchemaType>(sheet, {
    defval: "",
  });

  const cfcos = raw.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, val]) => [key, String(val ?? "")]),
    ),
  ) as CFCOFileFieldsSchemaType[];

  return cfcos;
};
