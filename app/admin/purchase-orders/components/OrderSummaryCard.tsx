'use client';

import { CalendarIcon, DollarSignIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PurchaseOrder } from '@/lib/redux/features';
import { formatDate } from './orderColumns';
import { formatCurrency } from '@/utils/formatCurrency';

interface OrderSummaryCardProps {
  order: PurchaseOrder;
}

export const OrderSummaryCard = ({ order }: OrderSummaryCardProps) => {
  const getTotalQuantity = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getUnitPrice = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    const totalCost = order.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal || '0');
    }, 0);
    const quantity = getTotalQuantity();
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const getTotalAmount = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal || '0');
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSignIcon className="h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>Financial details of this purchase order</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Quantity</p>
            <p className="text-2xl font-bold">{getTotalQuantity()} units</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average Unit Price</p>
            <p className="text-2xl font-bold">{formatCurrency(getUnitPrice(), order.currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(getTotalAmount(), order.currency)}</p>
          </div>
        </div>
        <div className="border-t my-4" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date Created</p>
            <p className="font-medium flex items-center gap-2 mt-1">
              <CalendarIcon className="h-4 w-4" />
              {formatDate(order.created_at)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium flex items-center gap-2 mt-1">
              <CalendarIcon className="h-4 w-4" />
              {formatDate(order.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

