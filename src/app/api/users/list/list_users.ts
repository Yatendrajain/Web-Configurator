import { count, eq, ilike, and, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import { users } from "@/db/schema";
import { usersColumnsType } from "@/constants/api/types/columnTypes";
import { usersColumnns } from "@/db/columns";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import { ListUsersRequest } from "./models";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import { usersColNames } from "@/constants/api/constants/column_names";

const DIRECT_FILTERS = [
  usersColNames.id,
  usersColNames.azureUserId,
  usersColNames.isActive,
];
const INDIRECT_ILIKE_FILTERS = [usersColNames.name];

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type UsersSelection = SelectedFieldsFor<typeof usersColumnns>;

export const ExecuteListUsers = async (
  req: ListUsersRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  query = applyFiltersForData(query, req.filters);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getQuery = (req: ListUsersRequest) => {
  return db.select(getSelectFields(req)).from(users).$dynamic();
};

const getCountQuery = () => {
  return db.select({ count: count() }).from(users).$dynamic();
};

const getSelectFields = (req: ListUsersRequest) => {
  let selectFields: UsersSelection = {};

  if (!req.includeFields.users || req.includeFields.users.length === 0) {
    selectFields = { ...usersColumnns, ...selectFields };
  }

  req.includeFields.users.forEach((field) => {
    if (field in usersColumnns) {
      (selectFields as { [key: string]: PgColumn })[field] =
        usersColumnns[field as keyof usersColumnsType];
    }
  });

  return selectFields;
};

const applyFiltersForData = (
  query: QueryType,
  reqFilters: ListUsersRequest["filters"],
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
  reqFilters: ListUsersRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
    ),
  );
};

const applyDirectFilters = (
  reqFilters: ListUsersRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column = usersColumnns[filter as keyof usersColumnsType];
      newFilters.push(
        eq(column as PgColumn, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListUsersRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column = usersColumnns[filter as keyof usersColumnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyPagination = (req: ListUsersRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (req: ListUsersRequest, query: QueryType) => {
  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      usersColumnns[req.sortBy as keyof usersColumnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListUsersRequest) => {
  const paginationData = {
    page: req.page,
    pageLimit: req.pageLimit,
    totalCount: 0,
    totalPages: 0,
  };

  const res = await applyFiltersForCount(getCountQuery(), req.filters);

  paginationData.totalCount = (res[0]?.count ?? 0) as number;
  paginationData.totalPages = Math.ceil(
    paginationData.totalCount / req.pageLimit,
  );

  return paginationData;
};
