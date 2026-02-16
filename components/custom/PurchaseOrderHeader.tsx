'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImportVouchersDialog } from '@/app/admin/purchase-orders/components';
import { SalesOrderDetails } from '@/lib/redux/features/salesOrdersApi';
import { PurchaseOrder } from '@/types';

interface PurchaseOrderHeaderProps {
  // either purchase order or sales order
  orderType: 'purchase' | 'sales';
  order: PurchaseOrder | SalesOrderDetails;
  isExternalSupplier?: boolean;
  onRefetch: () => void;
}

export const PurchaseOrderHeader = ({
  orderType,
  order,
  isExternalSupplier,
  onRefetch,
}: PurchaseOrderHeaderProps) => {
  const router = useRouter();

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outlined';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'completed' || lowerStatus === 'active') return 'filled';
    if (lowerStatus === 'inactive' || lowerStatus === 'in_active') return 'outlined';
    return 'outlined';
  };

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to {orderType === 'purchase' ? 'Purchase Orders' : 'Sales Orders'}
      </Button>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{orderType === 'purchase' ? 'Purchase Order Details' : 'Sales Order Details'}</h1>
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
        {isExternalSupplier !== undefined && !isExternalSupplier && (
          <ImportVouchersDialog order={order as PurchaseOrder} onSuccess={onRefetch} />
        )}
      </div>
    </div>
  );
};

