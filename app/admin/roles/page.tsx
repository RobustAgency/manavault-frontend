'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  type Role,
} from '@/lib/redux/features';
import { selectUserRole } from '@/lib/redux/features';
import { useAppSelector } from '@/lib/redux/hooks';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { toast } from 'react-toastify';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, TrashIcon, Plus, PencilIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RolesPage() {
  const router = useRouter();
  const role = useAppSelector(selectUserRole);

  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const perPage = 10;

  console.log(role)

  // Debounced search state for API queries
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameSearch(nameSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [nameSearch]);

  const { data, isLoading } = useGetRolesQuery({
    page,
    per_page: perPage,
    search: debouncedNameSearch || undefined,
  });
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Check if user is super_admin
  useEffect(() => {
    if (role !== 'super_admin') {
      toast.error('Unauthorized. Only super admins can access this page.');
      router.push('/admin/dashboard');
    }
  }, [role, router]);

  if (!role) {
    return null;
  }

  if (role !== 'super_admin') {
    return null;
  }


  const handleDelete = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole(selectedRole.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      toast.success("Role deleted successfully");
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error("Failed to delete role");
    }
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated At',
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/roles/${row.original.id}`)}
            title="View Role"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/roles/${row.original.id}/edit`)}
            title="Edit Role"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
            title="Delete Role"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];


  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage role-based access control and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/roles/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by role name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        serverSide
        pagination={{
          page: data?.pagination?.current_page || 1,
          limit: perPage,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.last_page || 1,
        }}
        onPageChange={setPage}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Role"
        description={`Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}
