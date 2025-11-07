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

export interface PurchaseOrder {
  id: number;
  order_number: string;
  product_id: number;
  supplier_id: number;
  purchase_price: number;
  quantity: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  supplier?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface PurchaseOrderFilters {
  page?: number;
  per_page?: number;
}

export interface CreatePurchaseOrderData {
  product_id: number;
  supplier_id: number;
  purchase_price: number;
  quantity: number;
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
          data: PurchaseOrder[];
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
          return {
            data: response.data.data,
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
        data: PurchaseOrder;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
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
  }),
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
} = purchaseOrdersApi;

