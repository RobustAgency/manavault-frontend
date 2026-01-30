'use client';

import React, { useEffect, useState } from 'react';
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
import { formatCurrency } from '@/utils/formatCurrency';
import { useCreateDigitalProductOrderMutation } from '@/lib/redux/features/purchaseOrdersApi';
import { getStatusColor } from './productColumns';
import { toast } from 'react-toastify';
import { DigitalProduct, Product, ProductStatus } from '@/types';


interface ProductAssociatedDigitalStockProps {
    product: Product;
}

const ProductAssociatedDigitalStock = ({
    product,
}: ProductAssociatedDigitalStockProps) => {

    const [createDigitalProductOrder] = useCreateDigitalProductOrderMutation();
    const [isDraggingRow, setIsDraggingRow] = React.useState(false);
    const [sortTableData, setSortTableData] = useState<DigitalProduct[]>(product.digital_products || []);

    const handleSave = async() => {
        if (!product) return;

        try {
            const data = sortTableData?.map((item, index) => ({
                digital_product_id: item.id,
                priority_order: index + 1,
            }));
            await createDigitalProductOrder({ id: product.id, data: data || [] })
                .unwrap();
            toast.success('Digital product order saved successfully');
            setIsDraggingRow(false);
        } catch {
            toast.error('Failed to save digital product order');
        }
    };

    // sorting based on priority 
    const sortDigitalProducts = () => {
        const digitalProducts = [...( product.digital_products || [])];
      
        const sortedProducts = digitalProducts?.sort((product_a, product_b) => {
            return (product_a?.pivot?.priority || 0) - (product_b?.pivot?.priority || 0);
        }) || [];
        setSortTableData(sortedProducts);
    }
    
    useEffect(() => {
        sortDigitalProducts();
    }, [product.digital_products]);

    const digitalProductColumns: ColumnDef<DigitalProduct>[] = [
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
            cell: ({ row }) => formatCurrency(parseFloat(row.getValue('cost_price')), row.original.currency),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.supplier?.status;
                return (
                  <Badge variant="filled" color={getStatusColor(status as ProductStatus)}>
                    {status}
                  </Badge>
                );
              },
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
                    sortTableData={sortTableData}
                    setSortTableData={setSortTableData}
                    searchKey="name"
                    sortable={isDraggingRow}
                    setIsDraggingRow={setIsDraggingRow}
                    handleSave={handleSave}
                    searchPlaceholder="Search digital products..."
                />

            </CardContent>
        </Card>
    );
};

export default ProductAssociatedDigitalStock;