'use client';

import { useState, useCallback } from 'react';
import { PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingPriceCell } from '@/components/custom/InlinePriceCell';
import type { DigitalProduct } from '@/lib/redux/features';

function getDiscountString(product: DigitalProduct): string {
  const raw =  product.selling_discount;
  if (raw === null || raw === undefined || raw === '') return '';
  return String(raw);
}

interface DigitalDiscountCellProps {
  product: DigitalProduct;
  canEdit: boolean;
  onUpdateDiscount?: (product: DigitalProduct, value: string) => void | Promise<void>;
  onUpdateSellingPrice?: (product: DigitalProduct, value: string) => void | Promise<void>;
  savingDiscountId?: number | null;
}

type EditKind = null | 'price' | 'discount';

export function DigitalDiscountCell({
  product,
  canEdit,
  onUpdateDiscount,
  onUpdateSellingPrice,
  savingDiscountId,
}: DigitalDiscountCellProps) {
  const [editKind, setEditKind] = useState<EditKind>(null);

  const sellingPrice = product.selling_price;
  const hasSellingPrice =
    sellingPrice !== null && sellingPrice !== undefined && sellingPrice !== '';

  const initialStr = getDiscountString(product);
  const hasExistingDiscount = initialStr !== '';
  const isSaving = savingDiscountId === product.id;

  const handleSaveDiscount = useCallback(
    async (value: string) => {
      if (!onUpdateDiscount) return;
      try {
        await onUpdateDiscount(product, value);
        setEditKind(null);
      } catch {
        // Keep edit mode open; toast is shown by the parent handler.
      }
    },
    [onUpdateDiscount, product]
  );

  const handleSavePrice = useCallback(
    async (value: string) => {
      if (!onUpdateSellingPrice) return;
      try {
        await onUpdateSellingPrice(product, value);
        setEditKind(null);
      } catch {
        // Keep edit mode open; toast is shown by the parent handler.
      }
    },
    [onUpdateSellingPrice, product]
  );

  const handleCancel = useCallback(() => {
    setEditKind(null);
  }, []);

  if (!hasSellingPrice) {
    if (!canEdit || !onUpdateSellingPrice) {
      return (
        <div className="flex items-center gap-2 min-h-8">
          <span className="text-muted-foreground">—</span>
        </div>
      );
    }
    if (editKind === 'price') {
      return (
        <div className="flex items-center gap-1">
          <PendingPriceCell
            key={`${product.id}-price`}
            variant="price"
            initialValue=""
            isSaving={isSaving}
            buttonLabel="Save"
            onAdd={(value) => void handleSavePrice(value)}
            onCancel={handleCancel}
          />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 min-h-8">
        <span className="text-muted-foreground">—</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setEditKind('price')}
          disabled={isSaving}
          aria-label="Set selling price"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  if (!canEdit || !onUpdateDiscount) {
    return (
      <span className="text-sm tabular-nums">
        {hasExistingDiscount ? `${Number(initialStr)}%` : '—'}
      </span>
    );
  }

  if (editKind === 'discount') {
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
        onClick={() => setEditKind('discount')}
        disabled={isSaving}
        aria-label={hasExistingDiscount ? 'Edit discount' : 'Add discount'}
      >
        <PencilIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
