import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../base";
import type { UserInfoModule } from "@/types";

type UserInfoPayload = {
  modules: UserInfoModule[];
  role: string | null;
};

export const userInfoApi = createApi({
  reducerPath: "userInfoApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserInfo"],
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfoPayload, void>({
      query: () => ({
        url: "/profile/user-info",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.modules?.length
          ? [
              ...result.modules.map((module) => ({
                type: "UserInfo" as const,
                id: String(module.id ?? module.slug ?? module.name ?? "unknown"),
              })),
              { type: "UserInfo", id: "LIST" },
            ]
          : [{ type: "UserInfo", id: "LIST" }],
      transformResponse: (response: {
        data?: UserInfoModule[] | { modules?: UserInfoModule[]; data?: UserInfoModule[]; role?: string; user?: { role?: string } };
        modules?: UserInfoModule[];
        role?: string;
        user?: { role?: string };
        error?: boolean;
        message?: string;
      }) => {
        const modules = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
            ? response.data
            : response.data?.modules && Array.isArray(response.data.modules)
              ? response.data.modules
              : response.data?.data && Array.isArray(response.data.data)
                ? response.data.data
                : response.modules && Array.isArray(response.modules)
                  ? response.modules
                  : [];

        const role =
          response?.role ??
          response?.data?.role ??
          response?.user?.role ??
          response?.data?.user?.role ??
          null;

        return { modules, role };
      },
    }),
  }),
});

export const { useGetUserInfoQuery } = userInfoApi;
