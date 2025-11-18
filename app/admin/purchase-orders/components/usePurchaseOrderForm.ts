import { useState, useCallback } from "react";
import {
  CreatePurchaseOrderData,
  PurchaseOrderItem,
} from "@/lib/redux/features";

export interface PurchaseOrderFormErrors {
  supplier_id?: string;
  items?: string;
  [key: string]: string | undefined; // For item-specific errors like 'items.0.quantity'
}

export const usePurchaseOrderForm = () => {
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplier_id: 0,
    items: [],
  });

  const [errors, setErrors] = useState<PurchaseOrderFormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: PurchaseOrderFormErrors = {};

    if (!formData.supplier_id || formData.supplier_id === 0) {
      newErrors.supplier_id = "Supplier is required";
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "At least one product with quantity is required";
    } else {
      // Validate each item
      formData.items.forEach((item, index) => {
        if (!item.digital_product_id || item.digital_product_id === 0) {
          newErrors[`items.${index}.digital_product_id`] =
            "Product is required";
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`items.${index}.quantity`] = "Quantity must be at least 1";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      supplier_id: 0,
      items: [],
    });
    setErrors({});
  }, []);

  const updateFormData = useCallback(
    (updates: Partial<CreatePurchaseOrderData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const addItem = useCallback((item: PurchaseOrderItem) => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  }, []);

  const updateItem = useCallback(
    (index: number, updates: Partial<PurchaseOrderItem>) => {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        ),
      }));
    },
    []
  );

  const removeItem = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    resetForm,
    updateFormData,
    addItem,
    updateItem,
    removeItem,
  };
};
