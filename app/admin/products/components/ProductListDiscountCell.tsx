'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, PencilIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useLazyGetProductQuery } from '@/lib/redux/features';
import type { DigitalProduct, Product } from '@/lib/redux/features';
import { DigitalDiscountCell } from '../../digital-stock/components/DigitalDiscountCell';

function resolveDigitalFromProduct(product: Product): {
  id: number | null;
  selling_discount: number | string | null | undefined;
  selling_price: number | string | null | undefined;
} {
  const firstDigital = product.digital_products?.[0];
  const nestedDigital = product.digital_product as
    | (Partial<DigitalProduct> & { id?: number })
    | undefined;

  const digitalProductId =
    nestedDigital?.id ??
    firstDigital?.id ??
    (product as Product & { digital_product_id?: number }).digital_product_id;

  const sellingDiscount =
    nestedDigital?.selling_discount ?? firstDigital?.selling_discount;

  const rootSelling = product.selling_price;
  const sellingPriceForCell =
    rootSelling != null
      ? rootSelling
      : (firstDigital?.selling_price ?? nestedDigital?.selling_price);

  return {
    id: digitalProductId ?? null,
    selling_discount: sellingDiscount,
    selling_price: sellingPriceForCell,
  };
}

export interface ProductListDiscountCellProps {
  product: Product;
  canEdit: boolean;
  onUpdateDiscount?: (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => Promise<void>;
  onUpdateSellingPrice?: (
    productId: number,
    digitalProduct: DigitalProduct,
    value: string
  ) => Promise<void>;
  savingDiscountId?: number | null;
}

export function ProductListDiscountCell({
  product,
  canEdit,
  onUpdateDiscount,
  onUpdateSellingPrice,
  savingDiscountId,
}: ProductListDiscountCellProps) {
  const [getProduct, { isFetching }] = useLazyGetProductQuery();
  const [hydratedDp, setHydratedDp] = useState<DigitalProduct | null>(null);

  const fromList = useMemo(
    () => resolveDigitalFromProduct(product),
    [product]
  );

  useEffect(() => {
    if (fromList.id != null) setHydratedDp(null);
  }, [fromList.id]);

  const activeDigital = useMemo((): DigitalProduct | null => {
    const id = hydratedDp?.id ?? fromList.id;
    if (id == null) return null;
    const discount =
      hydratedDp?.selling_discount ?? fromList.selling_discount ?? null;
    const price =
      hydratedDp?.selling_price ?? fromList.selling_price ?? product.selling_price;
    return {
      id,
      selling_discount: discount,
      selling_price: price,
    } as DigitalProduct;
  }, [
    hydratedDp,
    fromList.id,
    fromList.selling_discount,
    fromList.selling_price,
    product.selling_price,
  ]);

  const tryHydrate = useCallback(async () => {
    try {
      const full = await getProduct(product.id).unwrap();
      const r = resolveDigitalFromProduct(full);
      if (r.id == null) {
        toast.error(
          'No digital stock is linked to this product. Open the product and assign digital stock first.'
        );
        return;
      }
      setHydratedDp({
        id: r.id,
        selling_discount: r.selling_discount ?? null,
        selling_price: r.selling_price ?? null,
      } as DigitalProduct);
    } catch {
      toast.error('Failed to load product details');
    }
  }, [getProduct, product.id]);

  if (activeDigital) {
    return (
      <DigitalDiscountCell
        product={activeDigital}
        canEdit={canEdit}
        onUpdateDiscount={
          onUpdateDiscount
            ? (dp, v) => onUpdateDiscount(product.id, dp, v)
            : undefined
        }
        onUpdateSellingPrice={
          onUpdateSellingPrice
            ? (dp, v) => onUpdateSellingPrice(product.id, dp, v)
            : undefined
        }
        savingDiscountId={savingDiscountId}
      />
    );
  }

  const showPlaceholder =
    fromList.selling_discount != null &&
    fromList.selling_discount !== undefined &&
    fromList.selling_discount !== ''
      ? `${Number(fromList.selling_discount)}%`
      : '—';

  if (!canEdit) {
    return (
      <span className="text-sm tabular-nums">{showPlaceholder}</span>
    );
  }

  return (
    <div className="flex items-center gap-2 min-h-8">
      <span className="text-sm tabular-nums">{showPlaceholder}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => void tryHydrate()}
        disabled={isFetching}
        aria-label="Load discount editor"
      >
        {isFetching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <PencilIcon className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
