import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductListDiscountCell } from '@/app/admin/products/components/ProductListDiscountCell';
import type { Product } from '@/lib/redux/features';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const getProductMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redux/features/productsApi', () => ({
  useLazyGetProductQuery: () => [getProductMock, { isFetching: false }],
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Simplified DigitalDiscountCell so we can assert it is rendered
vi.mock('@/app/admin/digital-stock/components/DigitalDiscountCell', () => ({
  DigitalDiscountCell: ({ product }: { product: { id: number; selling_discount: unknown } }) => (
    <div data-testid="digital-discount-cell">
      discount-cell-{product.id}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 10,
    name: 'Test Product',
    sku: 'PROD-001',
    status: 'active',
    face_value: 50,
    currency: 'usd',
    selling_price: null,
    digital_products: [],
    digital_product: undefined,
    ...overrides,
  } as unknown as Product);

const withDigital = (discountOverride?: string | number | null, priceOverride?: number | null) =>
  makeProduct({
    digital_products: [
      {
        id: 99,
        selling_discount: discountOverride ?? null,
        selling_price: priceOverride ?? 30,
      } as any,
    ],
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProductListDiscountCell — no digital product linked', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a dash placeholder when the product has no digital stock', () => {
    render(
      <ProductListDiscountCell product={makeProduct()} canEdit={false} />
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('does not show the edit button when canEdit is false', () => {
    render(
      <ProductListDiscountCell product={makeProduct()} canEdit={false} />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the edit (pencil) button when canEdit is true even with no digital product', () => {
    render(
      <ProductListDiscountCell product={makeProduct()} canEdit />
    );

    expect(screen.getByRole('button', { name: /load discount editor/i })).toBeInTheDocument();
  });
});

describe('ProductListDiscountCell — digital product in list data', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders DigitalDiscountCell directly when digital_products are present', () => {
    render(
      <ProductListDiscountCell product={withDigital()} canEdit />
    );

    expect(screen.getByTestId('digital-discount-cell')).toBeInTheDocument();
    expect(screen.getByText('discount-cell-99')).toBeInTheDocument();
  });

  it('shows the discount percentage placeholder when canEdit is false', () => {
    render(
      <ProductListDiscountCell
        product={makeProduct({ selling_price: 30, digital_products: [] } as any)}
        canEdit={false}
      />
    );

    // No digital product → falls through to placeholder path
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the formatted discount when a discount value exists in list data', () => {
    const product = makeProduct({
      digital_products: [],
      // Simulate selling_discount surfaced at product root level
    } as any);
    // Attach via the `digital_product` field (nested object path)
    (product as any).digital_product = { id: 5, selling_discount: 15, selling_price: 40 };

    render(
      <ProductListDiscountCell product={product} canEdit={false} />
    );

    // With a hydrated digital product via the nested field, DigitalDiscountCell renders
    expect(screen.getByTestId('digital-discount-cell')).toBeInTheDocument();
  });
});

describe('ProductListDiscountCell — hydration on pencil click', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls getProduct when the pencil button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    getProductMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(makeProduct()),
    });

    render(
      <ProductListDiscountCell product={makeProduct()} canEdit />
    );

    await user.click(screen.getByRole('button', { name: /load discount editor/i }));

    expect(getProductMock).toHaveBeenCalledWith(10);
  });

  it('shows an error toast when no digital stock is linked after fetch', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    getProductMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(makeProduct({ digital_products: [] })),
    });

    render(
      <ProductListDiscountCell product={makeProduct()} canEdit />
    );

    await user.click(screen.getByRole('button', { name: /load discount editor/i }));

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringMatching(/no digital stock/i)
    );
  });

  it('shows DigitalDiscountCell after a successful hydration', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const hydratedProduct = makeProduct({
      digital_products: [{ id: 99, selling_discount: null, selling_price: 35 } as any],
    });

    getProductMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(hydratedProduct),
    });

    render(
      <ProductListDiscountCell product={makeProduct()} canEdit />
    );

    await user.click(screen.getByRole('button', { name: /load discount editor/i }));

    expect(await screen.findByTestId('digital-discount-cell')).toBeInTheDocument();
  });

  it('shows an error toast when the fetch itself fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    getProductMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    render(
      <ProductListDiscountCell product={makeProduct()} canEdit />
    );

    await user.click(screen.getByRole('button', { name: /load discount editor/i }));

    expect(toast.error).toHaveBeenCalledWith('Failed to load product details');
  });
});
