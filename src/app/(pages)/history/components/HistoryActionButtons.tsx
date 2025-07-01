// components/HistoryActionButtons.tsx
"use client";

import { useRouter } from "next/navigation";
import { Box, Tooltip } from "@mui/material";
import Icon from "@/components/IconConfig";
import styles from "@/app/(pages)/history/history.module.scss";
import { ActionProps } from "../types/interface";

const HistoryActionButtons: React.FC<ActionProps> = ({ orderIdVersion }) => {
  const router = useRouter();

  const handleView = () => {
    const orderId = orderIdVersion.split(" ");
    router.push(`/history/${orderId[0]}/view`);
  };

  const handleClone = () => {
    const orderId = orderIdVersion.split(" ");
    router.push(`/history/${orderId[0]}/clone`);
  };

  return (
    <Box className={styles.historyButtons}>
      <Tooltip title="Clone" arrow placement="left">
        <span>
          <Icon
            name="clone"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={handleClone}
          />
        </span>
      </Tooltip>
      <Tooltip title="View" arrow placement="right">
        <span>
          <Icon
            name="view"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={handleView}
          />
        </span>
      </Tooltip>
    </Box>
  );
};

export default HistoryActionButtons;
