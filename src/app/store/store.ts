import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "@/features/orders/orderSlice";
import cfcoReducer from "@/features/cfco/cfcoSlice";
import historyReducer from "@/features/history/historySlice";
import productTypeReducer from "@/features/productType/productTypeSlice";
import searchReducer from "./searchSlice";

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    cfco: cfcoReducer,
    history: historyReducer,
    productType: productTypeReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
