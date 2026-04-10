import { useState, useCallback } from 'react';

export interface DigitalProductFormErrors {
  supplier_id?: string;
  name?: string;
  sku?: string;
  cost_price?: string;
  selling_price?: string;
  selling_discount?: string;
  face_value?: string;
  tags?: string;
  region?: string;
  metadata?: string;
}

export interface DigitalProductFormState {
  supplier_id: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  tags: string; // Comma-separated string for input
  image: string | File | null;
  cost_price: string;
  selling_price: string;
  selling_discount: string;
  face_value: string;
  region: string; // Comma-separated string for input
  metadata: string; // JSON string for input
  currency: string;
}

export const useDigitalProductForm = (isEditMode: boolean) => {
  const [formData, setFormData] = useState<DigitalProductFormState>({
    supplier_id: 0,
    name: '',
    sku: '',
    brand: '',
    description: '',
    tags: '',
    image: '',
    cost_price: '',
    selling_price: '',
    selling_discount: '',
    face_value: '',
    region: '',
    metadata: '',
    currency: 'usd',
  });

  const [errors, setErrors] = useState<DigitalProductFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: DigitalProductFormErrors = {};

    if (!formData.supplier_id || formData.supplier_id === 0) {
      newErrors.supplier_id = 'Supplier is required';
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

    if (!formData.cost_price.trim()) {
      newErrors.cost_price = 'Cost price is required';
    } else {
      const costPriceValue = parseFloat(formData.cost_price);
      if (Number.isNaN(costPriceValue)) {
        newErrors.cost_price = 'Cost price must be a valid number';
      } else if (costPriceValue < 0) {
        newErrors.cost_price = 'Cost price must be 0 or greater';
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

    if (formData.selling_discount.trim()) {
      const sellingDiscountValue = parseFloat(formData.selling_discount);
      if (Number.isNaN(sellingDiscountValue)) {
        newErrors.selling_discount = 'Selling discount must be a valid number';
      } else if (sellingDiscountValue < 0 || sellingDiscountValue > 100) {
        newErrors.selling_discount = 'Selling discount must be between 0 and 100';
      }
    }

    if (!formData.face_value.trim()) {
      newErrors.face_value = 'Face value is required';
    } else {
      const faceValueValue = parseFloat(formData.face_value);
      if (Number.isNaN(faceValueValue)) {
        newErrors.face_value = 'Face value must be a valid number';
      } else if (faceValueValue < 0) {
        newErrors.face_value = 'Face value must be 0 or greater';
      }
    }
    // Validate tags format (optional)
    if (formData.tags.trim()) {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tagsArray.length > 0) {
        const invalidTags = tagsArray.filter(tag => tag.length > 100);
        if (invalidTags.length > 0) {
          newErrors.tags = 'Each tag must be 100 characters or less';
        }
      }
    }



    // Validate metadata JSON (optional)
    if (formData.metadata.trim()) {
      try {
        JSON.parse(formData.metadata);
      } catch {
        newErrors.metadata = 'Metadata must be valid JSON';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = useCallback(() => {
    setFormData({
      supplier_id: 0,
      name: '',
      sku: '',
      brand: '',
      description: '',
      tags: '',
      image: '',
      cost_price: '',
      selling_price: '',
      selling_discount: '',
      face_value: '',
      region: '',
      metadata: '',
      currency: 'usd',
    });
    setErrors({});
  }, []);

  const updateFormData = (updates: Partial<DigitalProductFormState>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Helper to convert form data to API format
  const getFormDataForSubmit = () => {
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    
    // const regionsArray = formData.regions
    //   .split(',')
    //   .map(region => region.trim())
    //   .filter(Boolean);
    const regionValue = formData.region.trim();

    let metadataObj: Record<string, unknown> | undefined;
    if (formData.metadata.trim()) {
      try {
        metadataObj = JSON.parse(formData.metadata);
      } catch {
        // Invalid JSON, will be caught by validation
      }
    }

    // For create mode, include all fields including SKU
    // For edit mode, exclude SKU (it cannot be updated)
    if (isEditMode) {
      const imageUrlValue =
        formData.image === null
          ? null
          : typeof formData.image === "string"
            ? formData.image.trim()
            : undefined;

      return {
        supplier_id: formData.supplier_id > 0 ? formData.supplier_id : undefined,
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        description: formData.description.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        image_url:
          imageUrlValue === null
            ? null
            : imageUrlValue || undefined,
        cost_price: parseFloat(formData.cost_price),
        selling_price: formData.selling_price.trim() ? parseFloat(formData.selling_price) : undefined,
        selling_discount: formData.selling_discount.trim() ? parseFloat(formData.selling_discount) : undefined,
        face_value: formData.face_value.trim() ? parseFloat(formData.face_value) : undefined,
        region: regionValue.length > 0 ? regionValue : undefined,
        metadata: metadataObj,
        currency: formData.currency || undefined,
      };
    }

    return {
      supplier_id: formData.supplier_id,
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      brand: formData.brand.trim() || undefined,
      description: formData.description.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      image:
        typeof formData.image === "string" && formData.image.trim()
          ? formData.image.trim()
          : undefined,
      cost_price: parseFloat(formData.cost_price),
      selling_price: formData.selling_price.trim() ? parseFloat(formData.selling_price) : undefined,
      face_value: formData.face_value.trim() ? parseFloat(formData.face_value) : undefined,
      region: regionValue.length > 0 ? regionValue : undefined,
      metadata: metadataObj,
      currency: formData.currency || undefined,
    };
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    resetForm,
    updateFormData,
    getFormDataForSubmit,
  };
};

