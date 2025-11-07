// Export all API slices
export { suppliersApi } from "./suppliersApi";
export { productsApi } from "./productsApi";
export { purchaseOrdersApi } from "./purchaseOrdersApi";
export { vouchersApi } from "./vouchersApi";

// Export all types
export type {
  Supplier,
  SupplierType,
  SupplierStatus,
  SupplierFilters,
  CreateSupplierData,
  UpdateSupplierData,
} from "./suppliersApi";

export type {
  Product,
  ProductStatus,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  ThirdPartyProduct,
  ThirdPartyProductFilters,
} from "./productsApi";

export type {
  PurchaseOrder,
  PurchaseOrderFilters,
  CreatePurchaseOrderData,
} from "./purchaseOrdersApi";

export type {
  ImportVouchersResponse,
  ImportVouchersData,
} from "./vouchersApi";

// Export all hooks
export {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "./suppliersApi";

export {
  useGetProductsQuery,
  useGetThirdPartyProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "./productsApi";

export {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
} from "./purchaseOrdersApi";

export {
  useImportVouchersMutation,
} from "./vouchersApi";

