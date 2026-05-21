import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePurchaseOrderForm } from '@/app/admin/purchase-orders/components/usePurchaseOrderForm';

describe('usePurchaseOrderForm', () => {
  it('fails validation when there are no items', () => {
    const { result } = renderHook(() => usePurchaseOrderForm());

    let valid = true;
    act(() => {
      valid = result.current.validateForm();
    });

    expect(valid).toBe(false);
    expect(result.current.errors.items).toBeTruthy();
  });

  it('passes validation when at least one complete line item exists', () => {
    const { result } = renderHook(() => usePurchaseOrderForm());

    act(() => {
      result.current.addItem({
        supplier_id: 10,
        digital_product_id: 501,
        quantity: 2,
        currency: 'usd',
      });
    });

    let valid = false;
    act(() => {
      valid = result.current.validateForm();
    });

    expect(valid).toBe(true);
    expect(result.current.errors.items).toBeUndefined();
  });

  it('resetForm clears items, currency, and errors', () => {
    const { result } = renderHook(() => usePurchaseOrderForm());

    act(() => {
      result.current.addItem({
        supplier_id: 1,
        digital_product_id: 2,
        quantity: 1,
        currency: 'eur',
      });
      result.current.setCurrency('eur');
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.items).toEqual([]);
    expect(result.current.currency).toBe('usd');
    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });
});
