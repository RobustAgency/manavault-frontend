import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { PaginationMeta, VoucherAuditLog, VoucherAuditLogFilters } from "@/types";

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
        url: "/voucher-audit-logs",
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