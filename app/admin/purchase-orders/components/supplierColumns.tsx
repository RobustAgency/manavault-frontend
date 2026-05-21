import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';
import { PurchaseOrderItemDetail } from '@/lib/redux/features';

interface Supplier {
  id: number;
  name: string;
  type?: string;
  status?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  items?: PurchaseOrderItemDetail[];
}

interface SupplierColumnsOptions {
  onViewProducts?: (supplier: Supplier) => void;
}

export const createSupplierColumns = ({
  onViewProducts,
}: SupplierColumnsOptions = {}): ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: 'Supplier Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      return type ? (
        <Badge variant="outlined" className="capitalize">
          {type}
        </Badge>
      ) : (
        '-'
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return status ? (
        <Badge variant="outlined" className="capitalize">
          {status}
        </Badge>
      ) : (
        '-'
      );
    },
  },
  {
    accessorKey: 'contact_email',
    header: 'Contact Email',
    cell: ({ row }) => {
      const email = row.original.contact_email;
      return email ? (
        <a
          href={`mailto:${email}`}
          className="text-blue-600 hover:underline break-all"
        >
          {email}
        </a>
      ) : (
        '-'
      );
    },
  },
  {
    accessorKey: 'contact_phone',
    header: 'Contact Phone',
    cell: ({ row }) => {
      const phone = row.original.contact_phone;
      return phone ? (
        <a
          href={`tel:${phone}`}
          className="text-blue-600 hover:underline"
        >
          {phone}
        </a>
      ) : (
        '-'
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const supplier = row.original;
      const hasItems = (supplier.items?.length || 0) > 0;

      return (
        hasItems && onViewProducts ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProducts?.(supplier)}
          disabled={!hasItems || !onViewProducts}
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Products
        </Button>
      ) : null
    )},
  },
];

