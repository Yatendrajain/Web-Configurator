import { count, eq, ilike, and, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import { productTypes, users } from "@/db/schema";
import { productTypesColumnns, usersColumnns } from "@/db/columns";
import { ListProductTypesRequest } from "./models";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import type {
  productTypesColumnnsType,
  usersColumnsType,
} from "@/constants/api/types/columnTypes";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import { productTypesColNames } from "@/constants/api/constants/column_names";

const DIRECT_FILTERS = [
  productTypesColNames.id,
  productTypesColNames.isActive,
  productTypesColNames.productTypeCode,
];
const INDIRECT_ILIKE_FILTERS = [productTypesColNames.name];

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type ProductTypesSelection = SelectedFieldsFor<typeof productTypesColumnns> & {
  userDetails?: SelectedFieldsFor<typeof usersColumnns>;
};

export const ExecuteListProductTypes = async (
  req: ListProductTypesRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  query = applyFiltersForData(query, req.filters);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getQuery = (req: ListProductTypesRequest) => {
  if (req.includeUserDetails) {
    return db
      .select(getSelectFields(req))
      .from(productTypes)
      .leftJoin(users, eq(productTypes.createdByUserId, users.id))
      .$dynamic();
  }

  return db.select(getSelectFields(req)).from(productTypes).$dynamic();
};

const getCountQuery = (req: ListProductTypesRequest) => {
  if (req.includeUserDetails) {
    return db
      .select({ count: count() })
      .from(productTypes)
      .leftJoin(users, eq(productTypes.createdByUserId, users.id))
      .$dynamic();
  }

  return db.select({ count: count() }).from(productTypes).$dynamic();
};

const getSelectFields = (req: ListProductTypesRequest) => {
  let selectFields: ProductTypesSelection = {};

  if (
    !req.includeFields.productTypes ||
    req.includeFields.productTypes.length === 0
  ) {
    selectFields = { ...productTypesColumnns, ...selectFields };
  }

  req.includeFields.productTypes.forEach((field) => {
    if (field in productTypesColumnns) {
      (selectFields as { [key: string]: PgColumn })[field] =
        productTypesColumnns[field as keyof productTypesColumnnsType];
    }
  });

  if (req.includeUserDetails === true && req.includeFields.users) {
    selectFields.userDetails = {};

    if (!req.includeFields.users || req.includeFields.users.length === 0) {
      selectFields.userDetails = { ...usersColumnns };
    }

    req.includeFields.users.forEach((field) => {
      if (field in usersColumnns) {
        (selectFields.userDetails as { [key: string]: PgColumn })[field] =
          usersColumnns[field as keyof usersColumnsType];
      }
    });
  }

  return selectFields;
};

const applyFiltersForData = (
  query: QueryType,
  reqFilters: ListProductTypesRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
    ),
  );
};

const applyFiltersForCount = (
  query: CountQueryType,
  reqFilters: ListProductTypesRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
    ),
  );
};

const applyDirectFilters = (
  reqFilters: ListProductTypesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        productTypesColumnns[filter as keyof productTypesColumnnsType];
      newFilters.push(
        eq(column as PgColumn, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListProductTypesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        productTypesColumnns[filter as keyof productTypesColumnnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyPagination = (req: ListProductTypesRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (
  req: ListProductTypesRequest,
  query: QueryType,
) => {
  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      productTypesColumnns[req.sortBy as keyof productTypesColumnnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListProductTypesRequest) => {
  const paginationData = {
    page: req.page,
    pageLimit: req.pageLimit,
    totalCount: 0,
    totalPages: 0,
  };

  const res = await applyFiltersForCount(getCountQuery(req), req.filters);

  paginationData.totalCount = (res[0]?.count ?? 0) as number;
  paginationData.totalPages = Math.ceil(
    paginationData.totalCount / req.pageLimit,
  );

  return paginationData;
};
