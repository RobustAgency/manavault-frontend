"use client";

import { useMemo } from "react";
import { selectUserRole, useGetUserInfoQuery } from "@/lib/redux/features";
import { buildPermissionSet } from "@/lib/permissions";
import { useAuth } from "@/providers/AuthProvider";
import { useAppSelector } from "@/lib/redux/hooks";

export const usePermissions = () => {
  const { user } = useAuth();
  const role = useAppSelector(selectUserRole);
  const { data, isLoading, isError } = useGetUserInfoQuery(undefined, {
    skip: !user,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const modules = data?.modules ?? [];
  const permissionSet = useMemo(() => {
    if (role === "super_admin") {
      return new Set(["*"]);
    }
    return buildPermissionSet(modules);
  }, [modules, role]);

  return {
    modules,
    permissionSet,
    isLoading,
    isError,
  };
};
