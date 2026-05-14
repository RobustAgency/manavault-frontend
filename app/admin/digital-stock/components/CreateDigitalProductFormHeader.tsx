import { GlobalSupplierSelector } from './GlobalSupplierSelector';
import { type Supplier } from '@/lib/redux/features';

type CreateDigitalProductFormHeaderProps = {
    selectedSupplierId: number | undefined;
    suppliers: Supplier[];
    supplierError: string;
    onSupplierChange: (supplierId: number) => void;
    onAddNewSupplier: () => void;
};

export const CreateDigitalProductFormHeader = ({
    selectedSupplierId,
    suppliers,
    supplierError,
    onSupplierChange,
    onAddNewSupplier,
}: CreateDigitalProductFormHeaderProps) => (
    <div className="bg-card border rounded-lg shadow-sm">
        <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Supplier Selection</h2>
            <p className="text-sm text-muted-foreground mt-1">
                Choose the supplier for these products
            </p>
        </div>
        <div className="p-6">
            <GlobalSupplierSelector
                selectedSupplierId={selectedSupplierId ?? undefined}
                suppliers={suppliers}
                error={supplierError}
                onSupplierChange={onSupplierChange}
                onAddNewSupplier={onAddNewSupplier}
                addNewSupplier
            />
        </div>
    </div>
);
