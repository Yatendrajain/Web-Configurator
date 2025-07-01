import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Order {
  id: string;
  name: string;
  submitCount: number;
  // Add other fields
}

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    selectOrder: (state, action: PayloadAction<Order>) => {
      state.selectedOrder = action.payload;
    },
    incrementSubmitCount: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) order.submitCount++;
    },
  },
});

export const { setOrders, selectOrder, incrementSubmitCount } =
  orderSlice.actions;
export default orderSlice.reducer;
