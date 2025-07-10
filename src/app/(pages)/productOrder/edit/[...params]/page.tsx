"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
import PageContentWrapper from "@/components/PageWrapper";
import ProductDetails from "@/components/orderDetails/ProductOrderDetails"; // Summary component
import EditProductOrder from "@/components/orderDetails/EditProductOrder"; // Editable form
import { FieldItem, ProductDetailData } from "@/interfaces/editProduct";
import { useParams, useRouter } from "next/navigation";
import SpinnerLoader from "@/components/SpinnerLoader";
import { formatDateTimeMMDDYYYY } from "@/utils/formatters";
import { parseOrderFieldsFromConfig } from "@/utils/common/parseOrderFields";
import { ProductDetail, systemField } from "../../constants/systemFields";
import { AlertType, ItemData } from "../../interface";
import CustomSnackbar from "@/components/CustomSnackbar";
import ConfirmDialog from "@/components/ConfirmDialog";

const EditProductOrderPage = () => {
  const [orderFields, setOrderFields] = useState<FieldItem[]>([]);
  const [paxVersion, setPaxVersion] = useState({ major: "", minor: "" });
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState<ItemData>();
  const [open, setOpen] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<string>("");
  const [productDetails, setProductDetails] =
    useState<ProductDetailData>(ProductDetail);
  const [systemFields, setSystemFields] = useState<FieldItem[]>(systemField);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [message, setMessage] = useState("");

  const params = useParams();
  const router = useRouter();
  const hasFetched = useRef(false);

  const [snackbarType, setSnackbarType] = useState<AlertType>("success");

  const showNotification = (type: AlertType, msg: string) => {
    setSnackbarType(type);
    setMessage(msg);
    setShowSnackbar(true);
  };

  useEffect(() => {
    const paramsData = params?.params || [];

    if (hasFetched.current) return;

    if (paramsData.length !== 3) {
      router.replace("/productOrder");
      return;
    }

    const fetchOrderData = async () => {
      setLoading(true);
      setLoadingType("fetch");
      try {
        const reqBody = {
          productTypeId: paramsData[0],
          itemNumber: paramsData[1],
          version: paramsData[2],
        };
        const encodedData = encodeURIComponent(JSON.stringify(reqBody));
        const response = await fetch(
          `/api/orders_data/edit/get?data=${encodedData}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product orders");
        }

        const json = await response.json();
        setProductDetails({
          productType: json.metadata.productTypeDetails.name,
          orderId: json.metadata.orderDetails.itemNumber,
          cfcoVersion: json.metadata.lookupVersionDetails.versionName,
          finalizedAt: json.metadata.orderDetails.finalizedDate,
          submissionHistory: json.metadata.orderDetails.submissionVersion,
          version: json.metadata.orderDetails.version,
        });

        const orderFields = parseOrderFieldsFromConfig(
          json.dictionary,
          json.optionsMap,
          json.originalData.attributes.configurationString,
        );

        setOrderFields(orderFields);
        setSystemFields(systemField);
        setPaxVersion({
          major: "",
          minor: "",
        });
        const metaData = json.metadata;
        setItemData({
          itemNumber: metaData.orderDetails.itemNumber,
          itemNumberVersion: metaData.orderDetails.version,
          lookupVersionId: metaData.lookupVersionDetails.id,
          productTypeId: metaData.productTypeDetails.id,
        });
      } catch (error) {
        console.error(error);
        showNotification("error", "Failed to fetch the data");
        setTimeout(() => {
          router.push("/productOrder");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    hasFetched.current = true;
    fetchOrderData();
  }, [params, router]);

  const handleFieldChange = (key: string, newValue: string) => {
    setIsFormChanged(true);
    setLoadingType("submit");
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

  const handleOrderFieldChange = (cfKey: string, newValue: string) => {
    setIsFormChanged(true);
    setOrderFields((prev) =>
      prev.map((field) =>
        field.key === cfKey ? { ...field, value: newValue } : field,
      ),
    );
  };

  const handlePaxChange = (key: "major" | "minor", value: string) => {
    setIsFormChanged(true);
    setPaxVersion((prev) => ({ ...prev, [key]: value }));
  };

  const handleSuccess = () => {
    setLoading(false);
    setShowSnackbar(true);
    setMessage("Successfully submitted");
    setSnackbarType("success");
    setTimeout(() => {
      router.push("/history");
    }, 2000);
  };

  const handleError = (error: unknown) => {
    setLoading(false);
    setShowSnackbar(true);
    setMessage("Submission failed!");
    setSnackbarType("error");
    console.error("❌ Submission failed:", error);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const mapped: Record<string, string> = {};
    const unmapped: Record<string, string> = {};

    orderFields.forEach((order) => {
      if (order.key) {
        const value = order.value || "";
        if (order.source === "mapped") {
          mapped[order.key] = value;
        } else {
          unmapped[order.key] = value;
        }
      }
    });

    const systemFieldsPayload: Record<string, string | number> =
      systemFields.reduce(
        (acc, field) => {
          acc[field.key!] = field.value || "";
          return acc;
        },
        {} as Record<string, string | number>,
      );
    systemFieldsPayload.paxMajor = +paxVersion.major;
    systemFieldsPayload.paxMinor = +paxVersion.minor;
    systemFieldsPayload.unitId = +systemFieldsPayload.unitId;

    const payload = {
      ...itemData,
      systemFields: systemFieldsPayload,
      changedOrderData: {
        mappedSection: mapped,
        unmappedSection: unmapped,
      },
    };
    try {
      const res = await fetch("/api/orders_data/edit/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      handleSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancel = () => {
    if (isFormChanged) {
      setOpen(true);
    } else {
      router.push("/productOrder");
    }
  };

  const handleConfirmDiscard = () => {
    setOpen(false);
    router.push("/productOrder");
  };

  if (loading && loadingType === "fetch") return <SpinnerLoader open={true} />;

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
                submitted: productDetails.productType,
                visibleIn: "both",
              },
              {
                key: "orderId",
                label: "Order ID (Version)",
                submitted: `${productDetails.orderId} (${productDetails.version})`,
                visibleIn: "both",
              },
              {
                key: "cfcoVersion",
                label: "CF-CO Version",
                submitted: productDetails.cfcoVersion,
                visibleIn: "both",
              },
              {
                key: "finalizedAt",
                label: "Finalized At",
                submitted: formatDateTimeMMDDYYYY(
                  productDetails.finalizedAt ?? "",
                ),
                visibleIn: "both",
              },
              {
                key: "submissionHistory",
                label: "Submission History",
                submitted:
                  productDetails.submissionHistory + " Times Submitted",
                visibleIn: "edit",
              },
            ]}
          />

          {/* Editable Form */}
          <EditProductOrder
            orderFields={orderFields}
            systemFields={systemFields as FieldItem[]}
            paxVersion={paxVersion}
            onChange={handleFieldChange}
            onPaxChange={handlePaxChange}
            mode="edit"
            onValidityChange={setIsFormValid}
            handleOrderFieldChange={handleOrderFieldChange}
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
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={!isFormValid}
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
      {loading && loadingType === "submit" && (
        <div className="overlay">
          <SpinnerLoader open={true} />
        </div>
      )}
      <CustomSnackbar
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message={message}
        severity={snackbarType}
      />
      <ConfirmDialog
        open={open}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmDiscard}
        confirmText="Discard"
        cancelText="Continue Editing"
      />
    </>
  );
};

export default EditProductOrderPage;
