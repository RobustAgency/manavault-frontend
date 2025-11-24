import { useState } from "react";
import { ProductStatus } from "@/lib/redux/features";

export interface ProductFormErrors {
  third_party_product?: string;
  name?: string;
  sku?: string;
  selling_price?: string;
  brand?: string;
}

export interface ProductFormState {
  name: string;
  brand_id: string;
  description: string;
  short_description: string;
  long_description: string;
  sku: string;
  selling_price: string;
  status: ProductStatus;
  tags: string;
  image: string | File;
  regions: string;
}

export const useProductForm = (isEditMode: boolean) => {
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    brand_id: "",
    description: "",
    short_description: "",
    long_description: "",
    sku: "",
    selling_price: "",
    status: "active",
    tags: "",
    image: "",
    regions: "",
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const validateForm = (
    isExternalSupplier: boolean,
    selectedThirdPartyProduct: string
  ): boolean => {
    const newErrors: ProductFormErrors = {};

    // For external suppliers during creation, ensure third-party product is selected
    if (!isEditMode && isExternalSupplier && !selectedThirdPartyProduct) {
      newErrors.third_party_product = "Please select a third-party product";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 255) {
      newErrors.name = "Name must be 255 characters or less";
    }

    if (!isEditMode) {
      if (!formData.sku.trim()) {
        newErrors.sku = "SKU is required";
      } else if (formData.sku.length > 100) {
        newErrors.sku = "SKU must be 100 characters or less";
      }
    }

    if (!formData.selling_price.trim()) {
      newErrors.selling_price = "Selling price is required";
    } else {
      const sellingPriceValue = parseFloat(formData.selling_price);
      if (Number.isNaN(sellingPriceValue)) {
        newErrors.selling_price = "Selling price must be a valid number";
      } else if (sellingPriceValue < 0) {
        newErrors.selling_price = "Selling price must be 0 or greater";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand_id: "",
      description: "",
      short_description: "",
      long_description: "",
      sku: "",
      selling_price: "",
      status: "active",
      tags: "",
      image: "",
      regions: "",
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<ProductFormState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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
