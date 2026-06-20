import { configureStore } from "@reduxjs/toolkit";
import inventoryReducer from "../../features/inventory/inventorySlice";
import billingReducer from "../../features/billing/billingSlice";


export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    billing: billingReducer,
  },
});

