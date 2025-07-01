"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { historyColumns } from "@/app/(pages)/history/components/HistoryColumn";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import { HistoryData, HistoryTableProps } from "../types/interface";
import { useAppSelector } from "@/app/hooks/reduxHooks";
// import { fetchHistoryData } from "@/services/history/history.service";
import { useSelector, useDispatch } from "react-redux";
import { selectSearchQuery } from "@/app/store/searchSlice";

interface HistoryApiResponseItem {
  itemNumber: string;
  itemNumberVersion: string;
  orderName?: string;
  userDetails?: { name?: string };
  pipelineStatus?: string;
  createdAt?: string;
  submissionVersion?: string;
  productTypeId?: string;
}

export default function HistoryTable({ search }: HistoryTableProps) {
  const [data, setData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { productTypeCode } = useAppSelector((state) => state.productType);
  const searchQuery = useSelector(selectSearchQuery);
  const dispatch = useDispatch();

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
            productTypeCode: productTypeCode,
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
          lastSubmitted: item?.createdAt || "--",
        }));
        if (reset) {
          setData(transformedData);
        } else {
          setData((prev) => [...prev, ...transformedData]);
        }
        setHasMore(transformedData.length > 0);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortOrder, sortBy, productTypeCode, searchQuery],
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

  return (
    <DynamicTable
      columns={historyColumns}
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
