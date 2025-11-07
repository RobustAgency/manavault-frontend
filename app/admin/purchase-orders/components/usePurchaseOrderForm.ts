import { useState } from 'react';
import { CreatePurchaseOrderData } from '@/lib/redux/features';

export interface PurchaseOrderFormErrors {
  product_id?: string;
  supplier_id?: string;
  purchase_price?: string;
  quantity?: string;
}

export const usePurchaseOrderForm = () => {
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    product_id: 0,
    supplier_id: 0,
    purchase_price: 0,
    quantity: 1,
  });

  const [errors, setErrors] = useState<PurchaseOrderFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: PurchaseOrderFormErrors = {};

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

  const resetForm = () => {
    setFormData({
      product_id: 0,
      supplier_id: 0,
      purchase_price: 0,
      quantity: 1,
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<CreatePurchaseOrderData>) => {
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

