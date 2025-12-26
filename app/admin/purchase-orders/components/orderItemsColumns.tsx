import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrderItemDetail } from '@/lib/redux/features';
import { formatCurrency } from '@/utils/formatCurrency';

export const createOrderItemsColumns = (): ColumnDef<PurchaseOrderItemDetail>[] => [
  
  {
    accessorKey: 'digital_product.name',
    header: 'Product Name',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {item.digital_product?.name || `Product ${item.digital_product_id}`}
            </span>
            {item.digital_product?.status && (
              <Badge variant="outlined" className="text-xs">
                {item.digital_product.status}
              </Badge>
            )}
          </div>
          {item.digital_product?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {item.digital_product.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'digital_product.sku',
    header: 'SKU',
    cell: ({ row }) => {
      const sku = row.original.digital_product?.sku;
      return (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {sku || '-'}
        </code>
      );
    },
  },
  {
    accessorKey: 'digital_product.brand',
    header: 'Brand',
    cell: ({ row }) => row.original.digital_product?.brand || '-',
  },
  {
    id: 'supplier',
    header: 'Supplier',
    cell: ({ row }) => {
      const supplier = (row.original.digital_product as any)?.supplier;
      if (!supplier) return '-';
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{supplier.name}</span>
          {supplier.type && (
            <Badge variant="outlined" className="text-xs capitalize">
              {supplier.type}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-center font-semibold">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: 'unit_cost',
    header: () => <div className="text-center">Unit Cost</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {formatCurrency(parseFloat(row.original.unit_cost || '0'), row.original.currency ?? null)}
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

