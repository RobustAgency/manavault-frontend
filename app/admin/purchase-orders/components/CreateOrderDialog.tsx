'use client';

import { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Supplier,
  CreatePurchaseOrderData,
  useCreateProductMutation,
  useCreateSupplierMutation,
  useGetProductsQuery,
  CreateProductData,
  CreateSupplierData,
} from '@/lib/redux/features';
import { usePurchaseOrderForm } from './usePurchaseOrderForm';
import { formatCurrency } from './orderColumns';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';
import { ProductFormDialog } from '@/app/admin/products/components/ProductFormDialog';

interface CreateOrderDialogProps {
  isOpen: boolean;
  suppliers: Supplier[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePurchaseOrderData) => void;
  onSuppliersRefetch?: () => void;
}

export const CreateOrderDialog = ({
  isOpen,
  suppliers,
  isSubmitting,
  onClose,
  onSubmit,
  onSuppliersRefetch,
}: CreateOrderDialogProps) => {
  const { formData, errors, validateForm, resetForm, updateFormData } = usePurchaseOrderForm();

  // Mutations for creating new items
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  // Dialog states for adding new items
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);

  // Fetch products for selected supplier
  const { data: productsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetProductsQuery(
    {
      supplier_id: formData.supplier_id > 0 ? formData.supplier_id : undefined,
      per_page: 100,
      status: 'active',
    },
    {
      skip: formData.supplier_id === 0, // Skip query when no supplier is selected
    }
  );

  const products = productsData?.data || [];
  const selectedProduct = products.find(p => p.id === formData.product_id);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsAddProductDialogOpen(false);
      setIsAddSupplierDialogOpen(false);
    }
  }, [isOpen]);

  const handleSupplierChange = (supplierId: string) => {
    const id = parseInt(supplierId);
    updateFormData({
      supplier_id: id,
      product_id: 0, // Clear product selection when supplier changes
      purchase_price: 0, // Clear purchase price when supplier changes
    });
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      updateFormData({
        product_id: product.id,
        purchase_price: product.purchase_price,
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateProduct = async (data: CreateProductData) => {
    try {
      const newProduct = await createProduct(data).unwrap();
      // Refresh products list
      await refetchProducts();
      // Auto-select the newly created product directly
      if (newProduct) {
        updateFormData({
          supplier_id: newProduct.supplier_id,
          product_id: newProduct.id,
          purchase_price: newProduct.purchase_price,
        });
      }
      setIsAddProductDialogOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      const newSupplier = await createSupplier(data).unwrap();
      // Refresh suppliers list in parent
      onSuppliersRefetch?.();
      // Auto-select the newly created supplier directly
      if (newSupplier) {
        updateFormData({ supplier_id: newSupplier.id });
      }
      setIsAddSupplierDialogOpen(false);
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for products
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <Select
              value={formData.supplier_id > 0 ? formData.supplier_id.toString() : undefined}
              onValueChange={handleSupplierChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
                <div className="border-t pt-1 mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAddSupplierDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Supplier
                  </Button>
                </div>
              </SelectContent>
            </Select>
            {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
            {formData.supplier_id > 0 && !isLoadingProducts && products.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No products found for this supplier. Add a new product below.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product_id">Product *</Label>
            <Select
              value={formData.product_id > 0 ? formData.product_id.toString() : undefined}
              onValueChange={handleProductChange}
              disabled={formData.supplier_id === 0 || isLoadingProducts}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  formData.supplier_id === 0
                    ? "Select a supplier first"
                    : isLoadingProducts
                      ? "Loading products..."
                      : products.length === 0
                        ? "No products available"
                        : "Select a product"
                } />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProducts ? (
                  <SelectItem value="loading" disabled>
                    Loading products...
                  </SelectItem>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {product.sku}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    {formData.supplier_id === 0
                      ? "Please select a supplier first"
                      : "No products available for this supplier"}
                  </SelectItem>
                )}
                {formData.supplier_id > 0 && !isLoadingProducts && (
                  <div className="border-t pt-1 mt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAddProductDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.product_id && <p className="text-sm text-red-500">{errors.product_id}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purchase_price">Purchase Price (per unit) *</Label>
            <Input
              id="purchase_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.purchase_price}
              onChange={(e) => updateFormData({ purchase_price: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) || 1 })}
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Add New Product Dialog */}
      <ProductFormDialog
        isOpen={isAddProductDialogOpen}
        isEditMode={false}
        selectedProduct={null}
        suppliers={suppliers}
        thirdPartyProducts={[]}
        isLoadingThirdParty={false}
        isSubmitting={isCreatingProduct}
        onClose={() => setIsAddProductDialogOpen(false)}
        onSubmit={handleCreateProduct}
        onSupplierChange={(supplierId, isExternal, slug) => {
          // Auto-select the supplier when creating a product from this dialog
          if (supplierId > 0) {
            updateFormData({ supplier_id: supplierId });
          }
        }}
      />

      {/* Add New Supplier Dialog */}
      <SupplierFormDialog
        isOpen={isAddSupplierDialogOpen}
        isEditMode={false}
        selectedSupplier={null}
        isSubmitting={isCreatingSupplier}
        onClose={() => setIsAddSupplierDialogOpen(false)}
        onSubmit={handleCreateSupplier}
      />
    </Dialog>
  );
};

