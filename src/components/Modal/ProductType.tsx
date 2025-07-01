"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { ProductTypePopupProps } from "@/interfaces/productType";
import { useProductTypes } from "@/services/productTypes/useProductTypes";

const ProductTypePopup: React.FC<ProductTypePopupProps> = ({
  open,
  onClose, // we will block this externally until submit
  originProduct,
  onProductTypeSelected,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const [mounted, setMounted] = useState(false);
  const { productTypeOptions, loading } = useProductTypes(originProduct);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const stored = Cookies.get("productType");
    if (stored) onClose(); // auto close if already selected
  }, [onClose]);

  const handleSubmit = () => {
    const selected = productTypeOptions.find(
      (opt) => opt.value === selectedType,
    );
    if (selected) {
      const cookieValue = selected.productTypeCode || selected.label;
      Cookies.set("productType", cookieValue, { expires: 365 });
      onProductTypeSelected?.(selected);
      onClose();

      // ✅ Refresh current route to reflect cookie update
      router.refresh(); // next/navigation - triggers soft reload
    }
  };

  if (!mounted) return null;

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      hideBackdrop={false}
      BackdropProps={{ sx: { backgroundColor: "#D9D9D96B" } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Select Product Type
        {/* ❌ Remove close button to block manual close */}
        <IconButton disabled size="small" sx={{ visibility: "hidden" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please choose your product type:
        </Typography>

        <FormControl fullWidth disabled={loading}>
          <Select
            labelId="product-type-label"
            value={selectedType}
            displayEmpty
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="">
              <em>Select Product Type</em>
            </MenuItem>
            {productTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          {loading && (
            <Typography variant="caption" sx={{ mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Loading options...
            </Typography>
          )}
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", pb: 3, mt: 1 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedType}
          sx={{
            textTransform: "none",
            backgroundColor: selectedType ? "#00886F" : "#D3D3D3",
            color: "#FFF",
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductTypePopup;
