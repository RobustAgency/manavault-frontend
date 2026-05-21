import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PurchaseOrderHeader } from '@/app/admin/purchase-orders/components/PurchaseOrderHeader';

const updatePurchaseOrderMock = vi.hoisted(() => vi.fn());
const routerBackMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: routerBackMock,
  }),
}));

vi.mock('@/lib/redux/features/purchaseOrdersApi', () => ({
  useUpdatePurchaseOrderMutation: () => [updatePurchaseOrderMock, { isLoading: false }],
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PurchaseOrderHeader', () => {
  beforeEach(() => {
    updatePurchaseOrderMock.mockReset();
    updatePurchaseOrderMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ error: false, message: 'ok' }),
    });
  });

  it('syncs the purchase order when requested', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <PurchaseOrderHeader
        purchaseOrderId={55}
        order={{ id: 55, order_number: 'PO-55' } as any}
        isExternalSupplier
      />
    );

    await user.click(screen.getByRole('button', { name: 'Sync Purchase Order' }));

    expect(updatePurchaseOrderMock).toHaveBeenCalledWith(55);
  });
});
