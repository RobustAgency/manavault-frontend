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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetDigitalProductsQuery, Supplier } from '@/lib/redux/features';
import { CheckIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignDigitalProductsDialogProps {
    isOpen: boolean;
    productId: number;
    suppliers: Supplier[];
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (digitalProductIds: number[]) => void;
}

export const AssignDigitalProductsDialog = ({
    isOpen,
    productId,
    suppliers,
    isSubmitting,
    onClose,
    onSubmit,
}: AssignDigitalProductsDialogProps) => {
    const [supplierId, setSupplierId] = useState<number>(0);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const perPage = 100;

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on new search
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Parse search query to extract name and brand
    const getSearchFilters = useCallback(() => {
        const trimmed = debouncedSearch.trim();
        if (!trimmed) {
            return {};
        }
        // For simplicity, search in name field (API supports name and brand separately)
        // You can enhance this to split search query if needed
        return { name: trimmed };
    }, [debouncedSearch]);

    // Fetch digital products with pagination and search
    const { data: digitalProductsData, isLoading } = useGetDigitalProductsQuery(
        {
            page: currentPage,
            per_page: perPage,
            status: 'active',
            supplier_id: supplierId > 0 ? supplierId : undefined,
            ...getSearchFilters(),
        },
        {
            skip: !isOpen || supplierId === 0, // Only fetch when dialog is open and supplier is selected
        }
    );

    const products = digitalProductsData?.data || [];
    const pagination = digitalProductsData?.pagination;

    // Reset selection and search when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSupplierId(0);
            setSelectedIds(new Set());
            setSearchQuery('');
            setDebouncedSearch('');
            setCurrentPage(1);
        }
    }, [isOpen]);

    // Reset selection when supplier changes
    useEffect(() => {
        setSelectedIds(new Set());
        setSearchQuery('');
        setDebouncedSearch('');
        setCurrentPage(1);
    }, [supplierId]);

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage >= 1 && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleToggle = (id: number) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const currentPageIds = products.map((p) => p.id);
        const allCurrentPageSelected = currentPageIds.every((id) => selectedIds.has(id));

        if (allCurrentPageSelected) {
            // Deselect all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                currentPageIds.forEach((id) => newSet.delete(id));
                return newSet;
            });
        } else {
            // Select all on current page
            setSelectedIds((prev) => {
                const newSet = new Set(prev);
                currentPageIds.forEach((id) => newSet.add(id));
                return newSet;
            });
        }
    };

    const handleSubmit = () => {
        if (selectedIds.size === 0) {
            return;
        }
        onSubmit(Array.from(selectedIds));
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Assign Digital Products</DialogTitle>
                    <DialogDescription>
                        Select digital products to associate with this product. You can select multiple products.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Supplier Select */}
                    <div className="grid gap-2">
                        <Label htmlFor="supplier_id">Supplier *</Label>
                        <Select
                            value={supplierId > 0 ? supplierId.toString() : undefined}
                            onValueChange={(value) => setSupplierId(parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {supplierId > 0 && !isLoading && products.length === 0 && !debouncedSearch && (
                            <p className="text-xs text-muted-foreground">
                                No digital products found for this supplier.
                            </p>
                        )}
                    </div>

                    {/* Search Input */}
                    {supplierId > 0 && (
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}

                    {/* Select All Button */}
                    {supplierId > 0 && products.length > 0 && (
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                {selectedIds.size} selected
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
                                {products.every((p) => selectedIds.has(p.id)) ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                    )}

                    {/* Products List */}
                    {supplierId > 0 && (
                        <div className="flex-1 overflow-y-auto border rounded-md">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-sm text-muted-foreground">Loading digital products...</p>
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
                                        const isSelected = selectedIds.has(product.id);
                                        return (
                                            <label
                                                key={product.id}
                                                className={cn(
                                                    'flex items-start gap-3 p-3 cursor-pointer hover:bg-accent transition-colors',
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
                                                        <div className="text-right shrink-0">
                                                            <p className="text-sm font-medium">
                                                                ${Number(product.cost_price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {supplierId > 0 && pagination && pagination.last_page > 1 && (
                        <div className="flex items-center justify-between border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
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
                                disabled={currentPage === pagination.last_page || isLoading}
                                className="gap-2"
                            >
                                Next
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedIds.size === 0}
                    >
                        {isSubmitting ? 'Assigning...' : `Assign ${selectedIds.size} Product${selectedIds.size !== 1 ? 's' : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

