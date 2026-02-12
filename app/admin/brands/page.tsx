'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGetBrandsQuery,
  useDeleteBrandMutation,
  type Brand,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { BrandDialog, createBrandColumns } from './components';
import { toast } from 'react-toastify';
import { usePermissions } from '@/hooks/usePermissions';
import { getModulePermission, hasPermission } from '@/lib/permissions';

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const perPage = 10;
  const { permissionSet } = usePermissions();
  const canCreate = hasPermission(getModulePermission('create', 'brand'), permissionSet);
  const canEdit = hasPermission(getModulePermission('edit', 'brand'), permissionSet);
  const canDelete = hasPermission(getModulePermission('delete', 'brand'), permissionSet);

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

  const { data, isLoading } = useGetBrandsQuery({
    page,
    per_page: perPage,
    name: debouncedNameSearch || undefined,
  });
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const handleDelete = async () => {
    if (!selectedBrand) return;

    try {
      await deleteBrand(selectedBrand.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedBrand(null);
      toast.success("Brand deleted successfully");
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast.error("Failed to delete brand");
    }
  };

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsBrandDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedBrand(null);
    setIsBrandDialogOpen(true);
  };

  const openDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsBrandDialogOpen(false);
    setSelectedBrand(null);
  };

  const handleDialogSuccess = () => {
    // Dialog will close automatically, and the list will refresh via cache invalidation
    handleDialogClose();
  };

  const columns = createBrandColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    canEdit,
    canDelete,
  });

  console.log(data);
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">Manage your brand inventory</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button onClick={openCreateDialog}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          )}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
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

      {/* Brand Create/Edit Dialog */}
      <BrandDialog
        isOpen={isBrandDialogOpen}
        onClose={handleDialogClose}
        brand={selectedBrand}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Brand"
        description={`Are you sure you want to delete "${selectedBrand?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}

