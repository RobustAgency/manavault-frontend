import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VoucherCodeDialog } from '@/components/admin/vouchers/VoucherCodeDialog';

const getDecryptedVoucherMock = vi.hoisted(() => vi.fn());
const resetMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redux/features', async () => {
  const actual = await vi.importActual<typeof import('@/lib/redux/features')>(
    '@/lib/redux/features'
  );
  return {
    ...actual,
    useGetDecryptedVoucherMutation: () => [
      getDecryptedVoucherMock,
      {
        data: { code: 'DECRYPTED-123' },
        isLoading: false,
        isError: false,
        reset: resetMock,
      },
    ],
  };
});

describe('VoucherCodeDialog', () => {
  beforeEach(() => {
    getDecryptedVoucherMock.mockReset();
    getDecryptedVoucherMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ id: 9, code: 'DECRYPTED-123' }),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ip: '10.0.0.1' }),
    }) as unknown as typeof fetch);
  });

  it('fetches and displays the decrypted voucher code', async () => {
    render(
      <VoucherCodeDialog voucherId={9} isOpen onClose={vi.fn()} />
    );

    await waitFor(() =>
      expect(getDecryptedVoucherMock).toHaveBeenCalledWith({
        voucherId: 9,
        ip_address: '10.0.0.1',
        user_agent: window.navigator.userAgent,
      })
    );

    expect(await screen.findByText('DECRYPTED-123')).toBeInTheDocument();
  });
});
