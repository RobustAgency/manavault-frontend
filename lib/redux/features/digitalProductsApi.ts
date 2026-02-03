import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { BulkCreateDigitalProductsData, DigitalProduct, DigitalProductFilters, GetLowStockProduct, MutationError, PaginationMeta, UpdateDigitalProductData } from "@/types";

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
        url: "/digital-stocks",
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
        error?: boolean;
        data?: {
          data: DigitalProduct[];
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: number;
          to: number;
        };
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

    getDigitalProductsList: builder.query<
      { data: DigitalProduct[]; pagination: PaginationMeta },
      DigitalProductFilters | void
    >({
      query: (filters) => ({
        url: "/digital-products",
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
        error?: boolean;
        data?: {
          data: DigitalProduct[];
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: number;
          to: number;
        };
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
        url: `/digital-products/${id}`,
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

   getLowStockProduct: builder.query<GetLowStockProduct[], void>({
  query: () => ({
    url: `/digital-stocks/low-stock`,
    method: "GET",
  }),
  providesTags: () => [{ type: "DigitalProduct" }],
  transformResponse: (response: {
    error?: boolean;
    data?: {
      data: GetLowStockProduct[];
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
    message?: string;
  }) => {
    return response.data?.data ?? []; 
  },
}),


    createDigitalProducts: builder.mutation<
      DigitalProduct[],
      BulkCreateDigitalProductsData
    >({
      query: (data) => ({
        url: "/digital-products",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "DigitalProduct", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create digital products";
            console.error(errorMessage);}
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
        url: `/digital-products/${id}`,
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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to update digital product";
            console.error(errorMessage);
          }
        }
      },
    }),

    deleteDigitalProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `/digital-products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DigitalProduct", id: String(id) },
        { type: "DigitalProduct", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message ||
            "Failed to delete digital product";
          console.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetLowStockProductQuery,
  useGetDigitalProductsQuery,
  useGetDigitalProductsListQuery,
  useGetDigitalProductQuery,
  useCreateDigitalProductsMutation,
  useUpdateDigitalProductMutation,
  useDeleteDigitalProductMutation,
} = digitalProductsApi;
