'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    useGetSuppliersQuery,
    useCreateDigitalProductsMutation,
    useCreateSupplierMutation,
    type CreateSupplierData,
} from '@/lib/redux/features';
import { toast } from 'react-toastify';
import { useBulkProductForm } from '../components/useBulkProductForm';
import { convertFormToSubmitData } from '../components/formDataUtils';
import { SupplierFormDialog } from '@/app/admin/suppliers/components/SupplierFormDialog';
import { CreateDigitalProductHeader } from '../components/CreateDigitalProductHeader';
import { CreateDigitalProductForm } from '../components/CreateDigitalProductForm';

export default function CreateDigitalProductPage() {
    const router = useRouter();
    const { data: suppliersData, refetch: refetchSuppliers } = useGetSuppliersQuery({ per_page: 100, status: 'active', type: 'internal' });
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

    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
    const [supplierError, setSupplierError] = useState<string>('');
    const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (!hasInitialized) {
            initializeForms(0);
            setHasInitialized(true);
        }
    }, [hasInitialized, initializeForms]);

    useEffect(() => {
        if (isSuccess && createdProducts) {
            router.push('/admin/digital-stock');
        }
    }, [isSuccess, router]);

    useEffect(() => {
        if (isError) {
            console.error('Create digital product error:', error);
        }
    }, [isError, error]);

    const handleSupplierChange = (supplierId: number) => {
        setSelectedSupplierId(supplierId);
        setSupplierError('');
        updateAllSuppliers(supplierId);
    };

    const handleAddAnotherProduct = () => {
        addProduct(selectedSupplierId ?? 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplierId || selectedSupplierId === 0) {
            setSupplierError('Supplier is required');
            return;
        }
        setSupplierError('');
        const allValid = productForms.every((form) => validateProductForm(form));
        if (!allValid) return;

        try {
            const products = productForms.map((form) =>
                convertFormToSubmitData(form.formData, selectedSupplierId)
            );
            const hasImageFile = productForms.some((form) => form.formData.image instanceof File);

            let payload: { products: typeof products } | FormData = { products };

            if (hasImageFile) {
                const formData = new FormData();
                products.forEach((product, index) => {
                    Object.entries(product).forEach(([key, value]) => {
                        if (value === undefined || value === null || value === '') return;
                        if (Array.isArray(value)) {
                            value.forEach((item) =>
                                formData.append(`products[${index}][${key}][]`, String(item))
                            );
                            return;
                        }
                        if (typeof value === 'object') {
                            formData.append(`products[${index}][${key}]`, JSON.stringify(value));
                            return;
                        }
                        formData.append(`products[${index}][${key}]`, String(value));
                    });

                    const image = productForms[index].formData.image;
                    if (image instanceof File) {
                        formData.append(`products[${index}][image]`, image);
                    }
                });
                payload = formData;
            }

            await createDigitalProducts(payload).unwrap();
            const count = Array.isArray(products) ? products.length : 1;
            toast.success(`Digital product ${count > 1 ? 's' : ''} created successfully`);
        } catch (error) {
            toast.error((error as any).data?.message || 'Failed to create digital product(s)');
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
            <CreateDigitalProductHeader
                productCount={productForms.length}
                onBack={() => router.back()}
            />

            <CreateDigitalProductForm
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
                suppliers={suppliersData?.data || []}
                selectedSupplierId={selectedSupplierId}
                supplierError={supplierError}
                onSupplierChange={handleSupplierChange}
                onAddNewSupplier={() => setIsAddSupplierDialogOpen(true)}
                productForms={productForms}
                expandedItems={expandedItems}
                onToggleAccordion={toggleAccordion}
                onRemoveProduct={removeProduct}
                onUpdateProductForm={updateProductForm}
                onAddProduct={handleAddAnotherProduct}
            />

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
