// Export all API slices
export { suppliersApi } from "./suppliersApi";
export { productsApi } from "./productsApi";
export { purchaseOrdersApi } from "./purchaseOrdersApi";
export { vouchersApi } from "./vouchersApi";
export { digitalProductsApi } from "./digitalProductsApi";
export { brandsApi } from "./brandsApi";
export { loginLogsApi } from "./loginLogsApi";
export { voucherAuditLogsApi } from "./voucherAuditLogsApi";

// Export all types
export type {
  Supplier,
  SupplierType,
  SupplierStatus,
  SupplierFilters,
  CreateSupplierData,
  UpdateSupplierData,
} from "./../../../types/index";

export type {
  Product,
  ProductStatus,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  ThirdPartyProduct,
  ThirdPartyProductFilters,
} from "./../../../types/index";

export type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderItem,
  PurchaseOrderItemDetail,
  CreatePurchaseOrderData,
} from "./../../../types/index";

export type {
  ImportVouchersResponse,
  ImportVouchersData,
  StoreVouchersData,
  StoreVouchersResponse,
  Voucher,
  GetVouchersParams,
  GetVouchersResponse,
  GetDecryptedVoucherResponse,
  GetDecryptedVoucherData,
} from "./../../../types/index";

export type {
  DigitalProduct,
  DigitalProductStatus,
  DigitalProductFilters,
  CreateDigitalProductData,
  BulkCreateDigitalProductsData,
  UpdateDigitalProductData,
} from "./../../../types/index";

export type {
  Brand,
  BrandFilters,
  CreateBrandData,
  UpdateBrandData,
} from "./../../../types/index";

export type {
  LoginLog,
  LoginLogFilters,
  CreateLoginLogData,
} from "./../../../types/index";

export type {
  VoucherAuditLog,
  VoucherAuditLogFilters,
} from "./../../../types/index";

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
  useGetDecryptedVoucherMutation,
  useImportVouchersMutation,
  useStoreVouchersMutation,
} from "./vouchersApi";

export {
  useGetDigitalProductsQuery,
  useGetDigitalProductsListQuery,
  useGetDigitalProductQuery,
  useCreateDigitalProductsMutation,
  useUpdateDigitalProductMutation,
  useDeleteDigitalProductMutation,
} from "./digitalProductsApi";

export {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "./brandsApi";

export {
  useGetLoginLogsQuery,
  useLazyGetLoginLogsQuery,
  useCreateLoginLogMutation,
} from "./loginLogsApi";

export {
  useGetVoucherAuditLogsQuery,
  useLazyGetVoucherAuditLogsQuery,
} from "./voucherAuditLogsApi";
