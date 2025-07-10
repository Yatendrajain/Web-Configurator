"use client";

import { Box, Tooltip } from "@mui/material";
import Icon from "@/components/IconConfig";
import styles from "@/app/(pages)/history/history.module.scss";
import { HistoryData } from "../types/interface";

interface Props {
  order: HistoryData;
  onEdit: (order: HistoryData, type: string) => void;
}

const HistoryActionButtons: React.FC<Props> = ({ order, onEdit }) => {
  return (
    <Box className={styles.historyButtons}>
      <Tooltip title="Clone" arrow placement="left">
        <span>
          <Icon
            name="clone"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(order, "clone")}
          />
        </span>
      </Tooltip>
      <Tooltip title="View" arrow placement="right">
        <span>
          <Icon
            name="view"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(order, "view")}
          />
        </span>
      </Tooltip>
    </Box>
  );
};

export default HistoryActionButtons;
