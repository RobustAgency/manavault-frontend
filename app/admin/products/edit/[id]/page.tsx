'use client';

import { useRouter } from 'next/navigation';
import {
    useGetProductQuery,
    useUpdateProductMutation,
    useGetBrandsQuery,
} from '@/lib/redux/features';
import { useProductForm } from '../../components/useProductForm';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { withPermission } from '@/components/auth/withPermission';
import { getModulePermission } from '@/lib/permissions';
import { EditProductHeader } from '../../components/EditProductHeader';
import { EditProductForm } from '../../components/EditProductForm';
import { EditProductLoadingState } from '../../components/EditProductLoadingState';
import { EditProductNotFound } from '../../components/EditProductNotFound';

type EditProductPageProps = { params: Promise<{ id: string }> };

function EditProductPage({ params }: EditProductPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const productId = parseInt(id);

    const { data: product, isLoading: isLoadingProduct } = useGetProductQuery(
        productId,
        { refetchOnMountOrArgChange: true }
    );
    const { data: brandsData } = useGetBrandsQuery({ per_page: 100 });
    const { formData, setFormData, errors, validateForm, updateFormData } = useProductForm(true);
    const [updateProduct, { isLoading }] = useUpdateProductMutation();
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        if (!product || !brandsData?.data) return;

        let brandId = '';
        if (product.brand_id) {
            brandId = String(product.brand_id);
        } else if (product.brand && typeof product.brand === 'object' && product.brand.id) {
            brandId = String(product.brand.id);
        } else if (typeof product.brand === 'string') {
            const foundBrand = brandsData.data.find((b) => b.name === product.brand);
            if (foundBrand) brandId = String(foundBrand.id);
        }

        setFormData({
            name: product.name,
            brand_id: brandId,
            short_description: product.short_description || '',
            long_description: product.long_description || '',
            sku: product.sku,
            image: product.image || '',
            status: product.status,
            tags: product.tags?.join(', ') || '',
            regions: product.regions?.join(', ') || '',
            currency: product.currency || '',
            face_value: product.face_value?.toString() ?? '',
            selling_price: (product as any).selling_price?.toString() ?? '',
            is_out_of_stock: Boolean(product.is_out_of_stock),
        });
    }, [product, brandsData]);

    const IMAGEPREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX || '';
    const imageValue = formData?.image instanceof File
        ? formData.image as unknown as string
        : formData?.image
            ? `${IMAGEPREFIX}/${formData.image}`
            : '';

    const handleImageChange = async (value: string | File | null) => {
        const previousImage = formData.image;
        updateFormData({ image: value ?? '' });

        if (typeof value === 'string' && value !== '') return;

        const payload: FormData | { image: null } =
            value instanceof File
                ? (() => { const fd = new FormData(); fd.append('image', value); return fd; })()
                : { image: null };

        setIsUploadingImage(true);
        try {
            await updateProduct({ id: productId, data: payload }).unwrap();
        } catch {
            updateFormData({ image: previousImage ?? '' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm(false, '')) return;

        const submitData: Record<string, unknown> = {
            name: formData.name.trim(),
            selling_price: parseFloat(formData.selling_price),
            status: formData.status,
            currency: formData.currency,
            face_value: parseFloat(formData.face_value),
            is_out_of_stock: Boolean(formData.is_out_of_stock),
        };

        if (formData.brand_id.trim()) {
            const brandId = parseInt(formData.brand_id);
            if (!isNaN(brandId)) submitData.brand_id = brandId;
        }
        if (formData.short_description.trim()) submitData.short_description = formData.short_description.trim();
        if (formData.long_description.trim()) submitData.long_description = formData.long_description.trim();
        if (formData.tags.trim()) {
            submitData.tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (formData.regions.trim()) {
            submitData.regions = formData.regions.split(',').map(r => r.trim()).filter(Boolean);
        }

        try {
            await updateProduct({ id: productId, data: submitData as any }).unwrap();
            toast.success('Product updated successfully');
            router.push('/admin/products');
        } catch {
            toast.error('Failed to update product');
        }
    };

    if (isLoadingProduct) return <EditProductLoadingState />;
    if (!product) return <EditProductNotFound onGoBack={() => router.push('/admin/products')} />;

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <EditProductHeader onBack={() => router.back()} />
            <EditProductForm
                mode="edit"
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                isUploadingImage={isUploadingImage}
                imageValue={imageValue}
                onUpdate={updateFormData}
                onImageChange={handleImageChange}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
            />
        </div>
    );
}

export default withPermission<EditProductPageProps>(
    [
        getModulePermission('view', 'product'),
        getModulePermission('edit', 'product'),
    ],
    {
        redirectTo: '/admin/products',
        requireAll: true,
        denyMessage: 'View permission is required to edit products.',
    }
)(EditProductPage);
