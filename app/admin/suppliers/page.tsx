'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  type Supplier,
  type CreateSupplierData,
} from '@/lib/redux/features';
import { ColumnDef } from '@tanstack/react-table';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useGetSuppliersQuery({ page, per_page: perPage });
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateSupplierData>({
    name: '',
    slug: '',
    type: 'internal',
    contact_email: '',
    contact_phone: '',
    status: 'active',
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase with underscores only';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createSupplier(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedSupplier || !validateForm()) return;

    try {
      await updateSupplier({
        id: selectedSupplier.id,
        data: formData,
      }).unwrap();
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;

    try {
      await deleteSupplier(selectedSupplier.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      slug: supplier.slug,
      type: supplier.type,
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      status: supplier.status,
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'internal',
      contact_email: '',
      contact_phone: '',
      status: 'active',
    });
    setErrors({});
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.slug}</code>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="filled" color={row.original.type === 'internal' ? 'info' : 'default'}>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'contact_email',
      header: 'Email',
      cell: ({ row }) => row.original.contact_email || '-',
    },
    {
      accessorKey: 'contact_phone',
      header: 'Phone',
      cell: ({ row }) => row.original.contact_phone || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="filled" color={row.original.status === 'active' ? 'success' : 'default'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.type === 'internal' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(row.original)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
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
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your suppliers and vendors</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        serverSide
        pagination={{
          page: data?.pagination.current_page || 1,
          limit: perPage,
          total: data?.pagination.total || 0,
          totalPages: data?.pagination.last_page || 1,
        }}
        onPageChange={setPage}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
          setSelectedSupplier(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update supplier information' : 'Add a new supplier to your system'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Supplier Name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                placeholder="supplier_name"
              />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only</p>
            </div>

            {/* <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'internal' | 'external') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="grid gap-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="supplier@example.com"
              />
              {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedSupplier(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleEdit : handleCreate}
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) ? 'Saving...' : isEditDialogOpen ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${selectedSupplier?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}

