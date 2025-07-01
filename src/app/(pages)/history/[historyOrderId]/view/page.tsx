"use client";

import React, { useEffect, useState, use } from "react";
import { Box, Checkbox, Divider, Typography } from "@mui/material";
import ProductDetails from "@/components/orderDetails/ProductOrderDetails";
import EditProductOrder from "@/components/orderDetails/EditProductOrder";
import historyDetailsDummyData from "@/dummy_data/history_data.json";
import styles from "@/app/(pages)/history/history.module.scss";
import SpinnerLoader from "@/components/SpinnerLoader";
import { HistoryData, ReqBody, ViewProps } from "../../types/interface";
import { useAppSelector } from "@/app/hooks/reduxHooks";
import SystemFields from "@/components/orderDetails/SystemFields";
// import { formatDateMMDDYYYY } from "@/utils/formatters";

const HistoryDetailsPage = ({ params }: ViewProps) => {
  const [loading, setLoading] = useState(true);
  const { historyOrderId } = use(params);
  const { productTypeCode } = useAppSelector((state) => state.productType);
  const [data, setData] = useState<HistoryData>();
  // const [systemFields, setSystemFields] = useState<SystemFields>()

  const dummyData = {
    productDetails: historyDetailsDummyData.productDetails,
    orderDetails: historyDetailsDummyData.orderDetails,
    systemFields: historyDetailsDummyData.systemFields,
    paxVersion: historyDetailsDummyData.paxVersion,
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        const reqBody: ReqBody = {
          includeFields: {
            orderHistories: [
              "itemNumber",
              "createdAt",
              "submissionVersion",
              "itemNumberVersion",
              "pipelineStatus",
              "productTypeId",
              "orderName",
              "decodedOrderData",
              "productNo",
              "unitId",
              "dataServerArea",
              "alarmServerArea",
              "processArea",
              "",
            ],
            users: ["name"],
          },
          paginationDataRequired: true,
          includeUserDetails: true,
          includeProductTypeDetails: false,
          includeLookupVersionDetails: false,
          // orderBy: sortOrder,
          // sortBy: sortBy,
          pageLimit: 1, //add 1 for single page
          // page: page + 1,
          filters: {
            productTypeCode: productTypeCode,
            itemNumber: historyOrderId,
            // submissionVersion: "01"
          },
        };
        const encodedData = encodeURIComponent(JSON.stringify(reqBody));
        const response = await fetch(
          `/api/order_histories/list?data=${encodedData}`,
        );

        if (!response.ok) throw new Error("Failed to fetch product orders");

        const json = await response.json();
        // const list = json?.list || [];

        setData(json.list[0]);
        console.log("data", json.list[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error loading product orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productTypeCode, historyOrderId]);

  if (loading) return <SpinnerLoader open={true} />;

  return (
    <Box className={styles.historyDetailsContainer}>
      <ProductDetails
        mode="view"
        productDetails={[
          {
            key: "productType",
            label: "Product Type",
            submitted: data?.orderName,
            visibleIn: "both",
          },
          {
            key: "orderId",
            label: "Order ID",
            submitted: data?.productNo,
            visibleIn: "both",
          },
          {
            key: "cfcoVersion",
            label: "CF-CO Version",
            submitted: "--",
            visibleIn: "both",
          },
          {
            key: "finalizedAt",
            label: "Finalized At",
            submitted: dummyData.productDetails.finalizedAt,
            visibleIn: "both",
          },
          {
            key: "submittedAt",
            label: "Submitted At",
            submitted: dummyData.productDetails.submittedAt,
            visibleIn: "view",
          },
          {
            key: "submissionVersion",
            label: "Submission Version",
            submitted: data?.submissionVersion,
            visibleIn: "view",
          },
          {
            key: "history",
            label: "Submission History",
            submitted: dummyData.productDetails.history,
            visibleIn: "edit",
          },
        ]}
      />

      <EditProductOrder
        orderFields={dummyData.orderDetails.map(
          ({ key, label, original, submitted }) => ({
            key,
            label,
            original,
            value: submitted ?? "",
            editable: false,
          }),
        )}
        systemFields={dummyData.systemFields.map(({ key, label, value }) => ({
          key,
          label,
          value,
          editable: false,
        }))}
        paxVersion={dummyData.paxVersion}
        onChange={() => {}}
        onPaxChange={() => {}}
        mode="view"
      />

      <Box className={styles.systemFieldsTitle}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            System Fields
          </Typography>
          <Checkbox checked />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <SystemFields
          systemFields={dummyData.systemFields.map(({ key, label, value }) => ({
            key,
            label,
            value,
            editable: false,
          }))}
          onChange={() => {}}
          mode="view"
        />
      </Box>
    </Box>
  );
};

export default HistoryDetailsPage;
