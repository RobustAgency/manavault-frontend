'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useGetDigitalProductQuery,
    useGetSuppliersQuery,
    useUpdateDigitalProductMutation,
    type UpdateDigitalProductData,
} from '@/lib/redux/features';
import { ProductFormFields, useDigitalProductForm } from '../../components';
import { toast } from 'react-toastify';

export default function EditDigitalProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading: isLoadingProduct } = useGetDigitalProductQuery(productId);
    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
    const { formData, setFormData, errors, validateForm, updateFormData, getFormDataForSubmit } =
        useDigitalProductForm(true);
    const [updateDigitalProduct, { isLoading, isSuccess, isError, error }] = useUpdateDigitalProductMutation();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    useEffect(() => {
        if (product) {

            setFormData({
                supplier_id: product.supplier_id || 0,
                name: product.name,
                sku: product.sku || '',
                brand: product.brand || '',
                description: product.description || '',
                tags: product.tags?.join(', ') || '',
                image: product.image_url || '',
                cost_price: product.cost_price?.toString() ?? '',
                selling_price: product.selling_price?.toString() ?? '',
                region: product.region || '',
                metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '',
                currency: product.currency || '',
            });
        }
    }, [product, setFormData]);


    // Fire the API immediately when the image is picked or removed (same behaviour as products)
    const handleImageChange = async (value: string | File | null) => {
        const previousImage = formData.image;
        updateFormData({ image: value ?? '' });

        // Only call the API for File uploads or explicit removal (null/empty)
        if (typeof value === 'string' && value !== '') return;

        const payload: FormData | { image: null } =
            value instanceof File
                ? (() => {
                    const fd = new FormData();
                    fd.append('image', value);
                    return fd;
                })()
                : { image: null };

        setIsUploadingImage(true);
        try {
            await updateDigitalProduct({
                id: productId,
                data: payload as UpdateDigitalProductData,
            }).unwrap();
        } catch {
            updateFormData({ image: previousImage ?? '' });
            toast.error('Failed to update image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const submitData = getFormDataForSubmit();
            // Exclude image - it is sent separately via handleImageChange when picked/removed
            const { image: _image, image_url: _imageUrl, ...rest } = submitData as UpdateDigitalProductData & { image?: unknown };
            const payload: UpdateDigitalProductData = rest;

            await updateDigitalProduct({
                id: productId,
                data: payload,
            }).unwrap();
            router.push('/admin/digital-stock');
            toast.success('Digital product updated successfully');
        } catch (error) {
            toast.error('Failed to update digital product');
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
                            onImageChange={handleImageChange}
                            isImageUploading={isUploadingImage}
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
