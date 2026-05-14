import { useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type ProductStatus } from '@/lib/redux/features';
import { ImagePicker } from '@/components/custom/ImagePicker';
import { BrandSelector } from './BrandSelector';
import type { ProductFormState, ProductFormErrors } from './useProductForm';

type ProductFormProps = {
    mode: 'create' | 'edit';
    formData: ProductFormState;
    errors: ProductFormErrors;
    isLoading: boolean;
    isUploadingImage: boolean;
    /** Pre-computed image URL (for edit mode where the prefix is already applied). Falls back to formData.image in create mode. */
    imageValue?: string;
    onUpdate: (updates: Partial<ProductFormState>) => void;
    /** Override image change handler. If omitted, defaults to onUpdate({ image: value ?? '' }). */
    onImageChange?: (value: string | File | null) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
};

export const ProductForm = ({
    mode,
    formData,
    errors,
    isLoading,
    isUploadingImage,
    imageValue,
    onUpdate,
    onImageChange,
    onSubmit,
    onCancel,
}: ProductFormProps) => {
    const nameRef = useRef<HTMLInputElement>(null);
    const skuRef = useRef<HTMLInputElement>(null);
    const statusRef = useRef<HTMLButtonElement>(null);
    const faceValueRef = useRef<HTMLInputElement>(null);

    const isEdit = mode === 'edit';
    const resolvedImageValue = imageValue ?? (formData.image instanceof File ? '' : (formData.image as string) ?? '');
    const handleImage = onImageChange ?? ((value: string | File | null) => onUpdate({ image: value ?? '' }));

    return (
        <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card border rounded-lg shadow-sm">
                <div className="border-b flex justify-between items-center px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                        <p className="text-sm text-muted-foreground mt-1">Essential product details</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-md px-0 py-2">
                        <Checkbox
                            id="is_out_of_stock"
                            checked={formData.is_out_of_stock}
                            className="cursor-pointer"
                            onCheckedChange={(checked) => onUpdate({ is_out_of_stock: checked === true })}
                        />
                        <Label htmlFor="is_out_of_stock" className="text-sm font-medium">
                            Out of stock
                        </Label>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                            <Input
                                ref={nameRef}
                                id="name"
                                value={formData.name}
                                onChange={(e) => onUpdate({ name: e.target.value })}
                                placeholder="Enter product name"
                                maxLength={255}
                                className="h-10"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku" className="text-sm font-medium">SKU *</Label>
                            {isEdit ? (
                                <>
                                    <Input id="sku" value={formData.sku} disabled className="bg-muted h-10" />
                                    <p className="text-xs text-muted-foreground">SKU cannot be updated</p>
                                </>
                            ) : (
                                <>
                                    <Input
                                        ref={skuRef}
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => onUpdate({ sku: e.target.value })}
                                        placeholder="PROD-001"
                                        maxLength={100}
                                        className="h-10"
                                    />
                                    {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <BrandSelector
                            value={formData.brand_id}
                            onChange={(value) => onUpdate({ brand_id: value ? String(value) : '' })}
                            error={errors.brand}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="face_value" className="text-sm font-medium">Face Value *</Label>
                            <Input
                                ref={faceValueRef}
                                id="face_value"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.face_value}
                                onChange={(e) => onUpdate({ face_value: e.target.value })}
                                placeholder="0.00"
                                className="h-10"
                            />
                            {errors.face_value && <p className="text-sm text-red-500">{errors.face_value}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                            <Select
                                key={isEdit ? formData.currency : undefined}
                                value={formData.currency}
                                onValueChange={(value) => onUpdate({ currency: value })}
                            >
                                <SelectTrigger className="h-10" id="currency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="usd">USD ($)</SelectItem>
                                    <SelectItem value="eur">EUR (€)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                            <Select
                                key={isEdit ? formData.status : undefined}
                                value={formData.status}
                                onValueChange={(value: ProductStatus) => onUpdate({ status: value })}
                            >
                                <SelectTrigger ref={statusRef} className="h-10" id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="in_active">Inactive</SelectItem>
                                    {isEdit && <SelectItem value="archived">Archived</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
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
                            onChange={(e) => onUpdate({ short_description: e.target.value })}
                            placeholder="Brief product description..."
                            rows={2}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">Brief summary for listing pages</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="long_description" className="text-sm font-medium">Long Description</Label>
                        <Textarea
                            id="long_description"
                            value={formData.long_description}
                            onChange={(e) => onUpdate({ long_description: e.target.value })}
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
                        value={resolvedImageValue}
                        onChange={handleImage}
                        label="Product Image"
                        description="Select a product image to upload (PNG, JPG, GIF up to 5MB)"
                        disabled={isUploadingImage}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => onUpdate({ tags: e.target.value })}
                            placeholder="gaming, console, electronics"
                            className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="regions" className="text-sm font-medium">Regions</Label>
                        <Input
                            id="regions"
                            value={formData.regions}
                            onChange={(e) => onUpdate({ regions: e.target.value })}
                            placeholder="Search regions..."
                            className="h-10"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isLoading || isUploadingImage}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || isUploadingImage}
                    size="lg"
                    className="min-w-[150px]"
                >
                    {isUploadingImage
                        ? 'Uploading image...'
                        : isLoading
                            ? isEdit ? 'Updating...' : 'Creating...'
                            : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
};
