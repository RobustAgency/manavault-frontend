import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceRule, RuleStatus } from '@/lib/redux/features/priceAutomationApi';
import { Badge } from '@/components/ui/badge';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getStatusColor = (status: RuleStatus): 'success' | 'default' | 'warning' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'in_active':
      return 'default';
    default:
      return 'default';
  }
};

interface RulesColumnsProps {
  onEdit: any
  onDelete: any;
}

export const createRulesColumns = ({ onEdit, onDelete }: RulesColumnsProps): ColumnDef<PriceRule>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="">{row.original.name}</span>,
  },
  {
    accessorKey: 'conditions',
    header: 'Conditions',
    cell: ({ row }) => {
      return (
        <div className='flex gap-2'>
          {row.original.conditions.map((condition, index) =>
          (
            <div key={index} className='flex gap-2 w-fit'>
              <span className='bg-accent px-2 py-1 rounded'> {condition.field} {condition.operator} {condition.value} </span>
            </div>
          )
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "action-value",
    header: 'Action Value',
    cell: ({ row }) => (
      <span>{formatCurrency(row.original.action_value)}</span>
    ),
  },
  {
    accessorKey: "match-type",
    header: 'Match Type',
    cell: ({ row }) => (
      <span className='bg-gray-100 px-2 py-1 rounded capitalize'>{row.original.match_type}</span>
    ),
  },

  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={"filled"} color={getStatusColor(row.original.status)}>{row.original.status}</Badge>
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

