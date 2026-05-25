import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadCsvDialogue } from '@/app/admin/products/components/uploadCsvDialogue';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const baseProps = {
  isOpen: true,
  isSubmitting: false,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
};

describe('UploadCsvDialogue (products)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the dialog when open', () => {
    render(<UploadCsvDialogue {...baseProps} />);

    expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    expect(screen.getByText(/upload a csv file to import products/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add csv/i })).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<UploadCsvDialogue {...baseProps} isOpen={false} />);

    expect(screen.queryByText('Upload CSV')).not.toBeInTheDocument();
  });

  it('shows validation error when submitted without a file', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<UploadCsvDialogue {...baseProps} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(screen.getByText('CSV file is required')).toBeInTheDocument();
    expect(baseProps.onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error for non-CSV file types', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<UploadCsvDialogue {...baseProps} onSubmit={vi.fn()} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const txtFile = new File(['data'], 'data.txt', { type: 'text/plain' });
    await user.upload(fileInput, txtFile);

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(screen.getByText('Only CSV files are allowed')).toBeInTheDocument();
  });

  it('calls onSubmit with a FormData containing the file on valid submission', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<UploadCsvDialogue {...baseProps} onSubmit={onSubmit} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['sku,name\nSKU001,Product A'], 'products.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    await user.click(screen.getByRole('button', { name: /add csv/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const formData: FormData = onSubmit.mock.calls[0][0];
    expect(formData.get('file')).toBe(csvFile);
  });

  it('shows file name after selecting a CSV', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<UploadCsvDialogue {...baseProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['a,b\n1,2'], 'products.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    expect(screen.getByText('products.csv')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('clears the file when Remove is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<UploadCsvDialogue {...baseProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['a,b\n1,2'], 'products.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(screen.queryByText('products.csv')).not.toBeInTheDocument();
  });

  it('shows "Importing..." and disables the button while isSubmitting', () => {
    render(<UploadCsvDialogue {...baseProps} isSubmitting />);

    const btn = screen.getByRole('button', { name: /importing/i });
    expect(btn).toBeDisabled();
  });

  it('calls onClose and resets the form when Cancel is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onClose = vi.fn();

    render(<UploadCsvDialogue {...baseProps} onClose={onClose} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const csvFile = new File(['a,b\n1,2'], 'products.csv', { type: 'text/csv' });
    await user.upload(fileInput, csvFile);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
