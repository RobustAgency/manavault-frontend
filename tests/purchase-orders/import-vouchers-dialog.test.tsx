import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportVouchersDialog } from '@/app/admin/purchase-orders/components/ImportVouchersDialog';

const importVouchersMock = vi.hoisted(() => vi.fn());
const storeVouchersMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redux/features', async () => {
  const actual = await vi.importActual<typeof import('@/lib/redux/features')>(
    '@/lib/redux/features'
  );
  return {
    ...actual,
    useImportVouchersMutation: () => [importVouchersMock, { isLoading: false }],
    useStoreVouchersMutation: () => [storeVouchersMock, { isLoading: false }],
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ImportVouchersDialog', () => {
  beforeEach(() => {
    importVouchersMock.mockReset();
    storeVouchersMock.mockReset();
    importVouchersMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ error: false, message: 'ok' }),
    });
    storeVouchersMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ error: false, message: 'ok' }),
    });
  });

  it('uploads a voucher file and calls the import endpoint', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const order = {
      id: 123,
      order_number: 'PO-123',
      items: [],
    } as any;

    render(<ImportVouchersDialog order={order} />);

    await user.click(screen.getByRole('button', { name: 'Import Vouchers' }));

    const fileInput = screen.getByLabelText(/vouchers file/i);
    const file = new File(['code-1'], 'vouchers.csv', { type: 'text/csv' });

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: 'Import' }));

    expect(importVouchersMock).toHaveBeenCalledWith({
      file,
      purchase_order_id: 123,
    });
  });
});
