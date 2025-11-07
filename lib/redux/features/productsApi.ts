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

export type ProductStatus = "in_active" | "active" | "archived";

export interface Product {
  id: number;
  supplier_id: number;
  name: string;
  description?: string | null;
  sku: string;
  purchase_price: number;
  selling_price: number;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: number;
    name: string;
    slug: string;
  };
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
  status?: ProductStatus;
}

export interface ThirdPartyProductFilters {
  slug: string;
  limit?: number;
  offset?: number;
}

export interface CreateProductData {
  supplier_id: number;
  name: string;
  description?: string;
  sku: string;
  purchase_price: number;
  selling_price: number;
  status: ProductStatus;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  purchase_price?: number;
  selling_price?: number;
  status?: ProductStatus;
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

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product", "ThirdPartyProduct"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      { data: Product[]; pagination: PaginationMeta },
      ProductFilters | void
    >({
      query: (filters) => ({
        url: "/admin/products",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Product" as const,
                id: String(id),
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: Product[];
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

    getThirdPartyProducts: builder.query<
      ThirdPartyProduct[],
      ThirdPartyProductFilters
    >({
      query: (filters) => ({
        url: "/admin/products/third-party",
        method: "GET",
        params: filters,
      }),
      providesTags: [{ type: "ThirdPartyProduct", id: "LIST" }],
      transformResponse: (response: {
        data: ThirdPartyProduct[];
        error?: boolean;
        message?: string;
      }) => {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
    }),

    getProduct: builder.query<Product, number>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Product", id: String(id) },
      ],
      transformResponse: (response: {
        data: Product;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Product;
      },
    }),

    createProduct: builder.mutation<Product, CreateProductData>({
      query: (data) => ({
        url: "/admin/products",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Product created successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create product";
            toast.error(errorMessage);
          }
        }
      },
    }),

    updateProduct: builder.mutation<
      Product,
      { id: number; data: UpdateProductData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/products/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id: String(id) },
        { type: "Product", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Product updated successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to update product";
            toast.error(errorMessage);
          }
        }
      },
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id: String(id) },
        { type: "Product", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Product deleted successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message ||
            "Failed to delete product";
          toast.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetThirdPartyProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

