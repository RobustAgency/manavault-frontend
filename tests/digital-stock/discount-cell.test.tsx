import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DigitalDiscountCell } from '@/app/admin/digital-stock/components/DigitalDiscountCell';
import type { DigitalProduct, DigitalProductStatus } from '@/lib/redux/features';

const baseProduct: DigitalProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'SKU-001',
  cost_price: '10.00',
  selling_price: '15.00',
  selling_discount: null,
  currency: 'usd',
  status: 'active' as DigitalProductStatus,
  supplier_id: 1,
  supplier: {
    id: 1,
    name: 'Test Supplier',
    slug: 'test-supplier',
    type: 'test',
    status: 'active' as DigitalProductStatus,
  },
  brand: null,
  description: null,
  tags: null,
  region: null,
  image_url: null,
  face_value: null,
  metadata: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('DigitalDiscountCell — read-only mode', () => {
  it('renders a dash when canEdit is false and there is no discount', () => {
    render(
      <DigitalDiscountCell product={baseProduct} canEdit={false} />
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the discount percentage when canEdit is false and discount exists', () => {
    const product = { ...baseProduct, selling_discount: '20' };
    render(
      <DigitalDiscountCell product={product} canEdit={false} />
    );
    expect(screen.getByText('20%')).toBeInTheDocument();
  });
});

describe('DigitalDiscountCell — editing discount', () => {
  it('shows the edit button with aria-label "Add discount" when no discount is set', () => {
    render(
      <DigitalDiscountCell
        product={baseProduct}
        canEdit
        onUpdateDiscount={vi.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Add discount' })
    ).toBeInTheDocument();
  });

  it('shows the edit button with aria-label "Edit discount" when a discount exists', () => {
    const product = { ...baseProduct, selling_discount: '15' };
    render(
      <DigitalDiscountCell
        product={product}
        canEdit
        onUpdateDiscount={vi.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Edit discount' })
    ).toBeInTheDocument();
  });

  it('opens the inline discount editor when the pencil button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <DigitalDiscountCell
        product={baseProduct}
        canEdit
        onUpdateDiscount={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add discount' }));

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('calls onUpdateDiscount with the entered value when saved', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onUpdateDiscount = vi.fn().mockResolvedValue(undefined);

    render(
      <DigitalDiscountCell
        product={baseProduct}
        canEdit
        onUpdateDiscount={onUpdateDiscount}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add discount' }));

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '10');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(onUpdateDiscount).toHaveBeenCalledWith(baseProduct, '10');
  });

  it('closes the editor and does not save on cancel', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onUpdateDiscount = vi.fn();

    render(
      <DigitalDiscountCell
        product={baseProduct}
        canEdit
        onUpdateDiscount={onUpdateDiscount}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add discount' }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onUpdateDiscount).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Add discount' })
    ).toBeInTheDocument();
  });

  it('keeps edit mode open when onUpdateDiscount throws', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onUpdateDiscount = vi.fn().mockRejectedValue(new Error('API error'));

    render(
      <DigitalDiscountCell
        product={baseProduct}
        canEdit
        onUpdateDiscount={onUpdateDiscount}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Add discount' }));

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Edit mode should remain open after failure
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });
});

describe('DigitalDiscountCell — editing selling price', () => {
  const productWithoutPrice: DigitalProduct = {
    ...baseProduct,
    selling_price: null,
    selling_discount: null,
  };

  it('shows a dash and a pencil button to set selling price when none exists', () => {
    render(
      <DigitalDiscountCell
        product={productWithoutPrice}
        canEdit
        onUpdateSellingPrice={vi.fn()}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Set selling price' })
    ).toBeInTheDocument();
  });

  it('opens the price editor when the pencil button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <DigitalDiscountCell
        product={productWithoutPrice}
        canEdit
        onUpdateSellingPrice={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Set selling price' }));

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('calls onUpdateSellingPrice with the entered value', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onUpdateSellingPrice = vi.fn().mockResolvedValue(undefined);

    render(
      <DigitalDiscountCell
        product={productWithoutPrice}
        canEdit
        onUpdateSellingPrice={onUpdateSellingPrice}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Set selling price' }));

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '25');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onUpdateSellingPrice).toHaveBeenCalledWith(productWithoutPrice, '25');
  });

  it('renders a static dash when no selling price and canEdit is false', () => {
    render(
      <DigitalDiscountCell
        product={productWithoutPrice}
        canEdit={false}
      />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
