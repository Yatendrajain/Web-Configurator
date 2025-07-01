import { z } from "zod";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { INSTALLED_BASE_ATTRIBUTES_LIST } from "@/constants/api/constants/tacton_attributs_list";
import { INSTALLED_BASE_ATTRIBUTES as IBA } from "@/constants/api/enums/tacton_attributes";

const AllowedOrderBy = z.enum([ORDER_BY.ASC, ORDER_BY.DESC]);
const AllowedSortBy = z.enum([IBA.ITEM_NUMBER]);
const AllowedExcludeFields = z.enum(
  INSTALLED_BASE_ATTRIBUTES_LIST as [string, ...string[]],
);

const FiltersSchema = z.object({
  productTypeCode: z.string(),
  itemNumber: z.string().optional(),
  version: z.string().optional(),
});

export const ProcessedFilterSchema = FiltersSchema.transform(
  ({ productTypeCode, ...rest }) => ({
    productFamilyFromOriginProduct: productTypeCode,
    ...rest,
  }),
);

export const ListOrdersDataRequestSchema = z.object({
  filters: ProcessedFilterSchema,
  excludeFields: z
    .array(AllowedExcludeFields)
    .default([IBA.CONFIGURATION_STRING, IBA.CONFIGURATION_STRING_AS_JSON]),
  includeResourceDetails: z.boolean().default(false),
  orderBy: z.string(AllowedOrderBy).default(ORDER_BY.DESC),
  sortBy: z.string(AllowedSortBy).default(IBA.ITEM_NUMBER),
  pageLimit: z.number().int().min(1).default(10),
  page: z.number().int().min(1).default(1),
});

export type ListOrdersDataRequest = z.infer<typeof ListOrdersDataRequestSchema>;
