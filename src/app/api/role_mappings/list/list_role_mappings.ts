import { count, eq, ilike, and, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import { roleMappings, users } from "@/db/schema";
import { roleMappingsColumnns, usersColumnns } from "@/db/columns";
import { ListRoleMappingsRequest } from "./models";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import type {
  roleMappingsColumnnsType,
  usersColumnsType,
} from "@/constants/api/types/columnTypes";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import { roleMappingsColNames } from "@/constants/api/constants/column_names";

const DIRECT_FILTERS = [roleMappingsColNames.id];
const INDIRECT_ILIKE_FILTERS = [
  roleMappingsColNames.appRole,
  roleMappingsColNames.azureAdRole,
];

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type RoleMappingSelection = SelectedFieldsFor<typeof roleMappingsColumnns> & {
  userDetails?: SelectedFieldsFor<typeof usersColumnns>;
};

export const ExecuteListRoleMappings = async (
  req: ListRoleMappingsRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  query = applyFiltersForData(query, req.filters);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getQuery = (req: ListRoleMappingsRequest) => {
  if (req.includeUserDetails) {
    return db
      .select(getSelectFields(req))
      .from(roleMappings)
      .leftJoin(users, eq(roleMappings.createdBy, users.id))
      .$dynamic();
  }

  return db.select(getSelectFields(req)).from(roleMappings).$dynamic();
};

const getCountQuery = (req: ListRoleMappingsRequest) => {
  if (req.includeUserDetails) {
    return db
      .select({ count: count() })
      .from(roleMappings)
      .leftJoin(users, eq(roleMappings.createdBy, users.id))
      .$dynamic();
  }

  return db.select({ count: count() }).from(roleMappings).$dynamic();
};

const getSelectFields = (req: ListRoleMappingsRequest) => {
  let selectFields: RoleMappingSelection = {};

  if (
    !req.includeFields.roleMappings ||
    req.includeFields.roleMappings.length === 0
  ) {
    selectFields = { ...roleMappingsColumnns, ...selectFields };
  }

  req.includeFields.roleMappings.forEach((field) => {
    if (field in roleMappingsColumnns) {
      (selectFields as { [key: string]: PgColumn })[field] =
        roleMappingsColumnns[field as keyof roleMappingsColumnnsType];
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
  reqFilters: ListRoleMappingsRequest["filters"],
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
  reqFilters: ListRoleMappingsRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
    ),
  );
};

const applyDirectFilters = (
  reqFilters: ListRoleMappingsRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        roleMappingsColumnns[filter as keyof roleMappingsColumnnsType];
      newFilters.push(
        eq(column as PgColumn, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListRoleMappingsRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        roleMappingsColumnns[filter as keyof roleMappingsColumnnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyPagination = (req: ListRoleMappingsRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (
  req: ListRoleMappingsRequest,
  query: QueryType,
) => {
  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      roleMappings[req.sortBy as keyof roleMappingsColumnnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListRoleMappingsRequest) => {
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
