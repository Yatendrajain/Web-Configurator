import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProductTypeState {
  productTypeId: string;
  productTypeCode: string;
  productTypeName: string;
}

const initialState: ProductTypeState = {
  productTypeId: "",
  productTypeCode: "",
  productTypeName: "",
};

const productTypeSlice = createSlice({
  name: "productType",
  initialState,
  reducers: {
    setProductTypeId: (state, action: PayloadAction<string>) => {
      state.productTypeId = action.payload;
    },
    setProductTypeCode: (state, action: PayloadAction<string>) => {
      state.productTypeCode = action.payload;
    },
    setProductTypeName: (state, action: PayloadAction<string>) => {
      state.productTypeName = action.payload;
    },
    setProductType: (
      state,
      action: PayloadAction<{ code: string; name: string }>,
    ) => {
      state.productTypeCode = action.payload.code;
      state.productTypeName = action.payload.name;
    },
  },
});

export const {
  setProductTypeId,
  setProductTypeCode,
  setProductTypeName,
  setProductType,
} = productTypeSlice.actions;
export default productTypeSlice.reducer;
