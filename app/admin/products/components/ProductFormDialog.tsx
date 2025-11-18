'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Product,
  ProductStatus,
  CreateProductData,
} from '@/lib/redux/features';
import { useProductForm } from './useProductForm';

interface ProductFormDialogProps {
  isOpen: boolean;
  isEditMode: boolean;
  selectedProduct: Product | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => void;
}

export const ProductFormDialog = ({
  isOpen,
  isEditMode,
  selectedProduct,
  isSubmitting,
  onClose,
  onSubmit,
}: ProductFormDialogProps) => {
  const { formData, setFormData, errors, validateForm, resetForm, updateFormData } = useProductForm(isEditMode);

  // Initialize form when editing
  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setFormData({
        name: selectedProduct.name,
        brand: selectedProduct.brand || '',
        description: selectedProduct.description || '',
        short_description: selectedProduct.short_description || '',
        long_description: selectedProduct.long_description || '',
        sku: selectedProduct.sku,
        selling_price: selectedProduct.selling_price?.toString() ?? '',
        status: selectedProduct.status,
        tags: selectedProduct.tags?.join(', ') || '',
        image: selectedProduct.image || '',
        regions: selectedProduct.regions?.join(', ') || '',
      });
    } else {
      resetForm();
    }
  }, [isEditMode, selectedProduct, isOpen]);


  const handleSubmit = () => {
    if (validateForm(false, '')) {
      const submitData: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        selling_price: parseFloat(formData.selling_price),
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.brand.trim()) submitData.brand = formData.brand.trim();
      if (formData.description.trim()) submitData.description = formData.description.trim();
      if (formData.short_description.trim()) submitData.short_description = formData.short_description.trim();
      if (formData.long_description.trim()) submitData.long_description = formData.long_description.trim();
      if (formData.image.trim()) submitData.image = formData.image.trim();

      // Parse tags from comma-separated string
      if (formData.tags.trim()) {
        submitData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }

      // Parse regions from comma-separated string
      if (formData.regions.trim()) {
        submitData.regions = formData.regions.split(',').map(region => region.trim()).filter(region => region.length > 0);
      }

      onSubmit(submitData);
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
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update product information' : 'Add a new product to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Product Name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => updateFormData({ sku: e.target.value })}
              placeholder="PROD-001"
              disabled={isEditMode}
            />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
            {!errors.sku && isEditMode && <p className="text-xs text-muted-foreground">SKU cannot be updated</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => updateFormData({ brand: e.target.value })}
              placeholder="Brand name"
              maxLength={255}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => updateFormData({ short_description: e.target.value })}
              placeholder="Brief product description..."
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => updateFormData({ long_description: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => updateFormData({ image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              maxLength={255}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateFormData({ tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="regions">Regions (comma-separated)</Label>
            <Input
              id="regions"
              value={formData.regions}
              onChange={(e) => updateFormData({ regions: e.target.value })}
              placeholder="US, CA, UK"
            />
            <p className="text-xs text-muted-foreground">Separate multiple regions with commas (e.g., US, CA, UK)</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="selling_price">Selling Price *</Label>
            <Input
              required
              id="selling_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.selling_price}
              onChange={(e) => updateFormData({ selling_price: e.target.value })}
              placeholder="0.00"
            />
            {errors.selling_price && <p className="text-sm text-red-500">{errors.selling_price}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              required
              value={formData.status}
              onValueChange={(value: ProductStatus) => updateFormData({ status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_active">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
};

