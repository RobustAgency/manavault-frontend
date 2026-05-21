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
    }),
  };
});

describe('CreateOrderDialog', () => {
  it('does not call onSubmit when the form is invalid', async () => {
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

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
