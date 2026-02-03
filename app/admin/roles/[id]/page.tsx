'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  useGetModulesQuery,
  useGetRoleQuery,
  type ModulePermission,
  type RolePermissionValue,
} from '@/lib/redux/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { ArrowLeft, Edit, Loader2, Check, X } from 'lucide-react';

export default function RoleViewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roleId = Number(params.id);
  const userRole = user?.user_metadata?.role;

  // Check if user is super_admin
  useEffect(() => {
    if (userRole !== 'super_admin') {
      toast.error('Unauthorized. Only super admins can access this page.');
      router.push('/admin/dashboard');
    }
  }, [userRole, router]);

  const { data: role, isLoading, error } = useGetRoleQuery(roleId);
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    error: modulesError,
  } = useGetModulesQuery();

  if (userRole !== 'super_admin') {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized</CardTitle>
            <CardDescription>Only super admins can access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/admin/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || isModulesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || modulesError || !role) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load role details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/admin/roles')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getModuleKey = (module: { key?: string; id?: string | number; name?: string }) =>
    module.key ?? module.id?.toString() ?? module.name ?? '';

  const normalizeModulePermissions = (
    permissions: Array<ModulePermission | number> | undefined
  ): ModulePermission[] =>
    (permissions ?? []).map((permission) =>
      typeof permission === 'number'
        ? { id: permission, action: `permission_${permission}` }
        : permission
    );

  const getRolePermissionState = (
    rolePermissions: RolePermissionValue[] | undefined
  ) => {
    const permissionIds = new Set<number>();

    (rolePermissions ?? []).forEach((perm) => {
      if (typeof perm === 'number') {
        permissionIds.add(perm);
        return;
      }
      if (typeof perm.id === 'number') {
        permissionIds.add(perm.id);
      }
      if (typeof perm.permission_id === 'number') {
        permissionIds.add(perm.permission_id);
      }
    });

    return { permissionIds };
  };

  const { permissionIds } = getRolePermissionState(
    role.permissions
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/roles')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roles
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Role: {role.name}</h1>
            <p className="text-muted-foreground mt-1">
              View role details and permissions
            </p>
          </div>
          <Button onClick={() => router.push(`/admin/roles/${roleId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Role
          </Button>
        </div>
      </div>

      <div className="grid gap-6">

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Module Permissions</CardTitle>
            <CardDescription>
              CRUD permissions for each module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {modules.map((module) => {
                const moduleKey = getModuleKey(module);
                const moduleLabel = module.label ?? module.name ?? moduleKey;
                const modulePermissions = normalizeModulePermissions(
                  module.permissions
                );

                return (
                  <div key={moduleKey} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">{moduleLabel}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {modulePermissions.map((perm: ModulePermission) => {
                        const hasPermission =
                          permissionIds.has(perm.id);

                        return (
                          <div
                            key={perm.id}
                            className="flex items-center space-x-2"
                          >
                            {hasPermission ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-gray-400" />
                            )}
                            <span className={`text-sm ${hasPermission ? 'font-medium' : 'text-muted-foreground'}`}>
                              {perm.label ?? perm.action ?? `Permission ${perm.id}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
