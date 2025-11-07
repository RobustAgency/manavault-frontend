'use client';

import { useState } from 'react';
import { ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetThirdPartyProductsQuery,
  useGetSuppliersQuery,
  type ThirdPartyProduct,
} from '@/lib/redux/features';
import { ColumnDef } from '@tanstack/react-table';

export default function ThirdPartyProductsPage() {
  const [supplierSlug, setSupplierSlug] = useState('ez_cards');
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(1);

  const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
  const { data: products, isLoading, refetch } = useGetThirdPartyProductsQuery({
    slug: supplierSlug,
    limit,
    offset,
  });

  // Filter only external suppliers
  const externalSuppliers = suppliersData?.data.filter(s => s.type === 'external') || [];

  const handleSupplierChange = (slug: string) => {
    setSupplierSlug(slug);
    setOffset(1);
  };

  const handleNextPage = () => {
    setOffset(offset + limit);
  };

  const handlePreviousPage = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const columns: ColumnDef<ThirdPartyProduct>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => row.original.sku ? (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.sku}</code>
      ) : '-',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => row.original.price ? (
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(row.original.price)
      ) : '-',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Third-Party Products</h1>
            <p className="text-muted-foreground mt-1">
              Browse products from external suppliers
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="w-64">
          <Select value={supplierSlug} onValueChange={handleSupplierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {externalSuppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.slug}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-32">
          <Select value={limit.toString()} onValueChange={(value) => {
            setLimit(parseInt(value));
            setOffset(0);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 items</SelectItem>
              <SelectItem value="15">15 items</SelectItem>
              <SelectItem value="25">25 items</SelectItem>
              <SelectItem value="50">50 items</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            <span>Loading products...</span>
          </div>
        </div>
      ) : products && products.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={products}
            loading={isLoading}
          />

          {/* Manual Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {offset + 1} - {offset + products.length} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={offset === 0 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={products.length < limit || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try selecting a different supplier
          </p>
        </div>
      )}
    </div>
  );
}

