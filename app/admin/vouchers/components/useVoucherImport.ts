import { useState } from 'react';

export interface ImportResult {
  success: boolean;
  message: string;
  imported_count?: number;
  failed_count?: number;
  errors?: string[];
}

export const useVoucherImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [purchaseOrderId, setPurchaseOrderId] = useState<number>(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const validateFile = (selectedFile: File): boolean => {
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ];
    
    const validExtensions = ['.csv', '.xlsx', '.xls', '.zip'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
      alert('Invalid file type. Please upload a CSV, Excel, or ZIP file.');
      return false;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return false;
    }

    return true;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const reset = () => {
    setFile(null);
    setPurchaseOrderId(0);
    setImportResult(null);
  };

  return {
    file,
    purchaseOrderId,
    importResult,
    setFile: handleFileChange,
    setPurchaseOrderId,
    setImportResult,
    clearFile,
    reset,
  };
};

