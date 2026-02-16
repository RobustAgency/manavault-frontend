import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { SalesOrderDetails } from '@/lib/redux/features/salesOrdersApi';

export const createOrderItemsColumns = (): ColumnDef<SalesOrderDetails['items'][number]>[] => [
  
  {
    accessorKey: 'digital_products.name',
    header: 'Product Name',
    cell: ({ row }) => {
      const item = row.original;
      console.log(item)
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {item.product?.name || '-'}
            </span>
            {item.product?.status && (
              <Badge variant="outlined" className="text-xs">
                {item.product.status}
              </Badge>
            )}
          </div>
          {item.product?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {item.product?.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'digital_products.sku',
    header: 'SKU',
    cell: ({ row }) => {
      const sku = row.original.product?.sku;
      return (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {sku || '-'}
        </code>
      );
    },
  },
  {
    accessorKey: 'digital_products.brand',
    header: 'Brand',
    cell: ({ row }) => row.original.product?.brand || '-',
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-center font-semibold">{row.original.quantity}</div>
    ),
  },
    {
    accessorKey: 'unit_price',
    header: () => <div className="text-center">Unit Price</div>,
    cell: ({ row }) => (
      <div className="text-center font-bold text-primary">
        {formatCurrency(parseFloat(row.original.unit_price || '0'))}
      </div>
    ),
  },
 
  {
    accessorKey: 'subtotal',
    header: () => <div className="text-center">Subtotal</div>,
    cell: ({ row }) => (
      <div className="text-center font-bold text-primary">
        {formatCurrency(parseFloat(row.original.subtotal || '0'))}
      </div>
    ),
  },
];

