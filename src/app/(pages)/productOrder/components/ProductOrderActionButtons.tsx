"use client";

import { Box, Tooltip } from "@mui/material";
import Icon from "../../../../components/IconConfig";

interface Props {
  orderId: string;
  onEdit: (id: string) => void;
}

const ProductOrderActionButtons: React.FC<Props> = ({ orderId, onEdit }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
      <Tooltip title="Edit" arrow placement="right">
        <span>
          <Icon
            name="edit"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(orderId)}
          />
        </span>
      </Tooltip>
    </Box>
  );
};

export default ProductOrderActionButtons;
