import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

interface Supplier {
  id: number;
  name: string;
  type?: string;
  status?: string;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export const createSupplierColumns = (): ColumnDef<Supplier>[] => [
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
];

