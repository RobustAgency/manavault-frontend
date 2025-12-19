'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Supplier,
  CreatePurchaseOrderData,
  useGetDigitalProductsListQuery,
  DigitalProduct,
} from '@/lib/redux/features';
import { usePurchaseOrderForm } from './usePurchaseOrderForm';
import { SelectDigitalProductsDialog } from './SelectDigitalProductsDialog';
import { SupplierCard } from './SupplierCard';
import { SupplierSelector } from './SupplierSelector';
import { OrderSummary } from './OrderSummary';
import { EmptyState } from './EmptyState';

interface CreateOrderDialogProps {
  isOpen: boolean;
  suppliers: Supplier[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePurchaseOrderData) => void;
  onSuppliersRefetch?: () => void;
}

export const CreateOrderDialog = ({
  isOpen,
  suppliers,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateOrderDialogProps) => {
  const { formData, errors, validateForm, resetForm, addItem, updateItem, removeItem } = usePurchaseOrderForm();

  // Dialog states for adding new items
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [isSelectProductsDialogOpen, setIsSelectProductsDialogOpen] = useState(false);
  const [selectedSupplierForProducts, setSelectedSupplierForProducts] = useState<number | null>(null);

  // Track active supplier selects (suppliers selected but products not yet added)
  const [activeSupplierSelects, setActiveSupplierSelects] = useState<number[]>([0]); // Start with one empty select
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number>>(new Set());

  // Fetch all digital products (we'll filter by supplier in the dialog)
  const { data: digitalProductsData, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetDigitalProductsListQuery(
    {
      per_page: 100,
      status: 'active',
    }
  );

  const allProducts = digitalProductsData?.data || [];

  // Cache product details when they're selected (to handle cases where product might not be in fetched list)
  const [productDetailsCache, setProductDetailsCache] = useState<Map<number, DigitalProduct>>(new Map());

  // Get product details for display - check cache first, then fetched products
  const getProductDetails = (productId: number): DigitalProduct | undefined => {
    // First check cache (products selected from dialog)
    if (productDetailsCache.has(productId)) {
      return productDetailsCache.get(productId);
    }
    // Then check fetched products
    return allProducts.find(p => p.id === productId);
  };

  // Get supplier details
  const getSupplierDetails = (supplierId: number): Supplier | undefined => {
    return suppliers.find(s => s.id === supplierId);
  };

  // Group items by supplier
  const itemsBySupplier = formData.items.reduce((acc, item) => {
    if (!acc[item.supplier_id]) {
      acc[item.supplier_id] = [];
    }
    acc[item.supplier_id].push(item);
    return acc;
  }, {} as Record<number, typeof formData.items>);

  // Get suppliers that have products (completed suppliers)
  const completedSupplierIds = Object.keys(itemsBySupplier).map(id => parseInt(id));

  // Get available suppliers for selects (not in active selects and not completed)
  const getAvailableSuppliersForSelect = (currentSelectIndex: number) => {
    const currentSelectId = activeSupplierSelects[currentSelectIndex];
    return suppliers.filter(supplier => {
      // Don't show if already completed
      if (completedSupplierIds.includes(supplier.id)) return false;
      // Don't show if selected in another active select
      const selectedInOtherSelect = activeSupplierSelects.some((selectId, index) =>
        index !== currentSelectIndex && selectId === supplier.id && selectId > 0
      );
      return !selectedInOtherSelect;
    });
  };
  
  const getSingleSupplierDetail = selectedSupplierForProducts ? getSupplierDetails(selectedSupplierForProducts) : undefined;

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsAddProductDialogOpen(false);
      setIsAddSupplierDialogOpen(false);
      setIsSelectProductsDialogOpen(false);
      setSelectedSupplierForProducts(null);
      setActiveSupplierSelects([0]); // Reset to one empty select
      setExpandedSuppliers(new Set());
      setProductDetailsCache(new Map()); // Clear product cache
    }
  }, [isOpen, resetForm]);

  const handleSupplierSelectChange = (selectIndex: number, supplierId: string) => {
    const id = parseInt(supplierId);
    if (id > 0) {
      // Update the active select with the selected supplier
      const newSelects = [...activeSupplierSelects];
      newSelects[selectIndex] = id;
      setActiveSupplierSelects(newSelects);

      // Open products dialog
      setSelectedSupplierForProducts(id);
      setIsSelectProductsDialogOpen(true);
    }
  };

  const handleProductsSelected = (items: Array<{ supplier_id: number; digital_product_id: number; quantity: number; product?: DigitalProduct }>) => {
    if (items.length === 0 || !selectedSupplierForProducts) {
      // No products selected, reset the supplier select
      handleProductsDialogClose();
      return;
    }

    // Cache product details if provided
    items.forEach((item) => {
      if (item.product) {
        setProductDetailsCache(prev => {
          const newMap = new Map(prev);
          newMap.set(item.digital_product_id, item.product!);
          return newMap;
        });
      }
    });

    // Add new items, avoiding duplicates (same supplier + product combination)
    items.forEach((item) => {
      const existingIndex = formData.items.findIndex(
        (i) => i.supplier_id === item.supplier_id && i.digital_product_id === item.digital_product_id
      );
      if (existingIndex >= 0) {
        // Update quantity if product already exists for this supplier
        updateItem(existingIndex, { quantity: item.quantity });
      } else {
        // Add new item (without product field, as it's not part of the form data structure)
        const { product, ...itemData } = item;
        addItem(itemData);
      }
    });

    // Remove the completed supplier from active selects and add a new empty select
    const newSelects = activeSupplierSelects.filter(id => id !== selectedSupplierForProducts);
    if (newSelects.length === 0 || newSelects.every(id => id > 0)) {
      // Add a new empty select if all are completed or none exist
      newSelects.push(0);
    }
    setActiveSupplierSelects(newSelects);

    setIsSelectProductsDialogOpen(false);
    setSelectedSupplierForProducts(null);
  };

  const handleProductsDialogClose = () => {
    // Reset the supplier select that was waiting for products
    if (selectedSupplierForProducts) {
      setActiveSupplierSelects(prev =>
        prev.map(id => id === selectedSupplierForProducts ? 0 : id)
      );
    }
    setIsSelectProductsDialogOpen(false);
    setSelectedSupplierForProducts(null);
  };

  const toggleSupplierAccordion = (supplierId: number) => {
    setExpandedSuppliers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  };

  const handleRemoveSupplier = (supplierId: number) => {
    // Remove all items for this supplier
    const itemsToRemove = formData.items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.supplier_id === supplierId)
      .reverse(); // Remove from end to avoid index shifting

    itemsToRemove.forEach(({ index }) => removeItem(index));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for products
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Header Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Purchase Order Details</h3>
            <p className="text-xs text-muted-foreground">
              Add suppliers and their products to create a purchase order. You can order from multiple suppliers in one order.
            </p>
          </div>

          {/* Suppliers & Products Section */}
          <div className="space-y-4">
            {/* Completed Suppliers */}
            {completedSupplierIds.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Suppliers & Products</Label>
                  <span className="text-xs text-muted-foreground">
                    {completedSupplierIds.length} supplier{completedSupplierIds.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {completedSupplierIds.map((supplierId) => {
                    const supplier = getSupplierDetails(supplierId);
                    const items = itemsBySupplier[supplierId] || [];
                    const isExpanded = expandedSuppliers.has(supplierId);

                    return (
                      <SupplierCard
                        key={supplierId}
                        supplierId={supplierId}
                        supplier={supplier}
                        items={items}
                        isExpanded={isExpanded}
                        onToggle={() => toggleSupplierAccordion(supplierId)}
                        onRemove={() => handleRemoveSupplier(supplierId)}
                        onUpdateQuantity={(itemIndex, quantity) => {
                          const globalIndex = formData.items.findIndex(
                            (i) => i.supplier_id === items[itemIndex].supplier_id &&
                              i.digital_product_id === items[itemIndex].digital_product_id
                          );
                          updateItem(globalIndex, { quantity });
                        }}
                        onRemoveItem={(itemIndex) => {
                          const globalIndex = formData.items.findIndex(
                            (i) => i.supplier_id === items[itemIndex].supplier_id &&
                              i.digital_product_id === items[itemIndex].digital_product_id
                          );
                          removeItem(globalIndex);
                        }}
                        getProductDetails={getProductDetails}
                        errors={Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v ?? '']))}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Supplier Section */}
            <div className="space-y-3">
              {activeSupplierSelects.length > 0 && activeSupplierSelects.map((selectId, index) => {
                const availableSuppliers = getAvailableSuppliersForSelect(index);
                const isWaitingForProducts = selectId > 0 && !completedSupplierIds.includes(selectId);

                return (
                  <SupplierSelector
                    key={index}
                    selectId={selectId}
                    isWaitingForProducts={isWaitingForProducts}
                    availableSuppliers={availableSuppliers}
                    onSupplierChange={(value) => handleSupplierSelectChange(index, value)}
                    getSupplierDetails={getSupplierDetails}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {formData.items.length === 0 && activeSupplierSelects.every(id => id === 0) && (
              <EmptyState />
            )}
          </div>

          {/* Validation Error */}
          {errors.items && (
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{errors.items}</p>
            </div>
          )}

          {/* Order Summary */}
          {formData.items.length > 0 && (
            <OrderSummary
              itemsBySupplier={itemsBySupplier}
              getSupplierDetails={getSupplierDetails}
              getProductDetails={getProductDetails}
              totalAmount={formData.items.reduce((total, item) => {
                const product = getProductDetails(item.digital_product_id);
                if (!product) return total;
                const costPrice = typeof product.cost_price === 'string' ? parseFloat(product.cost_price) : product.cost_price;
                return total + ((costPrice || 0) * item.quantity);
              }, 0)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Select Digital Products Dialog */}
      <SelectDigitalProductsDialog
        supplierDetails={getSingleSupplierDetail }
        isOpen={isSelectProductsDialogOpen}
        supplierId={selectedSupplierForProducts || 0}
        isSubmitting={false}
        onClose={handleProductsDialogClose}
        onSubmit={handleProductsSelected}
        onAddNewProduct={() => {
          setIsSelectProductsDialogOpen(false);
          setIsAddProductDialogOpen(true);
        }}
      />
    </Dialog>
  );
};

