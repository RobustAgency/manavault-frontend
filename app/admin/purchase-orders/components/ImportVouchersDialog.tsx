'use client';

import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { FileIcon, UploadIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ImportVouchersResponse,
  PurchaseOrder,
  useImportVouchersMutation,
} from '@/lib/redux/features';

interface ImportVouchersDialogProps {
  order: PurchaseOrder;
  onSuccess?: (order?: PurchaseOrder) => void;
}

export const ImportVouchersDialog = ({
  order,
  onSuccess,
}: ImportVouchersDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] =
    useState<ImportVouchersResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importVouchers, { isLoading: isImporting }] =
    useImportVouchersMutation();

  const purchaseOrderLabel = useMemo(() => {
    const productName = order.product?.name || 'Unknown product';
    return `${order.order_number} • ${productName}`;
  }, [order.order_number, order.product?.name]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const validateFile = useCallback((file: File) => {
    const validExtensions = ['.csv', '.xlsx', '.xls', '.zip'];
    const fileName = file.name.toLowerCase();
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return {
        valid: false,
        error: 'File must have a valid extension (.csv, .xlsx, .xls, or .zip).',
      };
    }

    const fileExtension = fileName.substring(lastDotIndex);
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error:
          'Invalid file type. Please upload a CSV, Excel (.xlsx/.xls), or ZIP file.',
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    return { valid: true };
  }, []);

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const resetState = useCallback(() => {
    clearSelectedFile();
    setValidationError(null);
    setImportResult(null);
  }, [clearSelectedFile]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        resetState();
      }
    },
    [resetState]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      setValidationError(null);
      setImportResult(null);

      if (file) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setValidationError(validation.error ?? 'Invalid file selected.');
          clearSelectedFile();
        } else {
          setSelectedFile(file);
        }
      } else {
        clearSelectedFile();
      }

      event.target.value = '';
    },
    [clearSelectedFile, validateFile]
  );

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      setValidationError('Please select a file to import.');
      return;
    }

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setValidationError(validation.error ?? 'Invalid file selected.');
      return;
    }

    try {
      setValidationError(null);
      const result = await importVouchers({
        file: selectedFile,
        purchase_order_id: order.id,
      }).unwrap();

      const isSuccess =
        typeof result?.success === 'boolean'
          ? result.success
          : result?.error === false;

      if (isSuccess) {
        if (typeof onSuccess === 'function') {
          onSuccess(result?.data as PurchaseOrder | undefined);
        }
        setImportResult(null);
        resetState();
        setIsOpen(false);
        return;
      }

      setImportResult({
        ...result,
        success: false,
        message:
          result?.message ||
          'Import completed with warnings. Please review the details below.',
      });
    } catch (error) {
      console.error('Failed to import vouchers:', error);
      setImportResult({
        success: false,
        message: 'Failed to import vouchers. Please try again.',
      });
    }
  }, [clearSelectedFile, importVouchers, order.id, selectedFile, validateFile]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <UploadIcon className="mr-2 h-4 w-4" />
          Import Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Vouchers</DialogTitle>
          <DialogDescription>
            Upload voucher codes for {purchaseOrderLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2 rounded-lg border border-dashed border-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Purchase Order
            </p>
            <p className="text-base font-semibold">{purchaseOrderLabel}</p>
            <div className="text-sm text-muted-foreground">
              Quantity:{' '}
              <span className="font-medium">{order.quantity} units</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voucher-file">Vouchers File *</Label>
            <Input
              ref={fileInputRef}
              id="voucher-file"
              type="file"
              accept=".csv,.xlsx,.xls,.zip"
              onChange={handleFileChange}
              disabled={isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: CSV, XLSX, XLS, ZIP (max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-4 rounded-lg border border-muted px-4 py-3">
              <FileIcon className="h-10 w-10 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelectedFile}
                disabled={isImporting}
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {validationError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError}
            </div>
          )}

          {importResult && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                importResult.success
                  ? 'border-green-200 bg-green-50 text-green-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              <p className="font-medium">
                {importResult.message ||
                  (importResult.success
                    ? 'Vouchers imported successfully.'
                    : 'Unable to import vouchers.')}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
                {typeof importResult.imported_count === 'number' && (
                  <span className="rounded-full bg-green-600 px-2 py-1 text-white">
                    {importResult.imported_count} Imported
                  </span>
                )}
                {typeof importResult.failed_count === 'number' &&
                  importResult.failed_count > 0 && (
                    <span className="rounded-full bg-red-600 px-2 py-1 text-white">
                      {importResult.failed_count} Failed
                    </span>
                  )}
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {importResult.errors.slice(0, 5).map((errorText, idx) => (
                    <li key={idx}>{errorText}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>
                      And {importResult.errors.length - 5} more error
                      {importResult.errors.length - 5 > 1 ? 's' : ''}...
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={resetState}
            disabled={isImporting}
          >
            Clear
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isImporting}>
            {isImporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-white" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


