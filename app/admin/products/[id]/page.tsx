'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    useGetProductQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useAssignDigitalProductsMutation,
    useGetSuppliersQuery,
} from '@/lib/redux/features';
import {
    ProductDetailHeader,
    ProductOverviewCard,
    ProductTagsRegionsCard,
    ProductTimestampsCard,
    ProductDetailSkeleton,
    ProductDetailError,
    AssignDigitalProductsDialog,
} from '../components';
import { ProductFormDialog } from '../components/ProductFormDialog';
import ConfirmationDialog from '@/components/custom/ConfirmationDialog';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = parseInt(params.id as string, 10);

    const {
        data: product,
        isLoading,
        error,
    } = useGetProductQuery(productId, {
        skip: !productId || isNaN(productId),
    });

    const { data: suppliersData } = useGetSuppliersQuery({
        page: 1,
        per_page: 100,
    });

    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
    const [assignDigitalProducts, { isLoading: isAssigning }] = useAssignDigitalProductsMutation();

    // Dialog states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

    const handleEdit = async (data: any) => {
        if (!product) return;

        try {
            // Don't send SKU on update (it can't be updated)
            const { sku, ...updateData } = data;
            await updateProduct({
                id: product.id,
                data: updateData,
            }).unwrap();
            setIsEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to update product:', error);
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        try {
            await deleteProduct(product.id).unwrap();
            setIsDeleteDialogOpen(false);
            router.push('/admin/products');
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleAssignDigitalProducts = async (digitalProductIds: number[]) => {
        if (!product) return;

        try {
            await assignDigitalProducts({
                productId: product.id,
                digitalProductIds,
            }).unwrap();
            setIsAssignDialogOpen(false);
        } catch (error) {
            console.error('Failed to assign digital products:', error);
        }
    };

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return <ProductDetailError error={!!error} />;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <ProductDetailHeader
                product={product}
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onAssignDigitalProducts={() => setIsAssignDialogOpen(true)}
            />

            <div className="grid gap-6">
                <ProductOverviewCard product={product} />
                <ProductTagsRegionsCard product={product} />
                <ProductTimestampsCard product={product} />
            </div>

            {/* Edit Dialog */}
            <ProductFormDialog
                isOpen={isEditDialogOpen}
                isEditMode={true}
                selectedProduct={product}
                isSubmitting={isUpdating}
                onClose={() => setIsEditDialogOpen(false)}
                onSubmit={handleEdit}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Product"
                description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={handleDelete}
                isLoading={isDeleting}
                type="danger"
            />

            {/* Assign Digital Products Dialog */}
            <AssignDigitalProductsDialog
                isOpen={isAssignDialogOpen}
                productId={product.id}
                suppliers={suppliersData?.data || []}
                isSubmitting={isAssigning}
                onClose={() => setIsAssignDialogOpen(false)}
                onSubmit={handleAssignDigitalProducts}
            />
        </div>
    );
}
