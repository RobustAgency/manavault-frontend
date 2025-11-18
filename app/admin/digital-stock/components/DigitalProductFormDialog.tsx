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
import { Button } from '@/components/ui/button';
import {
  DigitalProduct,
  Supplier,
  CreateDigitalProductData,
  BulkCreateDigitalProductsData,
  UpdateDigitalProductData,
  useCreateSupplierMutation,
  CreateSupplierData,
} from '@/lib/redux/features';
import { useDigitalProductForm } from './useDigitalProductForm';
import { useBulkProductForm, type ProductFormItem } from './useBulkProductForm';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';
import { GlobalSupplierSelector } from './GlobalSupplierSelector';
import { ProductFormFields } from './ProductFormFields';
import { ProductAccordionItem } from './ProductAccordionItem';
import { convertFormToSubmitData } from './formDataUtils';

interface DigitalProductFormDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  selectedProduct: DigitalProduct | null;
  suppliers: Supplier[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDigitalProductData | BulkCreateDigitalProductsData | UpdateDigitalProductData) => void;
  onSuppliersRefetch?: () => void;
}

export const DigitalProductFormDialog = ({
  isOpen,
  isEditMode,
  selectedProduct,
  suppliers,
  isSubmitting,
  onClose,
  onSubmit,
  onSuppliersRefetch,
}: DigitalProductFormDialogProps) => {
  // For edit mode, use single form
  const { formData, setFormData, errors, validateForm, resetForm, updateFormData, getFormDataForSubmit } =
    useDigitalProductForm(isEditMode);

  // For create mode, manage multiple products
  const {
    productForms,
    expandedItems,
    initializeForms,
    addProduct,
    removeProduct,
    toggleAccordion,
    updateProductForm,
    updateAllSuppliers,
    validateProductForm,
    reset: resetBulkForm,
  } = useBulkProductForm();

  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [supplierError, setSupplierError] = useState<string>('');

  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

  // Initialize with one empty form for create mode
  useEffect(() => {
    if (!isEditMode && isOpen) {
      initializeForms(0);
      setSelectedSupplierId(0);
      setSupplierError('');
    }
  }, [isOpen, isEditMode, initializeForms]);

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && selectedProduct && isOpen) {
      setFormData({
        supplier_id: selectedProduct.supplier_id,
        name: selectedProduct.name,
        sku: selectedProduct.sku || '',
        brand: selectedProduct.brand || '',
        description: selectedProduct.description || '',
        tags: selectedProduct.tags?.join(', ') || '',
        image: selectedProduct.image || '',
        cost_price: selectedProduct.cost_price?.toString() ?? '',
        status: selectedProduct.status,
        regions: selectedProduct.regions?.join(', ') || '',
        metadata: selectedProduct.metadata ? JSON.stringify(selectedProduct.metadata, null, 2) : '',
      });
    } else if (!isEditMode && isOpen) {
      resetForm();
      setIsAddSupplierDialogOpen(false);
    }
  }, [isEditMode, selectedProduct, isOpen, setFormData, resetForm]);

  const handleSupplierChange = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    setSupplierError('');
    updateAllSuppliers(supplierId);
  };

  const handleAddAnotherProduct = () => {
    addProduct(selectedSupplierId);
  };

  const handleSubmit = () => {
    if (isEditMode) {
      if (validateForm()) {
        const submitData = getFormDataForSubmit();
        onSubmit(submitData);
      }
    } else {
      // Validate supplier first
      if (!selectedSupplierId || selectedSupplierId === 0) {
        setSupplierError('Supplier is required');
        return;
      }
      setSupplierError('');

      // Validate all forms
      const allValid = productForms.every((form) => validateProductForm(form));
      if (allValid) {
        const products = productForms.map((form) =>
          convertFormToSubmitData(form.formData, selectedSupplierId)
        );
        onSubmit({ products });
      }
    }
  };

  const handleClose = () => {
    resetForm();
    resetBulkForm();
    setSelectedSupplierId(0);
    setSupplierError('');
    setIsAddSupplierDialogOpen(false);
    onClose();
  };

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      const newSupplier = await createSupplier(data).unwrap();
      onSuppliersRefetch?.();
      if (newSupplier) {
        if (isEditMode) {
          updateFormData({ supplier_id: newSupplier.id });
        } else {
          handleSupplierChange(newSupplier.id);
        }
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
          <DialogTitle>
            {isEditMode
              ? 'Edit Digital Product'
              : `Create Digital Product${productForms.length > 1 ? `s (${productForms.length})` : ''}`}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update digital product information'
              : productForms.length > 1
                ? 'Add multiple digital products from external suppliers'
                : 'Add a new digital product from external suppliers'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Global Supplier Selection for Create Mode */}
          {!isEditMode && (
            <GlobalSupplierSelector
              selectedSupplierId={selectedSupplierId}
              suppliers={suppliers}
              error={supplierError}
              onSupplierChange={handleSupplierChange}
              onAddNewSupplier={() => setIsAddSupplierDialogOpen(true)}
            />
          )}

          {isEditMode ? (
            // Edit mode: show single form
            <ProductFormFields
              form={formData}
              formErrors={errors}
              isEditMode={true}
              suppliers={suppliers}
              onUpdate={updateFormData}
            />
          ) : (
            // Create mode: show accordions if multiple, single form if one
            <>
              {productForms.length > 1 ? (
                // Multiple products: show accordions for all except last
                <>
                  {productForms.slice(0, -1).map((form, index) => (
                    <ProductAccordionItem
                      key={form.id}
                      id={form.id}
                      index={index}
                      formData={form.formData}
                      errors={form.errors}
                      isExpanded={expandedItems.has(form.id)}
                      canRemove={productForms.length > 1}
                      suppliers={suppliers}
                      onToggle={() => toggleAccordion(form.id)}
                      onRemove={() => removeProduct(form.id)}
                      onUpdate={(updates) => updateProductForm(form.id, updates)}
                    />
                  ))}
                  {/* Last product is always expanded and not in accordion */}
                  <div className="border rounded-lg p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Product {productForms.length}:{' '}
                        {productForms[productForms.length - 1].formData.name || 'New Product'}
                      </span>
                      {productForms.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(productForms[productForms.length - 1].id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <ProductFormFields
                      form={productForms[productForms.length - 1].formData}
                      formErrors={productForms[productForms.length - 1].errors}
                      formItemId={productForms[productForms.length - 1].id}
                      isEditMode={false}
                      onUpdate={(updates) =>
                        updateProductForm(productForms[productForms.length - 1].id, updates)
                      }
                    />
                  </div>
                </>
              ) : (
                // Single product: show regular form
                <ProductFormFields
                  form={productForms[0]?.formData || formData}
                  formErrors={productForms[0]?.errors || errors}
                  formItemId={productForms[0]?.id}
                  isEditMode={false}
                  onUpdate={(updates) => {
                    if (productForms[0]) {
                      updateProductForm(productForms[0].id, updates);
                    }
                  }}
                />
              )}

              {/* Add Another Product Button */}
              {!isEditMode && (
                <Button type="button" variant="outline" onClick={handleAddAnotherProduct} className="w-full">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Another Product
                </Button>
              )}
            </>
          )}
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
