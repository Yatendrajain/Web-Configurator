import { count, eq, ilike, and, SQL, or, inArray } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import {
  lookupVersions,
  orderHistories,
  productTypes,
  users,
} from "@/db/schema";
import {
  lookupVersionsColumnnsType,
  orderHistoriesColumnnsType,
  productTypesColumnnsType,
  usersColumnsType,
} from "@/constants/api/types/columnTypes";
import {
  productTypesColumnns,
  lookupVersionsColumnns,
  usersColumnns,
  orderHistoriesColumnns,
} from "@/db/columns";
import { ListOrderHistoriesRequest } from "./models";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import {
  GLOBAL_SEARCH,
  MULTIPLE_ITEM_NUMBERS,
  PRODUCT_TYPE_NAME,
  USER_NAME,
} from "@/constants/api/constants/indirect_filters_names";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import {
  lookupVersionsColNames,
  orderHistoriesColNames as OHCN,
  productTypesColNames,
  usersColNames,
} from "@/constants/api/constants/column_names";

const DIRECT_FILTERS = [
  OHCN.productTypeId,
  OHCN.itemNumber,
  OHCN.itemNumberVersion,
  OHCN.orderName,
  OHCN.submissionVersion,
  OHCN.id,
  OHCN.lookupVersionId,
  OHCN.createdByUserId,
  OHCN.paxMajor,
  OHCN.paxMinor,
  OHCN.pipelineStatus,
];
const INDIRECT_ILIKE_FILTERS: Array<string> = [];
const OTHER_INDIRECT_FILTERS = [GLOBAL_SEARCH, MULTIPLE_ITEM_NUMBERS];

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type OrderHistoriesSelection = SelectedFieldsFor<
  typeof orderHistoriesColumnns
> & {
  productTypeDetails?: SelectedFieldsFor<typeof productTypesColumnns>;
} & {
  userDetails?: SelectedFieldsFor<typeof usersColumnns>;
} & {
  lookupVersionDetails?: SelectedFieldsFor<typeof lookupVersionsColumnns>;
};

export const ExecuteListOrderHistories = async (
  req: ListOrderHistoriesRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  query = applyFiltersForData(query, req.filters);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getQuery = (req: ListOrderHistoriesRequest) => {
  let query = db.select(getSelectFields(req)).from(orderHistories).$dynamic();

  query = query.leftJoin(users, eq(users.id, orderHistories.createdByUserId));
  query = query.leftJoin(
    lookupVersions,
    eq(lookupVersions.id, orderHistories.lookupVersionId),
  );
  query = query.leftJoin(
    productTypes,
    eq(productTypes.id, orderHistories.productTypeId),
  );

  return query;
};

const getCountQuery = () => {
  let query = db.select({ count: count() }).from(orderHistories).$dynamic();

  query = query.leftJoin(users, eq(users.id, orderHistories.createdByUserId));
  query = query.leftJoin(
    lookupVersions,
    eq(lookupVersions.id, orderHistories.lookupVersionId),
  );
  query = query.leftJoin(
    productTypes,
    eq(productTypes.id, orderHistories.productTypeId),
  );

  return query;
};

const getSelectFields = (req: ListOrderHistoriesRequest) => {
  let selectFields: OrderHistoriesSelection = {};

  if (
    !req.includeFields.orderHistories ||
    req.includeFields.orderHistories.length === 0
  ) {
    selectFields = { ...orderHistories, ...selectFields };
  }

  req.includeFields.orderHistories.forEach((field) => {
    if (field in OHCN) {
      (selectFields as { [key: string]: PgColumn })[field] =
        orderHistoriesColumnns[field as keyof orderHistoriesColumnnsType];
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
      if (field in productTypesColNames) {
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
      if (field in usersColNames) {
        (selectFields.userDetails as { [key: string]: PgColumn })[field] =
          usersColumnns[field as keyof usersColumnsType];
      }
    });
  }

  if (
    req.includeLookupVersionDetails === true &&
    req.includeFields.lookupVersions
  ) {
    selectFields.lookupVersionDetails = {};

    if (
      !req.includeFields.lookupVersions ||
      req.includeFields.lookupVersions.length === 0
    ) {
      selectFields.lookupVersionDetails = { ...lookupVersions };
    }

    req.includeFields.lookupVersions.forEach((field) => {
      if (field in lookupVersionsColNames) {
        (selectFields.lookupVersionDetails as { [key: string]: PgColumn })[
          field
        ] = lookupVersionsColumnns[field as keyof lookupVersionsColumnnsType];
      }
    });
  }

  return selectFields;
};

const applyFiltersForData = (
  query: QueryType,
  reqFilters: ListOrderHistoriesRequest["filters"],
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
  reqFilters: ListOrderHistoriesRequest["filters"],
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
  reqFilters: ListOrderHistoriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        orderHistoriesColumnns[filter as keyof orderHistoriesColumnnsType];
      newFilters.push(
        eq(column as PgColumn, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListOrderHistoriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column = orderHistories[filter as keyof orderHistoriesColumnnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyIndirectFilters = (
  reqFilters: ListOrderHistoriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  if (
    GLOBAL_SEARCH in reqFilters &&
    OTHER_INDIRECT_FILTERS.includes(GLOBAL_SEARCH) &&
    reqFilters.globalSearch !== undefined
  ) {
    const searchString = `%${reqFilters.globalSearch}%`;
    const filters = or(
      ilike(orderHistories.itemNumber, searchString),
      ilike(users.name, searchString),
      ilike(productTypes.name, searchString),
      ilike(orderHistories.orderName, searchString),
    );

    if (filters) newFilters.push(filters);
  }

  if (
    MULTIPLE_ITEM_NUMBERS in reqFilters &&
    OTHER_INDIRECT_FILTERS.includes(MULTIPLE_ITEM_NUMBERS) &&
    reqFilters.itemNumbers.length > 0
  ) {
    newFilters.push(inArray(orderHistories.itemNumber, reqFilters.itemNumbers));
  }

  return newFilters;
};

const applyPagination = (req: ListOrderHistoriesRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (
  req: ListOrderHistoriesRequest,
  query: QueryType,
) => {
  if (req.sortBy === PRODUCT_TYPE_NAME) {
    return query.orderBy(
      getDrizzleOrder(req.orderBy as OrderByType)(productTypes.name),
    );
  }

  if (req.sortBy === USER_NAME) {
    return query.orderBy(
      getDrizzleOrder(req.orderBy as OrderByType)(users.name),
    );
  }

  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      orderHistories[req.sortBy as keyof orderHistoriesColumnnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListOrderHistoriesRequest) => {
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
