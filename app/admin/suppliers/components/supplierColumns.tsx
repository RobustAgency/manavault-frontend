import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/lib/redux/features';

interface SupplierColumnsProps {
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const createSupplierColumns = ({ onEdit, onDelete }: SupplierColumnsProps): ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  // {
  //   accessorKey: 'slug',
  //   header: 'Slug',
  //   cell: ({ row }) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{row.original.slug}</code>,
  // },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="filled" color={row.original.type === 'internal' ? 'info' : 'default'}>
        {row.original.type === "internal" ? "Supplier" : "API Supplier"} 
      </Badge>
    ),
  },
  {
    accessorKey: 'contact_email',
    header: 'Email',
    cell: ({ row }) => row.original.contact_email || '-',
  },
  {
    accessorKey: 'contact_phone',
    header: 'Phone',
    cell: ({ row }) => row.original.contact_phone || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="filled" color={row.original.status === 'active' ? 'success' : 'default'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.type === 'internal' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        )}
        {row.original.type === 'internal' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.original)}
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
        )}
      </div>
    ),
  },
];

