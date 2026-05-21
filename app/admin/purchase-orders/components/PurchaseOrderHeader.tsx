'use client';

import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/lib/redux/features';
import { ImportVouchersDialog } from './ImportVouchersDialog';
import { useUpdatePurchaseOrderMutation } from '@/lib/redux/features/purchaseOrdersApi';
import { toast } from 'react-toastify';

interface PurchaseOrderHeaderProps {
  purchaseOrderId: number;
  order: PurchaseOrder;
  isExternalSupplier: boolean;
}

export const PurchaseOrderHeader = ({
  purchaseOrderId,
  order,
  isExternalSupplier,
}: PurchaseOrderHeaderProps) => {
  const router = useRouter();
  const [updatePurchaseOrder, { isLoading: isUpdatingPurchaseOrder }] = useUpdatePurchaseOrderMutation();

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outlined';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'completed' || lowerStatus === 'active') return 'filled';
    if (lowerStatus === 'inactive' || lowerStatus === 'in_active') return 'outlined';
    return 'outlined';
  };

  const handleSyncPurchaseOrder = () => {
    updatePurchaseOrder(purchaseOrderId).unwrap().then((res) => {
      if (res.error) {
        toast.error(res.message || 'Failed to sync purchase order');
      } else {
        toast.success(res.message || 'Purchase order synced successfully');
      }
    }).catch((err) => {
      toast.error(err.message || 'Failed to sync purchase order');
    });
  };

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Purchase Orders
      </Button>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Purchase Order Details</h1>
            {order.status && (
              <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                {order.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Order Number:{' '}
            <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
              {order.order_number}
            </code>
          </p>
        </div>
        <div className="flex lg:flex-row flex-col gap-4 max-w-sm">
        {!isExternalSupplier && <ImportVouchersDialog order={order} />}
        
        <Button variant="secondary" className="text-white"  onClick={() => handleSyncPurchaseOrder()}>
          {isUpdatingPurchaseOrder ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />  : 'Sync Purchase Order'}
        </Button>
      </div>   

    </div>
    </div>
  );
};
