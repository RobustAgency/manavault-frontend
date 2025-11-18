import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DigitalProduct, DigitalProductStatus } from '@/lib/redux/features';
import Link from 'next/link';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusColor = (status: DigitalProductStatus): 'success' | 'default' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'default';
    default:
      return 'default';
  }
};

interface DigitalProductColumnsProps {
  onEdit: (product: DigitalProduct) => void;
  onDelete: (product: DigitalProduct) => void;
}

export const createDigitalProductColumns = ({
  onEdit,
  onDelete,
}: DigitalProductColumnsProps): ColumnDef<DigitalProduct>[] => [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.sku}</code>,
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => row.original.brand || '-',
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier?.name || '-',
    },
    {
      accessorKey: 'cost_price',
      header: 'Cost Price',
      cell: ({ row }) => formatCurrency(row.original.cost_price),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags || tags.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="outlined" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outlined" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'regions',
      header: 'Regions',
      cell: ({ row }) => {
        const regions = row.original.regions;
        if (!regions || regions.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {regions.slice(0, 3).map((region, idx) => (
              <Badge key={idx} variant="outlined" className="text-xs">
                {region}
              </Badge>
            ))}
            {regions.length > 3 && (
              <Badge variant="outlined" className="text-xs">
                +{regions.length - 3}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="filled" color={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/admin/digital-stock/${row.original.id}`}>
              <EyeIcon className="h-4 w-4" />
            </Link>
          </Button>
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

