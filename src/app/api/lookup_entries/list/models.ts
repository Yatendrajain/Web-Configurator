import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { LOOKUP_ENTRY_TYPES } from "@/constants/api/enums/lookup_entry_types";
import {
  lookupEntriesColNames,
  lookupVersionsColNames,
} from "@/constants/api/constants/column_names";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([
  lookupEntriesColNames.identifier,
  lookupVersionsColNames.createdAt,
]);

const includeFieldsSchema = z.object({
  lookupEntries: z
    .array(z.enum(Object.keys(lookupEntriesColNames) as [string, ...string[]]))
    .optional()
    .default([]),
  availableIdentifiers: z
    .array(z.enum(Object.keys(lookupEntriesColNames) as [string, ...string[]]))
    .optional()
    .default([]),
  lookupVersions: z
    .array(z.enum(Object.keys(lookupVersionsColNames) as [string, ...string[]]))
    .optional()
    .default([lookupVersionsColNames.id, lookupVersionsColNames.versionName]),
});

const FiltersSchema = z.object({
  id: z.string().uuid().optional(),
  lookupVersionId: z.string().uuid().optional(),
  uploadedByUserId: z.string().uuid().optional(),
  productTypeId: z.string().uuid().optional(),
  parent: z.string().optional(),
  identifier: z.string().optional(),
  identifiers: z.array(z.string()).optional(),
  type: z.string().optional().default(LOOKUP_ENTRY_TYPES.CF),
  description: z.string().optional(),
});

export const ListLookupEntriesRequestSchema = z
  .object({
    filters: FiltersSchema.optional().default({}),
    includeFields: includeFieldsSchema.strict().default({}),
    getLatestVersionData: z.boolean().default(true),
    includeLookupVersionInfo: z.boolean().default(true),
    showMapping: z.boolean().default(true),
    orderBy: AllowedOrderBy.default(ORDER_BY.ASC),
    sortBy: AllowedSortBy.default(lookupEntriesColNames.identifier),
    maxPageLimit: z.boolean().default(false),
    pageLimit: z.number().int().min(1).default(10),
    page: z.number().int().min(1).default(1),
  })
  .superRefine((data, ctx) => {
    if (data.getLatestVersionData && !data.filters.productTypeId) {
      ctx.addIssue({
        path: ["filters", "productTypeId"],
        code: z.ZodIssueCode.custom,
        message: "productTypeId is required when getLatestVersionData is true",
      });
    }
  });

export type ListLookupEntriesRequest = z.infer<
  typeof ListLookupEntriesRequestSchema
>;
