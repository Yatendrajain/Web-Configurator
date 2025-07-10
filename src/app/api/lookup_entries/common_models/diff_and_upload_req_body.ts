import { z } from "zod";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const DiffAndUploadLookupEntriesRequestSchema = z.object({
  productTypeId: z.string().uuid(),
  file: z
    .instanceof(File, {
      message: "File is required and must be a browser File.",
    })
    .refine((file) => file.name.toLowerCase().endsWith(".xlsx"), {
      message: "Only .xlsx files are allowed.",
    })
    .refine(
      (file) =>
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      { message: "File must be a valid Excel .xlsx document." },
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File must be smaller than 10MB.",
    }),
});

export type DiffAndUploadLookupEntriesRequest = z.infer<
  typeof DiffAndUploadLookupEntriesRequestSchema
>;
