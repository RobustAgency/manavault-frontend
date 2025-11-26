import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { PencilIcon, TrashIcon, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/lib/redux/features';

const IMAGEPREFIX = process.env.NEXT_PUBLIC_IMAGE_PREFIX || '';

interface BrandColumnsProps {
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export const createBrandColumns = ({
  onEdit,
  onDelete,
}: BrandColumnsProps): ColumnDef<Brand>[] => [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const image = row.original.image;
      if (!image) {
        return (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            <Box />
          </div>
        );
      }
      return (
        <div className="h-10 w-10 relative rounded overflow-hidden">
          <Image
            src={`${IMAGEPREFIX}${image}`}
            alt={row.original.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        href={`/admin/brands/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(row.original)}
        >
          <TrashIcon className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];

