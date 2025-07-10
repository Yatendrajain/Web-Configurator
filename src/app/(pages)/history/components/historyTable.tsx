"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { HistoryData, HistoryTableProps } from "../types/interface";
import { useAppSelector } from "@/app/hooks/reduxHooks";
// import { fetchHistoryData } from "@/services/history/history.service";
import { useSelector, useDispatch } from "react-redux";
import { selectSearchQuery } from "@/app/store/searchSlice";
import { formatDateTimeMMDDYYYY } from "@/utils/formatters";
import HistoryActionButtons from "./HistoryActionButtons";
import { Chip, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";

interface HistoryApiResponseItem {
  itemNumber: string;
  itemNumberVersion: string;
  orderName?: string;
  userDetails?: { name?: string };
  pipelineStatus?: string;
  createdAt?: string;
  submissionVersion?: string;
  productTypeId?: string;
  id: string;
}

export default function HistoryTable({ search }: HistoryTableProps) {
  const [data, setData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { productTypeCode, productTypeId } = useAppSelector(
    (state) => state.productType,
  );
  const searchQuery = useSelector(selectSearchQuery);
  const dispatch = useDispatch();
  const router = useRouter();

  const fetchData = useCallback(
    async (pageToFetch: number, reset = false) => {
      setLoadingMore(true);
      try {
        const reqBody = {
          includeFields: {
            orderHistories: [
              "itemNumber",
              "createdAt",
              "submissionVersion",
              "itemNumberVersion",
              "pipelineStatus",
              "productTypeId",
              "orderName",
              "id",
            ],
            users: ["name"],
          },
          paginationDataRequired: true,
          includeUserDetails: true,
          includeProductTypeDetails: false,
          includeLookupVersionDetails: false,
          orderBy: sortOrder,
          sortBy: sortBy,
          pageLimit: 15,
          page: pageToFetch,
          filters: {
            productTypeId: productTypeId,
            ...(searchQuery ? { globalSearch: searchQuery } : {}),
          },
        };
        const encodedData = encodeURIComponent(JSON.stringify(reqBody));
        const response = await fetch(
          `/api/order_histories/list?data=${encodedData}`,
        );
        if (!response.ok) throw new Error("Failed to fetch history");
        const json = await response.json();
        const list: HistoryApiResponseItem[] = json?.list || [];
        const transformedData: HistoryData[] = list.map((item) => ({
          itemNumber: item.itemNumber,
          createdAt: item.createdAt || "--",
          submissionVersion: item.submissionVersion || "--",
          itemNumberVersion: item.itemNumberVersion || "--",
          pipelineStatus: item.pipelineStatus || "--",
          productTypeId: item.productTypeId || "--",
          userDetails: { name: item.userDetails?.name || "--" },
          orderIdVersion: `${item.itemNumber} (${item.itemNumberVersion})`,
          name: item?.orderName ?? "--",
          updatedBy: item?.userDetails?.name || "--",
          status: item?.pipelineStatus || "--",
          id: item?.id,
          lastSubmitted:
            formatDateTimeMMDDYYYY(item?.createdAt as string) || "--",
        }));

        if (reset) {
          setData(transformedData);
        } else {
          setData((prev) => [...prev, ...transformedData]);
        }
        setHasMore(json.totalCount === transformedData.length);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortOrder, sortBy, searchQuery, productTypeId],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    if (!productTypeCode) return;
    fetchData(1, true);
  }, [
    search,
    productTypeCode,
    sortBy,
    sortOrder,
    fetchData,
    searchQuery,
    dispatch,
  ]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [page, loadingMore, hasMore, fetchData]);

  const memoizedData = useMemo(() => data, [data]);

  const handleSortChange = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnId);
      setSortOrder("asc");
    }
  };

  const handleEdit = useCallback(
    (row: HistoryData, type: string) => {
      if (type === "view") {
        router.push(`/history/view/${row.id}`);
      } else {
        router.push(`/history/clone/${row.id}`);
      }
    },
    [router],
  );

  const columns = useMemo(
    () => [
      {
        id: "orderIdVersion",
        label: "Order ID (Version)",
        sortable: false,
        render: (_: unknown, row: HistoryData) =>
          `${row.itemNumber} (${row.itemNumberVersion})`,
      },
      {
        id: "name",
        label: "Name",
        sortable: false,
        render: (_: unknown, row: HistoryData) => {
          return (
            <Tooltip title={row.name} arrow placement="bottom">
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                  maxWidth: 150,
                }}
              >
                {row.name}
              </span>
            </Tooltip>
          );
        },
      },
      {
        id: "updatedBy",
        label: "Updated By",
        sortByName: "userName",
        sortable: true,
      },
      {
        id: "status",
        label: "Status",
        sortable: false,
        render: (_: unknown, row: HistoryData) => (
          <Chip
            label={String(row.pipelineStatus ?? "-")}
            size="small"
            sx={{
              backgroundColor:
                row.pipelineStatus === "Failed" ? "#FEE4E2" : "#ECFDF3",
              color: row.pipelineStatus === "Failed" ? "#D92D20" : "#027A48",
              fontWeight: 500,
              fontSize: "0.7rem",
            }}
          />
        ),
      },
      {
        id: "lastSubmitted",
        label: "Last Submitted",
        sortByName: "createdAt",
        sortable: true,
        render: (_: unknown, row: HistoryData) => {
          return (
            <Tooltip title={row.lastSubmitted} arrow placement="bottom">
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "inline-block",
                  maxWidth: 150,
                }}
              >
                {row.lastSubmitted}
              </span>
            </Tooltip>
          );
        },
      },
      {
        id: "submissionVersion",
        label: "Submission Version",
        align: "center",
        sortable: false,
        render: (_: unknown, row: HistoryData) => `${row.submissionVersion}`,
      },
      {
        id: "actions",
        label: "Action",
        align: "center",
        sortable: false,
        render: (_: unknown, row: HistoryData) => (
          <HistoryActionButtons
            order={row}
            onEdit={(row, type) => handleEdit(row, type)}
          />
        ),
      },
    ],
    [handleEdit],
  );

  return (
    <DynamicTable
      columns={columns}
      data={memoizedData}
      showEditAction={false}
      loading={loading && page === 1}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}
