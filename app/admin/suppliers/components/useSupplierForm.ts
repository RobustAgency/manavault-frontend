import { useState } from 'react';
import {  SupplierStatus } from '@/lib/redux/features';

export interface SupplierFormErrors {
  name?: string;
  
  contact_email?: string;
  
  status?: string;
}

export interface SupplierFormState {
  name: string;
  contact_email: string;
  contact_phone: string;
  status: '' | SupplierStatus;
}

export const useSupplierForm = () => {
  const [formData, setFormData] = useState<SupplierFormState>({
    name: '',
    contact_email: '',
    contact_phone: '',
    status: '',
  });

  const [errors, setErrors] = useState<SupplierFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: SupplierFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be 255 characters or less';
    }

    

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }



    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      
      contact_email: '',
      contact_phone: '',
      status: '',
    });
    setErrors({});
  };

  const updateFormData = (updates: Partial<SupplierFormState>) => {
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

