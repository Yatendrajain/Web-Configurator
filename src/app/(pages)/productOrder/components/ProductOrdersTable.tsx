"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/app/hooks/reduxHooks";

import DynamicTable from "@/components/DynamicTable/DynamicTable";
import ProductOrderActionButtons from "./ProductOrderActionButtons";

import { formatDateMMDDYYYY } from "@/utils/formatters";
import { ProductOrderData, ReqBody } from "../interface";
import { selectSearchQuery } from "@/app/store/searchSlice";

export default function ProductOrdersTable() {
  const router = useRouter();
  const searchQuery = useSelector(selectSearchQuery);
  const { productTypeCode, productTypeName, productTypeId } = useAppSelector(
    (state) => state.productType,
  );

  const [data, setData] = useState<ProductOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("itemNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(
    async (pageToFetch: number, reset = false) => {
      setLoadingMore(true);
      if (!productTypeCode) {
        setData([]);
        setHasMore(false);
        // setLoading(false);
        return;
      }

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
          pageLimit: 10,
          page: pageToFetch,
        };

        if (searchQuery) {
          reqBody.filters = {
            itemNumber: searchQuery,
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

        // @ts-expect-error: API response is not guaranteed to match
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
      } catch (error) {
        console.error("Error fetching product orders:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sortOrder, sortBy, productTypeCode, searchQuery],
  );

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchData(1, true);
  }, [searchQuery, productTypeCode, sortBy, sortOrder, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [page, loadingMore, hasMore, fetchData]);

  const handleEdit = useCallback(
    (row: ProductOrderData) => {
      router.push(
        `/productOrder/edit/${productTypeId}/${row.itemNumber}/${row.version}`,
      );
    },
    [productTypeId, router],
  );

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
          <ProductOrderActionButtons order={row} onEdit={handleEdit} />
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
