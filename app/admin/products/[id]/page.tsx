'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import ProductAssociatedDigitalStock from '../components/ProductAssociatedDigitalStock';
import { toast } from 'react-toastify';
import { DigitalProductCurrency } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import { getModulePermission, hasPermission } from '@/lib/permissions';
import { selectUserRole } from '@/lib/redux/features';
import { useAppSelector } from '@/lib/redux/hooks';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const productId = parseInt(id, 10);
    const { permissionSet } = usePermissions();
    const role = useAppSelector(selectUserRole) ?? "user";

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
            const updateProductResult = await updateProduct({
                id: product.id,
                data: updateData,
            }).unwrap();
            if (updateProductResult) {
                toast.success("Product updated successfully");
                setIsEditDialogOpen(false);
            }
        } catch (error) {
            toast.error('Failed to update product');
        }
    };

    const handleDelete = async () => {
        if (!product) return;
        try {
            await deleteProduct(product.id).unwrap();
            toast.success("Product deleted successfully");
            setIsDeleteDialogOpen(false);
            router.push('/admin/products');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleAssignDigitalProducts = async (digitalProductIds: number[]) => {
        if (!product) return;

        try {
            await assignDigitalProducts({
                productId: product.id,
                digitalProductIds,
            }).unwrap();
            toast.success("Digital products assigned successfully");
            setIsAssignDialogOpen(false);
        } catch (error) {
            toast.error('Failed to assign digital products');
        }
    };

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (error || !product) {
        return <ProductDetailError error={!!error} />;
    }

    const isSuperAdmin = role === "super_admin";
    const canEdit = isSuperAdmin || hasPermission(getModulePermission("edit", "product"), permissionSet);
    const canDelete = isSuperAdmin || hasPermission(getModulePermission("delete", "product"), permissionSet);
    const canAssignSuppliers =
        isSuperAdmin || hasPermission(getModulePermission("edit", "supplier"), permissionSet);

    return (
        <div className="container mx-auto py-8 px-4">
            <ProductDetailHeader
                product={product}
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={() => setIsDeleteDialogOpen(true)}
                onAssignDigitalProducts={() => setIsAssignDialogOpen(true)}
                canEdit={canEdit}
                canDelete={canDelete}
                canAssignSuppliers={canAssignSuppliers}
            />

            <div className="grid gap-6">
                <ProductOverviewCard product={product} />
                <ProductAssociatedDigitalStock product={product} />
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
                currency={product.currency as unknown as DigitalProductCurrency}
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
