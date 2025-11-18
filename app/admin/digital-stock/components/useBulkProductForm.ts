import { useState } from 'react';
import { type DigitalProductFormState } from './useDigitalProductForm';

export interface ProductFormItem {
  id: string;
  formData: DigitalProductFormState;
  errors: Record<string, string>;
  isExpanded: boolean;
}

export const useBulkProductForm = () => {
  const [productForms, setProductForms] = useState<ProductFormItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const createInitialForm = (supplierId: number = 0): ProductFormItem => ({
    id: `product-${Date.now()}-${Math.random()}`,
    formData: {
      supplier_id: supplierId,
      name: '',
      sku: '',
      brand: '',
      description: '',
      tags: '',
      image: '',
      cost_price: '',
      status: 'active',
      regions: '',
      metadata: '',
    },
    errors: {},
    isExpanded: true,
  });

  const initializeForms = (supplierId: number = 0) => {
    const initialForm = createInitialForm(supplierId);
    setProductForms([initialForm]);
    setExpandedItems(new Set([initialForm.id]));
  };

  const addProduct = (supplierId: number) => {
    const newForm = createInitialForm(supplierId);
    setProductForms((prev) => [...prev, newForm]);
    setExpandedItems((prev) => new Set([...prev, newForm.id]));
  };

  const removeProduct = (id: string) => {
    setProductForms((prev) => prev.filter((form) => form.id !== id));
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleAccordion = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const updateProductForm = (id: string, updates: Partial<DigitalProductFormState>) => {
    setProductForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, formData: { ...form.formData, ...updates } } : form
      )
    );
  };

  const updateAllSuppliers = (supplierId: number) => {
    setProductForms((prev) =>
      prev.map((form) => ({
        ...form,
        formData: { ...form.formData, supplier_id: supplierId },
      }))
    );
  };

  const validateProductForm = (form: ProductFormItem): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    if (!form.formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (form.formData.sku.length > 100) {
      newErrors.sku = 'SKU must be 100 characters or less';
    }

    if (!form.formData.cost_price.trim()) {
      newErrors.cost_price = 'Cost price is required';
    } else {
      const costPriceValue = parseFloat(form.formData.cost_price);
      if (Number.isNaN(costPriceValue)) {
        newErrors.cost_price = 'Cost price must be a valid number';
      } else if (costPriceValue < 0) {
        newErrors.cost_price = 'Cost price must be 0 or greater';
      }
    }

    if (form.formData.metadata.trim()) {
      try {
        JSON.parse(form.formData.metadata);
      } catch {
        newErrors.metadata = 'Metadata must be valid JSON';
      }
    }

    setProductForms((prev) =>
      prev.map((f) => (f.id === form.id ? { ...f, errors: newErrors } : f))
    );

    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setProductForms([]);
    setExpandedItems(new Set());
  };

  return {
    productForms,
    expandedItems,
    initializeForms,
    addProduct,
    removeProduct,
    toggleAccordion,
    updateProductForm,
    updateAllSuppliers,
    validateProductForm,
    reset,
  };
};

