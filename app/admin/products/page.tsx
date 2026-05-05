'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { File, PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RegionSelect } from '@/components/custom/RegionSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useGetBrandsQuery,
  useImportProductsCsvMutation,
  useUpdateDigitalProductMutation,
  type DigitalProduct,
  type Product,
  type ProductStatus,
} from '@/lib/redux/features';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { createProductColumns } from './components';
import { toast } from 'react-toastify';
import { getModulePermission, hasPermission } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { selectUserRole } from '@/lib/redux/features';
import { useAppSelector } from '@/lib/redux/hooks';
import { UploadCsvDialogue } from './components/uploadCsvDialogue';

export default function ProductsPage() {
  const router = useRouter();
  const { permissionSet } = usePermissions();
  const role = useAppSelector(selectUserRole) ?? "user";
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [nameSearch, setNameSearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Debounced search states for API queries
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');
  const [debouncedRegionSearch, setDebouncedRegionSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRegionSearch(regionSearch);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [regionSearch]);
  const perPage = 10;

  // Fetch brands for the filter dropdown
  const { data: brandsData } = useGetBrandsQuery({ per_page: 100 });

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameSearch(nameSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [nameSearch]);

  // Reset to first page when brand filter changes
  useEffect(() => {
    setPage(1);
  }, [brandFilter]);


  const { data: productsData, refetch: refetchProducts, isLoading } = useGetProductsQuery({
    page,
    per_page: perPage,
    status: statusFilter === 'all' ? undefined : statusFilter,
    region: debouncedRegionSearch || undefined,
    name: debouncedNameSearch || undefined,
    brand_id: brandFilter === 'all' ? undefined : parseInt(brandFilter),
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [importProductsCsv, { isLoading: isImportingCsv }] = useImportProductsCsvMutation();
  const [updateDigitalProduct] = useUpdateDigitalProductMutation();
  const [savingDiscountId, setSavingDiscountId] = useState<number | null>(null);

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id).unwrap();
      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateDiscount = async (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => {
    const discount = parseFloat(value);
    if (
      value.trim() === '' ||
      Number.isNaN(discount) ||
      discount > 100
    ) {
      throw new Error('invalid_discount');
    }
    setSavingDiscountId(digitalProduct.id);
    try {
      await updateDigitalProduct({
        id: digitalProduct.id,
        data: { selling_discount: discount },
        productId,
      }).unwrap();
      await refetchProducts();
      toast.success('Discount updated successfully');
    } catch (e) {
      toast.error((e as any)?.data?.message || 'Failed to update discount');
    } finally {
      setSavingDiscountId(null);
    }
  };

  const handleUpdateSellingPrice = async (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => {
    const price = parseFloat(value);
    if (value.trim() === '' || Number.isNaN(price) || price <= 0) {
      toast.error('Price must be greater than 0');
      throw new Error('invalid_price');
    }
    setSavingDiscountId(digitalProduct.id);
    try {
      await updateDigitalProduct({
        id: digitalProduct.id,
        data: { selling_price: price },
        productId,
      }).unwrap();
      await refetchProducts();
      toast.success('Selling price updated successfully');
    } catch (e) {
      if ((e as Error)?.message !== 'invalid_price') {
        toast.error('Failed to update selling price');
      }
      throw e;
    } finally {
      setSavingDiscountId(null);
    }
  };

  const openEditPage = (product: Product) => {
    router.push(`/admin/products/edit/${product.id}`);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCsvImport = async (formData: FormData) => {
    try {
      await importProductsCsv(formData).unwrap();
      toast.success('CSV uploaded successfully');
      setIsUploadDialogOpen(false);
      refetchProducts();
    } catch {
      toast.error('Failed to upload CSV file');
    }
  };

  const isSuperAdmin = role === "super_admin";
  const canView =
    isSuperAdmin ||
    hasPermission(getModulePermission("create", "product"), permissionSet) ||
    hasPermission(getModulePermission("edit", "product"), permissionSet) ||
    hasPermission(getModulePermission("delete", "product"), permissionSet);
  const canCreate = isSuperAdmin || hasPermission(getModulePermission("create", "product"), permissionSet);
  const canEdit = isSuperAdmin || hasPermission(getModulePermission("edit", "product"), permissionSet);
  const canDelete = isSuperAdmin || hasPermission(getModulePermission("delete", "product"), permissionSet);

  const columns = createProductColumns({
    onEdit: openEditPage,
    onDelete: openDeleteDialog,
    canView,
    canEdit,
    canDelete,
    onUpdateDiscount: handleUpdateDiscount,
    onUpdateSellingPrice: handleUpdateSellingPrice,
    savingDiscountId,
  });
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button type="button" onClick={handleUploadClick}>
              <File className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => router.push('/admin/products/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
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
        <div className="w-64">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brandsData?.data?.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <RegionSelect
            value={regionSearch}
            onChange={setRegionSearch}
            placeholder="Filter by region"
            allowMultiple={false}
          />
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
        data={productsData?.data || []}
        loading={isLoading}
        serverSide
        pagination={{
          page: productsData?.pagination.current_page || 1,
          limit: perPage,
          total: productsData?.pagination.total || 0,
          totalPages: productsData?.pagination.last_page || 1,
        }}
        onPageChange={setPage}
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
      <UploadCsvDialogue
        isOpen={isUploadDialogOpen}
        isSubmitting={isImportingCsv}
        onClose={() => setIsUploadDialogOpen(false)}
        onSubmit={handleCsvImport}
      />
    </div>
  );
}
