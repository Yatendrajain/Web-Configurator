import {
  eq,
  ilike,
  and,
  SQL,
  aliasedTable,
  sql,
  inArray,
  getTableColumns,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import db from "@/db/client";
import { lookupVersions, lookupEntries } from "@/db/schema";
import { ListLookupEntriesRequest } from "./models";
import { getDrizzleOrder } from "@/utils/api/drizzleOrder";
import type { OrderByType } from "@/constants/api/types/orderByType";
import { lookupEntriesColumnns, lookupVersionsColumnns } from "@/db/columns";
import { SelectedFieldsFor } from "@/constants/api/types/select_fields_for_type";
import {
  lookupEntriesColumnnsType,
  lookupVersionsColumnnsType,
} from "@/constants/api/types/columnTypes";
import {
  lookupEntriesColNames,
  lookupVersionsColNames,
  productTypesColNames,
} from "@/constants/api/constants/column_names";
import { MULTIPLE_IDENTIFIERS } from "@/constants/api/constants/indirect_filters_names";
import { ORDER_BY } from "@/constants/api/enums/orderBy";
import { ExecuteListLookupVersions } from "../../lookup_versions/list/list_lookup_versions";
import { ListLookupVersionsRequestSchema } from "../../lookup_versions/list/models";

const DIRECT_FILTERS = [
  lookupEntriesColNames.id,
  lookupEntriesColNames.lookupVersionId,
  lookupEntriesColNames.type,
];
const INDIRECT_ILIKE_FILTERS = [
  lookupEntriesColNames.parent,
  lookupEntriesColNames.identifier,
  lookupEntriesColNames.description,
];
const OTHER_INDIRECT_FILTERS = [
  MULTIPLE_IDENTIFIERS,
  lookupVersionsColNames.uploadedByUserId,
  lookupVersionsColNames.productTypeId,
];

const parentLookupEntries = aliasedTable(lookupEntries, "parentLookupEntries");
const childLookupEntries = aliasedTable(lookupEntries, "childLookupEntries");
const parentLookupEntriesColumns = getTableColumns(parentLookupEntries);

type QueryType = ReturnType<typeof getQuery>;
type CountQueryType = ReturnType<typeof getCountQuery>;
type LookupEntriesSelection = SelectedFieldsFor<
  typeof lookupEntriesColumnns
> & {
  availableIdentifiers?: SQL.Aliased<unknown>;
} & {
  lookupVersionDetails?: SelectedFieldsFor<typeof lookupVersionsColumnns>;
};

interface LookupVersionResponse {
  list: Array<{
    id: string;
    versionName: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const ExecuteListLookEntries = async (
  req: ListLookupEntriesRequest,
): Promise<[object, number]> => {
  let query = getQuery(req);

  if (req.getLatestVersionData)
    req.filters.lookupVersionId = await getLatestLookupVersion(
      req.filters.productTypeId as string,
    );

  query = applyFiltersForData(query, req.filters);

  query = applyGroupBy(req, query);

  query = applySortingAndOrdering(req, query);

  query = applyPagination(req, query);

  const result = await getData(query);

  const paginationData = await getPaginationData(req);

  return [{ ...result, ...paginationData }, 200];
};

const getLatestLookupVersion = async (productTypeId: string) => {
  const payload = {
    filters: {
      productTypeId: productTypeId,
    },
    includeFields: {
      lookupVersions: [
        lookupVersionsColNames.id,
        lookupVersionsColNames.versionName,
      ],
      productTypes: [productTypesColNames.id],
    },
    orderBy: ORDER_BY.DESC,
    sortBy: lookupVersionsColNames.createdAt,
    includeProductTypeDetails: true,
    includeUserDetails: false,
    page: 1,
    pageLimit: 1,
  };

  const [res] = (await ExecuteListLookupVersions(
    ListLookupVersionsRequestSchema.parse(payload),
  )) as [LookupVersionResponse, number];

  if (res.list.length === 0) throw new Error("Invalid Product Type!");

  return res.list[0].id;
};

const getQuery = (req: ListLookupEntriesRequest) => {
  let query = db
    .select(getSelectFields(req))
    .from(parentLookupEntries)
    .$dynamic();
  if (req.showMapping) {
    query = query.leftJoin(
      childLookupEntries,
      and(
        eq(parentLookupEntries.identifier, childLookupEntries.parent),
        eq(
          parentLookupEntries.lookupVersionId,
          childLookupEntries.lookupVersionId,
        ),
      ),
    );
  }

  return query.innerJoin(
    lookupVersions,
    eq(parentLookupEntries.lookupVersionId, lookupVersions.id),
  );
};

const getCountQuery = (req: ListLookupEntriesRequest) => {
  let query = db
    .select({
      count: sql<number>`
        CAST(COUNT(DISTINCT ${parentLookupEntries.id}) AS INTEGER)
        `.as("distinctCount"),
    })
    .from(parentLookupEntries)
    .$dynamic();

  if (req.showMapping) {
    query = query.leftJoin(
      childLookupEntries,
      eq(parentLookupEntries.identifier, childLookupEntries.parent),
    );
  }

  return query.innerJoin(
    lookupVersions,
    eq(parentLookupEntries.lookupVersionId, lookupVersions.id),
  );
};

const getSelectFields = (req: ListLookupEntriesRequest) => {
  let selectFields: LookupEntriesSelection = {};

  if (
    !req.includeFields.lookupEntries ||
    req.includeFields.lookupEntries.length === 0
  ) {
    selectFields = { ...parentLookupEntriesColumns, ...selectFields };
  }

  req.includeFields.lookupEntries.forEach((field) => {
    if (field in parentLookupEntriesColumns) {
      (selectFields as { [key: string]: PgColumn })[field] =
        parentLookupEntriesColumns[field as keyof lookupEntriesColumnnsType];
    }
  });

  if (req.showMapping) {
    const identCols =
      req.includeFields.availableIdentifiers &&
      req.includeFields.availableIdentifiers.length > 0
        ? req.includeFields.availableIdentifiers
        : Object.keys(lookupEntriesColNames);

    selectFields = {
      availableIdentifiers: sql`
      COALESCE(
        json_agg(
          row_to_json(
            (
              SELECT t FROM (
                SELECT ${sql.join(
                  identCols.map(
                    (col) =>
                      sql`${childLookupEntries}.${sql.identifier(lookupEntries[col as keyof lookupEntriesColumnnsType].name)}`,
                  ),
                  sql`, `,
                )}
              ) AS t
            )
          )
        ) FILTER (WHERE ${childLookupEntries}.id IS NOT NULL),
        '[]'
      )
    `.as("availableIdentifiers"),
      ...selectFields,
    };
  }

  if (
    req.includeLookupVersionInfo === true &&
    req.includeFields.lookupVersions
  ) {
    selectFields.lookupVersionDetails = {};

    if (
      !req.includeFields.lookupVersions ||
      req.includeFields.lookupVersions.length === 0
    ) {
      selectFields.lookupVersionDetails = { ...lookupVersionsColumnns };
    }

    req.includeFields.lookupVersions.forEach((field) => {
      if (field in lookupVersionsColumnns) {
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
  reqFilters: ListLookupEntriesRequest["filters"],
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
  reqFilters: ListLookupEntriesRequest["filters"],
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
  reqFilters: ListLookupEntriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of DIRECT_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        parentLookupEntries[filter as keyof lookupEntriesColumnnsType];
      newFilters.push(
        eq(column, reqFilters[filter as keyof typeof reqFilters]),
      );
    }
  }

  return newFilters;
};

const applyIndirectIlikeFilters = (
  reqFilters: ListLookupEntriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  for (const filter of INDIRECT_ILIKE_FILTERS) {
    if (
      filter in reqFilters &&
      reqFilters[filter as keyof typeof reqFilters] !== undefined
    ) {
      const column =
        parentLookupEntries[filter as keyof lookupEntriesColumnnsType];
      newFilters.push(
        ilike(column, `%${reqFilters[filter as keyof typeof reqFilters]}%`),
      );
    }
  }

  return newFilters;
};

const applyIndirectFilters = (
  reqFilters: ListLookupEntriesRequest["filters"],
): Array<SQL> => {
  const newFilters: Array<SQL> = [];

  if (
    OTHER_INDIRECT_FILTERS.includes(lookupVersionsColNames.uploadedByUserId) &&
    lookupVersionsColNames.uploadedByUserId in reqFilters &&
    reqFilters.uploadedByUserId !== undefined
  ) {
    newFilters.push(
      eq(lookupVersionsColumnns.uploadedByUserId, reqFilters.uploadedByUserId),
    );
  }

  if (
    OTHER_INDIRECT_FILTERS.includes(MULTIPLE_IDENTIFIERS) &&
    MULTIPLE_IDENTIFIERS in reqFilters &&
    reqFilters.identifiers !== undefined
  ) {
    newFilters.push(
      inArray(parentLookupEntries.identifier, reqFilters.identifiers),
    );
  }

  return newFilters;
};

const applyGroupBy = (req: ListLookupEntriesRequest, query: QueryType) => {
  if (req.showMapping) {
    let groupByFields: Array<PgColumn> = [];

    req.includeFields.lookupEntries.forEach((field) => {
      if (field in parentLookupEntriesColumns) {
        const column =
          parentLookupEntriesColumns[field as keyof lookupEntriesColumnnsType];
        groupByFields.push(column as PgColumn);
      }
    });

    req.includeFields.lookupVersions.forEach((field) => {
      if (field in lookupVersionsColumnns) {
        const column =
          lookupVersionsColumnns[field as keyof lookupVersionsColumnnsType];
        groupByFields.push(column as PgColumn);
      }
    });

    if (
      !req.includeFields.lookupVersions ||
      req.includeFields.lookupVersions.length === 0
    ) {
      groupByFields = [
        ...Object.values(lookupVersionsColumnns),
        ...groupByFields,
      ];
    }

    if (
      !req.includeFields.lookupEntries ||
      req.includeFields.lookupEntries.length === 0
    ) {
      groupByFields = [
        ...Object.values(parentLookupEntriesColumns),
        ...groupByFields,
      ];
    }

    if (
      req.sortBy === lookupVersionsColNames.createdAt &&
      groupByFields.indexOf(lookupVersions.createdAt) === -1
    ) {
      groupByFields.push(lookupVersions.createdAt);
    }

    return query.groupBy(...groupByFields);
  }

  return query;
};

const applyPagination = (req: ListLookupEntriesRequest, query: QueryType) => {
  if (req.maxPageLimit) return query;

  return query.limit(req.pageLimit).offset((req.page - 1) * req.pageLimit);
};

const applySortingAndOrdering = (
  req: ListLookupEntriesRequest,
  query: QueryType,
) => {
  if (req.sortBy === lookupVersionsColNames.createdAt) {
    return query.orderBy(
      getDrizzleOrder(req.orderBy as OrderByType)(lookupVersions.createdAt),
    );
  }

  return query.orderBy(
    getDrizzleOrder(req.orderBy as OrderByType)(
      parentLookupEntries[req.sortBy as keyof lookupEntriesColumnnsType],
    ),
  );
};

const getData = async (query: QueryType) => {
  const rows = await query;

  return { list: rows };
};

const getPaginationData = async (req: ListLookupEntriesRequest) => {
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
