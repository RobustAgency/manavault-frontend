'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
} from '@/lib/redux/features';

interface BrandSelectorProps {
  value: string | number | null;
  onChange: (value: number | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const BrandSelector = ({
  value,
  onChange,
  error,
  label = 'Brand',
  required = false,
}: BrandSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: brandsData, isLoading: isLoadingBrands } = useGetBrandsQuery({
    per_page: 100,
  });
  const [createBrand] = useCreateBrandMutation();

  const brands = brandsData?.data || [];

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const result = await createBrand({ name: newBrandName.trim() }).unwrap();
      onChange(result.id);
      setNewBrandName('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to create brand:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="brand" className="text-sm font-medium">
          {label} {required && '*'}
        </Label>
        <Select
          value={value ? String(value) : ''}
          onValueChange={(val) => onChange(val ? parseInt(val) : null)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select a brand" />
          </SelectTrigger>
          <SelectContent>
            {isLoadingBrands ? (
              <SelectItem value="loading" disabled>
                Loading brands...
              </SelectItem>
            ) : brands.length === 0 ? (
              <SelectItem value="no-brands" disabled>
                No brands available
              </SelectItem>
            ) : (
              brands.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))
            )}
            <div className="border-t pt-1 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Brand
              </Button>
            </div>
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription>
              Create a new brand to use in your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-brand-name">Brand Name *</Label>
              <Input
                id="new-brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name"
                maxLength={255}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newBrandName.trim()) {
                    e.preventDefault();
                    handleAddBrand();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setNewBrandName('');
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddBrand}
              disabled={!newBrandName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

