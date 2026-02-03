'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import {
  useGetModulesQuery,
  useGetRoleQuery,
  useUpdateRoleMutation,
  type ModulePermission,
  type RolePermissionValue,
} from '@/lib/redux/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function EditRolePage() {
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
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    error: modulesError,
  } = useGetModulesQuery();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<number, boolean>>({});
  const [initializedRoleId, setInitializedRoleId] = useState<number | null>(null);

  const normalizeModulePermissions = useCallback((
    permissions: Array<ModulePermission | number> | undefined
  ): ModulePermission[] =>
    (permissions ?? []).map((permission) =>
      typeof permission === 'number'
        ? { id: permission, action: `permission_${permission}` }
        : permission
    ), []);

  const getModuleKey = useCallback((module: { key?: string; id?: string | number; name?: string }) =>
    module.key ?? module.id?.toString() ?? module.name ?? '', []);

  // Memoize the initial permissions based on role and modules
  const initialPermissions = useMemo(() => {
    if (!role || modules.length === 0) return {};

    const permissionIds = new Set<number>();

    (role.permissions ?? []).forEach((perm) => {
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

    const nextSelected: Record<number, boolean> = {};
    modules.forEach((module) => {
      normalizeModulePermissions(module.permissions).forEach((permission) => {
        nextSelected[permission.id] = permissionIds.has(permission.id);
      });
    });

    return nextSelected;
  }, [role?.permissions, modules, normalizeModulePermissions]);

  // Initialize form when role/modules data is loaded
  useEffect(() => {
    if (role && modules.length > 0 && initializedRoleId !== role.id) {
      setSelectedPermissions(initialPermissions);
      setName(role.name);
      setDescription(role.description || '');
      setInitializedRoleId(role.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, modules.length, initializedRoleId]);

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [permissionId]: checked,
    }));
  };

  const handleSave = async () => {
    try {
      const permissionsArray = modules.flatMap((module) =>
        normalizeModulePermissions(module.permissions)
          .filter((permission) => selectedPermissions[permission.id])
          .map((permission) => permission.id)
      );

      await updateRole({
        id: roleId,
        data: {
          name,
          permission_ids: permissionsArray,
        },
      }).unwrap();

      toast.success('Role permissions updated successfully');
      router.push(`/admin/roles/${roleId}`);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error(error?.data?.message || 'Failed to update role permissions');
    }
  };

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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/roles/${roleId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role View
        </Button>
        <h1 className="text-3xl font-bold">Edit Role: {role.name}</h1>
        <p className="text-muted-foreground mt-1">
          Manage permissions for this role
        </p>
      </div>

      <div className="grid gap-6">
        {/* Role Information */}
        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Basic information about this role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Module Permissions</CardTitle>
            <CardDescription>
              Configure CRUD permissions for each module
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
                      {modulePermissions.map((perm: ModulePermission) => (
                        <div
                          key={perm.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${moduleKey}-${perm.id}`}
                            checked={!!selectedPermissions[perm.id]}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                perm.id,
                                checked === true
                              )
                            }
                          />
                          <Label
                            htmlFor={`${moduleKey}-${perm.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {perm.label ?? perm.action ?? `Permission ${perm.id}`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/roles/${roleId}`)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
