import { Button } from '@/components/ui/button';
import { ProductFormFields } from './ProductFormFields';
import { type Supplier } from '@/lib/redux/features';
import { type DigitalProductFormState } from './useDigitalProductForm';

type EditDigitalProductFormProps = {
    isLoading: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    formData: DigitalProductFormState;
    errors: Record<string, string>;
    suppliers: Supplier[];
    onUpdate: (updates: Partial<DigitalProductFormState>) => void;
    onImageChange: (value: string | File | null) => void;
    isImageUploading: boolean;
};

export const EditDigitalProductForm = ({
    isLoading,
    onSubmit,
    onCancel,
    formData,
    errors,
    suppliers,
    onUpdate,
    onImageChange,
    isImageUploading,
}: EditDigitalProductFormProps) => (
    <form onSubmit={onSubmit} className="space-y-8">
        <div className="bg-card border rounded-lg shadow-sm">
            <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">Product Information</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Digital product details and pricing
                </p>
            </div>
            <div className="p-6">
                <ProductFormFields
                    form={formData}
                    formErrors={errors}
                    isEditMode={true}
                    suppliers={suppliers}
                    onUpdate={onUpdate}
                    onImageChange={onImageChange}
                    isImageUploading={isImageUploading}
                />
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
                Cancel
            </Button>
            <Button type="submit" disabled={isLoading} size="lg" className="min-w-[150px]">
                {isLoading ? 'Updating...' : 'Update Digital Product'}
            </Button>
        </div>
    </form>
);
