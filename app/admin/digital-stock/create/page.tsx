'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    useGetSuppliersQuery,
    useCreateDigitalProductsMutation,
    useCreateSupplierMutation,
    type CreateSupplierData,
} from '@/lib/redux/features';
import { toast } from 'react-toastify';
import { useBulkProductForm } from '../components/useBulkProductForm';
import { GlobalSupplierSelector } from '../components/GlobalSupplierSelector';
import { ProductFormFields } from '../components/ProductFormFields';
import { ProductAccordionItem } from '../components/ProductAccordionItem';
import { convertFormToSubmitData } from '../components/formDataUtils';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';

export default function CreateDigitalProductPage() {
    const router = useRouter();
    const { data: suppliersData, refetch: refetchSuppliers } = useGetSuppliersQuery({ per_page: 100, status: 'active' });
    const [createDigitalProducts, { isLoading, isSuccess, isError, error, data: createdProducts }] = useCreateDigitalProductsMutation();
    const [createSupplier, { isLoading: isCreatingSupplier }] = useCreateSupplierMutation();

    const {
        productForms,
        expandedItems,
        initializeForms,
        addProduct,
        removeProduct,
        toggleAccordion,
        updateProductForm,
        updateAllSuppliers,
        validateProductForm,
    } = useBulkProductForm();

    const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
    const [supplierError, setSupplierError] = useState<string>('');
    const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Initialize with one empty form
    useEffect(() => {
        if (!hasInitialized) {
            initializeForms(0);
            setHasInitialized(true);
        }
    }, [hasInitialized, initializeForms]);

    useEffect(() => {
        if (isSuccess && createdProducts) {
            toast.success('Digital product(s) created successfully');
            // Navigate to first created product's detail page
            if (createdProducts.length > 0) {
                router.push(`/admin/digital-stock/${createdProducts[0].id}`);
            } else {
                router.push('/admin/digital-stock');
            }
        }
    }, [isSuccess, createdProducts, router]);

    useEffect(() => {
        if (isError) {
            toast.error('Failed to create digital product(s)');
            console.error('Create digital product error:', error);
        }
    }, [isError, error]);

    const handleSupplierChange = (supplierId: number) => {
        setSelectedSupplierId(supplierId);
        setSupplierError('');
        updateAllSuppliers(supplierId);
    };

    const handleAddAnotherProduct = () => {
        addProduct(selectedSupplierId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate supplier first
        if (!selectedSupplierId || selectedSupplierId === 0) {
            setSupplierError('Supplier is required');
            return;
        }
        setSupplierError('');

        // Validate all forms
        const allValid = productForms.every((form) => validateProductForm(form));
        if (allValid) {
            const products = productForms.map((form) =>
                convertFormToSubmitData(form.formData, selectedSupplierId)
            );
            await createDigitalProducts({ products });
        }
    };

    const handleCreateSupplier = async (data: CreateSupplierData) => {
        try {
            const newSupplier = await createSupplier(data).unwrap();
            refetchSuppliers();
            if (newSupplier) {
                handleSupplierChange(newSupplier.id);
            }
            setIsAddSupplierDialogOpen(false);
            toast.success('Supplier created successfully');
        } catch (error) {
            console.error('Failed to create supplier:', error);
            toast.error('Failed to create supplier');
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create Digital Product{productForms.length > 1 ? `s (${productForms.length})` : ''}
                    </h1>
                    <p className="text-muted-foreground">
                        {productForms.length > 1
                            ? 'Add multiple digital products from external suppliers'
                            : 'Add a new digital product from external suppliers'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Global Supplier Selection */}
                <div className="bg-card border rounded-lg shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h2 className="text-lg font-semibold">Supplier Selection</h2>
                        <p className="text-sm text-muted-foreground mt-1">Choose the external supplier for these products</p>
                    </div>
                    <div className="p-6">
                        <GlobalSupplierSelector
                            selectedSupplierId={selectedSupplierId}
                            suppliers={suppliersData?.data || []}
                            error={supplierError}
                            onSupplierChange={handleSupplierChange}
                            onAddNewSupplier={() => setIsAddSupplierDialogOpen(true)}
                        />
                    </div>
                </div>

                {/* Product Forms */}
                <div className="space-y-4">
                    {productForms.length > 1 ? (
                        // Multiple products: show accordions for all except last
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
                                    suppliers={suppliersData?.data || []}
                                    onToggle={() => toggleAccordion(form.id)}
                                    onRemove={() => removeProduct(form.id)}
                                    onUpdate={(updates) => updateProductForm(form.id, updates)}
                                />
                            ))}
                            {/* Last product is always expanded and not in accordion */}
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
                                            onClick={() => removeProduct(productForms[productForms.length - 1].id)}
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
                                        updateProductForm(productForms[productForms.length - 1].id, updates)
                                    }
                                />
                            </div>
                        </>
                    ) : (
                        // Single product: show regular form
                        productForms[0] && (
                            <div className="bg-card border rounded-lg shadow-sm">
                                <div className="border-b px-6 py-4">
                                    <h2 className="text-lg font-semibold">Product Details</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Digital product information</p>
                                </div>
                                <div className="p-6">
                                    <ProductFormFields
                                        form={productForms[0].formData}
                                        formErrors={productForms[0].errors}
                                        formItemId={productForms[0].id}
                                        isEditMode={false}
                                        onUpdate={(updates) => {
                                            updateProductForm(productForms[0].id, updates);
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    )}

                    {/* Add Another Product Button */}
                    <div className="bg-card border rounded-lg shadow-sm p-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddAnotherProduct}
                            className="w-full h-12"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Another Product
                        </Button>
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
                        {isLoading ? 'Creating...' : 'Create Digital Product' + (productForms.length > 1 ? 's' : '')}
                    </Button>
                </div>
            </form>

            {/* Add New Supplier Dialog */}
            <SupplierFormDialog
                isOpen={isAddSupplierDialogOpen}
                isEditMode={false}
                selectedSupplier={null}
                isSubmitting={isCreatingSupplier}
                onClose={() => setIsAddSupplierDialogOpen(false)}
                onSubmit={handleCreateSupplier}
            />
        </div>
    );
}
