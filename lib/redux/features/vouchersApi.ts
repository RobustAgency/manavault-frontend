import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";

export interface Voucher {
  id: number;
  code: string;
  purchase_order_id: number;
  created_at: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  error?: boolean;
  message?: string;
  data?: T;
}

type Nullable<T> = T | null | undefined;

interface PaginatedPayload<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: Nullable<number>;
  to: Nullable<number>;
  next_page_url?: Nullable<string>;
  prev_page_url?: Nullable<string>;
}

export interface ImportVouchersResponse extends ApiResponse<unknown> {
  error?: boolean;
  message?: string;
}

export interface ImportVouchersData {
  file: File;
  purchase_order_id: number;
}

export interface VoucherCodeItem {
  code: string;
  digitalProductID: number;
}

export interface StoreVouchersData {
  purchase_order_id: number;
  voucher_codes: VoucherCodeItem[];
}

export interface StoreVouchersResponse extends ApiResponse<unknown> {
  error?: boolean;
  message?: string;
}

export interface GetVouchersParams {
  purchase_order_id: number;
  page?: number;
  per_page?: number;
}

export interface GetVouchersResponse {
  vouchers: Voucher[];
  pagination: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: Nullable<number>;
    to: Nullable<number>;
  } | null;
  message?: string;
  error?: boolean;
}

export interface GetDecryptedVoucherResponse {
  id: number;
  code: string;
  message?: string;
  error?: boolean;
}

export interface GetDecryptedVoucherData {
  voucherId: number;
  ip_address: string;
  user_agent: string;
}

// Custom base query using existing Axios client
const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
    async ({ url, method = "GET", data, params, headers }) => {
      try {
        const result = await apiClient({
          url,
          method,
          data,
          params,
          headers,
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

export const vouchersApi = createApi({
  reducerPath: "vouchersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Voucher"],
  endpoints: (builder) => ({
    getVouchers: builder.query<GetVouchersResponse, GetVouchersParams>({
      query: (params) => ({
        url: "/admin/vouchers",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: ApiResponse<PaginatedPayload<Voucher>>
      ): GetVouchersResponse => {
        const payload = response?.data;
        const vouchers = Array.isArray(payload?.data)
          ? (payload!.data as Voucher[])
          : [];
        const pagination = payload
          ? {
            currentPage: payload.current_page ?? 1,
            perPage: payload.per_page ?? vouchers.length,
            total: payload.total ?? vouchers.length,
            lastPage: payload.last_page ?? 1,
            from: payload.from ?? null,
            to: payload.to ?? null,
          }
          : null;

        return {
          vouchers,
          pagination,
          message: response?.message,
          error: response?.error,
        };
      },
      providesTags: (result) =>
        result?.vouchers?.length
          ? [
            ...result.vouchers.map(({ id }) => ({
              type: "Voucher" as const,
              id: String(id),
            })),
            { type: "Voucher", id: "LIST" },
          ]
          : [{ type: "Voucher", id: "LIST" }],
    }),
    getDecryptedVoucher: builder.mutation<
      GetDecryptedVoucherResponse,
      GetDecryptedVoucherData
    >({
      query: ({ voucherId, ip_address, user_agent }) => ({
        url: `/admin/vouchers/${voucherId}/code`,
        method: "POST",
        data: {
          ip_address,
          user_agent,
        },
      }),
      transformResponse: (
        response: ApiResponse<{ id: number; code: string }>
      ): GetDecryptedVoucherResponse => {
        return {
          id: response?.data?.id ?? 0,
          code: response?.data?.code ?? "",
          message: response?.message,
          error: response?.error,
        };
      },
    }),
    importVouchers: builder.mutation<
      ImportVouchersResponse,
      ImportVouchersData
    >({
      query: ({ file, purchase_order_id }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purchase_order_id", purchase_order_id.toString());

        return {
          url: "/admin/vouchers/store",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
      invalidatesTags: [{ type: "Voucher", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const isSuccess = data.error === false;
          if (isSuccess) {
            toast.success(data.message || "Vouchers imported successfully");
          } else {
            toast.error(data.message || "Failed to import vouchers");
          }
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to import vouchers";
            toast.error(errorMessage);
          }
        }
      },
    }),
    storeVouchers: builder.mutation<StoreVouchersResponse, StoreVouchersData>({
      query: ({ purchase_order_id, voucher_codes }) => {
        return {
          url: "/admin/vouchers/store",
          method: "POST",
          data: {
            purchase_order_id,
            voucher_codes,
          },
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      invalidatesTags: [{ type: "Voucher", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const isSuccess = data.error === false;
          if (isSuccess) {
            toast.success(data.message || "Vouchers stored successfully");
          } else {
            toast.error(data.message || "Failed to store vouchers");
          }
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to store vouchers";
            toast.error(errorMessage);
          }
        }
      },
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetDecryptedVoucherMutation,
  useImportVouchersMutation,
  useStoreVouchersMutation,
} = vouchersApi;
