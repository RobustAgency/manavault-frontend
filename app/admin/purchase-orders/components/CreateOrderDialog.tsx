'use client';

import { useEffect } from 'react';
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
import { Product, Supplier, CreatePurchaseOrderData } from '@/lib/redux/features';
import { usePurchaseOrderForm } from './usePurchaseOrderForm';
import { formatCurrency } from './orderColumns';

interface CreateOrderDialogProps {
  isOpen: boolean;
  products: Product[];
  suppliers: Supplier[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePurchaseOrderData) => void;
}

export const CreateOrderDialog = ({
  isOpen,
  products,
  suppliers,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateOrderDialogProps) => {
  const { formData, errors, validateForm, resetForm, updateFormData } = usePurchaseOrderForm();

  // Get selected product to auto-fill data
  const selectedProduct = products.find(p => p.id === formData.product_id);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      updateFormData({
        product_id: product.id,
        supplier_id: product.supplier_id,
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
            <Label htmlFor="product_id">Product *</Label>
            <Select 
              value={formData.product_id.toString()} 
              onValueChange={handleProductChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
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
              onValueChange={(value) => updateFormData({ supplier_id: parseInt(value) })}
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
    </Dialog>
  );
};

