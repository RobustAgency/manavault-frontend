'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useGetProductQuery,
    useUpdateProductMutation,
    useGetBrandsQuery,
    type ProductStatus,
} from '@/lib/redux/features';
import { useProductForm } from '../../components/useProductForm';
import { use, useEffect } from 'react';
import { ImagePicker } from '@/components/custom/ImagePicker';
import { BrandSelector } from '../../components/BrandSelector';
import { toast } from 'react-toastify';
import { withPermission } from '@/components/auth/withPermission';
import { getModulePermission } from '@/lib/permissions';

type EditProductPageProps = { params: Promise<{ id: string }> };

function EditProductPage({ params }: EditProductPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading: isLoadingProduct } = useGetProductQuery(productId);
    const { data: brandsData } = useGetBrandsQuery({ per_page: 100 });
    const { formData, setFormData, errors, validateForm, updateFormData } = useProductForm(true);
    const [updateProduct, { isLoading, isSuccess, isError, error }] = useUpdateProductMutation();

    useEffect(() => {
        if (!product || !brandsData?.data) return;

        let brandId = '';

        if (product.brand_id) {
            brandId = String(product.brand_id);
        } else if (product.brand && typeof product.brand === 'object' && product.brand.id) {
            brandId = String(product.brand.id);
        } else if (typeof product.brand === 'string') {
            const foundBrand = brandsData.data.find(
                (brand) => brand.name === product.brand
            );
            if (foundBrand) brandId = String(foundBrand.id);
        }
        setFormData(
            {
                name: product.name,
                brand_id: brandId,
                short_description: product.short_description || '',
                long_description: product.long_description || '',
                sku: product.sku,
                selling_price: product.selling_price?.toString() ?? '',
                image: product.image || '',
                status: product.status,
                tags: product.tags?.join(', ') || '',
                regions: product.regions?.join(', ') || '',
                currency: product.currency || "",
                face_value: product.face_value?.toString() ?? ''
            }
        );
    }, [product, brandsData]);

    const IMAGEPREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX || '';

    const isImageExist = formData?.image instanceof File ? formData.image : formData?.image ? IMAGEPREFIX + "/" + formData.image : "";


    useEffect(() => {
        if (isSuccess) {
            router.push('/admin/products');
        }
    }, [isSuccess, router]);

    useEffect(() => {
        if (isError) {
            toast.error('Failed to update product');
        }
    }, [isError, error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm(false, '')) {
            const submitData = new FormData();

            // Add required fields
            submitData.append('name', formData.name.trim());
            submitData.append('selling_price', formData.selling_price);
            submitData.append('status', formData.status);
            submitData.append('currency', formData.currency);
            submitData.append('face_value', formData.face_value);

            // Add optional fields only if they have values
            if (formData.brand_id.trim()) {
                const brandId = parseInt(formData.brand_id);
                if (!isNaN(brandId)) {
                    submitData.append('brand_id', brandId.toString());
                }
            }
            // if (formData.description.trim()) submitData.append('description', formData.description.trim());
            if (formData.short_description.trim()) submitData.append('short_description', formData.short_description.trim());
            if (formData.long_description.trim()) submitData.append('long_description', formData.long_description.trim());

            // Handle image - append the File object directly
            if (formData.image instanceof File) {
                submitData.append("image", formData.image);
            }

            // Parse tags from comma-separated string
            if (formData.tags.trim()) {
                const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                tags.forEach(tag => submitData.append('tags[]', tag));
            }

            // Parse regions from comma-separated string
            if (formData.regions.trim()) {
                const regions = formData.regions.split(',').map(region => region.trim()).filter(region => region.length > 0);
                regions.forEach(region => submitData.append('regions[]', region));
            }

            try {
                await updateProduct({ id: productId, data: submitData });
                toast.success("Product updated successfully");
            } catch (error) {
                toast.error('Failed to update product');
            }
        }
    };
    if (isLoadingProduct) {
        return (
            <div className="container mx-auto py-8 max-w-3xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                        <div className="h-10 bg-muted rounded"></div>
                        <div className="h-10 bg-muted rounded"></div>
                        <div className="h-10 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto py-8 max-w-3xl">
                <div className="text-center">
                    <p className="text-muted-foreground">Product not found</p>
                    <Button onClick={() => router.push('/admin/products')} className="mt-4">
                        Go to Products
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
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">Update product information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                        <p className="text-sm text-muted-foreground mt-1">Essential product details</p>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => updateFormData({ name: e.target.value })}
                                    placeholder="Enter product name"
                                    maxLength={255}
                                    className="h-10"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku" className="text-sm font-medium">SKU *</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    disabled
                                    className="bg-muted h-10"
                                />
                                <p className="text-xs text-muted-foreground">SKU cannot be updated</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <BrandSelector
                                value={formData.brand_id}
                                onChange={(value) => updateFormData({ brand_id: String(value) })}
                                error={errors.brand}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="selling_price" className="text-sm font-medium">Selling Price *</Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.selling_price}
                                    onChange={(e) => updateFormData({ selling_price: e.target.value })}
                                    placeholder="0.00"
                                    className="h-10"
                                />
                                {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                                <Select
                                    key={formData.currency}
                                    value={formData.currency}
                                    onValueChange={(value) => updateFormData({ currency: value })}
                                >
                                    <SelectTrigger className="h-10" id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usd">USD ($)</SelectItem>
                                        <SelectItem value="eur">EUR (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="face_value" className="text-sm font-medium">Face Value *</Label>
                                <Input
                                    id="face_value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.face_value}
                                    onChange={(e) => updateFormData({ face_value: e.target.value })}
                                    placeholder="0.00"
                                    className="h-10"
                                />
                                {errors.face_value && <p className="text-sm text-red-500">{errors.face_value}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                            <Select
                                key={formData.status}
                                value={formData.status}
                                onValueChange={(value: ProductStatus) => updateFormData({ status: value })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="in_active">Inactive</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Product Descriptions</h2>
                        <p className="text-sm text-muted-foreground mt-1">Detailed information about the product</p>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="short_description" className="text-sm font-medium">Short Description</Label>
                            <Textarea
                                id="short_description"
                                value={formData.short_description}
                                onChange={(e) => updateFormData({ short_description: e.target.value })}
                                placeholder="Brief product description..."
                                rows={2}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Brief summary for listing pages</p>
                        </div>

                        {/* <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => updateFormData({ description: e.target.value })}
                                placeholder="Product description..."
                                rows={3}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Standard product description</p>
                        </div> */}

                        <div className="space-y-2">
                            <Label htmlFor="long_description" className="text-sm font-medium">Long Description</Label>
                            <Textarea
                                id="long_description"
                                value={formData.long_description}
                                onChange={(e) => updateFormData({ long_description: e.target.value })}
                                placeholder="Detailed product description..."
                                rows={5}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">Detailed description for product pages</p>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Additional Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">Media, tags, and regional information</p>
                    </div>
                    <div className="p-6 space-y-5">
                        <ImagePicker
                            value={isImageExist}
                            onChange={(value) => updateFormData({ image: value })}
                            label="Product Image"
                            description="Select a product image to upload (PNG, JPG, GIF up to 5MB)"
                        />

                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) => updateFormData({ tags: e.target.value })}
                                placeholder="gaming, console, electronics"
                                className="h-10"
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="regions" className="text-sm font-medium">Regions</Label>
                            <Input
                                id="region"
                                value={formData.regions}
                                onChange={(e) => updateFormData({ regions: e.target.value })}
                                placeholder="US"
                                className="h-10"
                            />
                            {/* <p className="text-xs text-muted-foreground">Comma-separated region codes where this product is available</p> */}
                        </div>
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
                        {isLoading ? 'Updating...' : 'Update Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default withPermission<EditProductPageProps>(
    [
        getModulePermission("view", "product"),
        getModulePermission("edit", "product"),
    ],
    {
        redirectTo: "/admin/products",
        requireAll: true,
        denyMessage: "View permission is required to edit products.",
    }
)(EditProductPage);
