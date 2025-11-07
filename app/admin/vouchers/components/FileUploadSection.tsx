'use client';

import React from 'react';
import { UploadIcon, FileIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PurchaseOrder } from '@/lib/redux/features';

interface FileUploadSectionProps {
  file: File | null;
  purchaseOrderId: number;
  purchaseOrders: PurchaseOrder[];
  onFileChange: (file: File | null) => void;
  onPurchaseOrderChange: (id: number) => void;
  onClearFile: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const FileUploadSection = ({
  file,
  purchaseOrderId,
  purchaseOrders,
  onFileChange,
  onPurchaseOrderChange,
  onClearFile,
}: FileUploadSectionProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const previousFileRef = React.useRef<File | null>(null);

  // Preserve file input value when component re-renders
  React.useEffect(() => {
    if (file && fileInputRef.current && file !== previousFileRef.current) {
      // File was set, preserve it
      previousFileRef.current = file;
    } else if (!file && previousFileRef.current && fileInputRef.current) {
      // File was cleared, reset input
      fileInputRef.current.value = '';
      previousFileRef.current = null;
    }
  }, [file]);

  // Use useCallback to prevent the handler from being recreated on every render
  const handleFileInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    console.log('📁 File input changed:', selectedFile?.name || 'no file', 'Files length:', e.target.files?.length);
    
    if (selectedFile) {
      console.log('✅ Calling onFileChange with file:', selectedFile.name, 'Size:', selectedFile.size);
      // Call immediately - don't delay
      onFileChange(selectedFile);
    } else {
      console.log('⚠️ No file selected in input');
      // Don't clear the file if input is empty - this might be a re-render issue
      // Only reset the input value to allow selecting the same file again
      if (fileInputRef.current && !file) {
        fileInputRef.current.value = '';
      }
    }
  }, [onFileChange, file]);

  return (
    <div className="space-y-6">
      {/* Purchase Order Selection */}
      <div className="grid gap-2">
        <Label htmlFor="purchase_order">Purchase Order *</Label>
        <Select 
          value={purchaseOrderId > 0 ? purchaseOrderId.toString() : undefined} 
          onValueChange={(value) => onPurchaseOrderChange(parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a purchase order" />
          </SelectTrigger>
          <SelectContent>
            {purchaseOrders.length === 0 ? (
              <SelectItem value="no-orders" disabled>
                No purchase orders available
              </SelectItem>
            ) : (
              purchaseOrders.map((order) => (
                <SelectItem key={order.id} value={order.id.toString()}>
                  {order.order_number} - {order.product?.name || 'N/A'} ({order.quantity} units)
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* File Upload */}
      <div className="grid gap-2">
        <Label htmlFor="file-upload">Vouchers File *</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls,.zip"
            onChange={handleFileInput}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              CSV, XLSX, XLS, or ZIP (max 10MB)
            </p>
          </label>
        </div>
      </div>

      {/* Selected File Display */}
      {file && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <FileIcon className="h-8 w-8 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClearFile();
              // Reset the file input
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <XCircleIcon className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File Format Info */}
      <div className="text-sm text-muted-foreground space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="font-medium text-blue-900">📋 File Format Requirements:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>CSV files should have headers in the first row</li>
          <li>Excel files (.xlsx or .xls) are supported</li>
          <li>ZIP files can contain multiple voucher files</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

