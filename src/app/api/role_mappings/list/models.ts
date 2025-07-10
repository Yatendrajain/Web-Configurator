import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import {
  roleMappingsColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([
  roleMappingsColNames.appRole,
  roleMappingsColNames.azureAdRole,
  roleMappingsColNames.updatedAt,
]);

const includeFieldsSchema = z.object({
  users: z
    .array(z.enum(Object.keys(usersColNames) as [string, ...string[]]))
    .optional()
    .default([usersColNames.id, usersColNames.name, usersColNames.isActive]),
  roleMappings: z
    .array(z.enum(Object.keys(roleMappingsColNames) as [string, ...string[]]))
    .optional()
    .default([
      roleMappingsColNames.id,
      roleMappingsColNames.appRole,
      roleMappingsColNames.azureAdRole,
      roleMappingsColNames.updatedAt,
    ]),
});

const FiltersSchema = z.object({
  id: z.string().uuid().optional(),
  appRole: z.string().optional(),
  azureAdRole: z.string().optional(),
});

export const ListRoleMappingsRequestSchema = z.object({
  filters: FiltersSchema.optional().default({}),
  includeFields: includeFieldsSchema.strict().default({}),
  includeUserDetails: z.boolean().default(false),
  orderBy: AllowedOrderBy.default(ORDER_BY.ASC),
  sortBy: AllowedSortBy.default(roleMappingsColNames.appRole),
  maxPageLimit: z.boolean().default(true),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListRoleMappingsRequest = z.infer<
  typeof ListRoleMappingsRequestSchema
>;
