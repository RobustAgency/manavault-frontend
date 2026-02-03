import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import { Module } from "@/types";

export const modulesApi = createApi({
  reducerPath: "modulesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Module"],
  endpoints: (builder) => ({
    getModules: builder.query<Module[], void>({
      query: () => ({
        url: "/modules",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((module) => ({
                type: "Module" as const,
                id:
                  module.key ??
                  module.id?.toString() ??
                  module.name ??
                  "unknown",
              })),
              { type: "Module", id: "LIST" },
            ]
          : [{ type: "Module", id: "LIST" }],
      transformResponse: (response: {
        data?: Module[] | { modules?: Module[]; data?: Module[] };
        modules?: Module[];
        error?: boolean;
        message?: string;
      }) => {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (response.data?.modules && Array.isArray(response.data.modules)) {
          return response.data.modules;
        }
        if (response.data?.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        if (response.modules && Array.isArray(response.modules)) {
          return response.modules;
        }
        return [];
      },
    }),
  }),
});

export const { useGetModulesQuery } = modulesApi;
