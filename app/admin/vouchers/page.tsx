'use client';

import { useState } from 'react';
import { UploadIcon, FileIcon, CheckCircle2Icon, XCircleIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useImportVouchersMutation,
  useGetPurchaseOrdersQuery,
} from '@/lib/redux/features';
import { Badge } from '@/components/ui/badge';

export default function VouchersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [purchaseOrderId, setPurchaseOrderId] = useState<number>(0);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported_count?: number;
    failed_count?: number;
    errors?: string[];
  } | null>(null);

  const { data: purchaseOrdersData } = useGetPurchaseOrdersQuery({ per_page: 100 });
  const [importVouchers, { isLoading: isImporting }] = useImportVouchersMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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
        e.target.value = '';
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        alert('File size exceeds 10MB limit.');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!purchaseOrderId || purchaseOrderId === 0) {
      alert('Please select a purchase order');
      return;
    }

    try {
      const result = await importVouchers({
        file,
        purchase_order_id: purchaseOrderId,
      }).unwrap();

      setImportResult(result);
      
      // Reset form on success
      if (result.success) {
        setFile(null);
        setPurchaseOrderId(0);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Failed to import vouchers:', error);
      setImportResult({
        success: false,
        message: 'Failed to import vouchers',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return <FileIcon className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import Vouchers</h1>
        <p className="text-muted-foreground mt-1">
          Upload vouchers from CSV, Excel, or ZIP files
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Vouchers File</CardTitle>
          <CardDescription>
            Select a purchase order and upload vouchers file (CSV, Excel .xlsx/.xls, or ZIP)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Purchase Order Selection */}
          <div className="grid gap-2">
            <Label htmlFor="purchase_order">Purchase Order *</Label>
            <Select 
              value={purchaseOrderId.toString()} 
              onValueChange={(value) => setPurchaseOrderId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a purchase order" />
              </SelectTrigger>
              <SelectContent>
                {purchaseOrdersData?.data.map((order) => (
                  <SelectItem key={order.id} value={order.id.toString()}>
                    {order.order_number} - {order.product?.name} ({order.quantity} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Vouchers File *</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
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
              {getFileIcon(file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-lg border ${
              importResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle2Icon className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    importResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {importResult.message}
                  </p>
                  
                  {importResult.imported_count !== undefined && (
                    <div className="flex gap-4 mt-2">
                      {importResult.imported_count > 0 && (
                        <Badge variant="filled" color="success">
                          {importResult.imported_count} Imported
                        </Badge>
                      )}
                      {importResult.failed_count !== undefined && importResult.failed_count > 0 && (
                        <Badge variant="filled" color="error">
                          {importResult.failed_count} Failed
                        </Badge>
                      )}
                    </div>
                  )}

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-red-900">Errors:</p>
                      <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-red-700">
                            And {importResult.errors.length - 5} more errors...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setPurchaseOrderId(0);
              setImportResult(null);
              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
            disabled={isImporting}
          >
            Clear
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !purchaseOrderId || purchaseOrderId === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-white mr-2" />
                Importing...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4 mr-2" />
                Import Vouchers
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Stats Cards (Optional - can show recent imports) */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrdersData?.pagination.total || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Supported Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS, ZIP</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Max File Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10 MB</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

