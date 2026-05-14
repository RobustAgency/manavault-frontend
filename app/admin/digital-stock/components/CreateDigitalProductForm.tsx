import { PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateDigitalProductFormActions } from './CreateDigitalProductFormActions';
import { CreateDigitalProductFormHeader } from './CreateDigitalProductFormHeader';
import { ProductAccordionItem } from './ProductAccordionItem';
import { ProductFormFields } from './ProductFormFields';
import { type Supplier } from '@/lib/redux/features';
import { type DigitalProductFormState } from './useDigitalProductForm';
import { type ProductFormItem } from './useBulkProductForm';

type CreateDigitalProductFormProps = {
    isLoading: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    suppliers: Supplier[];
    selectedSupplierId: number | undefined;
    supplierError: string;
    onSupplierChange: (supplierId: number) => void;
    onAddNewSupplier: () => void;
    productForms: ProductFormItem[];
    expandedItems: Set<string>;
    onToggleAccordion: (id: string) => void;
    onRemoveProduct: (id: string) => void;
    onUpdateProductForm: (id: string, updates: Partial<DigitalProductFormState>) => void;
    onAddProduct: () => void;
};

export const CreateDigitalProductForm = ({
    isLoading,
    onSubmit,
    onCancel,
    suppliers,
    selectedSupplierId,
    supplierError,
    onSupplierChange,
    onAddNewSupplier,
    productForms,
    expandedItems,
    onToggleAccordion,
    onRemoveProduct,
    onUpdateProductForm,
    onAddProduct,
}: CreateDigitalProductFormProps) => (
    <form onSubmit={onSubmit} className="space-y-8">
        <CreateDigitalProductFormHeader
            selectedSupplierId={selectedSupplierId}
            suppliers={suppliers}
            supplierError={supplierError}
            onSupplierChange={onSupplierChange}
            onAddNewSupplier={onAddNewSupplier}
        />

        <div className="space-y-4">
            {productForms.length > 1 ? (
                <>
                    {productForms.slice(0, -1).map((form, index) => (
                        <ProductAccordionItem
                            key={form.id}
                            id={form.id}
                            index={index}
                            formData={form.formData}
                            errors={form.errors}
                            isExpanded={expandedItems.has(form.id)}
                            canRemove={productForms.length > 1}
                            suppliers={suppliers}
                            onToggle={() => onToggleAccordion(form.id)}
                            onRemove={() => onRemoveProduct(form.id)}
                            onUpdate={(updates) => onUpdateProductForm(form.id, updates)}
                        />
                    ))}
                    <div className="bg-card border rounded-lg shadow-sm p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-base font-semibold">
                                Product {productForms.length}:{' '}
                                {productForms[productForms.length - 1].formData.name || 'New Product'}
                            </h3>
                            {productForms.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        onRemoveProduct(productForms[productForms.length - 1].id)
                                    }
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <ProductFormFields
                            form={productForms[productForms.length - 1].formData}
                            formErrors={productForms[productForms.length - 1].errors}
                            formItemId={productForms[productForms.length - 1].id}
                            isEditMode={false}
                            onUpdate={(updates) =>
                                onUpdateProductForm(productForms[productForms.length - 1].id, updates)
                            }
                        />
                    </div>
                </>
            ) : (
                productForms[0] && (
                    <div className="bg-card border rounded-lg shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">Product Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Digital product information
                            </p>
                        </div>
                        <div className="p-6">
                            <ProductFormFields
                                form={productForms[0].formData}
                                formErrors={productForms[0].errors}
                                formItemId={productForms[0].id}
                                isEditMode={false}
                                onUpdate={(updates) => {
                                    onUpdateProductForm(productForms[0].id, updates);
                                }}
                            />
                        </div>
                    </div>
                )
            )}

            <div className="bg-card border rounded-lg shadow-sm p-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddProduct}
                    className="w-full h-12"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Another Product
                </Button>
            </div>
        </div>

        <CreateDigitalProductFormActions
            isLoading={isLoading}
            productCount={productForms.length}
            onCancel={onCancel}
        />
    </form>
);
