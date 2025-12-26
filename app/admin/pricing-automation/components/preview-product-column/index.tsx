import { ColumnDef } from '@tanstack/react-table';
import { Product } from '@/lib/redux/features/priceAutomationApi';

export const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(amount);
};

const normalizeCurrency = (currency?: string): string => {
    switch (currency?.toLowerCase()) {
        case 'usd':
            return 'USD';
        case 'eur':
            return 'EUR';
        default:
            return 'USD';
    }
};

export const PreviewRulesColumns = (): ColumnDef<Product>[] => [
    {
        accessorKey: 'product_name',
        header: 'Name',
        cell: ({ row }) => (
            <span className="font-medium text-primary">
                {row.original.product_name}
            </span>
        ),
    },
    {
        accessorKey: 'face_value',
        header: 'Face Value',
        cell: ({ row }) => `${formatCurrency(Number(row.original.face_value), normalizeCurrency(row.original.currency ?? 'USD'))}`,

    },
    {
        accessorKey: 'current_selling_price',
        header: 'Current Selling Price',
        cell: ({ row }) => `${formatCurrency(Number(row.original.current_selling_price), normalizeCurrency(row.original.currency ?? 'USD'))}`,
    },
    {
        accessorKey: 'new_selling_price',
        header: 'New Selling Price',
        cell: ({ row }) => `${formatCurrency(Number(row.original.new_selling_price), normalizeCurrency(row.original.currency ?? 'USD'))}`,

    },

];

