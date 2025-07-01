"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import PageContentWrapper from "@/components/PageWrapper";
import ProductDetails from "@/components/orderDetails/ProductOrderDetails"; // Summary component
import EditProductOrder from "@/components/orderDetails/EditProductOrder"; // Editable form
import historyDetailsDummyData from "@/dummy_data/product_details.json";
import { FieldItem } from "@/interfaces/editProduct";

const EditProductOrderPage = () => {
  const [orderFields, setOrderFields] = useState<FieldItem[]>([]);
  const [systemFields, setSystemFields] = useState<FieldItem[]>([]);
  const [paxVersion, setPaxVersion] = useState({ major: "", minor: "" });
  const [loading, setLoading] = useState(true);

  const dummyData = {
    productDetails: historyDetailsDummyData.productDetails,
    orderDetails: historyDetailsDummyData.orderDetails,
    systemFields: historyDetailsDummyData.systemFields,
    paxVersion: historyDetailsDummyData.paxVersion,
  };

  useEffect(() => {
    setOrderFields(dummyData.orderDetails);
    setSystemFields(dummyData.systemFields);
    setPaxVersion(dummyData.paxVersion);
    setLoading(false);
  }, [dummyData.orderDetails, dummyData.systemFields, dummyData.paxVersion]);

  const handleFieldChange = (key: string, newValue: string) => {
    setOrderFields((prev) =>
      prev.map((field) =>
        field.key === key ? { ...field, value: newValue } : field,
      ),
    );

    setSystemFields((prev) =>
      prev.map((field) =>
        field.key === key ? { ...field, value: newValue } : field,
      ),
    );
  };

  const handlePaxChange = (key: "major" | "minor", value: string) => {
    setPaxVersion((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    console.log("Order Fields:", orderFields);
    console.log("System Fields:", systemFields);
    console.log("PAX Version:", paxVersion);
    alert("Product order saved successfully!");
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <PageContentWrapper>
        <Box
          display="flex"
          flexDirection="column"
          gap={4}
          overflow={"hidden"}
          mb={"10%"}
        >
          {/* Product Summary */}
          <ProductDetails
            mode="edit"
            productDetails={[
              {
                key: "productType",
                label: "Product Type",
                submitted: dummyData.productDetails.productType,
                visibleIn: "both",
              },
              {
                key: "orderId",
                label: "Order ID",
                submitted: dummyData.productDetails.orderId,
                visibleIn: "both",
              },
              {
                key: "cfcoVersion",
                label: "CF-CO Version",
                submitted: dummyData.productDetails.cfcoVersion,
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
                submitted: dummyData.productDetails.submissionVersion,
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

          {/* Editable Form */}
          <EditProductOrder
            orderFields={orderFields}
            systemFields={systemFields}
            paxVersion={paxVersion}
            onChange={handleFieldChange}
            onPaxChange={handlePaxChange}
            mode="edit"
          />
        </Box>
      </PageContentWrapper>
      <Box
        display="flex"
        justifyContent="flex-end"
        gap={2}
        bgcolor="white"
        p={2}
        pr={4}
        position={"absolute"}
        bottom={"0%"}
        right={"0%"}
        width={"100%"}
        borderTop="1px solid #eee"
      >
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            color: "#00886F",
            borderColor: "#00886F",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: "#00886F",
            color: "#FFF",
          }}
        >
          Submit
        </Button>
      </Box>
    </>
  );
};

export default EditProductOrderPage;
