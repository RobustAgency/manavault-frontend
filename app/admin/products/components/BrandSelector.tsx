'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetBrandsQuery } from '@/lib/redux/features';
import { BrandDialog } from '@/app/admin/brands/components';

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

  const { data: brandsData, isLoading: isLoadingBrands } = useGetBrandsQuery({
    per_page: 100,
  });

  const brands = brandsData?.data || [];

  const handleBrandCreated = (brand: { id: number; name: string }) => {
    onChange(brand.id);
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

      <BrandDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleBrandCreated}
      />
    </>
  );
};

