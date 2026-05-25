import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductFormDialog } from '@/app/admin/products/components/ProductFormDialog';
import type { Product } from '@/lib/redux/features';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Radix UI Dialog causes infinite setState loops in JSDOM — mock with a simple wrapper
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/app/admin/products/components/BrandSelector', () => ({
  BrandSelector: ({
    onChange,
    error,
  }: {
    value: string | number | null;
    onChange: (v: number | null) => void;
    error?: string;
  }) => (
    <div>
      <button type="button" onClick={() => onChange(5)}>
        Select Brand
      </button>
      {error && <p>{error}</p>}
    </div>
  ),
}));

vi.mock('@/components/custom/RegionSelect', () => ({
  RegionSelect: ({
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    allowMultiple?: boolean;
    helperText?: string;
  }) => (
    <input
      aria-label="Region select"
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// useGetBrandsQuery must return the SAME object reference on every call.
// If it returns a new object each render, `brandsData` in ProductFormDialog's
// useEffect dependency array changes every cycle → infinite setState loop.
const stableBrandsResult = vi.hoisted(() => ({
  data: { data: [{ id: 1, name: 'Test Brand' }] },
  isLoading: false,
}));

vi.mock('@/lib/redux/features', async () => {
  const actual = await vi.importActual<typeof import('@/lib/redux/features')>(
    '@/lib/redux/features'
  );
  return {
    ...actual,
    useGetBrandsQuery: () => stableBrandsResult,
  };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockProduct: Product = {
  id: 1,
  name: 'Existing Product',
  sku: 'PROD-001',
  status: 'active',
  face_value: 50,
  currency: 'usd',
  selling_price: 60,
  short_description: 'A short desc',
  long_description: 'A long desc',
  tags: ['tag1', 'tag2'],
  regions: ['US', 'CA'],
  brand: 'Nintendo',
  brand_id: 1,
  is_out_of_stock: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
} as unknown as Product;

const baseProps = {
  isOpen: true,
  isEditMode: false,
  selectedProduct: null,
  isSubmitting: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests — Create mode
// ---------------------------------------------------------------------------

describe('ProductFormDialog — create mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders "Create Product" title and description', () => {
    render(<ProductFormDialog {...baseProps} />);

    expect(screen.getByText('Create Product')).toBeInTheDocument();
    expect(screen.getByText(/add a new product to your inventory/i)).toBeInTheDocument();
  });

  it('shows the Create action button', () => {
    render(<ProductFormDialog {...baseProps} />);

    expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
  });

  it('SKU field is editable in create mode', () => {
    render(<ProductFormDialog {...baseProps} />);

    const skuInput = screen.getByPlaceholderText('PROD-001');
    expect(skuInput).not.toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onClose = vi.fn();

    render(<ProductFormDialog {...baseProps} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows "Saving..." and disables button while isSubmitting', () => {
    render(<ProductFormDialog {...baseProps} isSubmitting />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('shows validation errors when submitted with empty required fields', () => {
    render(<ProductFormDialog {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('SKU is required')).toBeInTheDocument();
  });

  it('does NOT call onSubmit when validation fails', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn();

    render(<ProductFormDialog {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when name and SKU are filled but face_value is missing', async () => {
    // ProductFormDialog is primarily used in edit mode from the detail page.
    // It has no face_value input, so validateForm always blocks submission in
    // create mode unless the form is pre-populated (e.g. via selectedProduct).
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn();

    render(<ProductFormDialog {...baseProps} onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText('Product Name'), 'New Product');
    await user.type(screen.getByPlaceholderText('PROD-001'), 'SKU-NEW');

    await user.click(screen.getByRole('button', { name: /^create$/i }));

    // face_value is empty → validateForm returns false → onSubmit not called
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Tests — Edit mode
// ---------------------------------------------------------------------------

describe('ProductFormDialog — edit mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders "Edit Product" title and description', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
      />
    );

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    expect(screen.getByText(/update product information/i)).toBeInTheDocument();
  });

  it('shows the Update action button', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
      />
    );

    expect(screen.getByRole('button', { name: /^update$/i })).toBeInTheDocument();
  });

  it('pre-populates the product name from selectedProduct', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
      />
    );

    expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument();
  });

  it('SKU field is disabled in edit mode', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
      />
    );

    const skuInput = screen.getByDisplayValue('PROD-001');
    expect(skuInput).toBeDisabled();
    expect(screen.getByText('SKU cannot be updated')).toBeInTheDocument();
  });

  it('pre-populates short and long description', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
      />
    );

    expect(screen.getByDisplayValue('A short desc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A long desc')).toBeInTheDocument();
  });

  it('calls onSubmit with updated name when form is saved', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn();

    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
        onSubmit={onSubmit}
      />
    );

    const nameInput = screen.getByDisplayValue('Existing Product');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    await user.click(screen.getByRole('button', { name: /^update$/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });

  it('shows "Saving..." and disables button while isSubmitting in edit mode', () => {
    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
        isSubmitting
      />
    );

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked in edit mode', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onClose = vi.fn();

    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation error when product name is cleared and Update is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn();

    render(
      <ProductFormDialog
        {...baseProps}
        isEditMode
        selectedProduct={mockProduct}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByDisplayValue('Existing Product'));

    await user.click(screen.getByRole('button', { name: /^update$/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
