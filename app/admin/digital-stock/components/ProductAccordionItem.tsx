'use client';

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DigitalProductFormState } from './useDigitalProductForm';
import { ProductFormFields } from './ProductFormFields';
import { Supplier } from '@/lib/redux/features';

interface ProductAccordionItemProps {
  id: string;
  index: number;
  formData: DigitalProductFormState;
  errors: Record<string, string>;
  isExpanded: boolean;
  canRemove: boolean;
  suppliers: Supplier[];
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<DigitalProductFormState>) => void;
}

export const ProductAccordionItem = ({
  id,
  index,
  formData,
  errors,
  isExpanded,
  canRemove,
  suppliers,
  onToggle,
  onRemove,
  onUpdate,
}: ProductAccordionItemProps) => {
  return (
    <div className="border rounded-lg mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium">
            Product {index + 1}: {formData.name || 'New Product'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 pt-0 border-t">
          <ProductFormFields
            form={formData}
            formErrors={errors}
            formItemId={id}
            isEditMode={false}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};

