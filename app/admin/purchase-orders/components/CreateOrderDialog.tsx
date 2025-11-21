'use client';

import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from 'lucide-react';
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
  useCreateDigitalProductsMutation,
  useCreateSupplierMutation,
  useGetDigitalProductsListQuery,
  BulkCreateDigitalProductsData,
  CreateDigitalProductData,
  UpdateDigitalProductData,
  CreateSupplierData,
  DigitalProduct,
} from '@/lib/redux/features';
import { usePurchaseOrderForm } from './usePurchaseOrderForm';
import { formatCurrency } from './orderColumns';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';
import { DigitalProductFormDialog } from '@/app/admin/digital-stock/components/DigitalProductFormDialog';
import { SelectDigitalProductsDialog } from './SelectDigitalProductsDialog';

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
  const { formData, errors, validateForm, resetForm, updateFormData, addItem, updateItem, removeItem } = usePurchaseOrderForm();

  // Mutations for creating new items
  const [createDigitalProduct, { isLoading: isCreatingProduct }] = useCreateDigitalProductsMutation();
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  // Dialog states for adding new items
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isSelectProductsDialogOpen, setIsSelectProductsDialogOpen] = useState(false);

  // Fetch digital products for selected supplier (for the add product dialog)
  const { data: digitalProductsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetDigitalProductsListQuery(
    {
      supplier_id: formData.supplier_id > 0 ? formData.supplier_id : undefined,
      per_page: 100,
      status: 'active',
    },
    {
      skip: formData.supplier_id === 0, // Skip query when no supplier is selected
    }
  );

  const products = digitalProductsData?.data || [];

  // Get product details for display
  const getProductDetails = (productId: number): DigitalProduct | undefined => {
    return products.find(p => p.id === productId);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsAddProductDialogOpen(false);
      setIsAddSupplierDialogOpen(false);
      setIsSelectProductsDialogOpen(false);
    }
  }, [isOpen, resetForm]);

  const handleSupplierChange = (supplierId: string) => {
    const id = parseInt(supplierId);
    updateFormData({
      supplier_id: id,
      items: [], // Clear items when supplier changes
    });
  };

  const handleProductsSelected = (items: Array<{ digital_product_id: number; quantity: number }>) => {
    // Add new items, avoiding duplicates
    items.forEach((item) => {
      const existingIndex = formData.items.findIndex(
        (i) => i.digital_product_id === item.digital_product_id
      );
      if (existingIndex >= 0) {
        // Update quantity if product already exists
        updateItem(existingIndex, { quantity: item.quantity });
      } else {
        // Add new item
        addItem(item);
      }
    });
    setIsSelectProductsDialogOpen(false);
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

  const handleCreateProduct = async (
    data: BulkCreateDigitalProductsData | CreateDigitalProductData | UpdateDigitalProductData
  ) => {
    try {
      // DigitalProductFormDialog in create mode always sends BulkCreateDigitalProductsData
      const bulkData = data as BulkCreateDigitalProductsData;
      await createDigitalProduct(bulkData).unwrap();
      // Refresh products list so new products appear in SelectDigitalProductsDialog
      await refetchProducts();
      setIsAddProductDialogOpen(false);
    } catch (error) {
      console.error('Failed to create digital product:', error);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                No digital products found for this supplier. Add a new digital product below.
              </p>
            )}
          </div>

          {/* Selected Products List */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Digital Stock *</Label>
              {formData.supplier_id > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectProductsDialogOpen(true)}
                  disabled={isLoadingProducts}
                  className="gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Select Products
                </Button>
              )}
            </div>
            {errors.items && <p className="text-sm text-red-500">{errors.items}</p>}

            {formData.items.length === 0 ? (
              <div className="p-4 border border-dashed rounded-md text-center">
                <p className="text-sm text-muted-foreground">
                  {formData.supplier_id === 0
                    ? 'Please select a supplier first'
                    : 'No products selected. Click "Add Products" to select digital products.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 border rounded-md p-4">
                {formData.items.map((item, index) => {
                  const product = getProductDetails(item.digital_product_id);
                  const itemError = errors[`items.${index}.quantity`] || errors[`items.${index}.digital_product_id`];
                  return (
                    <div key={`${item.digital_product_id}-${index}`} className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <div className="flex-1 min-w-0">
                          {product ? (
                            <>
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {product.sku}
                                </code>
                                {product.brand && (
                                  <span className="text-xs text-muted-foreground">{product.brand}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Cost: {formatCurrency(product.cost_price)} per unit
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Product ID: {item.digital_product_id}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${index}`} className="text-xs whitespace-nowrap">
                              Quantity:
                            </Label>
                            <Input
                              id={`qty-${index}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-20 h-8 text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {itemError && <p className="text-xs text-red-500 px-3">{itemError}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total Amount */}
          {formData.items.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                {formData.items.map((item, index) => {
                  const product = getProductDetails(item.digital_product_id);
                  if (!product) return null;
                  const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                  const subtotal = (costPrice || 0) * item.quantity;
                  return (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(
                      formData.items.reduce((total, item) => {
                        const product = getProductDetails(item.digital_product_id);
                        if (!product) return total;
                        const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                        return total + ((costPrice || 0) * item.quantity);
                      }, 0)
                    )}
                  </span>
                </div>
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

      {/* Select Digital Products Dialog */}
      <SelectDigitalProductsDialog
        isOpen={isSelectProductsDialogOpen}
        supplierId={formData.supplier_id}
        isSubmitting={false}
        onClose={() => setIsSelectProductsDialogOpen(false)}
        onSubmit={handleProductsSelected}
        onAddNewProduct={() => {
          setIsSelectProductsDialogOpen(false);
          setIsAddProductDialogOpen(true);
        }}
      />

      {/* Add New Digital Product Dialog */}
      <DigitalProductFormDialog
        isOpen={isAddProductDialogOpen}
        isEditMode={false}
        selectedProduct={null}
        suppliers={suppliers}
        isSubmitting={isCreatingProduct}
        onClose={() => setIsAddProductDialogOpen(false)}
        onSubmit={handleCreateProduct}
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

