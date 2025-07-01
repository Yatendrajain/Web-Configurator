"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import DynamicTable from "@/components/DynamicTable/DynamicTable";
import {
  ProductOrderData,
  ProductOrdersTableProps,
  ReqBody,
} from "../interface";
import { useAppSelector } from "@/app/hooks/reduxHooks";
import { formatDateMMDDYYYY } from "@/utils/formatters";
import ProductOrderActionButtons from "./ProductOrderActionButtons";
import { useRouter } from "next/navigation";

export default function ProductOrdersTable({
  search,
}: ProductOrdersTableProps) {
  const { productTypeCode, productTypeName } = useAppSelector(
    (state) => state.productType,
  );
  const [data, setData] = useState<ProductOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("itemNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(
    async (pageToFetch: number, reset = false) => {
      setLoadingMore(true);
      try {
        const reqBody: ReqBody = {
          filters: {
            productTypeCode: productTypeCode,
          },
          excludeFields: [
            "configurationString",
            "configurationStringAsJSON",
            "comment",
            "createdFrom",
            "createdFrom_strongRef",
            "customer",
            "customerReference",
            "fbomDate",
            "fbomRevision",
            "hasBeenCustomized",
            "hasBeenReconfigured",
            "originProduct_strongRef",
            "productCode",
            "source",
          ],
          orderBy: sortOrder,
          sortBy: sortBy,
          maxPageLimit: false,
          pageLimit: 15,
          page: pageToFetch,
        };
        if (search) {
          reqBody.filters = {
            itemNumber: search,
            ...reqBody.filters,
          };
        }
        const encodedData = encodeURIComponent(JSON.stringify(reqBody));
        const response = await fetch(
          `/api/orders_data/list?data=${encodedData}`,
        );
        if (!response.ok) throw new Error("Failed to fetch product orders");
        const json = await response.json();
        const list = json?.list || [];
        // @ts-expect-error: API response is not guaranteed to match ProductOrderData
        const transformedData: ProductOrderData[] = list.map((item) => ({
          id: item.id,
          itemNumber: item.attributes?.itemNumber || "",
          version: item.attributes?.version || "00",
          productType: item.attributes?.productType || "",
          finalizedDate: item.attributes?.finalizedDate || "",
          submissionVersion: item.attributes?.submissionVersion || "00",
          productFamilyFromOriginProduct:
            item.attributes?.productFamilyFromOriginProduct || "",
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
    [sortOrder, sortBy, productTypeCode, search],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchData(1, true);
  }, [search, productTypeCode, sortBy, sortOrder, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [page, loadingMore, hasMore, fetchData]);

  const handleEdit = () => {
    router.push("productOrder/edit");
  };

  const handleSortChange = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnId);
      setSortOrder("asc");
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "itemNumber",
        label: "Order ID (Version)",
        sortable: true,
        sortByName: "itemNumber",
        render: (_: unknown, row: ProductOrderData) =>
          `${row.itemNumber} (${row.version})`,
      },
      {
        id: "productType",
        label: "Product Name",
        render: (_: unknown, row: ProductOrderData) => row.productType,
      },
      {
        id: "finalizedDate",
        label: "Finalized At",
        render: (_: unknown, row: ProductOrderData) =>
          formatDateMMDDYYYY(row.finalizedDate),
      },
      {
        id: "productFamilyFromOriginProduct",
        label: "Product Type",
        render: () => productTypeName,
      },
      {
        id: "submissionVersion",
        label: "Submission Version",
        align: "center",
        render: (_: unknown, row: ProductOrderData) => row.submissionVersion,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        render: (_: unknown, row: ProductOrderData) => (
          <ProductOrderActionButtons orderId={row.id} onEdit={handleEdit} />
        ),
      },
    ],
    [productTypeName, handleEdit],
  );

  const memoizedData = useMemo(() => data, [data]);

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
