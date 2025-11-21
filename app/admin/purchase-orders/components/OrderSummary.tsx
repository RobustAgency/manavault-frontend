'use client';

import { DigitalProduct, Supplier } from '@/lib/redux/features';
import { formatCurrency } from './orderColumns';

interface OrderSummaryProps {
    itemsBySupplier: Record<number, Array<{ supplier_id: number; digital_product_id: number; quantity: number }>>;
    getSupplierDetails: (supplierId: number) => Supplier | undefined;
    getProductDetails: (productId: number) => DigitalProduct | undefined;
    totalAmount: number;
}

export const OrderSummary = ({
    itemsBySupplier,
    getSupplierDetails,
    getProductDetails,
    totalAmount,
}: OrderSummaryProps) => {
    return (
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-4">
                <h4 className="text-sm font-semibold">Order Summary</h4>
            </div>
            <div className="p-4 space-y-3">
                {Object.entries(itemsBySupplier).map(([supplierId, items]) => {
                    const supplier = getSupplierDetails(parseInt(supplierId));
                    const supplierTotal = items.reduce((total, item) => {
                        const product = getProductDetails(item.digital_product_id);
                        if (!product) return total;
                        const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                        return total + ((costPrice || 0) * item.quantity);
                    }, 0);

                    return (
                        <div key={supplierId} className="pb-3 border-b last:border-b-0">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                                {supplier?.name || `Supplier ${supplierId}`}
                            </p>
                            <div className="space-y-1.5 pl-3">
                                {items.map((item, itemIndex) => {
                                    const product = getProductDetails(item.digital_product_id);
                                    if (!product) return null;
                                    const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                                    const subtotal = (costPrice || 0) * item.quantity;
                                    return (
                                        <div key={itemIndex} className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600">
                                                {product.name} <span className="text-gray-400">× {item.quantity}</span>
                                            </span>
                                            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                                        </div>
                                    );
                                })}
                                <div className="flex justify-between items-center text-sm font-medium pt-1.5 border-t mt-1.5">
                                    <span className="text-gray-700">Subtotal:</span>
                                    <span className="text-gray-900">{formatCurrency(supplierTotal)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="flex justify-between items-center pt-3 border-t-2">
                    <span className="text-base font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>
        </div>
    );
};
