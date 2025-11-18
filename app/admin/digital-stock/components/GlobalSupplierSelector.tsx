'use client';

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
import { Supplier } from '@/lib/redux/features';

interface GlobalSupplierSelectorProps {
  selectedSupplierId: number;
  suppliers: Supplier[];
  error?: string;
  onSupplierChange: (supplierId: number) => void;
  onAddNewSupplier: () => void;
}

export const GlobalSupplierSelector = ({
  selectedSupplierId,
  suppliers,
  error,
  onSupplierChange,
  onAddNewSupplier,
}: GlobalSupplierSelectorProps) => {
  return (
    <div className="grid gap-2 border-b pb-4">
      <Label htmlFor="global-supplier-id">Supplier *</Label>
      <Select
        required
        value={selectedSupplierId.toString()}
        onValueChange={(value) => onSupplierChange(parseInt(value))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a supplier for all products" />
        </SelectTrigger>
        <SelectContent>
          {suppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id.toString()}>
              {supplier.name} {supplier.type === 'external' && '(External)'}
            </SelectItem>
          ))}
          <div className="border-t pt-1 mt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddNewSupplier();
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Supplier
            </Button>
          </div>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-muted-foreground">This supplier will be applied to all products</p>
    </div>
  );
};

