import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadCsvDialogue } from '@/app/admin/digital-stock/components/uploadCsvDialogue';
import { CSVUploader } from '@/app/admin/digital-stock/components/CsvUploader';

const createCSVUploadMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/redux/features/purchaseOrdersApi', () => ({
  useCreateCSVUploadMutation: () => [createCSVUploadMock, { isLoading: false }],
}));

vi.mock('@/app/admin/digital-stock/components/GlobalSupplierSelector', () => ({
  GlobalSupplierSelector: ({ onSupplierChange, error }: { onSupplierChange: (id: number) => void; error?: string }) => (
    <div>
      <button type="button" onClick={() => onSupplierChange(1)}>Select Supplier</button>
      {error && <p>{error}</p>}
    </div>
  ),
}));

vi.mock('@/lib/redux/features', async () => {
  const actual = await vi.importActual<typeof import('@/lib/redux/features')>(
    '@/lib/redux/features'
  );
  return {
    ...actual,
    useGetSuppliersQuery: () => ({
      data: {
        data: [
          { id: 1, name: 'Supplier A', type: 'internal', status: 'active' },
          { id: 2, name: 'Supplier B', type: 'internal', status: 'active' },
        ],
      },
      isLoading: false,
    }),
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UploadCsvDialogue', () => {
  beforeEach(() => {
    createCSVUploadMock.mockReset();
    createCSVUploadMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ error: false, message: 'ok' }),
    });
  });

  it('renders the upload dialog when open', () => {
    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    expect(screen.getByText(/upload a csv file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add csv/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted without supplier or file', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(screen.getByText('Supplier is required')).toBeInTheDocument();
    expect(screen.getByText('CSV file is required')).toBeInTheDocument();
    expect(createCSVUploadMock).not.toHaveBeenCalled();
  });

  it('calls the upload mutation with supplier_id and file on valid submission', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /select supplier/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['sku,name,cost_price\nSKU001,Product A,10'], 'products.csv', {
      type: 'text/csv',
    });
    await user.upload(fileInput, csvFile);

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(createCSVUploadMock).toHaveBeenCalledOnce();
    const calledWith: FormData = createCSVUploadMock.mock.calls[0][0];
    expect(calledWith.get('supplier_id')).toBe('1');
    expect(calledWith.get('file')).toBe(csvFile);
  });

  it('shows success toast and closes dialog on successful upload', async () => {
    const { toast } = await import('react-toastify');
    const onClose = vi.fn();

    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /select supplier/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['sku,name\nSKU001,Product A'], 'products.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [csvFile] } });

    fireEvent.click(screen.getByRole('button', { name: /add csv/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('CSV uploaded successfully');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error toast when upload fails', async () => {
    const { toast } = await import('react-toastify');
    createCSVUploadMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /select supplier/i }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['sku,name\nSKU001,Product A'], 'products.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(toast.error).toHaveBeenCalledWith('Failed to upload CSV file');
  });

  it('resets form and calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onClose = vi.fn();

    render(
      <UploadCsvDialogue
        isOpen
        suppliers={[]}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});

describe('CSVUploader', () => {
  it('shows file name and size after a file is selected', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const setFile = vi.fn();

    const { rerender } = render(
      <CSVUploader file={null} setFile={setFile} error={undefined} />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    expect(setFile).toHaveBeenCalledWith(csvFile);

    // Simulate parent updating the prop
    rerender(<CSVUploader file={csvFile} setFile={setFile} error={undefined} />);

    expect(screen.getByText('data.csv')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('clears file when Remove is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const setFile = vi.fn();
    const csvFile = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });

    render(<CSVUploader file={csvFile} setFile={setFile} error={undefined} />);

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(setFile).toHaveBeenCalledWith(null);
  });

  it('displays an error message when error prop is provided', () => {
    render(
      <CSVUploader file={null} setFile={vi.fn()} error="CSV file is required" />
    );

    expect(screen.getByText('CSV file is required')).toBeInTheDocument();
  });
});
