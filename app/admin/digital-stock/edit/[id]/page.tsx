'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useGetDigitalProductQuery,
    useGetSuppliersQuery,
    useUpdateDigitalProductMutation,
    type UpdateDigitalProductData,
} from '@/lib/redux/features';
import { ProductFormFields, useDigitalProductForm } from '../../components';

export default function EditDigitalProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading: isLoadingProduct } = useGetDigitalProductQuery(productId);
    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
    const { formData, setFormData, errors, validateForm, updateFormData, getFormDataForSubmit } =
        useDigitalProductForm(true);
    const [updateDigitalProduct, { isLoading, isSuccess, isError, error }] = useUpdateDigitalProductMutation();
    useEffect(() => {
        if (product) {

            setFormData({
                supplier_id: product.supplier_id || 0 ,
                name: product.name,
                sku: product.sku || '',
                brand: product.brand || '',
                description: product.description || '',
                tags: product.tags?.join(', ') || '',
                image: product.image || '',
                cost_price: product.cost_price?.toString() ?? '',
                region: product.region || '',
                metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '',
            });
        }
    }, [product, setFormData]);

    useEffect(() => {
        if (isSuccess) {
            // toast.success('Digital product updated successfully');
            router.push('/admin/digital-stock');
        }
    }, [isSuccess, router]);

    useEffect(() => {
        if (isError) {
            // toast.error('Failed to update digital product');
            console.error('Update digital product error:', error);
        }
    }, [isError, error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            const submitData = getFormDataForSubmit();
            await updateDigitalProduct({
                id: productId,
                data: submitData as UpdateDigitalProductData,
            });
        }
    };

    if (isLoadingProduct) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="bg-card border rounded-lg shadow-sm">
                        <div className="border-b p-6">
                            <div className="h-6 bg-muted rounded w-1/3"></div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="h-10 bg-muted rounded"></div>
                            <div className="h-10 bg-muted rounded"></div>
                            <div className="h-10 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto py-8 max-w-4xl">
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg mb-4">Digital product not found</p>
                    <Button onClick={() => router.push('/admin/digital-stock')}>
                        Go to Digital Stock
                    </Button>
                </div>
            </div>
        );
    }

    return (  
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 -ml-2"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Digital Product</h1>
                    <p className="text-muted-foreground">Update digital product information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Product Information</h2>
                        <p className="text-sm text-muted-foreground mt-1">Digital product details and pricing</p>
                    </div>
                    <div className="p-6">
                        <ProductFormFields
                            form={formData}
                            formErrors={errors}
                            isEditMode={true}
                            suppliers={suppliersData?.data || []}
                            onUpdate={updateFormData}
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px]">
                        {isLoading ? 'Updating...' : 'Update Digital Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
