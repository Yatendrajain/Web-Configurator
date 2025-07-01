import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { usersColNames } from "@/constants/api/constants/column_names";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([
  usersColNames.name,
  usersColNames.createdAt,
  usersColNames.updatedAt,
]);

const includeFieldsSchema = z.object({
  users: z
    .array(z.enum(Object.keys(usersColNames) as [string, ...string[]]))
    .optional()
    .default([]),
});

const FiltersSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  isActive: z.boolean().default(true),
  azureUserId: z.string().optional(),
});

export const ListUsersRequestSchema = z.object({
  filters: FiltersSchema.default({ isActive: true }),
  includeFields: includeFieldsSchema.strict().default({}),
  orderBy: AllowedOrderBy.default(ORDER_BY.ASC),
  sortBy: AllowedSortBy.default(usersColNames.name),
  maxPageLimit: z.boolean().default(false),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListUsersRequest = z.infer<typeof ListUsersRequestSchema>;
