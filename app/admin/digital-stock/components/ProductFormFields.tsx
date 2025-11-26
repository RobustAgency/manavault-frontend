'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Supplier,
} from '@/lib/redux/features';
import { type DigitalProductFormState } from './useDigitalProductForm';

interface ProductFormFieldsProps {
  form: DigitalProductFormState;
  formErrors: Record<string, string> | Partial<Record<keyof DigitalProductFormState, string>>;
  formItemId?: string;
  isEditMode: boolean;
  suppliers?: Supplier[];
  onUpdate: (updates: Partial<DigitalProductFormState>) => void;
  onSupplierChange?: (supplierId: number) => void;
}

export const ProductFormFields = ({
  form,
  formErrors,
  formItemId = 'edit',
  isEditMode,
  suppliers = [],
  onUpdate,
  onSupplierChange,
}: ProductFormFieldsProps) => {
  return (
    <div className="grid gap-4">
      {/* Supplier field only shown in edit mode */}
      {isEditMode && suppliers.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor={`supplier_id-${formItemId}`}>Supplier *</Label>
          <Select
            required
            value={form.supplier_id.toString()}
            onValueChange={(value) => {
              onUpdate({ supplier_id: parseInt(value) });
              onSupplierChange?.(parseInt(value));
            }}
            disabled={isEditMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name} {supplier.type === 'external' && '(External)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.supplier_id && <p className="text-sm text-red-500">{formErrors.supplier_id}</p>}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor={`name-${formItemId}`}>Product Name *</Label>
        <Input
          id={`name-${formItemId}`}
          value={form.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Steam Gift Card $50"
        />
        {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`sku-${formItemId}`}>SKU *</Label>
        <Input
          id={`sku-${formItemId}`}
          value={form.sku}
          onChange={(e) => onUpdate({ sku: e.target.value })}
          placeholder="STEAM-50-USD"
          disabled={isEditMode}
        />
        <div className="min-h-[20px]">
          {formErrors.sku && <p className="text-sm text-red-500">{formErrors.sku}</p>}
          {!formErrors.sku && isEditMode && <p className="text-xs text-muted-foreground">SKU cannot be updated</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`brand-${formItemId}`}>Brand</Label>
        <Input
          id={`brand-${formItemId}`}
          value={form.brand}
          onChange={(e) => onUpdate({ brand: e.target.value })}
          placeholder="Steam"
        />
        <p className="text-xs text-muted-foreground">Optional: Product brand name</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`description-${formItemId}`}>Description</Label>
        <Textarea
          id={`description-${formItemId}`}
          value={form.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Digital gift card for Steam platform"
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`tags-${formItemId}`}>Tags</Label>
        <Input
          id={`tags-${formItemId}`}
          value={form.tags}
          onChange={(e) => onUpdate({ tags: e.target.value })}
          placeholder="gaming, gift card, digital"
        />
        <p className="text-xs text-muted-foreground">Comma-separated tags (e.g., gaming, digital)</p>
        {formErrors.tags && <p className="text-sm text-red-500">{formErrors.tags}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`image-${formItemId}`}>Image URL</Label>
        <Input
          id={`image-${formItemId}`}
          type="url"
          value={form.image}
          onChange={(e) => onUpdate({ image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">Optional: Product image URL</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`cost_price-${formItemId}`}>Cost Price *</Label>
        <Input
          id={`cost_price-${formItemId}`}
          type="number"
          step="0.01"
          min="0"
          value={form.cost_price}
          onChange={(e) => onUpdate({ cost_price: e.target.value })}
          placeholder="45.00"
        />
        {formErrors.cost_price && <p className="text-sm text-red-500">{formErrors.cost_price}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`regions-${formItemId}`}>Region</Label>
        <Input
          id={`regions-${formItemId}`}
          value={form.regions}
          onChange={(e) => onUpdate({ regions: e.target.value })}
          placeholder="US"
        />
        <p className="text-xs text-muted-foreground">Comma-separated region codes (e.g., US, CA, UK)</p>
        {formErrors.regions && <p className="text-sm text-red-500">{formErrors.regions}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`metadata-${formItemId}`}>Metadata (JSON)</Label>
        <Textarea
          id={`metadata-${formItemId}`}
          value={form.metadata}
          onChange={(e) => onUpdate({ metadata: e.target.value })}
          placeholder='{"external_id": "steam-50-usd", "category": "Gaming"}'
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Optional: JSON object for additional metadata</p>
        {formErrors.metadata && <p className="text-sm text-red-500">{formErrors.metadata}</p>}
      </div>
    </div>
  );
};

