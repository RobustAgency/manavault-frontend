import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateDigitalProductForm } from '@/app/admin/digital-stock/components/CreateDigitalProductForm';
import { EditDigitalProductForm } from '@/app/admin/digital-stock/components/EditDigitalProductForm';
import type { DigitalProductFormState } from '@/app/admin/digital-stock/components/useDigitalProductForm';
import type { ProductFormItem } from '@/app/admin/digital-stock/components/useBulkProductForm';
import type { Supplier } from '@/lib/redux/features';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/app/admin/digital-stock/components/GlobalSupplierSelector', () => ({
  GlobalSupplierSelector: ({
    onSupplierChange,
    error,
  }: {
    onSupplierChange: (id: number) => void;
    error?: string;
  }) => (
    <div>
      <button type="button" onClick={() => onSupplierChange(1)}>
        Select Supplier
      </button>
      {error && <p>{error}</p>}
    </div>
  ),
}));

const mockSuppliers: Supplier[] = [
  { id: 1, name: 'Supplier A', type: 'internal', status: 'active' } as Supplier,
];

const blankFormData: DigitalProductFormState = {
  supplier_id: 0,
  name: '',
  sku: '',
  brand: '',
  description: '',
  selling_price: '',
  selling_discount: 0,
  tags: '',
  image: '',
  cost_price: '0',
  face_value: '0',
  region: '',
  metadata: '',
  currency: 'usd',
};

const makeFormItem = (overrides: Partial<DigitalProductFormState> = {}): ProductFormItem => ({
  id: 'form-1',
  formData: { ...blankFormData, ...overrides },
  errors: {},
  isExpanded: true,
});

// --------------------------------------------------------------------------
// CreateDigitalProductForm
// --------------------------------------------------------------------------
describe('CreateDigitalProductForm', () => {
  const baseCreateProps = {
    isLoading: false,
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onCancel: vi.fn(),
    suppliers: mockSuppliers,
    selectedSupplierId: undefined as number | undefined,
    supplierError: '',
    onSupplierChange: vi.fn(),
    onAddNewSupplier: vi.fn(),
    productForms: [makeFormItem()],
    expandedItems: new Set<string>(['form-1']),
    onToggleAccordion: vi.fn(),
    onRemoveProduct: vi.fn(),
    onUpdateProductForm: vi.fn(),
    onAddProduct: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders supplier selection and product details sections', () => {
    render(<CreateDigitalProductForm {...baseCreateProps} />);

    expect(screen.getByText('Supplier Selection')).toBeInTheDocument();
    expect(screen.getByText('Product Details')).toBeInTheDocument();
  });

  it('shows a supplier validation error when supplierError is set', () => {
    render(
      <CreateDigitalProductForm
        {...baseCreateProps}
        supplierError="Supplier is required"
      />
    );

    expect(screen.getByText('Supplier is required')).toBeInTheDocument();
  });

  it('calls onSupplierChange when a supplier is selected', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSupplierChange = vi.fn();

    render(
      <CreateDigitalProductForm
        {...baseCreateProps}
        onSupplierChange={onSupplierChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /select supplier/i }));

    expect(onSupplierChange).toHaveBeenCalledWith(1);
  });

  it('calls onAddProduct when "Add Another Product" is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onAddProduct = vi.fn();

    render(
      <CreateDigitalProductForm {...baseCreateProps} onAddProduct={onAddProduct} />
    );

    await user.click(screen.getByRole('button', { name: /add another product/i }));

    expect(onAddProduct).toHaveBeenCalled();
  });

  it('calls onSubmit when the submit button is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(
      <CreateDigitalProductForm
        {...baseCreateProps}
        onSubmit={onSubmit}
        selectedSupplierId={1}
        productForms={[makeFormItem({ name: 'Test Product', sku: 'SKU-001', cost_price: '10' })]}
      />
    );

    await user.click(screen.getByRole('button', { name: /create digital product/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onCancel = vi.fn();

    render(
      <CreateDigitalProductForm {...baseCreateProps} onCancel={onCancel} />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows "Creating..." label on the submit button while loading', () => {
    render(
      <CreateDigitalProductForm {...baseCreateProps} isLoading={true} />
    );

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('renders accordion items and a final expanded form for multiple products', () => {
    const forms = [
      makeFormItem({ name: 'Product 1', sku: 'SKU-001', cost_price: '10' }),
      makeFormItem({ name: 'Product 2', sku: 'SKU-002', cost_price: '20' }),
    ];
    forms[0].id = 'form-a';
    forms[1].id = 'form-b';

    render(
      <CreateDigitalProductForm
        {...baseCreateProps}
        productForms={forms}
        expandedItems={new Set(['form-b'])}
      />
    );

    expect(screen.getByText(/product 2/i)).toBeInTheDocument();
  });

  it('calls onRemoveProduct when the trash button is clicked in multi-product view', () => {
    const onRemoveProduct = vi.fn();

    const forms = [
      makeFormItem({ name: 'Product 1', sku: 'SKU-001', cost_price: '10' }),
      makeFormItem({ name: 'Product 2', sku: 'SKU-002', cost_price: '20' }),
    ];
    forms[0].id = 'form-a';
    forms[1].id = 'form-b';

    render(
      <CreateDigitalProductForm
        {...baseCreateProps}
        productForms={forms}
        expandedItems={new Set(['form-b'])}
        onRemoveProduct={onRemoveProduct}
      />
    );

    const heading = screen.getByRole('heading', { name: /product 2:/i });
    const row = heading.closest('.flex');
    const trashBtn = row?.querySelector('button[type="button"]');
    expect(trashBtn).toBeTruthy();
    fireEvent.click(trashBtn!);

    expect(onRemoveProduct).toHaveBeenCalledWith('form-b');
  });
});

// --------------------------------------------------------------------------
// EditDigitalProductForm
// --------------------------------------------------------------------------
describe('EditDigitalProductForm', () => {
  const filledFormData: DigitalProductFormState = {
    ...blankFormData,
    name: 'Existing Product',
    sku: 'SKU-EXISTING',
    cost_price: '20',
    selling_price: '30',
    currency: 'usd',
  };

  const baseEditProps = {
    isLoading: false,
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onCancel: vi.fn(),
    formData: filledFormData,
    errors: {} as Record<string, string>,
    suppliers: mockSuppliers,
    onUpdate: vi.fn(),
    onImageChange: vi.fn(),
    isImageUploading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Product Information section', () => {
    render(<EditDigitalProductForm {...baseEditProps} />);

    expect(screen.getByText('Product Information')).toBeInTheDocument();
    expect(screen.getByText('Digital product details and pricing')).toBeInTheDocument();
  });

  it('renders the Update Digital Product submit button', () => {
    render(<EditDigitalProductForm {...baseEditProps} />);

    expect(
      screen.getByRole('button', { name: /update digital product/i })
    ).toBeInTheDocument();
  });

  it('shows "Updating..." and disables the button while loading', () => {
    render(<EditDigitalProductForm {...baseEditProps} isLoading={true} />);

    const submitBtn = screen.getByRole('button', { name: /updating/i });
    expect(submitBtn).toBeDisabled();
  });

  it('calls onSubmit when Update Digital Product is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(<EditDigitalProductForm {...baseEditProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /update digital product/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onCancel = vi.fn();

    render(<EditDigitalProductForm {...baseEditProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables Cancel button while loading', () => {
    render(<EditDigitalProductForm {...baseEditProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('displays field-level validation errors', () => {
    render(
      <EditDigitalProductForm
        {...baseEditProps}
        errors={{ name: 'Name is required', sku: 'SKU is required' }}
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('SKU is required')).toBeInTheDocument();
  });
});
