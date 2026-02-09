import type { UserInfoModule } from "@/types";

export const buildPermissionSet = (modules?: UserInfoModule[]) => {
  const permissions = modules?.flatMap((module) => module.permissions ?? []) ?? [];
  return new Set(permissions.map((permission) => permission.toLowerCase()));
};

export const getModulePermission = (action: string, moduleSlug: string) =>
  `${action}_${moduleSlug}`.toLowerCase();

export const hasPermission = (permission: string, permissionSet?: Set<string>) =>
  Boolean(
    permissionSet?.has("*") ||
      permissionSet?.has(permission.toLowerCase())
  );

export const hasAnyPermission = (
  permissions: string[],
  permissionSet?: Set<string>
) => permissions.some((permission) => hasPermission(permission, permissionSet));

export const hasAllPermissions = (
  permissions: string[],
  permissionSet?: Set<string>
) => permissions.every((permission) => hasPermission(permission, permissionSet));

export const canViewModule = (moduleSlug: string, permissionSet?: Set<string>) =>
  hasAnyPermission(
    [
      getModulePermission("create", moduleSlug),
      getModulePermission("edit", moduleSlug),
      getModulePermission("delete", moduleSlug),
    ],
    permissionSet
  );
