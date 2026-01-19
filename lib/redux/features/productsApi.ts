import { createApi } from "@reduxjs/toolkit/query/react";
import { CreateProductData, MutationError, PaginationMeta, Product, ProductFilters, ThirdPartyProduct, ThirdPartyProductFilters, UpdateProductData } from "@/types";
import { axiosBaseQuery } from "../base";

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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to create product";
            console.error(errorMessage);
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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to update product";
            console.error(errorMessage);
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
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message || "Failed to delete product";
          console.error(errorMessage);
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
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to assign digital products";
            console.error(errorMessage);
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
