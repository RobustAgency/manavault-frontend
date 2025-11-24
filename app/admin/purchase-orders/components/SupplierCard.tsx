'use client';

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DigitalProduct, Supplier } from '@/lib/redux/features';
import { formatCurrency } from './orderColumns';

interface SupplierCardProps {
    supplierId: number;
    supplier?: Supplier;
    items: Array<{ supplier_id: number; digital_product_id: number; quantity: number }>;
    isExpanded: boolean;
    onToggle: () => void;
    onRemove: () => void;
    onUpdateQuantity: (itemIndex: number, quantity: number) => void;
    onRemoveItem: (itemIndex: number) => void;
    getProductDetails: (productId: number) => DigitalProduct | undefined;
    errors: Record<string, string>;
}

export const SupplierCard = ({
    supplierId,
    supplier,
    items,
    isExpanded,
    onToggle,
    onRemove,
    onUpdateQuantity,
    onRemoveItem,
    getProductDetails,
    errors,
}: SupplierCardProps) => {
    const itemCount = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const supplierTotal = items.reduce((total, item) => {
        const product = getProductDetails(item.digital_product_id);
        if (!product) return total;
        const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
        return total + ((costPrice || 0) * item.quantity);
    }, 0);

    return (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Supplier Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
                onClick={onToggle}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                            {supplier?.name || `Supplier ID: ${supplierId}`}
                        </p>
                        {supplier?.slug && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {supplier.slug}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{itemCount} product{itemCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{totalQuantity} total units</span>
                        <span>•</span>
                        <span className="font-medium text-gray-900">{formatCurrency(supplierTotal)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </div>

            {/* Products List */}
            {isExpanded && (
                <div className="p-4 bg-gray-50 border-t">
                    <div className="space-y-3">
                        {items.map((item, itemIndex) => {
                            const product = getProductDetails(item.digital_product_id);
                            const itemError = errors[`items.${itemIndex}.quantity`] ||
                                errors[`items.${itemIndex}.digital_product_id`] ||
                                errors[`items.${itemIndex}.supplier_id`];
                            const costPrice = product ? (typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price) : 0;
                            const subtotal = (costPrice || 0) * item.quantity;

                            return (
                                <div key={`${item.supplier_id}-${item.digital_product_id}-${itemIndex}`} className="bg-white rounded-lg border p-3 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            {product ? (
                                                <>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">{product.name}</p>
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                                                            {product.sku}
                                                        </code>
                                                        {product.brand && (
                                                            <span className="text-xs text-gray-600 px-2 py-0.5 bg-gray-100 rounded">
                                                                {product.brand}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                                        <span>Unit Cost: <span className="font-medium text-gray-900">{formatCurrency(costPrice)}</span></span>
                                                        <span>•</span>
                                                        <span>Subtotal: <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span></span>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Product ID: {item.digital_product_id}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex flex-col items-end gap-1">
                                                <Label htmlFor={`qty-${itemIndex}`} className="text-xs text-gray-600">
                                                    Quantity
                                                </Label>
                                                <Input
                                                    id={`qty-${itemIndex}`}
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => onUpdateQuantity(itemIndex, parseInt(e.target.value) || 1)}
                                                    className="w-20 h-9 text-sm text-center"
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRemoveItem(itemIndex)}
                                                className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 mt-5"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {itemError && (
                                        <p className="text-xs text-red-500 mt-2 px-1">{itemError}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
