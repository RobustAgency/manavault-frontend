import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/lib/redux/features';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface OrderColumnsProps {
  onView: (orderId: number) => void;
}

export const createOrderColumns = ({ onView }: OrderColumnsProps): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: 'order_number',
    header: 'Order Number',
    cell: ({ row }) => (
      <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
        {row.original.order_number}
      </code>
    ),
  },
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.product?.name || '-'}</div>
        {row.original.product?.sku && (
          <code className="text-xs text-muted-foreground">{row.original.product.sku}</code>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
    cell: ({ row }) => row.original.supplier?.name || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <Badge variant="filled" color="info">{row.original.quantity} units</Badge>
    ),
  },
  {
    accessorKey: 'purchase_price',
    header: 'Unit Price',
    cell: ({ row }) => formatCurrency(row.original.purchase_price),
  },
  {
    accessorKey: 'total_amount',
    header: 'Total Amount',
    cell: ({ row }) => (
      <span className="font-semibold">{formatCurrency(row.original.total_amount)}</span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(row.original.id)}
      >
        <EyeIcon className="h-4 w-4" />
      </Button>
    ),
  },
];

