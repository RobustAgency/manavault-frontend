'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useGetProductsQuery,
  useGetSuppliersQuery,
} from '@/lib/redux/features';
import { CreateOrderDialog, ViewOrderDialog, createOrderColumns } from './components';

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useGetPurchaseOrdersQuery({ page, per_page: perPage });
  const { data: productsData, refetch: refetchProducts } = useGetProductsQuery({ per_page: 100, status: 'active' });
  const { data: suppliersData, refetch: refetchSuppliers } = useGetSuppliersQuery({ per_page: 100 });
  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch selected order details
  const { data: selectedOrder } = useGetPurchaseOrderQuery(selectedOrderId!, {
    skip: !selectedOrderId,
  });

  const handleCreate = async (data: any) => {
    try {
      await createPurchaseOrder(data).unwrap();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create purchase order:', error);
    }
  };

  const openViewDialog = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsViewDialogOpen(true);
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedOrderId(null);
  };

  const columns = createOrderColumns({ onView: openViewDialog });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">Manage your purchase orders and inventory</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        serverSide
        pagination={{
          page: data?.pagination.current_page || 1,
          limit: perPage,
          total: data?.pagination.total || 0,
          totalPages: data?.pagination.last_page || 1,
        }}
        onPageChange={setPage}
      />

      {/* Create Dialog */}
      <CreateOrderDialog
        isOpen={isCreateDialogOpen}
        products={productsData?.data || []}
        suppliers={suppliersData?.data || []}
        isSubmitting={isCreating}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        onProductsRefetch={refetchProducts}
        onSuppliersRefetch={refetchSuppliers}
      />

      {/* View Details Dialog */}
      <ViewOrderDialog
        isOpen={isViewDialogOpen}
        order={selectedOrder || null}
        onClose={closeViewDialog}
      />
    </div>
  );
}
