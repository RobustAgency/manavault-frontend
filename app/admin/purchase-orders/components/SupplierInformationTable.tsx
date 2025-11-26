'use client';

import { Building2Icon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/custom/DataTable';
import { PurchaseOrder } from '@/lib/redux/features';
import { createSupplierColumns } from './supplierColumns';

interface SupplierInformationTableProps {
  order: PurchaseOrder;
}

export const SupplierInformationTable = ({ order }: SupplierInformationTableProps) => {
  const columns = createSupplierColumns();

  // Normalize suppliers data - handle both suppliers array and single supplier
  const suppliersData = order.suppliers && order.suppliers.length > 0
    ? order.suppliers
    : order.supplier
      ? [order.supplier]
      : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2Icon className="h-5 w-5" />
          Supplier Information
        </CardTitle>
        <CardDescription>
          {suppliersData.length > 0
            ? `${suppliersData.length} supplier${suppliersData.length > 1 ? 's' : ''} for this order`
            : 'Details about the supplier for this order'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suppliersData.length > 0 ? (
          <DataTable columns={columns} data={suppliersData} />
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Supplier information not available
          </p>
        )}
      </CardContent>
    </Card>
  );
};

