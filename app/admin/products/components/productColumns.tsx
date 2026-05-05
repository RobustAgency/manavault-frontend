import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DigitalProduct, Product, ProductStatus } from '@/lib/redux/features';
import { formatCurrency } from '@/utils/formatCurrency';
import { ProductListDiscountCell } from './ProductListDiscountCell';

type CurrencyCode = 'USD' | 'EUR' | 'PKR';

const normalizeCurrency = (currency?: string): CurrencyCode => {
  switch (currency?.toLowerCase()) {
    case 'usd':
      return 'USD';
    case 'eur':
      return 'EUR';
    default:
      return 'USD'; 
  }
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
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onUpdateDiscount?: (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => Promise<void>;
  onUpdateSellingPrice?: (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => Promise<void>;
  savingDiscountId?: number | null;
}

export const createProductColumns = ({
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  onUpdateDiscount,
  onUpdateSellingPrice,
  savingDiscountId,
}: ProductColumnsProps): ColumnDef<Product>[] => {

  const baseColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <>
        <Link href={`/admin/products/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
        </>
      );
    },
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
    accessorKey: 'cost_price',
    header: 'Cost Price',
    cell: ({ row }) => formatCurrency(row.original.digital_product?.cost_price || 0, normalizeCurrency(row.original?.currency)),
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
    cell: ({ row }) => row.original.digital_product?.supplier?.name || '-',
  },
  {
    accessorKey: 'region',
    header: 'Region',
    cell: ({ row }) => {
        const region = row.original.regions;
        if (!region || region.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant="outlined" className="text-xs">
              {region.join(', ')}
            </Badge>
          </div>
        );
      },
    },
  {
    accessorKey: 'selling_discount',
    header: 'Discount',
    cell: ({ row }) => (
      <ProductListDiscountCell
        product={row.original}
        canEdit={canEdit}
        onUpdateDiscount={onUpdateDiscount}
        onUpdateSellingPrice={onUpdateSellingPrice}
        savingDiscountId={savingDiscountId}
      />
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.sku}</code>,
  },
   {
    accessorKey: 'face_value',
    header: 'Face Value',
    cell: ({ row }) => formatCurrency(row.original.face_value, normalizeCurrency(row.original.currency)),
  },
  {
    accessorKey: 'selling_price',
    header: 'Selling Price',
    cell: ({ row }) => formatCurrency(row.original.selling_price, normalizeCurrency(row.original.currency)),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant="filled" color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Badge>
      );
    },
  },
  ];

  if (!canView && !canEdit && !canDelete) {
    return baseColumns;
  }

  return [
    ...baseColumns,
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {canView && (
            <Link href={`/admin/products/${row.original.id}`}>
              <Button
                variant="outline"
                size="sm"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            </Link>
          )}
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
        </div>
      ),
    },
  ];
};

