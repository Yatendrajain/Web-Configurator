import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CO {
  id: string;
  name: string;
}

interface CF {
  id: string;
  name: string;
  cos: CO[];
}

interface CfcoState {
  cfList: CF[];
  uploadedCfList: CF[]; // for comparing new upload
  version: string;
  showComparison: boolean;
}

const initialState: CfcoState = {
  cfList: [],
  uploadedCfList: [],
  version: "",
  showComparison: false,
};

const cfcoSlice = createSlice({
  name: "cfco",
  initialState,
  reducers: {
    setCFList: (state, action: PayloadAction<CF[]>) => {
      state.cfList = action.payload;
    },
    setUploadedCfList: (state, action: PayloadAction<CF[]>) => {
      state.uploadedCfList = action.payload;
    },
    setVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
    toggleComparisonPopup: (state, action: PayloadAction<boolean>) => {
      state.showComparison = action.payload;
    },
    updateWithUploadedData: (state) => {
      state.cfList = state.uploadedCfList;
      state.uploadedCfList = [];
      state.showComparison = false;
    },
  },
});

export const {
  setCFList,
  setUploadedCfList,
  setVersion,
  toggleComparisonPopup,
  updateWithUploadedData,
} = cfcoSlice.actions;

export default cfcoSlice.reducer;
