import { HistoryData } from "@/app/(pages)/history/types/interface";
import { formatDateMMDDYYYY } from "@/utils/formatters";
import {
  ReqBody,
  Filters,
  IncludeFields,
} from "@/app/(pages)/history/types/interface";
import { STATUS_LABEL } from "@/app/(pages)/history/types/enum";

interface FetchHistoryParams {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
  filters?: Filters;
  includeFields?: IncludeFields;
}

export const fetchHistoryData = async ({
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  search,
  filters = {},
  includeFields,
}: FetchHistoryParams): Promise<{
  data: HistoryData[];
  totalCount: number;
  page: number;
}> => {
  const reqBody: ReqBody = {
    includeFields: includeFields ?? {
      orderHistories: [
        "itemNumber",
        "createdAt",
        "submissionVersion",
        "itemNumberVersion",
        "pipelineStatus",
        "productTypeId",
        "orderName",
      ],
      users: ["name"],
    },
    paginationDataRequired: true,
    includeUserDetails: true,
    includeProductTypeDetails: false,
    includeLookupVersionDetails: false,
    orderBy: sortOrder,
    sortBy: sortBy,
    pageLimit: rowsPerPage,
    page: page + 1,
    filters: {
      ...filters,
    },
  };

  if (search) {
    reqBody.filters = {
      globalSearch: search.toLowerCase(),
      ...reqBody.filters,
    };
  }

  const encodedData = encodeURIComponent(JSON.stringify(reqBody));
  const response = await fetch(`/api/order_histories/list?data=${encodedData}`);

  if (!response.ok) throw new Error("Failed to fetch product orders");

  const json = await response.json();
  const list = json?.list || [];

  const transformedData: HistoryData[] = list.map((item: HistoryData) => ({
    orderIdVersion: `${item.itemNumber} (${item.itemNumberVersion})`,
    name: item?.orderName ?? "--",
    updatedBy: item?.userDetails?.name || "--",
    status:
      STATUS_LABEL[item?.pipelineStatus as keyof typeof STATUS_LABEL] || "--",
    lastSubmitted: formatDateMMDDYYYY(item?.createdAt),
    submissionVersion: item?.submissionVersion || "--",
  }));

  return {
    data: transformedData,
    totalCount: json.totalCount,
    page: json.page - 1,
  };
};
