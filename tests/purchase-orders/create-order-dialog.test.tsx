import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateOrderDialog } from '@/app/admin/purchase-orders/components/CreateOrderDialog';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/redux/features', async () => {
  const actual = await vi.importActual<typeof import('@/lib/redux/features')>(
    '@/lib/redux/features'
  );
  return {
    ...actual,
    useGetDigitalProductsListQuery: () => ({
      data: { data: [] },
      isLoading: false,
      refetch: vi.fn(),
    }),
  };
});

vi.mock(
  '/Users/alijee/Documents/GitHub/manavault-frontend/app/admin/purchase-orders/components/usePurchaseOrderForm.ts',
  () => ({
    usePurchaseOrderForm: () => ({
      formData: {
        items: [
          {
            supplier_id: 10,
            digital_product_id: 501,
            quantity: 2,
            currency: 'usd',
          },
        ],
      },
      errors: {},
      validateForm: () => true,
      resetForm: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      currency: 'usd',
      setCurrency: vi.fn(),
    }),
  })
);

describe('CreateOrderDialog', () => {
  it('submits items with supplier and product association', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn();

    render(
      <CreateOrderDialog
        isOpen
        suppliers={[{ id: 10, name: 'Supplier A' } as any]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Create Order' }));

    expect(onSubmit).toHaveBeenCalledWith({
      items: [
        {
          supplier_id: 10,
          digital_product_id: 501,
          quantity: 2,
          currency: 'usd',
        },
      ],
      currency: 'usd',
    });
  });
});
