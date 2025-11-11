import { useState } from 'react';
import { ProductStatus } from '@/lib/redux/features';

export interface ProductFormErrors {
  supplier_id?: string;
  third_party_product?: string;
  name?: string;
  sku?: string;
  purchase_price?: string;
  selling_price?: string;
}

export interface ProductFormState {
  supplier_id: number;
  name: string;
  description: string;
  sku: string;
  purchase_price: string;
  selling_price: string;
  status: ProductStatus;
}

export const useProductForm = (isEditMode: boolean) => {
  const [formData, setFormData] = useState<ProductFormState>({
    supplier_id: 0,
    name: '',
    description: '',
    sku: '',
    purchase_price: '',
    selling_price: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const validateForm = (isExternalSupplier: boolean, selectedThirdPartyProduct: string): boolean => {
    const newErrors: ProductFormErrors = {};

    if (!formData.supplier_id || formData.supplier_id === 0) {
      newErrors.supplier_id = 'Supplier is required';
    }

    // For external suppliers during creation, ensure third-party product is selected
    if (!isEditMode && isExternalSupplier && !selectedThirdPartyProduct) {
      newErrors.third_party_product = 'Please select a third-party product';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!isEditMode) {
      if (!formData.sku.trim()) {
        newErrors.sku = 'SKU is required';
      } else if (formData.sku.length > 100) {
        newErrors.sku = 'SKU must be 100 characters or less';
      }
    }

    if (!formData.purchase_price.trim()) {
      newErrors.purchase_price = 'Purchase price is required';
    } else {
      const purchasePriceValue = parseFloat(formData.purchase_price);
      if (Number.isNaN(purchasePriceValue)) {
        newErrors.purchase_price = 'Purchase price must be a valid number';
      } else if (purchasePriceValue < 0) {
        newErrors.purchase_price = 'Purchase price must be 0 or greater';
      }
    }

    if (!formData.selling_price.trim()) {
      newErrors.selling_price = 'Selling price is required';
    } else {
      const sellingPriceValue = parseFloat(formData.selling_price);
      if (Number.isNaN(sellingPriceValue)) {
        newErrors.selling_price = 'Selling price must be a valid number';
      } else if (sellingPriceValue < 0) {
        newErrors.selling_price = 'Selling price must be 0 or greater';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      supplier_id: 0,
      name: '',
      description: '',
      sku: '',
      purchase_price: '',
      selling_price: '',
      status: 'active',
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<ProductFormState>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    resetForm,
    updateFormData,
  };
};

