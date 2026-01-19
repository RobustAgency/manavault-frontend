import { createApi } from "@reduxjs/toolkit/query/react";
import { productsApi } from "@/lib/redux/features/productsApi";
import { MutationError, PaginationMeta, PriceRule, PriceRuleQuery, Product } from "@/types";
import { axiosBaseQuery } from "../base";

export const priceAutomationApi = createApi({
  reducerPath: "priceAutomationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["price-automation"],
  endpoints: (builder) => ({
    getPriceRulesList: builder.query<
      { data: PriceRule[]; pagination?: PaginationMeta },
      PriceRuleQuery | void
    >({
      query: (filters) => ({
        url: "/admin/price-rules",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "price-automation" as const,
              id: String(id),
            })),
            { type: "price-automation", id: "LIST" },
          ]
          : [{ type: "price-automation", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: PriceRule[];
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

    getPriceRule: builder.query<PriceRule, number>({
      query: (id) => ({
        url: `/admin/price-rules/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "price-automation", id: String(id) },
      ],
      transformResponse: (response: {
        data: PriceRule;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as PriceRule;
      },
    }),

    createPriceRule: builder.mutation<PriceRule, PriceRule | FormData>({
      query: (data) => ({
        url: "/admin/price-rules",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "price-automation", id: "LIST" }],
      transformResponse: (response: {
        data: PriceRule;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as PriceRule;
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        try {
          dispatch(
            productsApi.util.invalidateTags([
              { type: "Product", id: "LIST" },
            ])
          );

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

    updatePriceRule: builder.mutation<
      PriceRule,
      { id: number; data: PriceRule | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/price-rules/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "price-automation", id: String(id) },
        { type: "price-automation", id: "LIST" },
      ],
      transformResponse: (response: {
        data: PriceRule;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as PriceRule;
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            productsApi.util.invalidateTags([
              { type: "Product", id: "LIST" },
            ])
          );

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

    deletePriceRule: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/price-rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "price-automation", id: String(id) },
        { type: "price-automation", id: "LIST" },
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

    getPreviewRuleAffectedProducts: builder.query<Product[], PriceRule>({
      query: (data) => ({
        url: "/admin/price-rules/preview",
        method: "POST",
        data: data,
      }),
      transformResponse: (response: {
        data: Product[];
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Product[];
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        try {
          dispatch(
            productsApi.util.invalidateTags([
              { type: "Product", id: "LIST" },
            ])
          );

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
  }),
});

export const {
  useGetPriceRulesListQuery,
  useDeletePriceRuleMutation,
  useGetPriceRuleQuery,
  useUpdatePriceRuleMutation,
  useCreatePriceRuleMutation,
  useLazyGetPreviewRuleAffectedProductsQuery,

} = priceAutomationApi;

