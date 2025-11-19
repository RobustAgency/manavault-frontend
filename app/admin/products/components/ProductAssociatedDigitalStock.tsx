'use client';

import React from 'react';
import { PackageIcon } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/custom/DataTable';
import { Badge } from '@/components/ui/badge';
import { Product, DigitalProduct as DigitalProductType } from '@/lib/redux/features/productsApi';
import { formatCurrency } from './productColumns';

interface ProductAssociatedDigitalStockProps {
    product: Product;
}

const ProductAssociatedDigitalStock = ({
    product,
}: ProductAssociatedDigitalStockProps) => {

    const digitalProductColumns: ColumnDef<DigitalProductType>[] = [
        {
            accessorKey: 'sku',
            header: 'SKU',
            cell: ({ row }) => (
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {row.getValue('sku')}
                </code>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('name')}</span>
            ),
        },
        {
            accessorKey: 'brand',
            header: 'Brand',
        },
        {
            accessorKey: 'supplier.name',
            header: 'Supplier',
            cell: ({ row }) => row.original.supplier?.name || 'N/A',
        },
        {
            accessorKey: 'cost_price',
            header: 'Cost Price',
            cell: ({ row }) => formatCurrency(parseFloat(row.getValue('cost_price'))),
        },
        {
            accessorKey: 'metadata.faceValue',
            header: 'Face Value',
            cell: ({ row }) => {
                const faceValue = row.original.metadata?.faceValue;
                return faceValue && typeof faceValue === 'string'
                    ? formatCurrency(parseFloat(faceValue))
                    : 'N/A';
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant="outlined" className="capitalize">
                    {row.getValue('status')}
                </Badge>
            ),
        },
        {
            accessorKey: 'last_synced_at',
            header: 'Last Synced',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.getValue('last_synced_at')).toLocaleDateString()}
                </span>
            ),
        },
    ];

    // Only render if there are digital products
    if (!product.digital_products || product.digital_products.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5" />
                    Digital Stock
                </CardTitle>
                <CardDescription>
                    Associated digital products from suppliers
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={digitalProductColumns}
                    data={product.digital_products}
                    searchKey="name"
                    searchPlaceholder="Search digital products..."
                />
            </CardContent>
        </Card>
    );
};

export default ProductAssociatedDigitalStock;