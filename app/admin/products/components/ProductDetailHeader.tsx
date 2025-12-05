'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, TrashIcon, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/redux/features';
import { getStatusColor } from './productColumns';
import Link from 'next/link';

interface ProductDetailHeaderProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onAssignDigitalProducts: () => void;
}

export function ProductDetailHeader({ product, onEdit, onDelete, onAssignDigitalProducts }: ProductDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 -ml-2"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-3">
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <Badge
              variant="filled"
              color={getStatusColor(product.status)}
              className="shrink-0"
            >
              {product.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>SKU:</span>
            <code className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-md font-semibold border border-blue-200 dark:border-blue-800">
              {product.sku}
            </code>
          </div>
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-2">
              Brand: <span className="font-medium text-foreground">
                {typeof product.brand === 'string' ? product.brand : product.brand.name}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onAssignDigitalProducts}
            className="gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            Add Suppliers
          </Button>
          <Link href={`/admin/products/edit/${product.id}`}>
            <Button
              variant="outline"
              // onClick={onEdit}
              className="gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={onDelete}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

