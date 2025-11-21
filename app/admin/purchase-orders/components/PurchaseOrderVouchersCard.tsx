'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Voucher } from '@/lib/redux/features';
import { useGetVouchersQuery } from '@/lib/redux/features';
import { formatDate } from './orderColumns';
import { VoucherCodeDialog } from '@/components/admin/vouchers/VoucherCodeDialog';

interface PurchaseOrderVouchersCardProps {
  purchaseOrderId: number;
  isExternalSupplier?: boolean;
}

const EXTERNAL_SUPPLIER_RETRY_INTERVAL_MS = 30_000;
const EXTERNAL_SUPPLIER_MAX_RETRIES = 5;
const DEFAULT_PAGE_SIZE = 10;

export const PurchaseOrderVouchersCard = ({
  purchaseOrderId,
  isExternalSupplier = false,
}: PurchaseOrderVouchersCardProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasRetryFailure, setHasRetryFailure] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const shouldFetch = Number.isFinite(purchaseOrderId) && purchaseOrderId > 0;
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetVouchersQuery(
    { purchase_order_id: purchaseOrderId, page, per_page: DEFAULT_PAGE_SIZE },
    { skip: !shouldFetch }
  );

  const remoteVouchers = data?.vouchers ?? [];
  const pagination = data?.pagination;
  const totalEntries = pagination?.total ?? remoteVouchers.length;
  const totalPages = Math.max(pagination?.lastPage ?? 1, 1);
  const currentPage = pagination?.currentPage ?? page;
  const startEntry =
    pagination?.from ??
    (remoteVouchers.length ? (currentPage - 1) * DEFAULT_PAGE_SIZE + 1 : 0);
  const endEntry =
    pagination?.to ??
    (remoteVouchers.length ? startEntry + remoteVouchers.length - 1 : 0);
  const vouchers: Voucher[] = useMemo(() => remoteVouchers, [remoteVouchers]);

  const hasVouchers = vouchers.length > 0;
  const isLoadingState = isLoading || isFetching;
  const isAutoRetrying =
    isExternalSupplier &&
    shouldFetch &&
    !isError &&
    !hasRetryFailure &&
    data !== undefined &&
    remoteVouchers.length === 0 &&
    page === 1 &&
    retryCount < EXTERNAL_SUPPLIER_MAX_RETRIES;
  const shouldAttemptAutoRetry =
    isExternalSupplier &&
    shouldFetch &&
    !isLoadingState &&
    !isError &&
    !hasRetryFailure &&
    data !== undefined &&
    remoteVouchers.length === 0 &&
    page === 1;

  useEffect(() => {
    setPage(1);
  }, [purchaseOrderId]);

  useEffect(() => {
    setRetryCount(0);
    setHasRetryFailure(false);
  }, [purchaseOrderId, isExternalSupplier, page]);

  useEffect(() => {
    if (!isExternalSupplier) {
      return;
    }

    if (remoteVouchers.length > 0) {
      if (retryCount !== 0) {
        setRetryCount(0);
      }
      if (hasRetryFailure) {
        setHasRetryFailure(false);
      }
      return;
    }

    if (!shouldAttemptAutoRetry) {
      if (
        isExternalSupplier &&
        data !== undefined &&
        remoteVouchers.length === 0 &&
        retryCount >= EXTERNAL_SUPPLIER_MAX_RETRIES &&
        !hasRetryFailure
      ) {
        setHasRetryFailure(true);
      }
      return;
    }

    if (retryCount >= EXTERNAL_SUPPLIER_MAX_RETRIES) {
      if (!hasRetryFailure) {
        setHasRetryFailure(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setRetryCount((count) => {
        if (count >= EXTERNAL_SUPPLIER_MAX_RETRIES) {
          return count;
        }
        refetch();
        return count + 1;
      });
    }, EXTERNAL_SUPPLIER_RETRY_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [
    data,
    hasRetryFailure,
    isExternalSupplier,
    remoteVouchers.length,
    retryCount,
    shouldAttemptAutoRetry,
    refetch,
  ]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setHasRetryFailure(false);
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentPage > 1) {
        setPage(currentPage - 1);
      }
      if (direction === 'next' && currentPage < totalPages) {
        setPage(currentPage + 1);
      }
    },
    [currentPage, totalPages]
  );

  const handleViewVoucher = useCallback((voucherId: number) => {
    setSelectedVoucherId(voucherId);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedVoucherId(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voucher Codes</span>
          {totalEntries > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              {totalEntries.toLocaleString()} total
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isExternalSupplier
            ? 'Vouchers are synced automatically for external suppliers.'
            : 'All vouchers imported for this purchase order.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isLoadingState || isAutoRetrying) && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={`voucher-skeleton-${index}`}
                  className="h-16 animate-pulse rounded-lg border border-dashed border-border/40 bg-muted"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {isAutoRetrying ? (
                <span>
                  Syncing vouchers from the supplier…
                </span>
              ) : (
                <span>Fetching vouchers…</span>
              )}
            </div>
          </div>
        )}
        {!isLoadingState && isError && (
          <div className="flex flex-col items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>We couldn&apos;t load vouchers right now. Please try again.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Retry
            </Button>
          </div>
        )}
        {!isLoadingState &&
          !isError &&
          !hasRetryFailure &&
          !isExternalSupplier &&
          !hasVouchers ? (
          <p className="text-sm text-muted-foreground">
            No vouchers have been imported for this purchase order yet.
          </p>
        ) : null}
        {!isLoadingState && !isError && hasRetryFailure && isExternalSupplier && !hasVouchers ? (
          <div className="flex flex-col items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium text-amber-900">
              We couldn&apos;t retrieve vouchers for this purchase order automatically.
            </p>
            <p className="text-xs text-amber-700">
              Please try again later or contact support to confirm the vouchers are ready.
            </p>
            <Button type="button" size="sm" onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        ) : null}
        {!isLoadingState && hasVouchers ? (
          <div className="space-y-3">
            {vouchers.map((voucher) => {
              return (
                <div
                  key={voucher.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p
                      title={voucher.code}
                      className="text-sm font-semibold tracking-wide max-w-lg truncate">
                      {voucher.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added on {formatDate(voucher.created_at)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewVoucher(voucher.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                </div>
              );
            })}
          </div>
        ) : null}
        {!isLoadingState && !isError && totalEntries > 0 ? (
          <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-foreground">{startEntry.toLocaleString()}</span> to{' '}
              <span className="font-medium text-foreground">{endEntry.toLocaleString()}</span> of{' '}
              <span className="font-medium text-foreground">{totalEntries.toLocaleString()}</span> vouchers
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange('prev')}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous page</span>
              </Button>
              <span className="text-xs text-muted-foreground">
                Page{' '}
                <span className="font-medium text-foreground">{currentPage.toLocaleString()}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages.toLocaleString()}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange('next')}
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
      <VoucherCodeDialog
        voucherId={selectedVoucherId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </Card>
  );
};


