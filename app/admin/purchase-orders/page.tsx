'use client';

import { useState } from 'react';
import { PlusIcon, EyeIcon } from 'lucide-react';
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
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useGetProductsQuery,
  useGetSuppliersQuery,
  type PurchaseOrder,
  type CreatePurchaseOrderData,
} from '@/lib/redux/features';
import { ColumnDef } from '@tanstack/react-table';

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useGetPurchaseOrdersQuery({ page, per_page: perPage });
  const { data: productsData } = useGetProductsQuery({ per_page: 100, status: 'active' });
  const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch selected order details
  const { data: selectedOrder } = useGetPurchaseOrderQuery(selectedOrderId!, {
    skip: !selectedOrderId,
  });

  // Form states
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    product_id: 0,
    supplier_id: 0,
    purchase_price: 0,
    quantity: 1,
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected product to auto-fill data
  const selectedProduct = productsData?.data.find(p => p.id === formData.product_id);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id || formData.product_id === 0) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.supplier_id || formData.supplier_id === 0) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (formData.purchase_price <= 0) {
      newErrors.purchase_price = 'Purchase price must be greater than 0';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await createPurchaseOrder(formData).unwrap();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openViewDialog = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      product_id: 0,
      supplier_id: 0,
      purchase_price: 0,
      quantity: 1,
    });
    setErrors({});
  };

  // Auto-fill supplier and price when product is selected
  const handleProductChange = (productId: string) => {
    const product = productsData?.data.find(p => p.id === parseInt(productId));
    if (product) {
      setFormData({
        ...formData,
        product_id: product.id,
        supplier_id: product.supplier_id,
        purchase_price: product.purchase_price,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'order_number',
      header: 'Order Number',
      cell: ({ row }) => (
        <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
          {row.original.order_number}
        </code>
      ),
    },
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name || '-'}</div>
          {row.original.product?.sku && (
            <code className="text-xs text-muted-foreground">{row.original.product.sku}</code>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier?.name || '-',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <Badge variant="filled" color="info">{row.original.quantity} units</Badge>
      ),
    },
    {
      accessorKey: 'purchase_price',
      header: 'Unit Price',
      cell: ({ row }) => formatCurrency(row.original.purchase_price),
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span className="font-semibold">{formatCurrency(row.original.total_amount)}</span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openViewDialog(row.original.id)}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage your purchase orders and inventory</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Purchase Order
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for products
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product_id">Product *</Label>
              <Select 
                value={formData.product_id.toString()} 
                onValueChange={handleProductChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {productsData?.data.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product_id && <p className="text-sm text-red-500">{errors.product_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select 
                value={formData.supplier_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, supplier_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData?.data.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Product supplier: {selectedProduct.supplier?.name}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purchase_price">Purchase Price (per unit) *</Label>
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
              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Product purchase price: {formatCurrency(selectedProduct.purchase_price)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            </div>

            {formData.purchase_price > 0 && formData.quantity > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(formData.purchase_price * formData.quantity)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsViewDialogOpen(false);
          setSelectedOrderId(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              View detailed information about this purchase order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Order Number</Label>
                  <p className="font-semibold mt-1">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date Created</Label>
                  <p className="font-semibold mt-1">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">Product</Label>
                <p className="font-semibold mt-1">{selectedOrder.product?.name}</p>
                {selectedOrder.product?.sku && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    {selectedOrder.product.sku}
                  </code>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Supplier</Label>
                <p className="font-semibold mt-1">{selectedOrder.supplier?.name}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="font-semibold mt-1">{selectedOrder.quantity} units</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Unit Price</Label>
                  <p className="font-semibold mt-1">{formatCurrency(selectedOrder.purchase_price)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Amount</Label>
                  <p className="font-semibold text-xl text-primary mt-1">
                    {formatCurrency(selectedOrder.total_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedOrderId(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

