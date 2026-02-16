'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface ProductDetailErrorProps {
  error?: boolean;
}

export function ProductDetailError({ error }: ProductDetailErrorProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error ? 'Failed to load product details' : 'Product not found'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

