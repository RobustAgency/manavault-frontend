import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { Brand, BrandFilters, CreateBrandData, MutationError, PaginationMeta, UpdateBrandData } from "@/types";

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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to create brand";
            console.error(errorMessage);
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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to update brand";
              console.error(errorMessage);
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
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
          mutationError?.error?.data?.message || "Failed to delete brand";
          console.error(errorMessage);
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

