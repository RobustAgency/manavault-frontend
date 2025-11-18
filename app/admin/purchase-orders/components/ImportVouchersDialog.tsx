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
import { Textarea } from '@/components/ui/textarea';
import {
  ImportVouchersResponse,
  PurchaseOrder,
  useImportVouchersMutation,
  useStoreVouchersMutation,
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
  const [manualVouchers, setManualVouchers] = useState<string>('');
  const [importResult, setImportResult] =
    useState<ImportVouchersResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importVouchers, { isLoading: isImporting }] =
    useImportVouchersMutation();
  const [storeVouchers, { isLoading: isStoring }] =
    useStoreVouchersMutation();

  const purchaseOrderLabel = useMemo(() => {
    if (order.items && order.items.length > 0) {
      const productNames = order.items
        .map((item) => item.digital_product?.name || `Product ${item.digital_product_id}`)
        .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
        .slice(0, 2); // Show max 2 product names

      if (productNames.length === 0) {
        return order.order_number;
      }

      const productText = productNames.length === 1
        ? productNames[0]
        : productNames.length === 2
          ? `${productNames[0]}, ${productNames[1]}`
          : `${productNames[0]} + ${order.items.length - 1} more`;

      return `${order.order_number} • ${productText}`;
    }
    return order.order_number;
  }, [order.order_number, order.items]);

  const totalQuantity = useMemo(() => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  }, [order.items]);

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

  const parseVoucherCodes = useCallback((text: string): string[] => {
    // Clean up the text - remove extra whitespace and empty lines
    const codes = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (codes.length === 0) {
      throw new Error('No voucher codes found in the text.');
    }

    return codes;
  }, []);

  const resetState = useCallback(() => {
    clearSelectedFile();
    setManualVouchers('');
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

  const handleManualVouchersChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setManualVouchers(event.target.value);
      setValidationError(null);
      setImportResult(null);
    },
    []
  );

  const handleImport = useCallback(async () => {
    try {
      setValidationError(null);
      let result: ImportVouchersResponse;

      // Prioritize file upload over manual entry
      if (selectedFile) {
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
          setValidationError(validation.error ?? 'Invalid file selected.');
          return;
        }

        // Use file import endpoint
        result = await importVouchers({
          file: selectedFile,
          purchase_order_id: order.id,
        }).unwrap();
      } else if (manualVouchers.trim()) {
        // Parse and send voucher codes directly
        try {
          const voucher_codes = parseVoucherCodes(manualVouchers);

          // Use store vouchers endpoint for manual codes
          result = await storeVouchers({
            purchase_order_id: order.id,
            voucher_codes,
          }).unwrap();
        } catch (error) {
          setValidationError(
            error instanceof Error
              ? error.message
              : 'Failed to process voucher codes. Please check your input.'
          );
          return;
        }
      } else {
        setValidationError(
          'Please either upload a file or enter voucher codes manually.'
        );
        return;
      }

      const isSuccess = result?.error === false;

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
        error: true,
        message:
          result?.message ||
          'Failed to import vouchers. Please try again.',
      });
    } catch (error) {
      console.error('Failed to import vouchers:', error);
      setImportResult({
        error: true,
        message: 'Failed to import vouchers. Please try again.',
      });
    }
  }, [
    importVouchers,
    manualVouchers,
    order.id,
    parseVoucherCodes,
    selectedFile,
    storeVouchers,
    validateFile,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <UploadIcon className="mr-2 h-4 w-4" />
          Import Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
              <span className="font-medium">{totalQuantity} units</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voucher-file">Vouchers File</Label>
            <Input
              ref={fileInputRef}
              id="voucher-file"
              type="file"
              accept=".csv,.xlsx,.xls,.zip"
              onChange={handleFileChange}
              disabled={isImporting || isStoring}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: CSV, XLSX, XLS, ZIP (max 10MB)
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-vouchers">
              Enter Voucher Codes Manually
            </Label>
            <Textarea
              id="manual-vouchers"
              placeholder="Enter voucher codes, one per line."
              value={manualVouchers}
              onChange={handleManualVouchersChange}
              disabled={isImporting || isStoring}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter one voucher code per line. File upload takes precedence if
              both are provided.
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
                disabled={isImporting || isStoring}
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
              className={`rounded-md border px-4 py-3 text-sm ${importResult.error === false
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-red-200 bg-red-50 text-red-900'
                }`}
            >
              <p className="font-medium">
                {importResult.message ||
                  (importResult.error === false
                    ? 'Vouchers imported successfully.'
                    : 'Unable to import vouchers.')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={resetState}
            disabled={isImporting || isStoring}
          >
            Clear
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              (!selectedFile && !manualVouchers.trim()) ||
              isImporting ||
              isStoring
            }
          >
            {isImporting || isStoring ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-white" />
                {isImporting ? 'Uploading...' : 'Storing...'}
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


