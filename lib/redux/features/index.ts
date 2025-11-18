// Export all API slices
export { suppliersApi } from "./suppliersApi";
export { productsApi } from "./productsApi";
export { purchaseOrdersApi } from "./purchaseOrdersApi";
export { vouchersApi } from "./vouchersApi";
export { digitalProductsApi } from "./digitalProductsApi";

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
  PurchaseOrderItem,
  PurchaseOrderItemDetail,
  CreatePurchaseOrderData,
} from "./purchaseOrdersApi";

export type {
  ImportVouchersResponse,
  ImportVouchersData,
  StoreVouchersData,
  StoreVouchersResponse,
  Voucher,
  GetVouchersParams,
  GetVouchersResponse,
} from "./vouchersApi";

export type {
  DigitalProduct,
  DigitalProductStatus,
  DigitalProductFilters,
  CreateDigitalProductData,
  BulkCreateDigitalProductsData,
  UpdateDigitalProductData,
} from "./digitalProductsApi";

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
  useAssignDigitalProductsMutation,
} from "./productsApi";

export {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
} from "./purchaseOrdersApi";

export {
  useGetVouchersQuery,
  useImportVouchersMutation,
  useStoreVouchersMutation,
} from "./vouchersApi";

export {
  useGetDigitalProductsQuery,
  useGetDigitalProductQuery,
  useCreateDigitalProductsMutation,
  useUpdateDigitalProductMutation,
  useDeleteDigitalProductMutation,
} from "./digitalProductsApi";
