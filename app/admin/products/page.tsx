'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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
  type CreateProductData,
  type ProductStatus,
  type ThirdPartyProduct,
} from '@/lib/redux/features';
import { ColumnDef } from '@tanstack/react-table';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';

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

  // Form states
  const [formData, setFormData] = useState<CreateProductData>({
    supplier_id: 0,
    name: '',
    description: '',
    sku: '',
    purchase_price: 0,
    selling_price: 0,
    status: 'active',
  });

  // Third-party product selection
  const [selectedSupplierSlug, setSelectedSupplierSlug] = useState<string | null>(null);
  const [selectedThirdPartyProduct, setSelectedThirdPartyProduct] = useState<string>('');
  const [isExternalSupplier, setIsExternalSupplier] = useState(false);

  // Fetch third-party products when external supplier is selected
  const { data: thirdPartyProducts, isLoading: isLoadingThirdParty } = useGetThirdPartyProductsQuery(
    { slug: selectedSupplierSlug!, limit: 100, offset: 0 },
    { skip: !selectedSupplierSlug || !isExternalSupplier }
  );

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id || formData.supplier_id === 0) {
      newErrors.supplier_id = 'Supplier is required';
    }

    // For external suppliers during creation, ensure third-party product is selected
    if (!isEditDialogOpen && isExternalSupplier && !selectedThirdPartyProduct) {
      newErrors.third_party_product = 'Please select a third-party product';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!isEditDialogOpen) { // SKU is only required on create
      if (!formData.sku.trim()) {
        newErrors.sku = 'SKU is required';
      } else if (formData.sku.length > 100) {
        newErrors.sku = 'SKU must be 100 characters or less';
      }
    }

    if (formData.purchase_price < 0) {
      newErrors.purchase_price = 'Purchase price must be 0 or greater';
    }

    if (formData.selling_price < 0) {
      newErrors.selling_price = 'Selling price must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createProduct(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct || !validateForm()) return;

    try {
      // Don't send SKU on update (it can't be updated)
      const { sku, supplier_id, ...updateData } = formData;
      await updateProduct({
        id: selectedProduct.id,
        data: updateData,
      }).unwrap();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
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

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      supplier_id: product.supplier_id,
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      status: product.status,
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      supplier_id: 0,
      name: '',
      description: '',
      sku: '',
      purchase_price: 0,
      selling_price: 0,
      status: 'active',
    });
    setErrors({});
    setSelectedSupplierSlug(null);
    setSelectedThirdPartyProduct('');
    setIsExternalSupplier(false);
  };

  // Handle supplier change
  const handleSupplierChange = (supplierId: string) => {
    const id = parseInt(supplierId);
    const supplier = suppliersData?.data.find(s => s.id === id);

    setFormData({ ...formData, supplier_id: id });

    if (supplier) {
      const isExternal = supplier.type === 'external';
      setIsExternalSupplier(isExternal);
      setSelectedSupplierSlug(isExternal ? supplier.slug : null);

      // Reset third-party product selection when supplier changes
      setSelectedThirdPartyProduct('');

      // Clear form fields that will be auto-filled from third-party
      if (isExternal) {
        setFormData(prev => ({
          ...prev,
          supplier_id: id,
          name: '',
          description: '',
          sku: '',
          purchase_price: 0,
        }));
      }
    } else {
      setIsExternalSupplier(false);
      setSelectedSupplierSlug(null);
      setSelectedThirdPartyProduct('');
    }
  };

  // Handle third-party product selection
  const handleThirdPartyProductSelect = (productId: string) => {
    setSelectedThirdPartyProduct(productId);

    const product = thirdPartyProducts?.find(p => String(p.id) === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        purchase_price: product.price || 0,
        // Keep selling_price and status unchanged for manual entry
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: ProductStatus): 'success' | 'default' | 'warning' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'in_active':
        return 'default';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.sku}</code>,
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier?.name || '-',
    },
    {
      accessorKey: 'purchase_price',
      header: 'Purchase Price',
      cell: ({ row }) => formatCurrency(row.original.purchase_price),
    },
    {
      accessorKey: 'selling_price',
      header: 'Selling Price',
      cell: ({ row }) => formatCurrency(row.original.selling_price),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="filled" color={getStatusColor(row.original.status)}>
          {row.original.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row.original)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/admin/products/third-party'}>
            <ExternalLinkIcon className="h-4 w-4 mr-2" />
            Third-Party Products
          </Button>
          <Button onClick={openCreateDialog}>
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
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
          setSelectedProduct(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Product' : 'Create Product'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update product information' : 'Add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select
                value={formData.supplier_id.toString()}
                onValueChange={handleSupplierChange}
                disabled={isEditDialogOpen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData?.data.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name} {supplier.type === 'external' && '(External)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
            </div>

            {/* Third-Party Product Selection - Only show for external suppliers during creation */}
            {!isEditDialogOpen && isExternalSupplier && (
              <div className="grid gap-2">
                <Label htmlFor="third_party_product">Third-Party Product *</Label>
                <Select
                  value={selectedThirdPartyProduct}
                  onValueChange={handleThirdPartyProductSelect}
                  disabled={isLoadingThirdParty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingThirdParty ? "Loading products..." : "Select a product"} />
                  </SelectTrigger>
                  <SelectContent>
                    {thirdPartyProducts && thirdPartyProducts.length > 0 ? (
                      thirdPartyProducts.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name} {product.sku && `(${product.sku})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No products available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.third_party_product && <p className="text-sm text-red-500">{errors.third_party_product}</p>}
                <p className="text-xs text-muted-foreground">
                  Select a product from the external supplier to auto-fill details
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product Name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              {!isEditDialogOpen && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PROD-001"
                disabled={isEditDialogOpen}
              />
              {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
              {isEditDialogOpen && <p className="text-xs text-muted-foreground">SKU cannot be updated</p>}
              {!isEditDialogOpen && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
              {!isEditDialogOpen && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchase_price">Purchase Price *</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price}</p>}
                {!isEditDialogOpen && isExternalSupplier && selectedThirdPartyProduct && (
                  <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_active">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
                setSelectedProduct(null);
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

