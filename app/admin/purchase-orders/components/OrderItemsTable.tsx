'use client';

import { PackageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/custom/DataTable';
import { PurchaseOrderItemDetail } from '@/lib/redux/features';
import { createOrderItemsColumns } from './orderItemsColumns';

interface OrderItemsTableProps {
  items?: PurchaseOrderItemDetail[];
}

export const OrderItemsTable = ({ items }: OrderItemsTableProps) => {
  const columns = createOrderItemsColumns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageIcon className="h-5 w-5" />
          Order Items
        </CardTitle>
        <CardDescription>
          {items && items.length > 0
            ? `${items.length} item${items.length > 1 ? 's' : ''} in this order`
            : 'Items in this purchase order'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <DataTable columns={columns} data={items} />
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No items found in this order
          </p>
        )}
      </CardContent>
    </Card>
  );
};

