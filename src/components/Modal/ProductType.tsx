"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { ProductTypePopupProps } from "@/interfaces/productType";
import { useProductTypes } from "@/services/productTypes/useProductTypes";

const ProductTypePopup: React.FC<ProductTypePopupProps> = ({
  open,
  onClose,
  originProduct,
  onProductTypeSelected,
}) => {
  const [selectedType, setSelectedType] = useState("");
  const { productTypeOptions, loading } = useProductTypes(originProduct);
  const router = useRouter();

  useEffect(() => {
    const cookie = Cookies.get("productType");
    if (cookie) {
      try {
        JSON.parse(cookie);
        onClose(); // Close popup if valid cookie exists
      } catch {
        Cookies.remove("productType"); // Corrupted cookie cleanup
      }
    }
  }, [onClose]);

  const selected = useMemo(
    () => productTypeOptions.find((opt) => opt.value === selectedType),
    [productTypeOptions, selectedType],
  );

  const handleSubmit = () => {
    if (!selected) return;

    Cookies.set("productType", JSON.stringify(selected), { expires: 365 });
    onProductTypeSelected?.(selected);
    onClose();
    router.refresh(); // Trigger soft reload
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      slotProps={{
        backdrop: { sx: { backgroundColor: "#D9D9D96B" } },
        paper: {
          sx: {
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: 16,
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 0,
        }}
      >
        Select Product Type
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2, fontSize: 14 }}>
          Please choose your product type:
        </Typography>

        <FormControl fullWidth disabled={loading} size="small">
          {loading ? (
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading options...
            </Typography>
          ) : (
            <Select
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
          )}
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", pb: 3, mt: 1 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selected}
          sx={{
            textTransform: "none",
            backgroundColor: selected ? "#00886F" : "#D3D3D3",
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
