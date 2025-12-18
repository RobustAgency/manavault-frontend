import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";
import { productsApi } from "@/lib/redux/features/productsApi";


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

export interface PriceRuleQuery {
  page?: number;
  per_page?: number;
  status?: "active" | "in_active" | undefined;
  name: string | undefined
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

export interface Condition {
  id: string;
  field: string;
  value: string;
  operator?: "=" | "!=" | ">" | "<" | "contains" | string;
}

export type RuleStatus = "active" | "in_active" | undefined;

export interface PriceRule {
  id?: string;
  name: string;
  description: string;
  status: "active" | "in_active" | undefined;
  match_type: string;
  conditions: Condition[];
  action_value: number | null;
  action_operator: string;
  action_mode: string,
}

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

          toast.success("Price rule created successfully");
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
          toast.success("Price rule updated successfully");
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
          toast.success("Price rule deleted successfully");
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
  useGetPriceRulesListQuery,
  useDeletePriceRuleMutation,
  useGetPriceRuleQuery,
  useUpdatePriceRuleMutation,
  useCreatePriceRuleMutation

} = priceAutomationApi;

