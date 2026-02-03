'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Supplier, useGetDigitalProductsListQuery, type DigitalProduct } from '@/lib/redux/features';
import { CheckIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { DigitalProductCurrency } from '@/types';

interface SelectedProduct {
    id: number;
    quantity: number;
}

interface SelectDigitalProductsDialogProps {
    isOpen: boolean;
    supplierId: number;
    currency: DigitalProductCurrency;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (products: Array<{ supplier_id: number; digital_product_id: number; quantity: number; product?: DigitalProduct; currency: string }>) => void;
    onAddNewProduct?: () => void;
    supplierDetails?: Supplier;
}

export const SelectDigitalProductsDialog = ({
    supplierDetails,
    currency,
    isOpen,
    supplierId,
    isSubmitting,
    onClose,
    onSubmit,
    onAddNewProduct,
}: SelectDigitalProductsDialogProps) => {
    const [selectedProducts, setSelectedProducts] = useState<Map<number, number>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastSupplierId, setLastSupplierId] = useState<number | null>(null);

    const perPage = 100;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Parse search query
    const getSearchFilters = useCallback(() => {
        const trimmed = debouncedSearch.trim();
        if (!trimmed) {
            return {};
        }
        return { name: trimmed };
    }, [debouncedSearch]);

    // Fetch digital products with pagination and search
    const { data: digitalProductsData, isLoading, isFetching, refetch } = useGetDigitalProductsListQuery(
        {
            page: currentPage,
            per_page: perPage,
            status: 'active',
            currency: currency === 'usd' ? 'usd' : 'eur',
            supplier_id: supplierId > 0 ? supplierId : undefined,
            ...getSearchFilters(),
        },
        {
            skip: !isOpen || supplierId === 0,
        }
    );

    // Track when supplier changes and reset state
    useEffect(() => {
        if (isOpen && supplierId !== lastSupplierId) {
            setLastSupplierId(supplierId);
            setSelectedProducts(new Map());
            setSearchQuery('');
            setDebouncedSearch('');
            setCurrentPage(1);
        }
    }, [isOpen, supplierId, lastSupplierId]);

    // Refetch when dialog opens to get latest products
    useEffect(() => {
        if (isOpen && supplierId > 0) {
            refetch();
        }
    }, [isOpen, supplierId, refetch]);

    const products = digitalProductsData?.data || [];
    const pagination = digitalProductsData?.pagination;

    // Determine if we're showing loading state
    // Show loading if: currently loading OR fetching OR supplier changed (showing stale data)
    const isShowingLoading = isLoading || isFetching || (lastSupplierId !== supplierId && supplierId > 0);

    // Reset selection and search when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedProducts(new Map());
            setSearchQuery('');
            setDebouncedSearch('');
            setCurrentPage(1);
            setLastSupplierId(null);
        }
    }, [isOpen]);

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleToggle = (productId: number) => {
        setSelectedProducts((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(productId)) {
                newMap.delete(productId);
            } else {
                newMap.set(productId, 1); // Default quantity is 1
            }
            return newMap;
        });
    };

    const handleQuantityChange = (productId: number, quantity: number) => {
        const qty = Math.max(1, Math.floor(quantity) || 1);
        setSelectedProducts((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(productId)) {
                newMap.set(productId, qty);
            }
            return newMap;
        });
    };

    const handleSelectAll = () => {
        const currentPageIds = products.map((p) => p.id);
        const allCurrentPageSelected = currentPageIds.every((id) => selectedProducts.has(id));

        if (allCurrentPageSelected) {
            // Deselect all on current page
            setSelectedProducts((prev) => {
                const newMap = new Map(prev);
                currentPageIds.forEach((id) => newMap.delete(id));
                return newMap;
            });
        } else {
            // Select all on current page
            setSelectedProducts((prev) => {
                const newMap = new Map(prev);
                currentPageIds.forEach((id) => newMap.set(id, 1));
                return newMap;
            });
        }
    };

    const handleSubmit = () => {
        if (selectedProducts.size === 0 || supplierId === 0) {
            return;
        }
        const items = Array.from(selectedProducts.entries()).map(([digital_product_id, quantity]) => {
            const product = products.find(p => p.id === digital_product_id);
            return {
                supplier_id: supplierId,
                digital_product_id,
                quantity,
                product, // Include product details
                currency: currency || 'usd',
            };
        });
        onSubmit(items);
    };

    const totalItems = selectedProducts.size;
    const totalQuantity = Array.from(selectedProducts.values()).reduce((sum, qty) => sum + qty, 0);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Digital Products</DialogTitle>
                    <DialogDescription>
                        Select digital products and specify quantities for each. You can select multiple products.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 justify-center items-center">
                        <div className="relative flex gap-2">
                            <Label>Supplier Name: </Label>
                            <Badge variant="filled" className="capitalize">
                                {supplierDetails?.name}
                            </Badge>
                        </div>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='pl-9'
                            />
                        </div>
                    </div>

                    {/* Select All Button */}
                    {products.length > 0 && (
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                {totalItems} product{totalItems !== 1 ? 's' : ''} selected ({totalQuantity} total quantity)
                                {pagination && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        (Page {currentPage} of {pagination.last_page} • {pagination.total} total)
                                    </span>
                                )}
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                className="h-8"
                            >
                                {products.every((p) => selectedProducts.has(p.id)) ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    )}

                    {/* Products List */}
                    <div className="flex-1 overflow-y-auto border rounded-md">
                        {isShowingLoading ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-sm text-muted-foreground">
                                    {debouncedSearch ? 'No products found matching your search.' : 'No digital products available.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {products.map((product) => {
                                    const isSelected = selectedProducts.has(product.id);
                                    const quantity = selectedProducts.get(product.id) || 1;
                                    return (
                                        <div
                                            key={product.id}
                                            className={cn(
                                                'flex items-start gap-3 p-3 transition-colors',
                                                isSelected && 'bg-accent'
                                            )}
                                        >
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggle(product.id)}
                                                    className={cn(
                                                        "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
                                                        isSelected && "bg-primary"
                                                    )}
                                                />
                                                {isSelected && (
                                                    <CheckIcon className="absolute h-4 w-4 text-primary-foreground pointer-events-none" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                                {product.sku}
                                                            </code>
                                                            {product.brand && (
                                                                <span className="text-xs text-muted-foreground">{product.brand}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium">
                                                                {formatCurrency(Number(product.cost_price), product.currency)}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor={`qty-${product.id}`} className="text-xs whitespace-nowrap">
                                                                    Qty:
                                                                </Label>
                                                                <Input
                                                                    id={`qty-${product.id}`}
                                                                    type="number"
                                                                    min="1"
                                                                    value={quantity}
                                                                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                                                    className="w-20 h-8 text-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {pagination && pagination.last_page > 1 && !isShowingLoading && (
                        <div className="flex items-center justify-between border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isShowingLoading}
                                className="gap-2"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {pagination.last_page}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.last_page || isShowingLoading}
                                className="gap-2"
                            >
                                Next
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Add New Product Button */}
                    {/* {supplierId > 0 && onAddNewProduct && (
                        <div className="border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onAddNewProduct}
                                className="w-full gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add New Digital Product
                            </Button>
                        </div>
                    )} */}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedProducts.size === 0}
                    >
                        {isSubmitting ? 'Adding...' : `Add ${totalItems} Product${totalItems !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

