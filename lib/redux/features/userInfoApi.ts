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
                                                      
      transformResponse: (response:
        | UserInfoModule[]
        | {
            data?: UserInfoModule[] | {
              modules?: UserInfoModule[];
              data?: UserInfoModule[];
              role?: string;
              user?: { role?: string };
            };
            modules?: UserInfoModule[];
            role?: string;
            user?: { role?: string };
            error?: boolean;
            message?: string;
          }) => {
        const responseObject = Array.isArray(response) ? null : response;

        const modules = Array.isArray(response)
          ? response
          : Array.isArray(responseObject?.data)
            ? responseObject?.data
            : responseObject?.data?.modules && Array.isArray(responseObject.data.modules)
              ? responseObject.data.modules
              : responseObject?.data?.data && Array.isArray(responseObject.data.data)
                ? responseObject.data.data
                : responseObject?.modules && Array.isArray(responseObject.modules)
                  ? responseObject.modules
                  : [];

        let role: string | null = null;

        if (responseObject) {
          const dataObject =
            responseObject.data && !Array.isArray(responseObject.data)
              ? responseObject.data
              : null;

          role =
            responseObject.role ??
            dataObject?.role ??
            responseObject.user?.role ??
            dataObject?.user?.role ??
            null;
        }


        return { modules, role };
      },
    }),
  }),
});

export const { useGetUserInfoQuery } = userInfoApi;
