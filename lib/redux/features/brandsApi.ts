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

export const brandsApi = createApi({
  reducerPath: "brandsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<
      { data: Brand[]; pagination?: PaginationMeta },
      BrandFilters | void
    >({
      query: (filters) => ({
        url: "/admin/brands",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Brand" as const,
                id: String(id),
              })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
      transformResponse: (response: {
        data: Brand[] | { data: Brand[]; pagination?: PaginationMeta };
        error?: boolean;
        message?: string;
      }) => {
        // Handle both array and paginated response formats
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
          };
        }
        if (
          response.data &&
          "data" in response.data &&
          Array.isArray(response.data.data)
        ) {
          return {
            data: response.data.data,
            pagination: response.data.pagination,
          };
        }
        return {
          data: [],
        };
      },
    }),

    getBrand: builder.query<Brand, number>({
      query: (id) => ({
        url: `/admin/brands/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Brand", id: String(id) },
      ],
      transformResponse: (response: {
        data: Brand;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Brand;
      },
    }),

    createBrand: builder.mutation<Brand, CreateBrandData | FormData>({
      query: (data) => ({
        url: "/admin/brands",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
      transformResponse: (response: {
        data: Brand;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Brand;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Brand created successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to create brand";
            toast.error(errorMessage);
          }
        }
      },
    }),

    updateBrand: builder.mutation<
      Brand,
      { id: number; data: UpdateBrandData | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/brands/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Brand", id: String(id) },
        { type: "Brand", id: "LIST" },
      ],
      transformResponse: (response: {
        data: Brand;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Brand;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Brand updated successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to update brand";
            toast.error(errorMessage);
          }
        }
      },
    }),

    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Brand", id: String(id) },
        { type: "Brand", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Brand deleted successfully");
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message || "Failed to delete brand";
          toast.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;

