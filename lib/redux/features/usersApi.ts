import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { User, UserFilters } from "@/interfaces/User";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<
      {
        data: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      UserFilters | void
    >({
      query: (filters) => ({
        url: "/users",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map((user) => ({
                type: "User" as const,
                id: String(user.id ?? user.supabase_id ?? "unknown"),
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: User[];
          current_page?: number;
          per_page?: number;
          total?: number;
          last_page?: number;
        };
        error?: boolean;
        message?: string;
      }) => {
        if (response.data?.data && Array.isArray(response.data.data)) {
          return {
            data: response.data.data,
            pagination: {
              page: response.data.current_page ?? 1,
              limit: response.data.per_page ?? 10,
              total: response.data.total ?? 0,
              totalPages: response.data.last_page ?? 1,
            },
          };
        }
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        };
      },
    }),
    createUser: builder.mutation<
      { error?: boolean; message?: string; data?: User },
      { name: string; email: string; password: string }
    >({
      query: (payload) => ({
        url: "/users",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = usersApi;
