'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PackageIcon, TrashIcon, PencilIcon } from 'lucide-react';
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
import {
    useRemoveDigitalProductMutation,
    useUpdateProductMutation,
    useUpdateDigitalProductMutation,
    useAssignDigitalProductsMutation,
    selectSelectedProducts,
    selectSelectedProductIds,
    removeSelectedProduct,
    updateSelectedProduct,
    clearSelectedProducts,
} from '@/lib/redux/features';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { getStatusColor } from './productColumns';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { PendingPriceCell } from '@/components/custom/InlinePriceCell';
import { DigitalProduct, Product, ProductStatus } from '@/types';


interface ProductAssociatedDigitalStockProps {
    product: Product;
}

const ProductAssociatedDigitalStock = ({
    product,
}: ProductAssociatedDigitalStockProps) => {

    const dispatch = useAppDispatch();
    const reduxSelectedProducts = useAppSelector(selectSelectedProducts);
    const selectedProductIds = useAppSelector(selectSelectedProductIds);

    const [createDigitalProductOrder] = useCreateDigitalProductOrderMutation();
    const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
    const [removeDigitalProduct, { isLoading: isRemovingDigitalProduct }] =
        useRemoveDigitalProductMutation();
    const [updateDigitalProduct] = useUpdateDigitalProductMutation();
    const [assignDigitalProducts] = useAssignDigitalProductsMutation();

    const [isDraggingRow, setIsDraggingRow] = React.useState(false);
    const [sortTableData, setSortTableData] = useState<DigitalProduct[]>(product.digital_products || []);
    const [deleteDialog, setDeleteDialog] = useState<{ id: number; name: string } | null>(null);

    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
    const [savingIds, setSavingIds] = useState<Set<number>>(new Set());

    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [productSellingPrice, setProductSellingPrice] = useState<number | null>(product.selling_price ?? null);
    const [forceErrorIds, setForceErrorIds] = useState<Set<number>>(new Set());
    // Track prices we just added so UI updates immediately (avoids race with refetch)
    const [completedPricesMap, setCompletedPricesMap] = useState<Map<number, number>>(new Map());

    useEffect(() => {
        setIsDraggingRow(product?.is_custom_priority ?? false);
    }, [product?.is_custom_priority]);

    useEffect(() => {
        if (!selectedProductIds.length) return;
        setPendingIds((prev) => {
            const next = new Set(prev);
            selectedProductIds.forEach((id) => {
                const product = reduxSelectedProducts.find((p) => p.id === id);
                const hasPrice =
                    completedPricesMap.has(id) ||
                    (product?.selling_price != null && product.selling_price !== '');
                if (!hasPrice) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    }, [selectedProductIds, reduxSelectedProducts, completedPricesMap]);

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
        if (reduxSelectedProducts.length > 0) {
            setForceErrorIds(new Set(reduxSelectedProducts.map((p) => p.id)));
            toast.error('Please add the selling prices for all pending digital products before saving');
            return;
        }
        if (productSellingPrice === null || (productSellingPrice !== null && productSellingPrice < 0)) {
            toast.error('Please enter a valid price (0 or greater)');
            return;
        }
        try {
            const data = sortTableData?.map((item, index) => ({
                digital_product_id: item.id,
                priority_order: index + 1,
            }));
            await createDigitalProductOrder({ id: product.id, data: data || [] }).unwrap();
            toast.success('Digital product order saved successfully');
        } catch {
            toast.error('Failed to save digital product order');
        }
    };

    const handleRemoveDigitalProduct = async (digitalProductId: number) => {
        if (!product) return;
        try {
            await removeDigitalProduct({ productId: product.id, digitalProductId }).unwrap();
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
        const apiProducts = product.digital_products || [];
        const apiIds = new Set(apiProducts.map((p) => p.id));
        const pendingFromRedux = reduxSelectedProducts.filter((rp) => !apiIds.has(rp.id));
        // Prefer Redux selling_price when API product lacks it (e.g. optimistic update or stale refetch)
        const apiWithReduxPrices = apiProducts.map((p) => {
            const inRedux = reduxSelectedProducts.find((r) => r.id === p.id);
            if (
                inRedux?.selling_price != null &&
                inRedux.selling_price !== '' &&
                (p.selling_price == null || p.selling_price === '')
            ) {
                return { ...p, selling_price: inRedux.selling_price };
            }
            return p;
        });
        const merged = [...apiWithReduxPrices, ...pendingFromRedux];

        if (!isDraggingRow) {
            setSortTableData(merged);
            return;
        }
        const sorted = [...merged].sort(
            (a, b) => (a?.pivot?.priority || 0) - (b?.pivot?.priority || 0)
        );
        setSortTableData(sorted);
    };

    useEffect(() => {
        setDigitalProductsForView();
    }, [product.digital_products, isDraggingRow, reduxSelectedProducts]);

    // Clear completedPricesMap when product data has the price (refetch caught up)
    useEffect(() => {
        setCompletedPricesMap((prev) => {
            let changed = false;
            const next = new Map(prev);
            for (const id of next.keys()) {
                const apiProduct = (product.digital_products || []).find((p) => p.id === id);
                if (apiProduct?.selling_price != null && apiProduct.selling_price !== '') {
                    next.delete(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [product.digital_products]);

    const handleCancelPending = (id: number) => {
        setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        dispatch(removeSelectedProduct(id));
    };

    const handleAddPendingPrice = async (dp: DigitalProduct, rawValue: string) => {
        const price = parseFloat(rawValue);
        if (!rawValue.trim() || isNaN(price) || price <= 0) {
            toast.error('Please enter a valid price (0 or greater)');
            return;
        }
        setSavingIds((prev) => new Set(prev).add(dp.id));
        try {
            await updateDigitalProduct({
                id: dp.id,
                data: { selling_price: price },
            }).unwrap();

            await assignDigitalProducts({
                productId: product.id,
                digitalProductIds: [dp.id],
            }).unwrap();

            setSortTableData((prev) =>
                prev.map((item) =>
                    item.id === dp.id ? { ...item, selling_price: price } : item
                )
            );
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(dp.id);
                return next;
            });
            setForceErrorIds((prev) => {
                const next = new Set(prev);
                next.delete(dp.id);
                return next;
            });
            setCompletedPricesMap((prev) => new Map(prev).set(dp.id, price));
            dispatch(updateSelectedProduct({ id: dp.id, selling_price: price }));
            toast.success('Selling price added successfully');
        } catch {
            toast.error('Failed to add selling price');
        } finally {
            setSavingIds((prev) => {
                const next = new Set(prev);
                next.delete(dp.id);
                return next;
            });
        }
    };

    const handleStartEdit = (dp: DigitalProduct) => {
        setEditingId(dp.id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (dp: DigitalProduct, rawValue: string) => {
        const price = parseFloat(rawValue);
        if (!rawValue.trim() || isNaN(price) || price <= 0) {
            toast.error('Please enter a valid price (0 or greater)');
            return;
        }

        setIsSavingEdit(true);
        try {
            await updateDigitalProduct({
                id: dp.id,
                data: { selling_price: price },
            }).unwrap();

            setSortTableData((prev) =>
                prev.map((item) =>
                    item.id === dp.id ? { ...item, selling_price: price } : item
                )
            );
            setEditingId(null);
            toast.success('Selling price updated successfully');
        } catch {
            toast.error('Failed to update selling price');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const digitalProductColumns: ColumnDef<DigitalProduct>[] = useMemo(() => [
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
            cell: ({ row }) => {
                const isPending = pendingIds.has(row.original.id);
                return (
                    <div className="flex items-center gap-2">
                        {isPending && (
                            <span
                                className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0"
                                title="Selling price pending"
                            />
                        )}
                        <span className="font-medium">{row.getValue('name')}</span>
                    </div>
                );
            },
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
            cell: ({ row }) =>
                formatCurrency(parseFloat(row.getValue('cost_price')), row.original.currency),
        },
        {
            accessorKey: 'selling_price',
            header: 'Selling Price',
            cell: ({ row }) => {
                const dp = row.original;
                const isPending = pendingIds.has(dp.id);
                const isEditing = editingId === dp.id;
                const completedPrice = completedPricesMap.get(dp.id);
                const effectivePrice = completedPrice ?? dp.selling_price;
                const hasPrice =
                    effectivePrice !== null &&
                    effectivePrice !== undefined &&
                    effectivePrice !== '' &&
                    (typeof effectivePrice !== 'number' || effectivePrice > 0);
                const isSaving = savingIds.has(dp.id);

                if (isPending) {
                    return (
                        <PendingPriceCell
                            initialValue={dp.selling_price ? String(dp.selling_price) : ''}
                            isSaving={isSaving}
                            forceShowError={forceErrorIds.has(dp.id)}
                            onAdd={(val) => handleAddPendingPrice(dp, val)}
                            onCancel={() => handleCancelPending(dp.id)}
                        />
                    );
                }

                if (isEditing) {
                    return (
                        <PendingPriceCell
                            initialValue={dp.selling_price ? String(dp.selling_price) : ''}
                            isSaving={isSavingEdit}
                            buttonLabel="Save"
                            onAdd={(val) => handleSaveEdit(dp, val)}
                            onCancel={handleCancelEdit}
                        />
                    );
                }

                if (!hasPrice) {
                    return (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleStartEdit(dp)}
                        >
                            Add Price
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <span className="text-sm">
                            {formatCurrency(Number(effectivePrice), dp.currency)}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={() => handleStartEdit(dp)}
                        >
                            <PencilIcon className="h-3 w-3" />
                        </Button>
                    </div>
                );
            },
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
                    title="Remove"
                >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
            ),
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [pendingIds, editingId, savingIds, isSavingEdit, isRemovingDigitalProduct, forceErrorIds, completedPricesMap]);

    const pendingCount = pendingIds.size;
    const hasAnyProducts =
        (product.digital_products && product.digital_products.length > 0) ||
        reduxSelectedProducts.length > 0;

    if (!hasAnyProducts) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <PackageIcon className="h-5 w-5" />
                            Digital Stock
                        </CardTitle>
                        <CardDescription>
                            Associated digital products from suppliers
                        </CardDescription>
                    </div>
                    {pendingCount > 0 && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full px-2.5 py-1">
                            {pendingCount} pending price{pendingCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <DataTable
                    columns={digitalProductColumns}
                    data={sortTableData}
                    sortTableData={sortTableData}
                    setSortTableData={setSortTableData}
                    searchKey="name"
                    isDraggingRow={isDraggingRow}
                    sortable={isDraggingRow || hasAnyProducts }
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
