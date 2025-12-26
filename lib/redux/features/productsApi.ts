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

export interface DigitalProduct {
  id: number;
  supplier_id: number;
  name: string;
  sku: string;
  brand: string;
  description?: string | null;
  cost_price: string;
  status: string;
  currency: string;
  metadata?: {
    sku: string;
    name: string;
    brand: string;
    types?: string[];
    format?: string;
    prices?: Array<{
      price: string;
      toQuantity: number | null;
      fromQuantity: number;
    }>;
    country?: string;
    currency?: string;
    imageUrl?: string;
    faceValue?: string;
    descriptions?: string[];
    instructions?: string[];
    brandCategory?: string | null;
    termConditions?: string[];
    brandSubCategory?: string | null;
    percentageOffFaceValue?: string;
    isInstantDeliverySupported?: boolean;
  };
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: number;
    name: string;
    type: string;
    contact_email: string;
    contact_phone?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

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
        params: {
          slug: filters.slug,
          limit: filters.limit,
          offset: filters.offset ?? 1,
        },
      }),
      providesTags: [{ type: "ThirdPartyProduct", id: "LIST" }],
      transformResponse: (response: {
        data:
        | ThirdPartyProduct[]
        | {
          data?: ThirdPartyProduct[];
          limit?: number | string;
          offset?: number | string;
        };
        error?: boolean;
        message?: string;
      }) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (
          response.data &&
          "data" in response.data &&
          Array.isArray(response.data.data)
        ) {
          return response.data.data;
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

    createProduct: builder.mutation<Product, CreateProductData | FormData>({
      query: (data) => ({
        url: "/admin/products",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
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
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Product created successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to create product";
            toast.error(errorMessage);
          }
        }
      },
    }),

    updateProduct: builder.mutation<
      Product,
      { id: number; data: UpdateProductData | FormData }
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
              mutationError?.error?.data?.message || "Failed to update product";
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
            mutationError?.error?.data?.message || "Failed to delete product";
          toast.error(errorMessage);
        }
      },
    }),

    assignDigitalProducts: builder.mutation<
      { error: boolean; message: string },
      { productId: number; digitalProductIds: number[] }
    >({
      query: ({ productId, digitalProductIds }) => ({
        url: `/admin/products/${productId}/digital_products`,
        method: "POST",
        data: { digital_product_ids: digitalProductIds },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: String(productId) },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Digital products assigned successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to assign digital products";
            toast.error(errorMessage);
          }
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
  useAssignDigitalProductsMutation,
} = productsApi;
