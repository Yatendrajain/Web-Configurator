import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { PRODUCT_TYPE_NAME } from "@/constants/api/constants/indirect_filters_names";
import {
  lookupVersionsColNames,
  productTypesColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([
  PRODUCT_TYPE_NAME,
  lookupVersionsColNames.versionName,
  lookupVersionsColNames.createdAt,
]);

const includeFieldsSchema = z.object({
  lookupVersions: z
    .array(z.enum(Object.keys(lookupVersionsColNames) as [string, ...string[]]))
    .optional()
    .default([]),
  productTypes: z
    .array(z.enum(Object.keys(productTypesColNames) as [string, ...string[]]))
    .optional()
    .default([
      productTypesColNames.id,
      productTypesColNames.name,
      productTypesColNames.isActive,
    ]),
  users: z
    .array(z.enum(Object.keys(usersColNames) as [string, ...string[]]))
    .optional()
    .default([usersColNames.id, usersColNames.name]),
});

const FiltersSchema = z.object({
  id: z.string().uuid().optional(),
  versionName: z.string().optional(),
  uploadedByUserId: z.string().uuid().optional(),
  productTypeId: z.string().uuid().optional(),
  productTypeName: z.string().optional(),
  productTypeIsActive: z.boolean().default(true),
  productTypeCode: z.string().optional(),
  fileName: z.string().optional(),
  remarks: z.string().optional(),
});

export const ListLookupVersionsRequestSchema = z.object({
  filters: FiltersSchema.optional().default({}),
  includeFields: includeFieldsSchema.strict().default({}),
  includeProductTypeDetails: z.boolean().default(true),
  includeUserDetails: z.boolean().default(true),
  orderBy: z.string(AllowedOrderBy).default(ORDER_BY.ASC),
  sortBy: z.string(AllowedSortBy).default(PRODUCT_TYPE_NAME),
  maxPageLimit: z.boolean().default(false),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListLookupVersionsRequest = z.infer<
  typeof ListLookupVersionsRequestSchema
>;
