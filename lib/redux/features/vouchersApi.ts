import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/lib/api";
import { axiosBaseQuery } from "../base";
import { GetDecryptedVoucherData, GetDecryptedVoucherResponse, GetVouchersParams, GetVouchersResponse, ImportVouchersData, ImportVouchersResponse, MutationError, PaginatedPayload, StoreVouchersData, StoreVouchersResponse, Voucher } from "@/types";

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
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to import vouchers";
            console.error(errorMessage);
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
           await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to store vouchers";
            console.error(errorMessage);
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
