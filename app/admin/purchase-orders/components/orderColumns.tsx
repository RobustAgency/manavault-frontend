import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrder } from '@/lib/redux/features';
import Link from 'next/link';
import SupplierToolTip from './SupplierToolTip';

export const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status?: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  if (!status) return 'default';
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === 'completed') return 'success';
  if (lowerStatus === 'pending') return 'warning';
  if (lowerStatus === 'processing') return 'info';
  if (lowerStatus === 'cancelled') return 'error';

  return 'default';
};

interface OrderColumnsProps {
  onView?: (orderId: number) => void; // Optional, for backward compatibility
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="filled" color={getStatusColor(row.original.status)} className="capitalize">
        {row.original.status || '-'}
      </Badge>
    ),
  },
  {
    accessorKey: 'total_amount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const totalAmount = row.original.total_amount;
      if (totalAmount == null || isNaN(totalAmount)) {
        // Fallback: use total_price if total_amount is not available
        const totalPrice = parseFloat(row.original.total_price || '0');
        return <span className="font-semibold">{formatCurrency(totalPrice)}</span>;
      }
      return <span className="font-semibold">{formatCurrency(totalAmount)}</span>;
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.created_at),
  },
    {
    accessorKey: 'suppliers',
    header: 'Suppliers',
     cell: ({ row }) => {
  const suppliers = row.original.suppliers || []
  const defaultSuppliers = 2;

  return (
    <div className="flex gap-2 flex-wrap">
      {suppliers.slice(0,defaultSuppliers).map((s) => (
        <span key={s.id} className="px-2 py-1 text-xs bg-muted rounded">
          {s.name}
        </span>
      ))}

      {suppliers.length > defaultSuppliers && <>
      <span className="px-2 py-1 text-xs bg-muted rounded">
        <SupplierToolTip suppliersCount={suppliers.slice(defaultSuppliers).length} suppliers={suppliers.map((s) => s.name)} defaultSuppliers={defaultSuppliers} />
        </span>
        </>
     }
    </div>
  )
}
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <Link href={`/admin/purchase-orders/${row.original.id}`}>
          <EyeIcon className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

