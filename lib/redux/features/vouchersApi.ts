import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";

export interface ImportVouchersResponse {
  success: boolean;
  message: string;
  imported_count?: number;
  failed_count?: number;
  errors?: string[];
}

export interface ImportVouchersData {
  file: File;
  purchase_order_id: number;
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
    importVouchers: builder.mutation<
      ImportVouchersResponse,
      ImportVouchersData
    >({
      query: ({ file, purchase_order_id }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purchase_order_id", purchase_order_id.toString());

        return {
          url: "/admin/vouchers/import",
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
          if (data.success) {
            toast.success(
              data.message || "Vouchers imported successfully"
            );
          } else {
            toast.warning(data.message || "Import completed with warnings");
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
  }),
});

export const { useImportVouchersMutation } = vouchersApi;

