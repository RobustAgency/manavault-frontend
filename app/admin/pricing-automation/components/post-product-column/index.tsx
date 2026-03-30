import { PostViewProduct } from '@/types';
import { ColumnDef } from '@tanstack/react-table';


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

export const PostViewColumns = (): ColumnDef<PostViewProduct, unknown>[] => [
    {
        accessorKey: 'product_name',
        header: 'Name',
        cell: ({ row }) => (
            <span className="font-medium text-primary">
                {row.original.digital_product?.name}
            </span>
        ),
    },
    {
        accessorKey: 'current_selling_price',
        header: 'Current Selling Price',
        cell: ({ row }) =>
            formatCurrency(
                Number(row.original.original_selling_price),
                normalizeCurrency(row.original.digital_product?.currency ?? 'USD')
            ),
    },
    {
        accessorKey: 'new_selling_price',
        header: 'New Selling Price',
        cell: ({ row }) =>
            formatCurrency(
                Number(row.original.final_selling_price),
                normalizeCurrency(row.original.digital_product?.currency ?? 'USD')
            ),
    },
];

