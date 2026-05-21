import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GiftCodesDialog } from '../../app/admin/sale-orders/components/gift-codes/gift-codes-dialog';
import { SalesOrderGiftCodesActions } from '../../app/admin/sale-orders/components/gift-codes/index';

const mockUseGetSaleOrderCodesQuery = vi.fn();
const mockUseDownloadSaleOrderCodesMutation = vi.fn();
const copyTextMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('@/lib/redux/features/salesOrdersApi', () => ({
  useGetSaleOrderCodesQuery: (...args: unknown[]) =>
    mockUseGetSaleOrderCodesQuery(...args),
  useDownloadSaleOrderCodesMutation: () => mockUseDownloadSaleOrderCodesMutation(),
}));

vi.mock('@/utils/copyText', () => ({
  copyText: (...args: unknown[]) => copyTextMock(...args),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: vi.fn(),
  },
}));

const sampleRows = [
  {
    digital_product_brand: 'Acme',
    digital_product_id: 10,
    digital_product_name: 'Gift Card',
    digital_product_sku: 'GC-001',
    order_number: 'SO-1001',
    product_id: 42,
    product_name: 'Gift Card $50',
    sale_order_id: 7,
    sale_order_item_id: 100,
    voucher_codes: [
      { code_value: 'CODE-111', voucher_id: 1 },
      { code_value: 'CODE-222', voucher_id: 2 },
    ],
  },
  {
    digital_product_brand: 'Acme',
    digital_product_id: 11,
    digital_product_name: 'Gift Card',
    digital_product_sku: 'GC-002',
    order_number: 'SO-1001',
    product_id: 99,
    product_name: 'Gift Card $100',
    sale_order_id: 7,
    sale_order_item_id: 101,
    voucher_codes: [{ code_value: 'CODE-333', voucher_id: 3 }],
  },
];

const baseQueryState = {
  data: { data: sampleRows },
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  copyTextMock.mockResolvedValue(undefined);
  mockUseGetSaleOrderCodesQuery.mockReturnValue(baseQueryState);
  mockUseDownloadSaleOrderCodesMutation.mockReturnValue([
    vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
    { isLoading: false },
  ]);
});

describe('GiftCodesDialog', () => {
  it('copies visible codes and downloads a product voucher zip', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const downloadZip = vi.fn().mockResolvedValue(undefined);

    render(
      <GiftCodesDialog
        orderId={7}
        orderNumber="SO-1001"
        open
        onOpenChange={vi.fn()}
        onDownloadZip={downloadZip}
        isDownloading={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Copy All Codes' }));
    expect(copyTextMock).toHaveBeenCalledWith(
      'CODE-111\nCODE-222\nCODE-333',
      'Codes copied to clipboard'
    );

    await user.click(screen.getAllByRole('button', { name: 'View Codes' })[0]);
    await user.click(screen.getAllByLabelText('Copy code')[0]);
    expect(copyTextMock).toHaveBeenCalledWith('CODE-111', 'Code copied');

    await user.click(screen.getByRole('button', { name: 'Download ZIP' }));
    expect(downloadZip).toHaveBeenCalledWith(42);
  });
});

describe('SalesOrderGiftCodesActions', () => {
  it('downloads the full order voucher zip from list view', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const unwrap = vi.fn().mockResolvedValue(undefined);
    const downloadMutation = vi.fn(() => ({ unwrap }));

    mockUseDownloadSaleOrderCodesMutation.mockReturnValue([
      downloadMutation,
      { isLoading: false },
    ]);

    render(<SalesOrderGiftCodesActions orderId={7} orderNumber="SO-1001" />);

    await user.click(screen.getByRole('button', { name: 'View codes' }));
    await user.click(screen.getByRole('button', { name: 'Download ZIP' }));

    expect(downloadMutation).toHaveBeenCalledWith({
      saleOrderId: 7,
      productId: null,
      filename: 'gift-codes-SO-1001.zip',
    });
    expect(unwrap).toHaveBeenCalled();
    expect(toastSuccessMock).toHaveBeenCalledWith('Download started');
  });
});
