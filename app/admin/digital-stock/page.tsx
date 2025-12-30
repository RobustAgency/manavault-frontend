'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, PlusIcon } from 'lucide-react';
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
  useCreatePurchaseOrderMutation,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { createDigitalProductColumns } from './components';
import { UploadCsvDialogue } from './components/uploadCsvDialogue';
import CustomSelect from '@/components/custom/CustomSelect';
import { DigitalProductStock } from '@/lib/redux/features/digitalProductsApi';

export default function DigitalProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [currencyFilter, setCurrencyFilter] = useState<DigitalProductStatus | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<DigitalProductStock | 'all'>('all');
  const [nameSearch, setNameSearch] = useState(''); 
  const [brandSearch, setBrandSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();
  const  stock  = useSearchParams();



  // Debounced search states for API queries
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState('');
  const perPage = 10;

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameSearch(nameSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [nameSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBrandSearch(brandSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [brandSearch]);

  const { data, isLoading } = useGetDigitalProductsQuery({
    page,
    per_page: perPage,
    currency: currencyFilter === 'all' ? undefined : currencyFilter,
    stock: stockFilter === 'all' ? undefined : stockFilter,
    name: debouncedNameSearch || undefined,
    brand: debouncedBrandSearch || undefined,
    supplier_id: supplierFilter === 'all' ? undefined : parseInt(supplierFilter),
  });

  const { data: suppliersData, refetch: refetchSuppliers } = useGetSuppliersQuery({ per_page: 100 });
  const [deleteDigitalProduct, { isLoading: isDeleting }] = useDeleteDigitalProductMutation();

  const handleCreate = async (data: any) => {
    try {
      await createPurchaseOrder(data).unwrap();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    }
  };

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

  const handleUploadClick = () => {
    setIsCreateDialogOpen(true);
  }

  useEffect(() => {
    const stockParam = stock.get('stock');
    if (stockParam) {
      setStockFilter(stockParam as DigitalProductStock);
    }
  }, [stock]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex  md:flex-row flex-col justify-between md:items-center items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Digital Stock</h1>
          <p className="text-muted-foreground mt-1">Manage digital stock from external suppliers</p>
        </div>
        <div className='flex md:flex-row flex-col justify-between gap-2'>

          <label htmlFor="file">
            <Button type="button" onClick={handleUploadClick}>
              <File className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </label>

          <Button onClick={() => router.push('/admin/digital-stock/create')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Digital Stock
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="sm:w-35 w-full">
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
        <div className='sm:w-35 w-full'>
          <CustomSelect
            value={currencyFilter}
            placeholder="Filter by status"
            options={[
              { value: 'all', label: 'All Currency' },
              { value: 'usd', label: 'USD' },
              { value: 'eur', label: 'EUR' },
            ]}
            onChange={(value) => setCurrencyFilter(value as DigitalProductStatus | 'all')}
          />
        </div>
         <div className='sm:w-35 w-full'>
          <CustomSelect
            value={stockFilter}
            placeholder="Filter by stock"
            options={[
              { value: 'all', label: 'All Stock' },
              { value: 'high', label: 'High Stock' },
              { value: 'low', label: 'Low Stock' },
            ]}
            onChange={(value) => setStockFilter(value as DigitalProductStock | 'all')}
          />
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
      <UploadCsvDialogue
        isOpen={isCreateDialogOpen}
        suppliers={suppliersData?.data || []}
        isSubmitting={isCreating}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        onSuppliersRefetch={refetchSuppliers}
      />
    </div>
  );
}

