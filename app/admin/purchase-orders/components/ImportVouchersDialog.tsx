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
import { toast } from 'react-toastify';

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
  const [manualVouchers, setManualVouchers] = useState<Record<number, string>>({});
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
      // Filter items with internal supplier type only
      const internalItems = order.items.filter(
        (item) => (item.digital_product as any)?.supplier?.type?.toLowerCase() === 'internal'
      );

      if (internalItems.length === 0) {
        return order.order_number;
      }

      const productNames = internalItems
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
          : `${productNames[0]} + ${internalItems.length - 1} more`;

      return `${order.order_number} • ${productText}`;
    }
    return order.order_number;
  }, [order.order_number, order.items]);

  const totalQuantity = useMemo(() => {
    if (order.items && order.items.length > 0) {
      // Only count items with internal supplier type
      return order.items
        .filter((item) => (item.digital_product as any)?.supplier?.type?.toLowerCase() === 'internal')
        .reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  }, [order.items]);

  // Get internal supplier products with their quantities
  const internalProducts = useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return [];
    }

    const internalItems = order.items.filter(
      (item) => (item.digital_product as any)?.supplier?.type?.toLowerCase() === 'internal'
    );

    // Group by product ID and sum quantities
    const productMap = new Map<
      number,
      {
        id: number;
        name: string;
        quantity: number;
        sku?: string;
      }
    >();

    internalItems.forEach((item) => {
      const productId = item.digital_product_id;
      const product = item.digital_product;

      if (productId && product) {
        const existing = productMap.get(productId);
        if (existing) {
          existing.quantity += item.quantity || 0;
        } else {
          productMap.set(productId, {
            id: productId,
            name: product.name || `Product ${productId}`,
            quantity: item.quantity || 0,
            sku: product.sku,
          });
        }
      }
    });

    return Array.from(productMap.values());
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

  // Validate that all internal products have voucher codes
  const validateManualVouchers = useCallback((): { valid: boolean; error?: string } => {
    if (internalProducts.length === 0) {
      return { valid: false, error: 'No internal supplier products found in this order.' };
    }

    for (const product of internalProducts) {
      const vouchersText = manualVouchers[product.id] || '';
      if (!vouchersText.trim()) {
        return {
          valid: false,
          error: `Please enter voucher codes for "${product.name}".`,
        };
      }

      try {
        const codes = parseVoucherCodes(vouchersText);
        if (codes.length === 0) {
          return {
            valid: false,
            error: `Please enter at least one voucher code for "${product.name}".`,
          };
        }
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : 'Invalid voucher codes format.',
        };
      }
    }

    return { valid: true };
  }, [internalProducts, manualVouchers, parseVoucherCodes]);

  const resetState = useCallback(() => {
    clearSelectedFile();
    setManualVouchers({});
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
    (productId: number, value: string) => {
      setManualVouchers((prev) => ({
        ...prev,
        [productId]: value,
      }));
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
      } else {
        // Validate manual vouchers for all products
        const validation = validateManualVouchers();
        if (!validation.valid) {
          setValidationError(validation.error ?? 'Please complete all required fields.');
          return;
        }

        // Collect voucher codes as flat array with product IDs
        const voucherCodes: Array<{
          code: string;
          digitalProductID: number;
        }> = [];
        
        for (const product of internalProducts) {
          const vouchersText = manualVouchers[product.id] || '';
          try {
            const codes = parseVoucherCodes(vouchersText);
            if (codes.length > 0) {
              // Add each code with its product ID
              codes.forEach((code) => {
                voucherCodes.push({
                  code,
                  digitalProductID: product.id,
                });
              });
            }
          } catch (error) {
            setValidationError(
              error instanceof Error
                ? `Error processing codes for "${product.name}": ${error.message}`
                : `Failed to process voucher codes for "${product.name}".`
            );
            return;
          }
        }

        if (voucherCodes.length === 0) {
          setValidationError('No voucher codes found. Please enter voucher codes for all products.');
          return;
        }

        // Use store vouchers endpoint for manual codes with product IDs
        result = await storeVouchers({
          purchase_order_id: order.id,
          voucher_codes: voucherCodes,
        }).unwrap();
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
      if (isSuccess)
        toast.success(result.message || "Vouchers imported successfully");

    } catch (error) {
      setImportResult({
        error: true,
        message: 'Failed to import vouchers. Please try again.',
      });
      toast.error('Failed to import vouchers');
    }
  }, [
    importVouchers,
    internalProducts,
    manualVouchers,
    onSuccess,
    order.id,
    parseVoucherCodes,
    resetState,
    selectedFile,
    storeVouchers,
    validateFile,
    validateManualVouchers,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <UploadIcon className="mr-2 h-4 w-4" />
          Import Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Import Vouchers</DialogTitle>
          <DialogDescription>
            Upload voucher codes for {purchaseOrderLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <div className="space-y-5 px-1">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="voucher-file">Vouchers File </Label>
              <a
                href="/sample-csv/sample_vouchers.csv"
                download
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Download sample CSV
              </a>
            </div>
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

          {internalProducts.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-1 sticky top-0 bg-background z-10 pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Enter Voucher Codes Manually</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {internalProducts.length} product{internalProducts.length !== 1 ? 's' : ''} • All must have voucher codes
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {internalProducts.filter((p) => (manualVouchers[p.id] || '').trim()).length}
                    </span>
                    {' / '}
                    <span className="font-medium text-foreground">{internalProducts.length}</span>
                    {' completed'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2.5">
                {internalProducts.map((product, index) => {
                  const productVouchers = manualVouchers[product.id] || '';
                  const hasVouchers = productVouchers.trim().length > 0;
                  let codeCount = 0;
                  if (hasVouchers) {
                    try {
                      codeCount = parseVoucherCodes(productVouchers).length;
                    } catch {
                      codeCount = 0;
                    }
                  }
                  
                  return (
                    <div
                      key={product.id}
                      className={`relative rounded-lg border-2 transition-all ${
                        hasVouchers
                          ? 'border-green-300 bg-green-50/80 shadow-sm'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="p-3 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {index + 1}
                              </span>
                              <Label 
                                htmlFor={`manual-vouchers-${product.id}`} 
                                className="text-sm font-semibold text-gray-900 truncate"
                              >
                                {product.name}
                              </Label>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 ml-7">
                              {product.sku && (
                                <span className="inline-flex items-center gap-1">
                                  <span className="font-medium">SKU:</span>
                                  <span className="font-mono">{product.sku}</span>
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <span className="font-medium">Qty:</span>
                                <span className="text-gray-900">{product.quantity}</span>
                              </span>
                            </div>
                          </div>
                          {hasVouchers && (
                            <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1">
                              <svg
                                className="h-3.5 w-3.5 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-xs font-semibold text-green-700">
                                {codeCount}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <Textarea
                            id={`manual-vouchers-${product.id}`}
                            placeholder={`Enter ${product.quantity} voucher code${product.quantity > 1 ? 's' : ''}, one per line...`}
                            value={productVouchers}
                            onChange={(e) => handleManualVouchersChange(product.id, e.target.value)}
                            disabled={isImporting || isStoring}
                            rows={internalProducts.length > 3 ? 3 : 4}
                            className={`font-mono text-xs resize-none transition-colors ${
                              hasVouchers
                                ? 'border-green-200 focus:border-green-400 focus:ring-green-200'
                                : 'border-gray-200'
                            }`}
                          />
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-muted-foreground">
                              One code per line
                            </p>
                            {hasVouchers && (
                              <p className={`font-medium ${
                                codeCount >= product.quantity
                                  ? 'text-green-600'
                                  : 'text-amber-600'
                              }`}>
                                {codeCount} / {product.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Note:</span> File upload takes precedence if both file and manual codes are provided.
                </p>
              </div>
            </div>
          )}

          {internalProducts.length === 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <p className="font-medium">No Internal Supplier Products</p>
              <p className="mt-1">
                This purchase order does not contain any products from internal suppliers. 
                Manual voucher entry is only available for internal supplier products.
              </p>
            </div>
          )}

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
        </div>

        <DialogFooter className="shrink-0 border-t pt-4 mt-4">
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
              (!selectedFile && 
               (internalProducts.length === 0 || 
                !internalProducts.every((p) => (manualVouchers[p.id] || '').trim()))) ||
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


