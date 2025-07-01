import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import {
  lookupVersionsColNames,
  orderHistoriesColNames as OHCN,
  productTypesColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";
import {
  PRODUCT_TYPE_NAME,
  USER_NAME,
} from "@/constants/api/constants/indirect_filters_names";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([OHCN.createdAt, USER_NAME, PRODUCT_TYPE_NAME]);

const includeFieldsSchema = z.object({
  orderHistories: z
    .array(z.enum(Object.keys(OHCN) as [string, ...string[]]))
    .optional()
    .default([
      OHCN.id,
      OHCN.itemNumber,
      OHCN.submissionVersion,
      OHCN.pipelineStatus,
      OHCN.pipelineStatusUrl,
      OHCN.createdByUserId,
      OHCN.createdAt,
    ]),
  lookupVersions: z
    .array(z.enum(Object.keys(lookupVersionsColNames) as [string, ...string[]]))
    .optional()
    .default([lookupVersionsColNames.id, lookupVersionsColNames.versionName]),
  users: z
    .array(z.enum(Object.keys(usersColNames) as [string, ...string[]]))
    .optional()
    .default([usersColNames.id, usersColNames.name]),
  productTypes: z
    .array(z.enum(Object.keys(productTypesColNames) as [string, ...string[]]))
    .optional()
    .default([
      productTypesColNames.id,
      productTypesColNames.name,
      productTypesColNames.isActive,
    ]),
});

const FiltersSchema = z.object({
  productTypeId: z.string().uuid().optional(),
  id: z.string().uuid().optional(),
  itemNumber: z.string().optional(),
  itemNumberVersion: z.string().optional(),
  orderName: z.string().optional(),
  submissionVersion: z.string().optional(),
  lookupVersionId: z.string().uuid().optional(),
  createdByUserId: z.string().uuid().optional(),
  paxMajor: z.number().optional(),
  paxMinor: z.number().optional(),
  itemNumbers: z.array(z.string()).optional().default([]),
  globalSearch: z.string().optional(),
});

export const ListOrderHistoriesRequestSchema = z.object({
  filters: FiltersSchema.optional().default({}),
  includeFields: includeFieldsSchema.strict().default({}),
  includeLookupVersionDetails: z.boolean().default(false),
  includeUserDetails: z.boolean().default(true),
  includeProductTypeDetails: z.boolean().default(false),
  orderBy: AllowedOrderBy.default(ORDER_BY.ASC),
  sortBy: AllowedSortBy.default(OHCN.createdAt),
  maxPageLimit: z.boolean().default(false),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListOrderHistoriesRequest = z.infer<
  typeof ListOrderHistoriesRequestSchema
>;
