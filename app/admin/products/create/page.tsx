'use client';

import { useRouter } from 'next/navigation';
import {
    useCreateProductMutation,
    useUpdateProductMutation,
    type CreateProductData,
} from '@/lib/redux/features';
import { useProductForm } from '../components/useProductForm';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { withPermission } from '@/components/auth/withPermission';
import { getModulePermission } from '@/lib/permissions';
import { CreateProductHeader } from '../components/CreateProductHeader';
import { CreateProductForm } from '../components/CreateProductForm';

function CreateProductPage() {
    const router = useRouter();
    const { formData, errors, validateForm, updateFormData } = useProductForm(false);
    const [createProduct, { isLoading, isError, error }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUploadingImage }] = useUpdateProductMutation();

    const nameRef = useRef<HTMLInputElement>(null);
    const skuRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isError) {
            console.error('Create product error:', error);
            toast.error('Failed to create product');
        }
    }, [isError, error]);

    const scrollToFirstError = () => {
        const fieldOrder = [
            { key: 'name', ref: nameRef },
            { key: 'sku', ref: skuRef },
            { key: 'status', ref: statusRef },
        ];

        for (const field of fieldOrder) {
            if (errors[field.key as keyof typeof errors]) {
                const element = field.ref.current;
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => element.focus(), 100);
                    break;
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm(false, '')) {
            scrollToFirstError();
            return;
        }

        const submitData: CreateProductData = {
            name: formData.name.trim(),
            sku: formData.sku.trim(),
            face_value: parseFloat(formData.face_value),
            currency: formData.currency,
            status: formData.status,
            is_out_of_stock: formData.is_out_of_stock,
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
            const result = await createProduct(submitData).unwrap();

            if (!result?.id) {
                router.push('/admin/products');
                return;
            }

            if (formData.image instanceof File) {
                try {
                    const imagePayload = new FormData();
                    imagePayload.append('image', formData.image);
                    await updateProduct({ id: result.id, data: imagePayload }).unwrap();
                } catch {
                    toast.success('Product created successfully');
                    toast.error('Image upload failed — you can update it from the edit page');
                }
            } else {
                toast.success('Product created successfully');
            }

            router.push(`/admin/products/${result.id}`);
        } catch (err) {
            console.error('Failed to create product:', err);
            toast.error('Failed to create product');
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <CreateProductHeader onBack={() => router.back()} />
            <CreateProductForm
                mode="create"
                formData={formData}
                errors={errors}
                isLoading={isLoading}
                isUploadingImage={isUploadingImage}
                onUpdate={updateFormData}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
            />
        </div>
    );
}

export default withPermission(
    [
        getModulePermission("view", "product"),
        getModulePermission("create", "product"),
    ],
    {
        redirectTo: "/admin/products",
        requireAll: true,
        denyMessage: "View permission is required to create products.",
    }
)(CreateProductPage);
