'use client';

import { useCallback, useState } from 'react';
import { ClipboardIcon, ClipboardCheckIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PurchaseOrder } from '@/lib/redux/features';
import { formatDate } from './orderColumns';

interface PurchaseOrderVouchersCardProps {
  vouchers?: PurchaseOrder['vouchers'];
}

export const PurchaseOrderVouchersCard = ({
  vouchers = [],
}: PurchaseOrderVouchersCardProps) => {
  const [copiedVoucherId, setCopiedVoucherId] = useState<number | null>(null);

  const handleCopy = useCallback(async (code: string, voucherId: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedVoucherId(voucherId);
      setTimeout(() => setCopiedVoucherId(null), 2000);
    } catch (error) {
      console.error('Failed to copy voucher code:', error);
    }
  }, []);

  const hasVouchers = vouchers.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voucher Codes</span>
          {hasVouchers && (
            <span className="text-sm font-medium text-muted-foreground">
              {vouchers.length} total
            </span>
          )}
        </CardTitle>
        <CardDescription>
          All vouchers imported for this purchase order.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto">
        {!hasVouchers ? (
          <p className="text-sm text-muted-foreground">
            No vouchers have been imported for this purchase order yet.
          </p>
        ) : (
          <div className="space-y-3">
            {vouchers.map((voucher) => {
              const isCopied = copiedVoucherId === voucher.id;
              return (
                <div
                  key={voucher.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold tracking-wide">
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
                    className="w-full sm:w-auto"
                    onClick={() => handleCopy(voucher.code, voucher.id)}
                  >
                    {isCopied ? (
                      <>
                        <ClipboardCheckIcon className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="mr-2 h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


