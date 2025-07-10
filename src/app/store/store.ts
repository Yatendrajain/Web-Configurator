import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "@/features/orders/orderSlice";
import cfcoReducer from "@/features/cfco/cfcoSlice";
import historyReducer from "@/features/history/historySlice";
import productTypeReducer from "@/features/productType/productTypeSlice";
import searchReducer from "./searchSlice";
import cfcoSearchReducer from "./cfcoSearchSlice";

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    cfco: cfcoReducer,
    history: historyReducer,
    productType: productTypeReducer,
    search: searchReducer,
    cfcoSearch: cfcoSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
