import { createApi } from "@reduxjs/toolkit/query/react";
import { CreateSupplierData, GetSupplierKPI, MutationError, PaginationMeta, Supplier, SupplierFilters, UpdateSupplierData } from "@/types";
import { axiosBaseQuery } from "../base";

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<
      { data: Supplier[]; pagination: PaginationMeta },
      SupplierFilters | void
    >({
      query: (filters) => ({
        url: "/admin/suppliers",
        method: "GET",
        params: filters ?? undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Supplier" as const,
                id: String(id),
              })),
              { type: "Supplier", id: "LIST" },
            ]
          : [{ type: "Supplier", id: "LIST" }],
      transformResponse: (response: {
        data: {
          data: Supplier[];
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
getSupplierKpi: builder.query<GetSupplierKPI[], void>({
  query: () => ({
    url: `/admin/suppliers/kpis`,
    method: "GET",
  }),

providesTags: (result) =>
  result
    ? [
        ...result.map((item) => ({
          type: "Supplier" as const,
          id: item.supplier_id,
        })),
        { type: "Supplier" as const, id: "LIST" },
      ]
    : [{ type: "Supplier" as const, id: "LIST" }],

  transformResponse: (response: {
    error?: boolean;
    data?: {
      data: GetSupplierKPI[];
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
      from: number;
      to: number;
    };
    message?: string;
  }) => {
    return response.data?.data ?? [];
  },
}),

    getSupplier: builder.query<Supplier, number>({
      query: (id) => ({
        url: `/admin/suppliers/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "Supplier", id: String(id) },
      ],
      transformResponse: (response: {
        data: Supplier;
        error?: boolean;
        message?: string;
      }) => {
        if (response.data) {
          return response.data;
        }
        return response as unknown as Supplier;
      },
    }),

    createSupplier: builder.mutation<Supplier, CreateSupplierData>({
      query: (data) => ({
        url: "/admin/suppliers",
        method: "POST",
        data: data,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to create supplier";
            console.error(errorMessage);
          }
        }
      },
    }),

    updateSupplier: builder.mutation<
      Supplier,
      { id: number; data: UpdateSupplierData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/suppliers/${id}`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Supplier", id: String(id) },
        { type: "Supplier", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          if (!mutationError?.error?.data?.errors) {
            const errorMessage =
              mutationError?.error?.data?.message ||
              "Failed to update supplier";
            console.error(errorMessage);
          }
        }
      },
    }),

    deleteSupplier: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Supplier", id: String(id) },
        { type: "Supplier", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          const mutationError = error as MutationError;
          const errorMessage =
            mutationError?.error?.data?.message || "Failed to delete supplier";
          console.error(errorMessage);
        }
      },
    }),
  }),
});

export const {
  useGetSupplierKpiQuery,
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
