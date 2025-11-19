'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon } from 'lucide-react';
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
  useGetDigitalProductsQuery,
  useGetSuppliersQuery,
  useDeleteDigitalProductMutation,
  type DigitalProduct,
  type DigitalProductStatus,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { createDigitalProductColumns } from './components';

export default function DigitalProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<DigitalProductStatus | 'all'>('all');
  const [nameSearch, setNameSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const perPage = 10;

  const { data, isLoading } = useGetDigitalProductsQuery({
    page,
    per_page: perPage,
    status: statusFilter === 'all' ? undefined : statusFilter,
    name: nameSearch || undefined,
    brand: brandSearch || undefined,
    supplier_id: supplierFilter === 'all' ? undefined : parseInt(supplierFilter),
  });

  const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
  const [deleteDigitalProduct, { isLoading: isDeleting }] = useDeleteDigitalProductMutation();

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteDigitalProduct(selectedProduct.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete digital product:', error);
    }
  };

  const openEditPage = (product: DigitalProduct) => {
    router.push(`/admin/digital-stock/edit/${product.id}`);
  };

  const openDeleteDialog = (product: DigitalProduct) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const columns = createDigitalProductColumns({
    onEdit: openEditPage,
    onDelete: openDeleteDialog,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Digital Stock</h1>
          <p className="text-muted-foreground mt-1">Manage digital stock from external suppliers</p>
        </div>
        <Button onClick={() => router.push('/admin/digital-stock/create')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Digital Stock
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as DigitalProductStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={supplierFilter}
            onValueChange={setSupplierFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliersData?.data.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by brand..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Digital Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}

