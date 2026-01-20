export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface Brand {
  id: number;
  name: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandFilters {
  name?: string;
  page?: number;
  per_page?: number;
}

export interface CreateBrandData {
  name: string;
  image?: File | string;
}

export interface UpdateBrandData {
  name?: string;
  image?: File | string;
}

// Type for RTK Query mutation errors
export interface MutationError {
  error?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}


export type DigitalProductStatus = "active" | "inactive";

export type DigitalProductStock =  "high" | "low" | "all";

export interface DigitalProduct {
  id: number;
  supplier_id: number;
  name: string;
  sku: string;
  brand?: string | null;
  description?: string | null;
  tags?: string[] | null;
  image?: string | null;
  cost_price: string | number;
  status: DigitalProductStatus;
  region?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  supplier_name?: string | null;
  supplier_type?: string | null;
  quantity?: string | null;
  last_synced_at?: string | null;
  source?: string | null;
  currency?: string | null;
  pivot?: {
    priority?: number;
  };
  // Legacy nested supplier object (for backward compatibility)
  supplier?: {
    id: number;
    name: string;
    slug: string;
    type?: string;
    status?: string;
  };
}

export interface DigitalProductFilters {
  page?: number;
  per_page?: number;
  name?: string;
  brand?: string;
  supplier_id?: number;
  currency?: DigitalProductStatus;
  status?: DigitalProductStatus;
  stock?: DigitalProductStock;
}
export interface GetLowStockProduct{
  id: number;
  supplier_id: number;
  name: string;
  brand: string | null;
  description: string | null;
  cost_price: string;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  sku: string;
  last_synced_at: string | null;
  source: string | null;
  supplier_name: string;
  supplier_type: string;
  quantity: string;  
} 

export interface CreateDigitalProductData {
  supplier_id: number;
  name: string;
  sku: string;
  brand?: string;
  description?: string;
  tags?: string[];
  image?: string;
  cost_price: number;
  region?: string;
  metadata?: Record<string, unknown>;
}

export interface BulkCreateDigitalProductsData {
  products: CreateDigitalProductData[];
}

export interface UpdateDigitalProductData {
  name?: string;
  brand?: string;
  description?: string;
  tags?: string[];
  image?: string;
  cost_price?: number;
  region?: string;
  metadata?: Record<string, unknown>;
}


export interface LoginLog {
  id: number;
  email: string;
  ip_address: string;
  user_agent: string | null;
  activity: string;
  logged_in_at: string | null;
  logged_out_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginLogFilters {
  page?: number;
  per_page?: number;
  email?: string;
  ip_address?: string;
}

export interface CreateLoginLogData {
  email: string;
  ip_address: string;
  user_agent?: string | null;
  activity: string;
  logged_in_at?: string | null;
  logged_out_at?: string | null;
}

export interface Brand {
  id: number;
  name: string;
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceRuleQuery {
  page?: number;
  per_page?: number;
  status?: "active" | "in_active" | undefined;
  name: string | undefined
}


export interface UpdateBrandData {
  name?: string;
  image?: File | string;
}


export type ProductStatus = "in_active" | "active" | "archived";



export interface Product {
  id: number;
  name: string;
  brand?: string | null | {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  brand_id?: number;
  description?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  sku: string;
  selling_price: number;
  status: ProductStatus;
  tags?: string[];
  image?: string | null;
  regions?: string[];
  created_at: string;
  updated_at: string;
  digital_products?: DigitalProduct[];
  supplier?: {
    id: number;
    name: string;
    slug: string;
  };
  product_name? : string;
  current_selling_price : number;
  new_selling_price : number;
  currency : string;
  face_value : number;
}



export interface ThirdPartyProduct {
  id: string | number;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  [key: string]: unknown; // For additional fields from third-party APIs
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  name?: string;
  brand?: string;
  brand_id?: number;
  status?: ProductStatus;
}

export interface ThirdPartyProductFilters {
  slug: string;
  limit?: number;
  offset?: number;
}

export interface CreateProductData {
  name: string;
  sku: string;
  brand?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  tags?: string[];
  image?: string;
  selling_price: number;
  status: ProductStatus;
  regions?: string[];
}

export interface UpdateProductData {
  name?: string;
  brand?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  tags?: string[];
  image?: string;
  selling_price?: number;
  status?: ProductStatus;
  regions?: string[];
}

export interface VoucherAuditLog {
  id: number;
  voucher_id?: number;
  user_id?: number;
  action: string;
  ip_address?: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
  digital_product?: string | null;
  voucher?: {
    id: number; 
    code: string;
    serial_number?: string;
    pin_code?: string | null;
    status?: string;
    purchase_order_id?: number;
    purchase_order_item_id?: number;
    stock_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  user?: {
    id: number;
    supabase_id?: string;
    name?: string;
    email: string;
    email_verified_at?: string | null;
    is_approved?: boolean;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
  details?: Record<string, unknown> | null;
}

export interface VoucherAuditLogFilters {
  page?: number;
  per_page?: number;
  voucher_id?: number;
  user_id?: number;
  name?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}


export interface PurchaseOrderItemDetail {
  id: number;
  purchase_order_id: number;
  digital_product_id: number;
  quantity: number;
  unit_cost: string;
  subtotal: string;
  created_at: string;
  updated_at: string;
  currency: string;
  digital_product?: {
    id: number;
    name: string;
    sku: string;
    brand?: string | null;
    description?: string | null;
    cost_price: number;
    status?: string;
    supplier?: {
      id: number;
      name: string;
      type?: string;
      contact_email?: string | null;
      contact_phone?: string | null;
      status?: string;
      created_at?: string;
      updated_at?: string;
    };
  };
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  product_id?: number; // Optional for backward compatibility
  supplier_id: number;
  purchase_price?: number; // Calculated field
  quantity?: number; // Calculated from items
  total_amount?: number; // Calculated field
  total_price?: string; // API returns this as string
  status?: string;
  created_at: string;
  updated_at: string;
  currency?: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    description?: string | null;
    purchase_price?: string; // API returns this as string
    selling_price?: string; // API returns this as string
    status?: string;
    supplier_id?: number;
    created_at?: string;
    updated_at?: string;
  };
  items?: PurchaseOrderItemDetail[];
  supplier?: {
    id: number;
    name: string;
    slug?: string;
    type?: string;
    contact_email?: string | null;
    contact_phone?: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  suppliers?: {
    id: number;
    name: string;
    slug?: string;
    type?: string;
    contact_email?: string | null;
    contact_phone?: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  }[];
  vouchers?: {
    id: number;
    code: string;
    purchase_order_id: number;
    created_at: string;
    updated_at: string;
  }[];
}

export interface PurchaseOrderFilters {
  page?: number;
  per_page?: number;
  supplier_id?: number;
  status?: string;
  order_number?: string;
}

export interface PurchaseOrderItem {
  supplier_id: number;
  digital_product_id: number;
  quantity: number;
  currency: string;
}

export interface CreatePurchaseOrderData {
  items: PurchaseOrderItem[];
}
export interface CSVUploadData {
  supplier_id: number;
  file: File;
}

export interface createSortOrderItem {
  digital_product_id: number;
  priority_order: number;
}

export interface createDigitalProductOrder {
  id: number
  data: createSortOrderItem[];
}

export type SupplierType = "internal" | "external";
export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: number;
  name: string;
  slug: string;
  type: SupplierType;
  contact_email?: string | null;
  contact_phone?: string | null;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
  currency?: string | null;
}

export interface SupplierFilters {
  page?: number;
  per_page?: number;
  name?: string;
   type?: SupplierType;
  status?: SupplierStatus;
}

export interface CreateSupplierData {
  name: string;
  contact_email?: string;
  contact_phone?: string;
  status?: SupplierStatus;
}

export interface UpdateSupplierData {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  status?: SupplierStatus;
}

export interface GetSupplierKPI {
  supplier_id: number;
  supplier_name: string;
  total_purchase_orders: number;
  completed_purchase_orders: number;
  processing_purchase_orders: number;
  total_quantity_ordered: number;
  total_amount_spent: number;
  average_order_value: number;
  completion_rate: number;
}

export interface Voucher {
  id: number;
  code: string;
  purchase_order_id: number;
  created_at: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  error?: boolean;
  message?: string;
  data?: T;
}

type Nullable<T> = T | null | undefined;

export interface PaginatedPayload<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: Nullable<number>;
  to: Nullable<number>;
  next_page_url?: Nullable<string>;
  prev_page_url?: Nullable<string>;
}

export interface ImportVouchersResponse extends ApiResponse<unknown> {
  error?: boolean;
  message?: string;
}

export interface ImportVouchersData {
  file: File;
  purchase_order_id: number;
}

export interface VoucherCodeItem {
  code: string;
  digitalProductID: number;
}

export interface StoreVouchersData {
  purchase_order_id: number;
  voucher_codes: VoucherCodeItem[];
}

export interface StoreVouchersResponse extends ApiResponse<unknown> {
  error?: boolean;
  message?: string;
}

export interface GetVouchersParams {
  purchase_order_id: number;
  page?: number;
  per_page?: number;
}

export interface GetVouchersResponse {
  vouchers: Voucher[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: Nullable<number>;
    to: Nullable<number>;
  } | null;
  message?: string;
  error?: boolean;
}

export interface GetDecryptedVoucherResponse {
  id: number;
  code: string;
  message?: string;
  error?: boolean;
}

export interface GetDecryptedVoucherData {
  voucherId: number;
  ip_address: string;
  user_agent: string;
}

export interface Condition {
  id: string;
  field: string;
  value: string;
  operator?: "=" | "!=" | ">" | "<" | "contains" | string;
}

export type RuleStatus = "active" | "in_active" | undefined;

export interface PriceRule {
  id?: string;
  name: string;
  description: string;
  status: "active" | "in_active" | undefined;
  match_type: string;
  conditions: Condition[];
  action_value: number | null;
  action_operator: string;
  action_mode: string,
}