'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderSummaryCard } from '@/components/custom/OrderSummary';
import { OrderItemsTable } from '@/components/custom/OrderItemsTable';
import { PurchaseOrderHeader } from '@/components/custom/PurchaseOrderHeader';
import { useGetSalesOrderQuery } from '@/lib/redux/features/salesOrdersApi';
import { createOrderItemsColumns } from '../components/createOrderItemColumns';

export default function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const orderId = parseInt(id, 10);

  const {
    data: order,
    isLoading,
    error,
    refetch: refetchOrder,
  } = useGetSalesOrderQuery(orderId, {
    skip: !orderId || isNaN(orderId),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error ? 'Failed to load sales order details' : 'Sales order not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PurchaseOrderHeader
        orderType='sales'
        order={order}
        onRefetch={() => refetchOrder()}
      />

      <div className="grid gap-6">
        <OrderSummaryCard type='sales' order={order} />
        <OrderItemsTable type='sales' items={order.items} createOrderItemsColumns={createOrderItemsColumns} />
      </div>
    </div>
  );
}
