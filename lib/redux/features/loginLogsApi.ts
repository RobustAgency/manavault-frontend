import { createApi } from "@reduxjs/toolkit/query/react";
import { CreateLoginLogData, LoginLog, LoginLogFilters, PaginationMeta } from "@/types";
import { axiosBaseQuery } from "../base";

export const loginLogsApi = createApi({
  reducerPath: "loginLogsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LoginLog"],
  endpoints: (builder) => ({
    getLoginLogs: builder.query<
      { data: LoginLog[]; pagination: PaginationMeta },
      LoginLogFilters | void
    >({
      query: (filters) => ({
        url: "/login-logs",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "LoginLog" as const,
              id: String(id),
            })),
            { type: "LoginLog", id: "LIST" },
          ]
          : [{ type: "LoginLog", id: "LIST" }],
      transformResponse: (response: {
        data:
        | LoginLog[]
        | {
          data: LoginLog[];
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

    createLoginLog: builder.mutation<LoginLog, CreateLoginLogData>({
      query: (data) => ({
        url: "/login-logs",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "LoginLog", id: "LIST" }],
      transformResponse: (response: {
        data: LoginLog;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as LoginLog;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Silently succeed - don't show toast for login logs
        } catch (error) {
          // Silently fail - don't block login if logging fails
          console.error("Failed to create login log:", error);
        }
      },
    }),
  }),
});

export const {
  useGetLoginLogsQuery,
  useLazyGetLoginLogsQuery,
  useCreateLoginLogMutation,
} = loginLogsApi;

