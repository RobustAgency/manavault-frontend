'use client';

import { useState } from 'react';
import { PlusIcon, ExternalLinkIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetProductsQuery,
  useGetSuppliersQuery,
  useGetThirdPartyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type Product,
  type ProductStatus,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { ProductFormDialog, createProductColumns } from './components';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [nameSearch, setNameSearch] = useState('');
  const perPage = 10;

  const { data, isLoading } = useGetProductsQuery({
    page,
    per_page: perPage,
    status: statusFilter === 'all' ? undefined : statusFilter,
    name: nameSearch || undefined,
  });
  const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Third-party product selection
  const [selectedSupplierSlug, setSelectedSupplierSlug] = useState<string | null>(null);
  const [isExternalSupplier, setIsExternalSupplier] = useState(false);

  // Fetch third-party products when external supplier is selected
  const { data: thirdPartyProducts, isLoading: isLoadingThirdParty } = useGetThirdPartyProductsQuery(
    { slug: selectedSupplierSlug!, limit: 100, offset: 0 },
    { skip: !selectedSupplierSlug || !isExternalSupplier }
  );

  const handleCreate = async (data: any) => {
    try {
      await createProduct(data).unwrap();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedProduct) return;

    try {
      // Don't send SKU on update (it can't be updated)
      const { sku, supplier_id, ...updateData } = data;
      await updateProduct({
        id: selectedProduct.id,
        data: updateData,
      }).unwrap();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSupplierChange = (supplierId: number, isExternal: boolean, slug: string | null) => {
    setIsExternalSupplier(isExternal);
    setSelectedSupplierSlug(slug);
  };

  const columns = createProductColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/admin/products/third-party'}>
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            Third-Party Products
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="w-64">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_active">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          page: data?.pagination.current_page || 1,
          limit: perPage,
          total: data?.pagination.total || 0,
          totalPages: data?.pagination.last_page || 1,
        }}
        onPageChange={setPage}
      />

      {/* Create/Edit Dialog */}
      <ProductFormDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        isEditMode={isEditDialogOpen}
        selectedProduct={selectedProduct}
        suppliers={suppliersData?.data || []}
        thirdPartyProducts={thirdPartyProducts}
        isLoadingThirdParty={isLoadingThirdParty}
        isSubmitting={isCreating || isUpdating}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedProduct(null);
          setSelectedSupplierSlug(null);
          setIsExternalSupplier(false);
        }}
        onSubmit={isEditDialogOpen ? handleEdit : handleCreate}
        onSupplierChange={handleSupplierChange}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}
