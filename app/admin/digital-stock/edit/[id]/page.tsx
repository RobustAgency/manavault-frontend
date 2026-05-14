'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import {
    useGetDigitalProductQuery,
    useGetSuppliersQuery,
    useUpdateDigitalProductMutation,
    type UpdateDigitalProductData,
} from '@/lib/redux/features';
import { useDigitalProductForm } from '../../components';
import { toast } from 'react-toastify';
import { EditDigitalProductForm } from '../../components/EditDigitalProductForm';
import { EditDigitalProductHeader } from '../../components/EditDigitalProductHeader';
import { EditLoadingState } from '../../components/EditLoadingState';
import { ErrorState } from '../../components/ErrorState';

export default function EditDigitalProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading: isLoadingProduct } = useGetDigitalProductQuery(productId);
    const { data: suppliersData } = useGetSuppliersQuery({ per_page: 100 });
    const { formData, setFormData, errors, validateForm, updateFormData, getFormDataForSubmit } =
        useDigitalProductForm(true);
    const [updateDigitalProduct, { isLoading}] = useUpdateDigitalProductMutation();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    useEffect(() => {
        if (product) {

            setFormData({
                supplier_id: product.supplier_id || 0,
                name: product.name,
                sku: product.sku || '',
                brand: product.brand || '',
                description: product.description || '',
                tags: Array.isArray(product.tags) ? product.tags?.join(', ') : product.tags || '',
                image: product.image_url || '',
                cost_price: product.cost_price?.toString() ?? '',
                selling_price: product.selling_price?.toString() ?? '',
                selling_discount: Number(product.selling_discount) || 0,
                face_value: product.face_value?.toString() ?? '',
                region: product.region || '',
                metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '',
                currency: product.currency || '',
            });
        }
    }, [product, setFormData]);


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
            toast.error((error as any).data?.message || 'Failed to update digital product');
        }


    };

    if (isLoadingProduct) {
        return <EditLoadingState />;
    }

    if (!product) {
        return <ErrorState hasError={false} onBack={() => router.push('/admin/digital-stock')} />;
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <EditDigitalProductHeader onBack={() => router.back()} />
            <EditDigitalProductForm
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                formData={formData}
                errors={errors as Record<string, string>}
                suppliers={suppliersData?.data || []}
                onUpdate={updateFormData}
                onImageChange={handleImageChange}
                isImageUploading={isUploadingImage}
            />
        </div>
    );
}
