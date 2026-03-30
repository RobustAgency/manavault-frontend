import { PreviewAffectedProduct } from '@/types';
import { ColumnDef } from '@tanstack/react-table';


export const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(amount);
};

export const PreviewRulesColumns = (): ColumnDef<PreviewAffectedProduct, unknown>[] => [
    {
        accessorKey: 'product_name',
        header: 'Name',
        cell: ({ row }) => (
            <span className="font-medium text-primary">
                {row.original.digital_product_name}
            </span>
        ),
    },
    {
        accessorKey: 'current_selling_price',
        header: 'Current Selling Price',
        cell: ({ row }) => `${formatCurrency(Number(row.original.current_selling_price), 'USD')}`,
    },
    {
        accessorKey: 'new_selling_price',
        header: 'New Selling Price',
        cell: ({ row }) => `${formatCurrency(Number(row.original.new_selling_price), 'USD')}`,

    },

];

