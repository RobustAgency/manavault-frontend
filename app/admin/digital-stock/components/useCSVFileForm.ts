import { useState } from 'react';

export interface CSVUploadErrors {
  file?: string;
  supplier_id?: string;
}

export const useCSVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<CSVUploadErrors>({});

  const validateForm = (): boolean => {
    const newErrors: CSVUploadErrors = {};

    if (!selectedSupplierId) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!file) {
      newErrors.file = 'CSV file is required';
    } else if (
      file.type !== 'text/csv' &&
      !file.name.toLowerCase().endsWith('.csv')
    ) {
      newErrors.file = 'Only CSV files are allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const resetForm = () => {
    setFile(null);
    setSelectedSupplierId(undefined);
    setErrors({});
  };

  return {
    file,
    setFile,
    selectedSupplierId,
    setSelectedSupplierId,
    errors,
    validateForm,
    resetForm,
  };
};
