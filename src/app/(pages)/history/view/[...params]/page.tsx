"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Checkbox, Divider, Typography } from "@mui/material";
import ProductDetails from "@/components/orderDetails/ProductOrderDetails";
import EditProductOrder from "@/components/orderDetails/EditProductOrder";
import styles from "@/app/(pages)/history/history.module.scss";
import SpinnerLoader from "@/components/SpinnerLoader";
import { HistoryDetails, SystemFieldData } from "../../types/interface";
import { useAppSelector } from "@/app/hooks/reduxHooks";
import SystemFields from "@/components/orderDetails/SystemFields";
import { useParams } from "next/navigation";

import {
  capitalizeFirstLetter,
  formatDateTimeMMDDYYYY,
} from "@/utils/formatters";
import { FieldItem } from "@/interfaces/editProduct";

const HistoryDetailsPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const { productTypeCode } = useAppSelector((state) => state.productType);
  const [data, setData] = useState<HistoryDetails>();
  const hasFetched = useRef(false);
  const [orderFields, setOrderFields] = useState<FieldItem[]>();
  const [systemField, setSystemField] = useState<FieldItem[]>();
  const [paxVersion, setPaxVersion] = useState({ major: "", minor: "" });

  useEffect(() => {
    const paramsData = params?.params || [];

    if (hasFetched.current) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        const reqBody = {
          orderHistoryId: paramsData[0],
          includeDecodedData: true,
        };
        const encodedData = encodeURIComponent(JSON.stringify(reqBody));
        const response = await fetch(
          `/api/order_histories/view?data=${encodedData}`,
        );

        if (!response.ok) throw new Error("Failed to fetch product orders");

        const json = await response.json();
        const orderHistory = json.orderHistory;
        const decodedOrderData = orderHistory.decodedOrderData;
        const decodedChangedOrderData = orderHistory.decodedChangedOrderData;
        const orderFields: FieldItem[] = Object.keys(decodedOrderData).map(
          (key) => ({
            label: key,
            key: key,
            original: decodedOrderData[key],
            submitted: decodedChangedOrderData[key] ?? "",
          }),
        );

        const systemFieldData: SystemFieldData = {
          productNo: orderHistory.productNo,
          unitId: orderHistory.unitId,
          dataServerArea: orderHistory.dataServerArea,
          alarmServerArea: orderHistory.alarmServerArea,
          processArea: orderHistory.processArea,
        };

        const systemFieldArray = Object.entries(systemFieldData).map(
          ([key, value]) => ({
            key,
            label: capitalizeFirstLetter(key),
            value,
          }),
        );

        setOrderFields(orderFields);
        setSystemField(systemFieldArray);
        setPaxVersion({
          major: orderHistory.paxMajor,
          minor: orderHistory.paxMinor,
        });
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Error loading product orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productTypeCode, params]);

  const handlePaxChange = (key: "major" | "minor", value: string) => {
    setPaxVersion((prev) => ({ ...prev, [key]: value }));
  };

  const handleOrderFieldChange = (cfKey: string, newValue: string) => {
    setOrderFields((prev) => {
      if (prev) {
        return prev.map((field) =>
          field.key === cfKey ? { ...field, value: newValue } : field,
        );
      }
    });
  };

  if (loading) return <SpinnerLoader open={true} />;

  return (
    <Box className={styles.historyDetailsContainer}>
      <ProductDetails
        mode="edit"
        productDetails={[
          {
            key: "productType",
            label: "Product Type",
            submitted: data?.metadata.productTypeDetails.name,
            visibleIn: "both",
          },
          {
            key: "orderId",
            label: "Order ID (Version)",
            submitted: `${data?.metadata.orderDetails.itemNumber} (${data?.metadata.orderDetails.version})`,
            visibleIn: "both",
          },
          {
            key: "cfcoVersion",
            label: "CF-CO Version",
            submitted: data?.metadata.lookupVersionDetails.versionName,
            visibleIn: "both",
          },
          {
            key: "submittedAt",
            label: "Submitted At",
            submitted: formatDateTimeMMDDYYYY(
              data?.metadata.orderDetails.submittedAt as string,
            ),
            visibleIn: "both",
          },
          {
            key: "submissionHistory",
            label: "Submission History",
            submitted: data?.metadata.orderDetails.submissionVersion,
            visibleIn: "both",
          },
        ]}
      />

      <EditProductOrder
        orderFields={
          orderFields !== undefined
            ? orderFields.map(({ key, label, original, submitted }) => ({
                key,
                label,
                original,
                value: submitted ?? "",
                editable: false,
              }))
            : []
        }
        systemFields={[]}
        paxVersion={paxVersion ? paxVersion : { major: "", minor: "" }}
        onChange={() => {}}
        onPaxChange={() => {}}
        handleOrderFieldChange={handleOrderFieldChange}
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
          paxVersion={paxVersion}
          onPaxChange={handlePaxChange}
          systemFields={
            systemField
              ? systemField.map(({ key, label, value }) => ({
                  key,
                  label,
                  value,
                  editable: false,
                }))
              : []
          }
          onChange={() => {}}
          mode="view"
        />
      </Box>
    </Box>
  );
};

export default HistoryDetailsPage;
