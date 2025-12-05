import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, ProductStatus } from '@/lib/redux/features';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusColor = (status: ProductStatus): 'success' | 'default' | 'warning' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'in_active':
      return 'default';
    case 'archived':
      return 'warning';
    default:
      return 'default';
  }
};

interface ProductColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const createProductColumns = ({ onEdit, onDelete }: ProductColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        href={`/admin/products/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
    cell: ({ row }) => {
      const brand = row.original.brand;
      if (!brand) return '-';
      return typeof brand === 'string' ? brand : brand.name;
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.sku}</code>,
  },
  {
    accessorKey: 'selling_price',
    header: 'Selling Price',
    cell: ({ row }) => formatCurrency(row.original.selling_price),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="filled" color={getStatusColor(row.original.status)}>
        {row.original.status.replace('_', ' ')}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/admin/products/${row.original.id}`}>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
            <EyeIcon className="h-4 w-4" />
        </Button>
          </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.original)}
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];

