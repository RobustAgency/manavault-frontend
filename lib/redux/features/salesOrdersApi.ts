import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { apiClient } from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";
import { Product } from "@/types";

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface SalesOrderDetails {
  id: number;
  order_number: string; 
  source: string;
  total_price: string;
  currency?: string;
  status: string;
  items: {
    id: number;
    quantity: number;
    unit_price: string;
    subtotal: string;
    product: Product;
  }[];
}


export interface salesOrderFilters {
  page?: number;
  per_page?: number;
  status?: string;
  order_number?: string;
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

export const salesOrdersApi = createApi({
  reducerPath: "salesOrdersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["salesOrder"],
  endpoints: (builder) => ({
    getSalesOrders: builder.query<
      { data: SalesOrderDetails[]; pagination: PaginationMeta },
      salesOrderFilters | void
    >({
      query: (filters) => ({
        url: "/sale-orders",
        method: "GET",
        params: filters ?? undefined,
      }),
         providesTags: (result, error, id) => [
        { type: "salesOrder", id: String(id) },
      ],
      transformResponse: (response: {
        data: {
          data: any[]; 
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

    getSalesOrder: builder.query<SalesOrderDetails, number>({
      query: (id) => ({
        url: `/sale-orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "salesOrder", id: String(id) },
      ],
      transformResponse: (response: {
        data: SalesOrderDetails ; // Raw API response - will be transformed
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          const order = response.data;

          return {
            ...order,

           
          } as SalesOrderDetails;
        }
        return response as unknown as SalesOrderDetails;
      },
    }),
   
  }),
});

export const {
  useGetSalesOrdersQuery,
  useGetSalesOrderQuery,
} = salesOrdersApi;
