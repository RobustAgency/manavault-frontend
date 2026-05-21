'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type SaleOrderCodesApiResponse,
  useGetSaleOrderCodesQuery,
} from '@/lib/redux/features/salesOrdersApi';
import type { SaleOrderGiftCodeRow, GiftCodesDialogProps } from '@/types';
import { copyText } from '@/utils/copyText';

type Step = 'list' | 'detail';



export function GiftCodesDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
  onDownloadZip,
  isDownloading = false,
}: GiftCodesDialogProps) {
  const [step, setStep] = useState<Step>('list');
  const [selected, setSelected] = useState<SaleOrderGiftCodeRow | null>(null);

  const {
    data: codesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSaleOrderCodesQuery(orderId, {
    skip: !orderId || !open,
  });

  const items = useMemo(() => {
    const body = codesResponse as SaleOrderCodesApiResponse | undefined;
    const raw = body?.data;
    if (!Array.isArray(raw)) return [] as SaleOrderGiftCodeRow[];
    return raw as SaleOrderGiftCodeRow[];
  }, [codesResponse]);

  useEffect(() => {
    if (open) {
      setStep('list');
      setSelected(null);
    }
  }, [open, orderId]);

  const allCodesText = useMemo(
    () =>
      items
        .flatMap((row) => row.voucher_codes.map((v) => v.code_value))
        .filter(Boolean)
        .join('\n'),
    [items]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const openDetail = useCallback((row: SaleOrderGiftCodeRow) => {
    setSelected(row);
    setStep('detail');
  }, []);

  const goBack = useCallback(() => {
    setStep('list');
    setSelected(null);
  }, []);

  const copyAllVisible = useCallback(async () => {
    const text =
      step === 'detail' && selected
        ? selected.voucher_codes.map((v) => v.code_value).filter(Boolean).join('\n')
        : allCodesText;
    if (!text.trim()) {
      toast.error('No codes to copy');
      return;
    }
    await copyText(text, 'Codes copied to clipboard');
  }, [step, selected, allCodesText]);

  const errMessage =
    isError && error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { message?: string } }).data?.message ?? '')
      : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-[520px] gap-0 overflow-hidden p-0"
      >
        <div className="p-6 pb-4">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-xl font-semibold">
              Gift Codes
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Order {orderNumber}
            </p>
          </DialogHeader>

          {step === 'detail' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto px-6">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading codes…</span>
            </div>
          )}

          {!isLoading && isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errMessage || 'Failed to load gift codes.'}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && step === 'list' && (
            <ul className="flex flex-col gap-3 pb-2">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No gift codes found for this order.
                </p>
              )}
              {items.map((row) => (
                <li
                  key={row.sale_order_item_id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-foreground pr-2">
                    {row.product_name}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openDetail(row)}
                      className="gap-1.5"
                    >
                      <Eye className="h-4 w-4" />
                      View Codes
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !isError && step === 'detail' && selected && (
            <div className="flex flex-col gap-3 pb-2">
              {selected.voucher_codes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No codes for this product.
                </p>
              ) : (
                selected.voucher_codes.map((v, i) => (
                  <div
                    key={`${v.code_value}-${i}`}
                    className="flex items-center gap-2 rounded-md border border-border bg-muted/30 pl-3 pr-1 py-1"
                  >
                    <Input
                      readOnly
                      value={v.code_value}
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => copyText(v.code_value, 'Code copied')}
                      aria-label="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              loading={isDownloading}
              disabled={isDownloading}
              onClick={() =>
                onDownloadZip(
                  step === 'detail' && selected ? selected.product_id : null
                )
              }
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download ZIP
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => void copyAllVisible()}
            >
              Copy All Codes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
