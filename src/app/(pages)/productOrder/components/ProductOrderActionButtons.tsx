"use client";

import { Box, Tooltip } from "@mui/material";
import Icon from "../../../../components/IconConfig";
import { ProductOrderData } from "../interface";

interface Props {
  order: ProductOrderData;
  onEdit: (order: ProductOrderData) => void;
}

const ProductOrderActionButtons: React.FC<Props> = ({ order, onEdit }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
      <Tooltip title="Edit" arrow placement="right">
        <span>
          <Icon
            name="edit"
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => onEdit(order)}
          />
        </span>
      </Tooltip>
    </Box>
  );
};

export default ProductOrderActionButtons;
