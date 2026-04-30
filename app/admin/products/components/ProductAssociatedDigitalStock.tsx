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
    removeSelectedProduct,
    clearSelectedProducts,
} from '@/lib/redux/features';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { getStatusColor } from './productColumns';
import { toast } from 'react-toastify';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';
import { PendingPriceCell } from '@/components/custom/InlinePriceCell';
import { DigitalProduct, MutationError, Product, ProductStatus } from '@/types';


interface ProductAssociatedDigitalStockProps {
    product: Product;
}

const ProductAssociatedDigitalStock = ({
    product,
}: ProductAssociatedDigitalStockProps) => {

    const dispatch = useAppDispatch();
    const reduxSelectedProducts = useAppSelector(selectSelectedProducts);

    const [createDigitalProductOrder] = useCreateDigitalProductOrderMutation();
    const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
    const [removeDigitalProduct, { isLoading: isRemovingDigitalProduct }] =
        useRemoveDigitalProductMutation();
    const [updateDigitalProduct] = useUpdateDigitalProductMutation();
    const [assignDigitalProducts, { isLoading: isAssigningDigitalProducts }] =
        useAssignDigitalProductsMutation();

    const [isDraggingRow, setIsDraggingRow] = React.useState(false);
    const [sortTableData, setSortTableData] = useState<DigitalProduct[]>(product.digital_products || []);
    const [deleteDialog, setDeleteDialog] = useState<{ id: number; name: string } | null>(null);

    const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);
    const [editingDiscountValue, setEditingDiscountValue] = useState('');
    const [isSavingDiscount, setIsSavingDiscount] = useState(false);
    const [completedDiscountsMap, setCompletedDiscountsMap] = useState<Map<number, number>>(new Map());
    const [forceDiscountErrorIds, setForceDiscountErrorIds] = useState<Set<number>>(new Set());

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

    const handleMainSave = async () => {
        if (!product || !sortTableData?.length) return;

        if (editingDiscountId !== null) {
            const parsed = parseFloat(editingDiscountValue);
            const isInvalid =
                !editingDiscountValue.trim() ||
                isNaN(parsed) ||
                parsed < 0 ||
                parsed > 100;
            if (isInvalid) {
                setForceDiscountErrorIds(new Set([editingDiscountId]));
                toast.error('Please enter a valid discount percentage (0–100) before saving');
                return;
            }
        }

        try {
            const digitalProductIds = sortTableData.map((dp) => dp.id);
            await assignDigitalProducts({
                productId: product.id,
                digitalProductIds,
            }).unwrap();
            setForceDiscountErrorIds(new Set());
            dispatch(clearSelectedProducts());
            toast.success('Digital products assigned successfully');
        } catch {
            toast.error('Failed to assign digital products');
        }
    };

    const handleSave = async () => {
        if (!product) return;

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
        if (digitalProductId) {
            try {
                await removeDigitalProduct({ productId: product.id, digitalProductId }).unwrap();
                setSortTableData((prev) => prev.filter((item) => item.id !== digitalProductId));
                toast.success('Digital product removed successfully');
            } catch {
                toast.error('Failed to remove digital product');
            }
        }
        dispatch(removeSelectedProduct(digitalProductId));
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
        const merged = isDraggingRow
            ? apiProducts
            : [...apiProducts, ...pendingFromRedux];

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

    // Clear completedDiscountsMap when product data has the discount (refetch caught up)
    useEffect(() => {
        setCompletedDiscountsMap((prev) => {
            let changed = false;
            const next = new Map(prev);
            for (const id of next.keys()) {
                const apiProduct = (product.digital_products || []).find((p) => p.id === id);
                if (apiProduct?.selling_discount != null && apiProduct.selling_discount !== '') {
                    next.delete(id);
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [product.digital_products]);

    const handleStartEditDiscount = (dp: DigitalProduct) => {
        setEditingDiscountId(dp.id);
        setEditingDiscountValue(dp.selling_discount ? String(dp.selling_discount) : '');
    };

    const handleCancelEditDiscount = () => {
        setEditingDiscountId(null);
        setEditingDiscountValue('');
        setForceDiscountErrorIds(new Set());
    };

    const handleSaveDiscount = async (dp: DigitalProduct, rawValue: string) => {
        const discount = parseFloat(rawValue);
        if (!rawValue.trim() || isNaN(discount) || discount > 100) {
            toast.error('Please enter a valid discount percentage (100% maximum; negatives allowed)');
            return;
        }

        setIsSavingDiscount(true);
        try {
            const mutationResult = await updateDigitalProduct({
                id: dp.id,
                data: { selling_discount: discount },
                productId: product.id,
            }).unwrap();

            const updatedPayload =
                mutationResult &&
                typeof mutationResult === 'object' &&
                'data' in mutationResult &&
                mutationResult.data != null &&
                typeof mutationResult.data === 'object'
                    ? (mutationResult as { data: DigitalProduct }).data
                    : (mutationResult as DigitalProduct);

            setSortTableData((prev) =>
                prev.map((item) => {
                    if (item.id !== dp.id) return item;
                    const next: DigitalProduct = { ...item, selling_discount: discount };
                    const sp = updatedPayload?.selling_price;
                    if (sp != null && sp !== '') {
                        next.selling_price = sp;
                    }
                    return next;
                })
            );
            setEditingDiscountId(null);
            setEditingDiscountValue('');
            setForceDiscountErrorIds((prev) => {
                const next = new Set(prev);
                next.delete(dp.id);
                return next;
            });
            setCompletedDiscountsMap((prev) => new Map(prev).set(dp.id, discount));
            toast.success('Discount updated successfully');
        } catch (error) {
            toast.error(
                (error as MutationError)?.data?.message ||
                    'Failed to update discount'
            );
        } finally {
            setIsSavingDiscount(false);
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
            cell: ({ row }) =>
                formatCurrency(parseFloat(row.getValue('cost_price')), row.original.currency),
        },
        {
            accessorKey: 'selling_price',
            header: 'Selling Price',
            cell: ({ row }) => {
                const raw = row.getValue('selling_price') as string | number | null | undefined;
                const sellingPrice = parseFloat(raw === null || raw === undefined ? '' : String(raw));
                if (!Number.isFinite(sellingPrice)) {
                    return (
                    <span className="text-muted-foreground">—</span>
                );
                }
                return formatCurrency(sellingPrice, row.original.currency);
            },
        },
        {
            accessorKey: 'selling_discount',
            header: 'Discount',
            cell: ({ row }) => {
                const dp = row.original;
                const isEditing = editingDiscountId === dp.id;
                const completedDiscount = completedDiscountsMap.get(dp.id);
                const effectiveDiscount = completedDiscount ?? dp.selling_discount;
                const hasDiscount =
                    effectiveDiscount !== null &&
                    effectiveDiscount !== undefined &&
                    effectiveDiscount !== '';

                if (isEditing) {
                    return (
                        <PendingPriceCell
                            variant="percentage"
                            initialValue={dp.selling_discount ? String(dp.selling_discount) : ''}
                            isSaving={isSavingDiscount}
                            buttonLabel="Save"
                            forceShowError={forceDiscountErrorIds.has(dp.id)}
                            onClearError={() =>
                                setForceDiscountErrorIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(dp.id);
                                    return next;
                                })
                            }
                            onValueChange={setEditingDiscountValue}
                            onAdd={(val) => handleSaveDiscount(dp, val)}
                            onCancel={handleCancelEditDiscount}
                        />
                    );
                }

                if (!hasDiscount) {
                    return (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleStartEditDiscount(dp)}
                        >
                            Add Discount
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center gap-1">
                        <span className="text-sm">{Number(effectiveDiscount)}%</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={() => handleStartEditDiscount(dp)}
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
    ], [editingDiscountId, isSavingDiscount, completedDiscountsMap, forceDiscountErrorIds, isRemovingDigitalProduct]);

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
                    sortable={isDraggingRow}
                    setIsDraggingRow={setIsDraggingRow}
                    handleSave={handleSave}
                    onMainSave={handleMainSave}
                    mainSaveLoading={isAssigningDigitalProducts}
                    mainSaveLabel="Save"
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
