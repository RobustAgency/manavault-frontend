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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Product,
  ProductStatus,
  Supplier,
  ThirdPartyProduct,
  CreateProductData,
  useCreateSupplierMutation,
  CreateSupplierData,
} from '@/lib/redux/features';
import { useProductForm } from './useProductForm';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';

interface ProductFormDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  selectedProduct: Product | null;
  suppliers: Supplier[];
  thirdPartyProducts?: ThirdPartyProduct[];
  isLoadingThirdParty: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => void;
  onSupplierChange: (supplierId: number, isExternal: boolean, slug: string | null) => void;
  onSuppliersRefetch?: () => void;
}

export const ProductFormDialog = ({
  isOpen,
  isEditMode,
  selectedProduct,
  suppliers,
  thirdPartyProducts = [],
  isLoadingThirdParty,
  isSubmitting,
  onClose,
  onSubmit,
  onSupplierChange,
  onSuppliersRefetch,
}: ProductFormDialogProps) => {
  const { formData, setFormData, errors, validateForm, resetForm, updateFormData } = useProductForm(isEditMode);

  const [selectedSupplierSlug, setSelectedSupplierSlug] = useState<string | null>(null);
  const [selectedThirdPartyProduct, setSelectedThirdPartyProduct] = useState<string>('');
  const [isExternalSupplier, setIsExternalSupplier] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);

  // Mutation for creating new supplier
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setFormData({
        supplier_id: selectedProduct.supplier_id,
        name: selectedProduct.name,
        description: selectedProduct.description || '',
        sku: selectedProduct.sku,
        purchase_price: selectedProduct.purchase_price?.toString() ?? '',
        selling_price: selectedProduct.selling_price?.toString() ?? '',
        status: selectedProduct.status,
      });
    } else {
      resetForm();
      setSelectedSupplierSlug(null);
      setSelectedThirdPartyProduct('');
      setIsExternalSupplier(false);
      setIsAddSupplierDialogOpen(false);
    }
  }, [isEditMode, selectedProduct, isOpen]);

  const handleSupplierChange = (supplierId: string) => {
    const id = parseInt(supplierId);
    const supplier = suppliers.find(s => s.id === id);

    updateFormData({ supplier_id: id });

    if (supplier) {
      const isExternal = supplier.type === 'external';
      setIsExternalSupplier(isExternal);
      setSelectedSupplierSlug(isExternal ? supplier.slug : null);
      setSelectedThirdPartyProduct('');

      // Notify parent about supplier change
      onSupplierChange(id, isExternal, isExternal ? supplier.slug : null);

      // Clear form fields that will be auto-filled from third-party
      if (isExternal) {
        updateFormData({
          name: '',
          description: '',
          sku: '',
          purchase_price: '',
          selling_price: '',
        });
      }
    } else {
      setIsExternalSupplier(false);
      setSelectedSupplierSlug(null);
      setSelectedThirdPartyProduct('');
    }
  };

  const handleThirdPartyProductSelect = (productSku: string) => {
    if (productSku === 'none') {
      setSelectedThirdPartyProduct('');
      return;
    }

    setSelectedThirdPartyProduct(productSku);

    const product = thirdPartyProducts.find(p => p.sku === productSku);
    if (product) {
      updateFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        purchase_price: product.price !== undefined && product.price !== null ? String(product.price) : '',
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm(isExternalSupplier, selectedThirdPartyProduct)) {
      onSubmit({
        supplier_id: formData.supplier_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        sku: formData.sku.trim(),
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
        status: formData.status,
      });
    }
  };

  const handleClose = () => {
    resetForm();
    setSelectedSupplierSlug(null);
    setSelectedThirdPartyProduct('');
    setIsExternalSupplier(false);
    setIsAddSupplierDialogOpen(false);
    onClose();
  };

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      const newSupplier = await createSupplier(data).unwrap();
      // Refresh suppliers list in parent
      onSuppliersRefetch?.();
      // Auto-select the newly created supplier directly
      if (newSupplier) {
        handleSupplierChange(newSupplier.id.toString());
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
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update product information' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <Select
              required
              value={formData.supplier_id.toString()}
              onValueChange={handleSupplierChange}
              disabled={isEditMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name} {supplier.type === 'external' && '(External)'}
                  </SelectItem>
                ))}
                {!isEditMode && (
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
                )}
              </SelectContent>
            </Select>
            {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
          </div>

          {/* Third-Party Product Selection */}
          {!isEditMode && isExternalSupplier && (
            <div className="grid gap-2">
              <Label htmlFor="third_party_product">Third-Party Product *</Label>
              <Select
                required
                value={
                  selectedThirdPartyProduct &&
                    thirdPartyProducts.some(p => p.sku === selectedThirdPartyProduct)
                    ? selectedThirdPartyProduct
                    : undefined
                }
                onValueChange={handleThirdPartyProductSelect}
                disabled={isLoadingThirdParty}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingThirdParty ? "Loading products..." : "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {thirdPartyProducts.length > 0 ? (
                    thirdPartyProducts
                      .filter((product): product is ThirdPartyProduct & { sku: string } => !!product.sku) // Filter out products without SKU
                      .map((product) => (
                        <SelectItem key={product.sku} value={product.sku}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem key="no-products" value="none" disabled>
                      No products available
                    </SelectItem>
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
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Product Name"
              disabled={!isEditMode && isExternalSupplier && !!selectedThirdPartyProduct}
            />
            <div className="min-h-[20px]">
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              {!errors.name && !isEditMode && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => updateFormData({ sku: e.target.value })}
              placeholder="PROD-001"
              disabled={isEditMode || (isExternalSupplier && !!selectedThirdPartyProduct)}
            />
            <div className="min-h-[20px]">
              {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
              {!errors.sku && isEditMode && <p className="text-xs text-muted-foreground">SKU cannot be updated</p>}
              {!errors.sku && !isEditMode && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
            <div className="min-h-[20px]">
              {!isEditMode && isExternalSupplier && selectedThirdPartyProduct && (
                <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="purchase_price">Purchase Price *</Label>
              <Input
                required
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => updateFormData({ purchase_price: e.target.value })}
                placeholder="0.00"
                disabled={!isEditMode && isExternalSupplier && !!selectedThirdPartyProduct}
              />
              <div className="min-h-[20px]">
                {errors.purchase_price && <p className="text-sm text-red-500">{errors.purchase_price}</p>}
                {!errors.purchase_price && !isEditMode && isExternalSupplier && selectedThirdPartyProduct && (
                  <p className="text-xs text-blue-600">Auto-filled from third-party product</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="selling_price">Selling Price *</Label>
              <Input
                required
                id="selling_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.selling_price}
                onChange={(e) => updateFormData({ selling_price: e.target.value })}
                placeholder="0.00"
              />
              <div className="min-h-[20px]">
                {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price}</p>}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              required
              value={formData.status}
              onValueChange={(value: ProductStatus) => updateFormData({ status: value })}
            >
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
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Add New Supplier Dialog */}
      {!isEditMode && (
        <SupplierFormDialog
          isOpen={isAddSupplierDialogOpen}
          isEditMode={false}
          selectedSupplier={null}
          isSubmitting={isCreatingSupplier}
          onClose={() => setIsAddSupplierDialogOpen(false)}
          onSubmit={handleCreateSupplier}
        />
      )}
    </Dialog>
  );
};

