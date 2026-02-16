// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { suppliersApi } from "./features/suppliersApi";
import { productsApi } from "./features/productsApi";
import { purchaseOrdersApi } from "./features/purchaseOrdersApi";
import { vouchersApi } from "./features/vouchersApi";
import { digitalProductsApi } from "./features/digitalProductsApi";
import { brandsApi } from "./features/brandsApi";
import { loginLogsApi } from "./features/loginLogsApi";
import { voucherAuditLogsApi } from "./features/voucherAuditLogsApi";
import { priceAutomationApi } from "./features/priceAutomationApi";
import { salesOrdersApi } from "./features/salesOrdersApi";
import { rolesApi } from "./features/rolesApi";
import { modulesApi } from "./features/modulesApi";
import { usersApi } from "./features/usersApi";
import { userInfoApi } from "./features/userInfoApi";
import userInfoReducer from "./features/userInfoSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [suppliersApi.reducerPath]: suppliersApi.reducer,
      [productsApi.reducerPath]: productsApi.reducer,
      [purchaseOrdersApi.reducerPath]: purchaseOrdersApi.reducer,
      [vouchersApi.reducerPath]: vouchersApi.reducer,
      [digitalProductsApi.reducerPath]: digitalProductsApi.reducer,
      [brandsApi.reducerPath]: brandsApi.reducer,
      [loginLogsApi.reducerPath]: loginLogsApi.reducer,
      [voucherAuditLogsApi.reducerPath]: voucherAuditLogsApi.reducer,
      [priceAutomationApi.reducerPath]: priceAutomationApi.reducer,
      [salesOrdersApi.reducerPath]: salesOrdersApi.reducer,
      [rolesApi.reducerPath]: rolesApi.reducer,
      [modulesApi.reducerPath]: modulesApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [userInfoApi.reducerPath]: userInfoApi.reducer,
      userInfo: userInfoReducer,

    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        suppliersApi.middleware,
        productsApi.middleware,
        purchaseOrdersApi.middleware,
        vouchersApi.middleware,
        digitalProductsApi.middleware,
        brandsApi.middleware,
        loginLogsApi.middleware,
        voucherAuditLogsApi.middleware,
        priceAutomationApi.middleware,
        salesOrdersApi.middleware,
        rolesApi.middleware,
        modulesApi.middleware,
        usersApi.middleware,
        userInfoApi.middleware,
      ),
  });
};

// creating store singleton
let store: AppStore;
export const getStore = () => {
  if (!store) {
    store = makeStore();
    setupListeners(store.dispatch);
  }
  return store;
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
