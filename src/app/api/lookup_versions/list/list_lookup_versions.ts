import { count, eq, ilike, and, SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import { lookupVersions, productTypes, users } from "@/db/schema";
import {
  lookupVersionsColumnnsType,
  productTypesColumnnsType,
  usersColumnsType,
} from "@/constants/api/types/columnTypes";
import {
  productTypesColumnns,
  lookupVersionsColumnns,
  usersColumnns,
} from "@/db/columns";
import { ListLookupVersionsRequest } from "./models";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import {
  PRODUCT_TYPE_NAME,
  PRODUCT_TYPE_CODE,
  ACTIVE_PRODUCT_TYPE,
} from "@/constants/api/constants/indirect_filters_names";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import { lookupVersionsColNames } from "@/constants/api/constants/column_names";

const DIRECT_FILTERS = [
  lookupVersionsColNames.id,
  lookupVersionsColNames.versionName,
  lookupVersionsColNames.uploadedByUserId,
  lookupVersionsColNames.productTypeId,
];
const INDIRECT_ILIKE_FILTERS = [
  PRODUCT_TYPE_NAME,
  lookupVersionsColNames.remarks,
  lookupVersionsColNames.fileName,
];

const OTHER_INDIRECT_FILTERS = [PRODUCT_TYPE_CODE, ACTIVE_PRODUCT_TYPE];

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type LookupVersionsSelection = SelectedFieldsFor<
  typeof lookupVersionsColumnns
> & {
  productTypeDetails?: SelectedFieldsFor<typeof productTypesColumnns>;
} & {
  userDetails?: SelectedFieldsFor<typeof usersColumnns>;
};

export const ExecuteListLookupVersions = async (
  req: ListLookupVersionsRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  query = applyFiltersForData(query, req.filters);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getQuery = (req: ListLookupVersionsRequest) => {
  let query = db.select(getSelectFields(req)).from(lookupVersions).$dynamic();
  query = query.innerJoin(
    productTypes,
    eq(lookupVersions.productTypeId, productTypes.id),
  );

  if (req.includeUserDetails === true) {
    query = query.leftJoin(
      users,
      eq(lookupVersions.uploadedByUserId, users.id),
    );
  }

  return query;
};

const getCountQuery = () => {
  let query = db.select({ count: count() }).from(lookupVersions).$dynamic();
  query = query.innerJoin(
    productTypes,
    eq(lookupVersions.productTypeId, productTypes.id),
  );

  return query;
};

const getSelectFields = (req: ListLookupVersionsRequest) => {
  let selectFields: LookupVersionsSelection = {};

  if (
    !req.includeFields.lookupVersions ||
    req.includeFields.lookupVersions.length === 0
  ) {
    selectFields = { ...lookupVersionsColumnns, ...selectFields };
  }

  req.includeFields.lookupVersions.forEach((field) => {
    if (field in lookupVersionsColumnns) {
      (selectFields as { [key: string]: PgColumn })[field] =
        lookupVersionsColumnns[field as keyof lookupVersionsColumnnsType];
    }
  });

  if (
    req.includeProductTypeDetails === true &&
    req.includeFields.productTypes
  ) {
    selectFields.productTypeDetails = {};

    if (
      !req.includeFields.productTypes ||
      req.includeFields.productTypes.length === 0
    ) {
      selectFields.productTypeDetails = { ...productTypesColumnns };
    }

    req.includeFields.productTypes.forEach((field) => {
      if (field in productTypesColumnns) {
        (selectFields.productTypeDetails as { [key: string]: PgColumn })[
          field
        ] = productTypesColumnns[field as keyof productTypesColumnnsType];
      }
    });
  }

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
  reqFilters: ListLookupVersionsRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
      ...applyIndirectFilters(reqFilters),
    ),
  );
};

const applyFiltersForCount = (
  query: CountQueryType,
  reqFilters: ListLookupVersionsRequest["filters"],
) => {
  return query.where(
    and(
      ...applyDirectFilters(reqFilters),
      ...applyIndirectIlikeFilters(reqFilters),
      ...applyIndirectFilters(reqFilters),
    ),
  );
};

const applyDirectFilters = (
  reqFilters: ListLookupVersionsRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        lookupVersionsColumnns[filter as keyof lookupVersionsColumnnsType];
      newFilters.push(
        eq(column as PgColumn, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListLookupVersionsRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        lookupVersionsColumnns[filter as keyof lookupVersionsColumnnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyIndirectFilters = (
  reqFilters: ListLookupVersionsRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  if (
    OTHER_INDIRECT_FILTERS.includes(ACTIVE_PRODUCT_TYPE) &&
    reqFilters[ACTIVE_PRODUCT_TYPE] !== undefined
  ) {
    newFilters.push(eq(productTypes.isActive, reqFilters[ACTIVE_PRODUCT_TYPE]));
  }

  if (
    OTHER_INDIRECT_FILTERS.includes(PRODUCT_TYPE_CODE) &&
    reqFilters[PRODUCT_TYPE_CODE] !== undefined
  ) {
    newFilters.push(
      eq(productTypes.productTypeCode, reqFilters[PRODUCT_TYPE_CODE]),
    );
  }

  return newFilters;
};

const applyPagination = (req: ListLookupVersionsRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (
  req: ListLookupVersionsRequest,
  query: QueryType,
) => {
  if (req.sortBy === PRODUCT_TYPE_NAME) {
    return query.orderBy(
      getDrizzleOrder(req.orderBy as OrderByType)(productTypes.name),
    );
  }

  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      lookupVersions[req.sortBy as keyof lookupVersionsColumnnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListLookupVersionsRequest) => {
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
