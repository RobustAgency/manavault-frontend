'use client';

import { CalendarIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Product } from '@/lib/redux/features';

interface ProductTimestampsCardProps {
  product: Product;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ProductTimestampsCard({ product }: ProductTimestampsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Timestamps
        </CardTitle>
        <CardDescription>Creation and update information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Date Created</p>
            <p className="font-medium flex items-center gap-2 text-foreground">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {formatDate(product.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Last Updated</p>
            <p className="font-medium flex items-center gap-2 text-foreground">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {formatDate(product.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

