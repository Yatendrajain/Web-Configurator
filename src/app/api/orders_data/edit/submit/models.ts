import { ProcessAreasOptions } from "@/constants/common/enums/process_areas_options";
import { z } from "zod";

export const SubmitEditOrderSchema = z.object({
  itemNumber: z.string(),
  itemNumberVersion: z.string(),
  lookupVersionId: z.string().uuid(),
  productTypeId: z.string().uuid(),
  productTypeCode: z.string().optional(),
  systemFields: z.object({
    productNo: z
      .string()
      .regex(/^(0[1-9]|[1-9][0-9])$/, "Must be two digits from 01 to 99"),

    unitId: z
      .number()
      .int("Must be a whole number")
      .min(1, "Must be at least 1")
      .max(254, "Must be at most 254"),

    dataServerArea: z
      .string()
      .regex(/^L(0[1-9]|[1-9][0-9])$/, "Must be 'L' followed by 01–99"),

    alarmServerArea: z
      .string()
      .regex(/^A(0[1-9]|[1-9][0-9])$/, "Must be 'A' followed by 01–99"),

    processArea: z.nativeEnum(ProcessAreasOptions),

    paxMajor: z.number().int("Must be a whole number"),
    paxMinor: z.number().int("Must be a whole number"),
  }),

  changedOrderData: z.object({
    mappedSection: z.record(z.string(), z.string()),
    unmappedSection: z.record(z.string(), z.string()),
  }),
});

export type SubmitEditOrderRequest = z.infer<typeof SubmitEditOrderSchema>;
