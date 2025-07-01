import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import {
  productTypesColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";

const AllowedSortBy = z.enum([
  productTypesColNames.name,
  productTypesColNames.updatedAt,
]);
const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);

const includeFieldsSchema = z.object({
  productTypes: z
    .array(z.enum(Object.keys(productTypesColNames) as [string, ...string[]]))
    .optional()
    .default([]),
  users: z
    .array(z.enum(Object.keys(usersColNames) as [string, ...string[]]))
    .optional()
    .default([usersColNames.id, usersColNames.name]),
});

const FiltersSchema = z.object({
  name: z.string().optional(),
  productTypeCode: z.string().optional(),
  id: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

export const ListProductTypesRequestSchema = z.object({
  filters: FiltersSchema.default({ isActive: true }),
  includeFields: includeFieldsSchema.strict().default({}),
  includeUserDetails: z.boolean().default(false),
  orderBy: AllowedOrderBy.default(ORDER_BY.ASC),
  sortBy: AllowedSortBy.default(productTypesColNames.name),
  maxPageLimit: z.boolean().default(false),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListProductTypesRequest = z.infer<
  typeof ListProductTypesRequestSchema
>;
