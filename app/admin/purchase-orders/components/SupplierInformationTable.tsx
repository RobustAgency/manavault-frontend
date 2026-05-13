'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftIcon, Building2Icon, PackageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/DataTable';
import { PurchaseOrder } from '@/lib/redux/features';
import { createSupplierColumns } from './supplierColumns';
import { createOrderItemsColumns } from './orderItemsColumns';

interface SupplierInformationTableProps {
  order: PurchaseOrder;
}

export const SupplierInformationTable = ({ order }: SupplierInformationTableProps) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const orderItemsColumns = createOrderItemsColumns();

  // Normalize supplier payload for the table.
  const suppliersData = useMemo(() => {
    if (order.suppliers && order.suppliers.length > 0) {
      return order.suppliers.map((entry) => {
        const nestedSupplier = entry.supplier;
        const fallbackName = `Supplier ${entry.supplier_id}`;

        return {
          id: entry.id,
          name: nestedSupplier?.name || fallbackName,
          type: nestedSupplier?.type,
          status: entry.status || nestedSupplier?.status,
          contact_email: nestedSupplier?.contact_email ?? null,
          contact_phone: nestedSupplier?.contact_phone ?? null,
          items: entry.items || [],
        };
      });
    }

    if (order.supplier) {
      return [{
        ...order.supplier,
        items: order.items || [],
      }];
    }

    return [];
  }, [order.items, order.supplier, order.suppliers]);

  const selectedSupplier = suppliersData.find((supplier) => supplier.id === selectedSupplierId);
  const columns = createSupplierColumns({
    onViewProducts: (supplier) => setSelectedSupplierId(supplier.id),
  });

  return (
    <Card>
      <CardHeader>
        {selectedSupplier ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                {selectedSupplier.name} Products
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSupplierId(null)}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Suppliers
              </Button>
            </div>
            <CardDescription>
              {(selectedSupplier.items?.length || 0) > 0
                ? `${selectedSupplier.items?.length || 0} item${(selectedSupplier.items?.length || 0) > 1 ? 's' : ''} from this supplier`
                : 'No items available for this supplier'}
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5" />
              Supplier Information
            </CardTitle>
            <CardDescription>
              {suppliersData.length > 0
                ? `${suppliersData.length} supplier${suppliersData.length > 1 ? 's' : ''} for this order`
                : 'Details about the supplier for this order'}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {!selectedSupplier && suppliersData.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md  px-3 py-2">
          </div>
        )}
        {selectedSupplier ? (
          (selectedSupplier.items?.length || 0) > 0 ? (
            <DataTable columns={orderItemsColumns} data={selectedSupplier.items || []} />
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No items found for this supplier
            </p>
          )
        ) : suppliersData.length > 0 ? (
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

