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

export type DigitalProductStatus = "active" | "inactive";

export interface DigitalProduct {
  id: number;
  supplier_id: number;
  name: string;
  sku: string;
  brand?: string | null;
  description?: string | null;
  tags?: string[] | null;
  image?: string | null;
  cost_price: number;
  status: DigitalProductStatus;
  regions?: string[] | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
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
  status?: DigitalProductStatus;
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
  status: DigitalProductStatus;
  regions?: string[];
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
  status?: DigitalProductStatus;
  regions?: string[];
  metadata?: Record<string, unknown>;
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

export const digitalProductsApi = createApi({
  reducerPath: "digitalProductsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["DigitalProduct"],
  endpoints: (builder) => ({
    getDigitalProducts: builder.query<
      { data: DigitalProduct[]; pagination: PaginationMeta },
      DigitalProductFilters | void
    >({
      query: (filters) => ({
        url: "/admin/digital-products",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "DigitalProduct" as const,
                id: String(id),
              })),
              { type: "DigitalProduct", id: "LIST" },
            ]
          : [{ type: "DigitalProduct", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: DigitalProduct[];
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

    getDigitalProduct: builder.query<DigitalProduct, number>({
      query: (id) => ({
        url: `/admin/digital-products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "DigitalProduct", id: String(id) },
      ],
      transformResponse: (response: {
        data: DigitalProduct;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as DigitalProduct;
      },
    }),

    createDigitalProducts: builder.mutation<
      DigitalProduct[],
      BulkCreateDigitalProductsData
    >({
      query: (data) => ({
        url: "/admin/digital-products",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "DigitalProduct", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const count = Array.isArray(data) ? data.length : 1;
          toast.success(
            `${count} digital product${
              count > 1 ? "s" : ""
            } created successfully`
          );
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create digital products";
            toast.error(errorMessage);
          }
        }
      },
      transformResponse: (response: {
        data: DigitalProduct | DigitalProduct[];
        error?: boolean;
        message?: string;
      }) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return [response.data];
      },
    }),

    updateDigitalProduct: builder.mutation<
      DigitalProduct,
      { id: number; data: UpdateDigitalProductData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/digital-products/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DigitalProduct", id: String(id) },
        { type: "DigitalProduct", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Digital product updated successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to update digital product";
            toast.error(errorMessage);
          }
        }
      },
    }),

    deleteDigitalProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/digital-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DigitalProduct", id: String(id) },
        { type: "DigitalProduct", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Digital product deleted successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message ||
            "Failed to delete digital product";
          toast.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetDigitalProductsQuery,
  useGetDigitalProductQuery,
  useCreateDigitalProductsMutation,
  useUpdateDigitalProductMutation,
  useDeleteDigitalProductMutation,
} = digitalProductsApi;
