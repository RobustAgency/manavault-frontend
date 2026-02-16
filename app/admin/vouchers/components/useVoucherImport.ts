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

  const validateFile = (selectedFile: File): { valid: boolean; error?: string } => {
    // Validate file extension (more reliable than MIME type)
    const validExtensions = ['.csv', '.xlsx', '.xls', '.zip'];
    const fileName = selectedFile.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');
    
    // Check if file has an extension
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return {
        valid: false,
        error: 'File must have a valid extension (.csv, .xlsx, .xls, or .zip)',
      };
    }
    
    const fileExtension = fileName.substring(lastDotIndex);
    
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file type "${fileExtension}". Please upload a CSV, Excel (.xlsx/.xls), or ZIP file.`,
      };
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { valid: true };
  };

  const handleFileChange = (selectedFile: File | null) => {
    console.log('🔵 handleFileChange called with:', selectedFile?.name || 'null');
    if (selectedFile) {
      // Always set the file first so it shows up in the UI
      console.log('🟢 Setting file:', selectedFile.name);
      setFile(selectedFile);
      setImportResult(null);
      
      // Then validate and show error if needed
      const validation = validateFile(selectedFile);
      console.log('🟡 Validation result:', validation);
      if (!validation.valid) {
        alert(validation.error || 'Invalid file');
        // Don't clear the file even if validation fails - let user see what they selected
      }
    } else {
      console.log('🔴 Clearing file (null passed)');
      setFile(null);
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

