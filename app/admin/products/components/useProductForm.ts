import { useState } from 'react';
import { CreateProductData, ProductStatus } from '@/lib/redux/features';

export interface ProductFormErrors {
  supplier_id?: string;
  third_party_product?: string;
  name?: string;
  sku?: string;
  purchase_price?: string;
  selling_price?: string;
}

export const useProductForm = (isEditMode: boolean) => {
  const [formData, setFormData] = useState<CreateProductData>({
    supplier_id: 0,
    name: '',
    description: '',
    sku: '',
    purchase_price: 0,
    selling_price: 0,
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

    if (formData.purchase_price < 0) {
      newErrors.purchase_price = 'Purchase price must be 0 or greater';
    }

    if (formData.selling_price < 0) {
      newErrors.selling_price = 'Selling price must be 0 or greater';
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
      purchase_price: 0,
      selling_price: 0,
      status: 'active',
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<CreateProductData>) => {
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

