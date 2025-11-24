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

export interface VoucherAuditLog {
  id: number;
  voucher_id?: number;
  user_id?: number;
  action: string;
  ip_address?: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
  voucher?: {
    id: number;
    code: string;
    serial_number?: string;
    pin_code?: string | null;
    status?: string;
    purchase_order_id?: number;
    purchase_order_item_id?: number;
    stock_id?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  user?: {
    id: number;
    supabase_id?: string;
    name?: string;
    email: string;
    email_verified_at?: string | null;
    is_approved?: boolean;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
  details?: Record<string, unknown> | null;
}

export interface VoucherAuditLogFilters {
  page?: number;
  per_page?: number;
  voucher_id?: number;
  user_id?: number;
  name?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
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

export const voucherAuditLogsApi = createApi({
  reducerPath: "voucherAuditLogsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["VoucherAuditLog"],
  endpoints: (builder) => ({
    getVoucherAuditLogs: builder.query<
      { data: VoucherAuditLog[]; pagination: PaginationMeta },
      VoucherAuditLogFilters | void
    >({
      query: (filters) => ({
        url: "/admin/voucher-audit-logs",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "VoucherAuditLog" as const,
              id: String(id),
            })),
            { type: "VoucherAuditLog", id: "LIST" },
          ]
          : [{ type: "VoucherAuditLog", id: "LIST" }],
      transformResponse: (response: {
        data:
        | VoucherAuditLog[]
        | {
          data: VoucherAuditLog[];
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
        // Handle direct array response
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: {
              current_page: 1,
              per_page: response.data.length,
              total: response.data.length,
              last_page: 1,
              from: 1,
              to: response.data.length,
            },
          };
        }

        // Handle paginated response
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
  }),
});

export const {
  useGetVoucherAuditLogsQuery,
  useLazyGetVoucherAuditLogsQuery,
} = voucherAuditLogsApi;

