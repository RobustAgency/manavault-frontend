'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  type Supplier,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { SupplierFormDialog, createSupplierColumns } from './components';

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

  const handleCreate = async (data: any) => {
    try {
      await createSupplier(data).unwrap();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedSupplier) return;

    try {
      await updateSupplier({
        id: selectedSupplier.id,
        data,
      }).unwrap();
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
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

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  const columns = createSupplierColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your suppliers and vendors</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
      <SupplierFormDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        isEditMode={isEditDialogOpen}
        selectedSupplier={selectedSupplier}
        isSubmitting={isCreating || isUpdating}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={isEditDialogOpen ? handleEdit : handleCreate}
      />

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
