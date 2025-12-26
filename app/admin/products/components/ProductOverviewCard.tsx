'use client';

import { PackageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/redux/features/productsApi';
import { getStatusColor } from './productColumns';
import { ProductImage } from './ProductImage';
import { formatCurrency } from '@/utils/formatCurrency';

const IMAGEPREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX || '';

interface ProductOverviewCardProps {
  product: Product;
}

export function ProductOverviewCard({ product }: ProductOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageIcon className="h-5 w-5" />
          Product Overview
        </CardTitle>
        <CardDescription>Basic information about this product</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Text Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Product Name</p>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">SKU</p>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-md font-semibold">
                  {product.sku}
                </code>
              </div>
              {product.brand && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Brand</p>
                  <p className="text-lg font-semibold">
                    {typeof product.brand === 'string' ? product.brand : product.brand.name}
                  </p>
                </div>
              )}
            </div>

            {product.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {product.short_description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Short Description</p>
                <p className="text-sm text-foreground">{product.short_description}</p>
              </div>
            )}

            {product.long_description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Long Description</p>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {product.long_description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Image and Pricing */}
          <div className="space-y-6">
            {product.image && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Product Image</p>
                <ProductImage src={`${IMAGEPREFIX}${product.image}`} alt={product.name} />
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Selling Price</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(product.selling_price, product.currency)}
                </p>
              </div>
               
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                <Badge variant="filled" color={getStatusColor(product.status)}>
                  {product.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

