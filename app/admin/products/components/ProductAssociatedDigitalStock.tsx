'use client';

import React, { useEffect, useState } from 'react';
import { PackageIcon, TrashIcon } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCreateDigitalProductOrderMutation } from '@/lib/redux/features/purchaseOrdersApi';
import { useRemoveDigitalProductMutation, useUpdateProductMutation } from '@/lib/redux/features';
import { getStatusColor } from './productColumns';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { DigitalProduct, Product, ProductStatus } from '@/types';


interface ProductAssociatedDigitalStockProps {
    product: Product;
}

const ProductAssociatedDigitalStock = ({
    product,
}: ProductAssociatedDigitalStockProps) => {

    const [createDigitalProductOrder] = useCreateDigitalProductOrderMutation();
    const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
    const [removeDigitalProduct, { isLoading: isRemovingDigitalProduct }] =
        useRemoveDigitalProductMutation();
    const [isDraggingRow, setIsDraggingRow] = React.useState(false);
    const [sortTableData, setSortTableData] = useState<DigitalProduct[]>(product.digital_products || []);
    const [deleteDialog, setDeleteDialog] = useState<{ id: number; name: string } | null>(null);

    useEffect(() => {
        setIsDraggingRow(product?.is_custom_priority ?? false);
    }, [product?.is_custom_priority]);

    const handleToggleCustomFulfillmentMode = async (checked: boolean) => {
        if (!product) return;
        const previousValue = isDraggingRow;
        setIsDraggingRow(checked);

        try {
            await updateProduct({
                id: product.id,
                data: { is_custom_priority: checked },
            }).unwrap();
        } catch {
            setIsDraggingRow(previousValue);
        }
    };

    const handleSave = async () => {
        if (!product) return;

        try {
            const data = sortTableData?.map((item, index) => ({
                digital_product_id: item.id,
                priority_order: index + 1,
            }));
            await createDigitalProductOrder({ id: product.id, data: data || [] })
                .unwrap();
            toast.success('Digital product order saved successfully');
        } catch {
            toast.error('Failed to save digital product order');
        }
    };

    const handleRemoveDigitalProduct = async (digitalProductId: number) => {
        if (!product) return;

        try {
            await removeDigitalProduct({
                productId: product.id,
                digitalProductId,
            }).unwrap();

            setSortTableData((prev) => prev.filter((item) => item.id !== digitalProductId));
            toast.success('Digital product removed successfully');
        } catch {
            toast.error('Failed to remove digital product');
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog) return;
        await handleRemoveDigitalProduct(deleteDialog.id);
        setDeleteDialog(null);
    };

    const setDigitalProductsForView = () => {
        const digitalProducts = [...(product.digital_products || [])];
        if (!isDraggingRow) {
            setSortTableData(digitalProducts);
            return;
        }

        const sortedProducts =
            digitalProducts?.sort((product_a, product_b) => {
                return (product_a?.pivot?.priority || 0) - (product_b?.pivot?.priority || 0);
            }) || [];
        setSortTableData(sortedProducts);
    };

    useEffect(() => {
        setDigitalProductsForView();
    }, [product.digital_products, isDraggingRow]);

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
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialog({ id: row.original.id, name: row.original.name })}
                    disabled={isRemovingDigitalProduct}
                    title="Delete"
                >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
            ),
        },
    ];

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
                    isDraggingRow={isDraggingRow}
                    sortable={isDraggingRow}
                    setIsDraggingRow={setIsDraggingRow}
                    handleSave={handleSave}
                    onToggleSortMode={handleToggleCustomFulfillmentMode}
                    toggleDisabled={isUpdatingProduct || isRemovingDigitalProduct}
                    searchPlaceholder="Search digital products..."
                />

                <ConfirmationDialog
                    isOpen={Boolean(deleteDialog)}
                    onClose={() => setDeleteDialog(null)}
                    onConfirm={handleConfirmDelete}
                    title="Remove digital product"
                    description={
                        deleteDialog
                            ? `Remove "${deleteDialog.name}" from this product? This action cannot be undone.`
                            : 'Remove this digital product? This action cannot be undone.'
                    }
                    confirmText="Remove"
                    cancelText="Cancel"
                    type="danger"
                    isLoading={isRemovingDigitalProduct}
                    loadingText="Removing..."
                />
            </CardContent>
        </Card>
    );
};

export default ProductAssociatedDigitalStock;