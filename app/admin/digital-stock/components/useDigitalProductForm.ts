import { useState, useCallback } from 'react';

export interface DigitalProductFormErrors {
  supplier_id?: string;
  name?: string;
  sku?: string;
  cost_price?: string;
  tags?: string;
  regions?: string;
  metadata?: string;
}

export interface DigitalProductFormState {
  supplier_id: number;
  name: string;
  sku: string;
  brand: string;
  description: string;
  tags: string; // Comma-separated string for input
  image: string;
  cost_price: string;
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

    // Validate regions format (optional)
    if (formData.region.trim()) {
      // const regionsArray = formData.regions.split(',').map(region => region.trim()).filter(Boolean);
      if (formData.region.length > 0) {
        // const invalidRegions = regionsArray.filter(region => region.length > 10);
        const invalidRegions = formData.region.length>10;
        if (invalidRegions) {
          newErrors.regions = 'Each region code must be 10 characters or less';
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
    const regionsArray = formData.region;

    let metadataObj: Record<string, unknown> | undefined;
    if (formData.metadata.trim()) {
      try {
        metadataObj = JSON.parse(formData.metadata);
      } catch {
        // Invalid JSON, will be caught by validation
      }
    }

    // For create mode, include all fields including SKU
    // For edit mode, exclude SKU (it cannot be updated) and supplier_id
    if (isEditMode) {
      return {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        description: formData.description.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        image: formData.image.trim() || undefined,
        cost_price: parseFloat(formData.cost_price),
        regions: regionsArray.length > 0 ? regionsArray : undefined,
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
      image: formData.image.trim() || undefined,
      cost_price: parseFloat(formData.cost_price),
      regions: regionsArray.length > 0 ? regionsArray : undefined,
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

