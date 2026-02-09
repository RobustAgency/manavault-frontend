import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';
import { SalesOrderDetails } from '@/lib/redux/features/salesOrdersApi';


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
  if (lowerStatus === 'cancelled') return 'error';

  return 'default';
};

interface OrderColumnsProps {
}

export const createOrderColumns = ({  }: OrderColumnsProps): ColumnDef<SalesOrderDetails>[] => [
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
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => row.original.source || '-',
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
    accessorKey: 'total_price',
    header: 'Total Price',
    cell: ({ row }) => {
      const totalAmount = row.original.total_price;
      return <span className="font-semibold">{formatCurrency(Number(totalAmount), row.original.currency ?? null)}</span>;
    },
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
        <Link href={`/admin/sale-orders/${row.original.id}`}>
          <EyeIcon className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

