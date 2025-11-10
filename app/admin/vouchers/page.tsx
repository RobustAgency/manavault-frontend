'use client';

import React from 'react';
import { UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useImportVouchersMutation,
  useGetPurchaseOrdersQuery,
} from '@/lib/redux/features';
import {
  FileUploadSection,
  ImportResultDisplay,
  StatsCards,
  useVoucherImport,
} from './components';

export default function VouchersPage() {
  const {
    file,
    purchaseOrderId,
    importResult,
    setFile,
    setPurchaseOrderId,
    setImportResult,
    clearFile,
    reset,
  } = useVoucherImport();

  const { data: purchaseOrdersData } = useGetPurchaseOrdersQuery({ per_page: 100 });
  const [importVouchers, { isLoading: isImporting }] = useImportVouchersMutation();

  // Memoize the file change handler to prevent unnecessary re-renders
  const handleFileChange = React.useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
  }, [setFile]);

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!purchaseOrderId || purchaseOrderId <= 0) {
      alert('Please select a purchase order');
      return;
    }

    // Validate file before importing
    const validExtensions = ['.csv', '.xlsx', '.xls', '.zip'];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      alert(`Invalid file type. Please upload a CSV, Excel (.xlsx/.xls), or ZIP file.`);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    try {
      const result = await importVouchers({
        file,
        purchase_order_id: purchaseOrderId,
      }).unwrap();

      // setImportResult(result);

      // Reset form on success
      if (result.success) {
        setFile(null);
        setPurchaseOrderId(0);
      }
    } catch (error) {
      console.error('Failed to import vouchers:', error);
      setImportResult({
        success: false,
        message: 'Failed to import vouchers',
      });
    }
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
          <FileUploadSection
            file={file}
            purchaseOrderId={purchaseOrderId}
            purchaseOrders={purchaseOrdersData?.data || []}
            onFileChange={handleFileChange}
            onPurchaseOrderChange={setPurchaseOrderId}
            onClearFile={clearFile}
          />

          {/* Import Result */}
          {importResult && <ImportResultDisplay result={importResult} />}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={reset}
            disabled={isImporting}
          >
            Clear
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || purchaseOrderId <= 0 || isImporting}
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

      {/* Stats Cards */}
      <StatsCards totalOrders={purchaseOrdersData?.pagination.total || 0} />
    </div>
  );
}
