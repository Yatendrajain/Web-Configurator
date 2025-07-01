import EditProductOrderPage from "@/components/orderDetails/EditAndClone";
import { Box } from "@mui/material";
import React from "react";
import styles from "../../history.module.scss";

export default function Clone() {
  return (
    <Box className={styles.editProductContainerr}>
      <EditProductOrderPage />
    </Box>
  );
}
