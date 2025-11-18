'use client';

import { TagIcon, GlobeIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/redux/features';

interface ProductTagsRegionsCardProps {
  product: Product;
}

export function ProductTagsRegionsCard({ product }: ProductTagsRegionsCardProps) {
  const hasTags = product.tags && product.tags.length > 0;
  const hasRegions = product.regions && product.regions.length > 0;

  if (!hasTags && !hasRegions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Tags & Regions
        </CardTitle>
        <CardDescription>Product categorization and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {hasTags && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {product.tags!.map((tag, idx) => (
                  <Badge key={idx} variant="outlined">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {hasRegions && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <GlobeIcon className="h-4 w-4" />
                Available Regions
              </p>
              <div className="flex flex-wrap gap-2">
                {product.regions!.map((region, idx) => (
                  <Badge key={idx} variant="outlined" color="info">
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

