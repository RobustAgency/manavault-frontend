import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DigitalProduct, DigitalProductStatus } from '@/lib/redux/features';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';
import { DigitalDiscountCell } from './DigitalDiscountCell';

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
  canEdit: boolean;
  canDelete: boolean;
  onUpdateDiscount?: (product: DigitalProduct, value: string) => void | Promise<void>;
  savingDiscountId?: number | null;
}

export const createDigitalProductColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  onUpdateDiscount,
  savingDiscountId,
}: DigitalProductColumnsProps): ColumnDef<DigitalProduct>[] => [
    {
      accessorKey: 'name',
      header: 'Name',
    },
      {
      accessorKey: 'supplier_name',
      header: 'Supplier',
      cell: ({ row }) => row.original.supplier_name || '-',
    },
    {
      accessorKey: 'regions',
      header: 'Region',
      cell: ({ row }) => {
        const region = row.original.region;
        if (!region || region.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant="outlined" className="text-xs">
              +{region}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => row.original.brand || '-',
    },
    {
      accessorKey: 'face_value',
      header: 'Face Value',
      cell: ({ row }) => formatCurrency(Number(row.original.face_value), row.original.currency),
    },
    {
      accessorKey: 'cost_price',
      header: 'Cost Price',
      cell: ({ row }) => formatCurrency(Number(row.original.cost_price), row.original.currency),
    },
    {
      accessorKey: 'cost_price_discount',
      header: 'Cost Price (%)',
      cell: ({ row }) => Number(row.original.cost_price_discount) + '%',
    },


    {
      accessorKey: 'selling_discount',
      header: 'Selling Discount (%)',
      cell: ({ row }) => (
        <DigitalDiscountCell
          product={row.original}
          canEdit={canEdit}
          onUpdateDiscount={onUpdateDiscount}
          savingDiscountId={savingDiscountId}
        />
      ),
    },
    {
      accessorKey: 'selling_price',
      header: 'Selling Price',
      cell: ({ row }) => formatCurrency(Number(row.original.selling_price), row.original.currency),
    },
    {
      accessorKey: 'profit_margin',
      header: 'Profit Margin',
      cell: ({ row }) => Number(row.original.profit_margin) + '%',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => {
        const quantity = row.original.quantity;
        if (quantity === null || quantity === undefined || quantity === '') return '-';
        const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
        return isNaN(numQuantity) ? '-' : numQuantity.toString();
      },
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags = row.original.tags;
        if (!tags || tags.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {Array.isArray(tags) && tags.slice(0, 3).map((tag, idx) => (
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isExternal = row.original.supplier_type === 'external';

        return (
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
            {!isExternal && (
              <>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];
