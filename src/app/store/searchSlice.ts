import { SearchState } from "@/interfaces/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

const initialState: SearchState = {
  searchQuery: "",
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setSearchQuery } = searchSlice.actions;
export const selectSearchQuery = (state: RootState) => state.search.searchQuery;

export default searchSlice.reducer;
