import { SearchState } from "@/interfaces/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState: SearchState = {
  searchQuery: "",
};

const cfcoSearchSlice = createSlice({
  name: "cfcoSearch",
  initialState,
  reducers: {
    setCFCOSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearCFCOSearchQuery: (state) => {
      state.searchQuery = "";
    },
  },
});

export const { setCFCOSearchQuery, clearCFCOSearchQuery } =
  cfcoSearchSlice.actions;
export const selectCFCOSearchQuery = (state: RootState) =>
  state.cfcoSearch.searchQuery;

export default cfcoSearchSlice.reducer;
