// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { suppliersApi } from "./features/suppliersApi";
import { productsApi } from "./features/productsApi";
import { purchaseOrdersApi } from "./features/purchaseOrdersApi";
import { vouchersApi } from "./features/vouchersApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [suppliersApi.reducerPath]: suppliersApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
      [purchaseOrdersApi.reducerPath]: purchaseOrdersApi.reducer,
      [vouchersApi.reducerPath]: vouchersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        suppliersApi.middleware,
        productsApi.middleware,
        purchaseOrdersApi.middleware,
        vouchersApi.middleware
      ),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
