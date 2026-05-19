'use client';

import { useState, useCallback } from 'react';
import { PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingPriceCell } from '@/components/custom/InlinePriceCell';
import type { DigitalProduct } from '@/lib/redux/features';

function getDiscountString(product: DigitalProduct): string {
  const raw = product.selling_discount;
  if (raw === null || raw === undefined || raw === '') return '';
  return String(raw);
}

/** Used by the Selling Price column so “no price” rows show — instead of $0. */
export function isSellingPricePresent(product: DigitalProduct): boolean {
  const sp = product.selling_price;
  return sp !== null && sp !== undefined && sp !== '';
}

interface DigitalDiscountCellProps {
  product: DigitalProduct;
  canEdit: boolean;
  onUpdateDiscount?: (product: DigitalProduct, value: string) => void | Promise<void>;
  savingDiscountId?: number | null;
}

export function DigitalDiscountCell({
  product,
  canEdit,
  onUpdateDiscount,
  savingDiscountId,
}: DigitalDiscountCellProps) {
  const [isEditing, setIsEditing] = useState(false);

  const initialStr = getDiscountString(product);
  const hasExistingDiscount = initialStr !== '';
  const isSaving = savingDiscountId === product.id;

  const handleSaveDiscount = useCallback(
    async (value: string) => {
      if (!onUpdateDiscount) return;
      try {
        await onUpdateDiscount(product, value);
        setIsEditing(false);
      } catch {
        // Keep edit mode open; toast is shown by the parent handler.
      }
    },
    [onUpdateDiscount, product]
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!canEdit || !onUpdateDiscount) {
    return (
      <span className="text-sm tabular-nums">
        {hasExistingDiscount ? `${Number(initialStr)}%` : '—'}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <PendingPriceCell
          key={`${product.id}-edit-${initialStr}`}
          variant="percentage"
          initialValue={initialStr}
          isSaving={isSaving}
          buttonLabel={hasExistingDiscount ? 'Save' : 'Add'}
          onAdd={(value) => void handleSaveDiscount(value)}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-h-8">
      <span className="text-sm tabular-nums">
        {hasExistingDiscount ? `${Number(initialStr)}%` : '—'}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => setIsEditing(true)}
        disabled={isSaving}
        aria-label={hasExistingDiscount ? 'Edit discount' : 'Add discount'}
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
