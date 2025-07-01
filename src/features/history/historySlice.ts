import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderHistory {
  orderId: string;
  versionId: string;
  date: string;
  data: unknown; // full data snapshot
}

interface HistoryState {
  orderHistoryList: OrderHistory[];
  selectedHistory: OrderHistory | null;
}

const initialState: HistoryState = {
  orderHistoryList: [],
  selectedHistory: null,
};

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setOrderHistoryList: (state, action: PayloadAction<OrderHistory[]>) => {
      state.orderHistoryList = action.payload;
    },
    selectHistory: (state, action: PayloadAction<OrderHistory>) => {
      state.selectedHistory = action.payload;
    },
  },
});

export const { setOrderHistoryList, selectHistory } = historySlice.actions;
export default historySlice.reducer;
