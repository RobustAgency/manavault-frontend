import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
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

// Custom base query using existing Axios client
const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
    },
    unknown,
    unknown
  > =>
    async ({ url, method = "GET", data, params }) => {
      try {
        const result = await apiClient({
          url,
          method,
          data,
          params,
        });
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError as AxiosError<{
          data?: unknown;
          message?: string;
          error?: boolean;
          errors?: Record<string, string[]>;
        }>;
        const error = {
          status: err.response?.status || 500,
          data: err.response?.data || {
            message: err.message || "An error occurred",
            error: true,
          },
        };
        return {
          error,
        };
      }
    };

// Type for RTK Query mutation errors
interface MutationError {
  error?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

export const purchaseOrdersApi = createApi({
  reducerPath: "purchaseOrdersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PurchaseOrder"],
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<
      { data: PurchaseOrder[]; pagination: PaginationMeta },
      PurchaseOrderFilters | void
    >({
      query: (filters) => ({
        url: "/admin/purchase-orders",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "PurchaseOrder" as const,
              id: String(id),
            })),
            { type: "PurchaseOrder", id: "LIST" },
          ]
          : [{ type: "PurchaseOrder", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: any[]; // Raw API response - will be transformed
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: number;
          to: number;
        };
        error?: boolean;
        message?: string;
      }) => {
        if (response.data?.data && Array.isArray(response.data.data)) {
          // Transform the data to map API fields to expected interface
          const transformedData = response.data.data.map((order: any) => {
            // API returns total_price as string, convert to number for total_amount
            const totalPrice = parseFloat(String(order.total_price || "0"));
            const quantity = order.quantity || 1;
            // Calculate unit price from total_price / quantity, or use product.purchase_price if available
            const unitPrice = order.product?.purchase_price
              ? parseFloat(String(order.product.purchase_price))
              : quantity > 0
                ? totalPrice / quantity
                : 0;

            return {
              ...order,
              total_amount: totalPrice,
              purchase_price: unitPrice,
            } as PurchaseOrder;
          });

          return {
            data: transformedData,
            pagination: {
              current_page: response.data.current_page,
              per_page: response.data.per_page,
              total: response.data.total,
              last_page: response.data.last_page,
              from: response.data.from,
              to: response.data.to,
            },
          };
        }
        return {
          data: [],
          pagination: {
            current_page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
          },
        };
      },
    }),

    getPurchaseOrder: builder.query<PurchaseOrder, number>({
      query: (id) => ({
        url: `/admin/purchase-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "PurchaseOrder", id: String(id) },
      ],
      transformResponse: (response: {
        data: any; // Raw API response - will be transformed
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          const order = response.data;
          // API returns total_price as string, convert to number for total_amount
          const totalPrice = parseFloat(String(order.total_price || "0"));

          // Calculate quantity and unit price from items if available
          let quantity = 0;
          let unitPrice = 0;

          if (
            order.items &&
            Array.isArray(order.items) &&
            order.items.length > 0
          ) {
            // Calculate total quantity from items
            quantity = order.items.reduce((sum: number, item: any) => {
              return sum + (item.quantity || 0);
            }, 0);

            // Calculate average unit price from items
            const totalCost = order.items.reduce((sum: number, item: any) => {
              return sum + parseFloat(String(item.subtotal || "0"));
            }, 0);
            unitPrice = quantity > 0 ? totalCost / quantity : 0;
          } else {
            // Fallback to old structure
            quantity = order.quantity || 1;
            unitPrice = order.product?.purchase_price
              ? parseFloat(String(order.product.purchase_price))
              : quantity > 0
                ? totalPrice / quantity
                : 0;
          }

          return {
            ...order,
            total_amount: totalPrice,
            purchase_price: unitPrice,
            quantity: quantity,
          } as PurchaseOrder;
        }
        return response as unknown as PurchaseOrder;
      },
    }),

    createPurchaseOrder: builder.mutation<
      PurchaseOrder,
      CreatePurchaseOrderData
    >({
      query: (data) => ({
        url: "/admin/purchase-orders",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Purchase order created successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create purchase order";
            toast.error(errorMessage);
          }
        }
      },
    }),

    createDigitalProductOrder: builder.mutation<
      PurchaseOrder,
      createDigitalProductOrder
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}/digital-products/priority`,
        method: "POST",
        data: {
          digital_products: data,
        },
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Digital product order created successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create purchase order";
            toast.error(errorMessage);
          }
        }
      },
    }),

    createCSVUpload: builder.mutation<
      CSVUploadData, FormData
    >({
      query: (data) => ({
        url: "/admin/digital-products/batch-import",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "PurchaseOrder", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("CSV Uploaded successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to upload CSV file";
            toast.error(errorMessage);
          }
        }
      },
    }),
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useCreateCSVUploadMutation,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useCreateDigitalProductOrderMutation
} = purchaseOrdersApi;
