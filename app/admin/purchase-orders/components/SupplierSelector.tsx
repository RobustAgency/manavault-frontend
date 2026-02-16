'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Supplier } from '@/lib/redux/features';

interface SupplierSelectorProps {
    selectId: number;
    isWaitingForProducts: boolean;
    availableSuppliers: Supplier[];
    onSupplierChange: (value: string) => void;
    getSupplierDetails: (supplierId: number) => Supplier | undefined;
}

export const SupplierSelector = ({
    selectId,
    isWaitingForProducts,
    availableSuppliers,
    onSupplierChange,
    getSupplierDetails,
}: SupplierSelectorProps) => {
    return (
        <div className="border border-dashed rounded-lg p-4 bg-blue-50/50">
            <Label className="text-sm font-medium mb-2 block">
                {isWaitingForProducts ? 'Select Products' : 'Add Supplier'}
            </Label>
            <Select
                value={selectId > 0 ? selectId.toString() : ""}
                onValueChange={onSupplierChange}
                disabled={isWaitingForProducts}
            >
                <SelectTrigger className="bg-white">
                    <SelectValue
                        placeholder={
                            isWaitingForProducts
                                ? `${getSupplierDetails(selectId)?.name || `Supplier ${selectId}`} - Waiting for products...`
                                : "Choose a supplier to add products..."
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {availableSuppliers.length > 0 ? (
                        availableSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                <div className="flex items-center gap-2">
                                    <span>{supplier.name}</span>
                                    {supplier.slug && (
                                        <span className="text-xs text-muted-foreground">({supplier.slug})</span>
                                    )}
                                </div>
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                            No more suppliers available
                        </div>
                    )}
                </SelectContent>
            </Select>
            {isWaitingForProducts && (
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                    Select products for this supplier
                </p>
            )}
        </div>
    );
};
