'use client';

import { useCallback, useState } from 'react';
import { Download, Gift } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useDownloadSaleOrderCodesMutation } from '@/lib/redux/features/salesOrdersApi';
import { GiftCodesDialog } from './gift-codes-dialog';

interface SalesOrderGiftCodesActionsProps {
  orderId: number;
  orderNumber: string;
}

export function SalesOrderGiftCodesActions({
  orderId,
  orderNumber,
}: SalesOrderGiftCodesActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadSaleOrderCodes, { isLoading: isDownloading }] =
    useDownloadSaleOrderCodesMutation();

  const downloadZip = useCallback(
    async (productId?: number | null) => {
      try {
        const suffix =
          productId != null && productId > 0 ? `-product-${productId}` : '';
        const filename = `gift-codes-${orderNumber}${suffix}.zip`;
        await downloadSaleOrderCodes({
          saleOrderId: orderId,
          productId: productId ?? null,
          filename,
        }).unwrap();
        toast.success('Download started');
      } catch {
        toast.error('Failed to download gift codes');
      }
    },
    [downloadSaleOrderCodes, orderId, orderNumber]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="default"
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <Gift className="h-4 w-4" />
        View codes
      </Button>
      <GiftCodesDialog
        orderId={orderId}
        orderNumber={orderNumber}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDownloadZip={downloadZip}
        isDownloading={isDownloading}
      />
    </div>
  );
}
