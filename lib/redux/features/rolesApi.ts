import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { MutationError, PaginationMeta, Role, RoleFilters, CreateRoleData, UpdateRoleData  } from "@/types";

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Role"],
  endpoints: (builder) => ({
    getRoles: builder.query<
      { data: Role[]; pagination: PaginationMeta },
      RoleFilters | void
    >({
      query: (filters) => ({
        url: "/roles",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Role" as const,
                id: String(id),
              })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: Role[];
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

    getRole: builder.query<Role, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Role", id: String(id) },
      ],
      transformResponse: (response: {
        data: Role;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Role;
      },
    }),

    createRole: builder.mutation<Role, CreateRoleData>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
      transformResponse: (response: {
        data: Role;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Role;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to create role";
            console.error(errorMessage);
          }
        }
      },
    }),

    updateRole: builder.mutation<Role, { id: number; data: UpdateRoleData }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id: String(id) },
        { type: "Role", id: "LIST" },
      ],
      transformResponse: (response: {
        data: Role;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Role;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message || "Failed to update role";
            console.error(errorMessage);
          }
        }
      },
    }),

    deleteRole: builder.mutation<void, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Role", id: String(id) },
        { type: "Role", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message || "Failed to delete role";
          console.error(errorMessage);
        }
      },
    }),

    assignUserRole: builder.mutation<
      { error?: boolean; message?: string },
      { userId: string; roleId: number }
    >({
      query: ({ userId, roleId }) => ({
        url: `/users/${userId}/assign-roles`,
        method: "POST",
        data: { role_id: roleId },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message || "Failed to assign role";
          console.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignUserRoleMutation,
} = rolesApi;
