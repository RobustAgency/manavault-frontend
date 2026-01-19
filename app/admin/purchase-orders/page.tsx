'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useGetSuppliersQuery,
} from '@/lib/redux/features';
import { CreateOrderDialog, ViewOrderDialog, createOrderColumns } from './components';
import { toast } from 'react-toastify';

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderNumberSearch, setOrderNumberSearch] = useState('');
  const perPage = 10;

  const { data, isLoading } = useGetPurchaseOrdersQuery({
    page,
    per_page: perPage,
    supplier_id: supplierFilter === 'all' ? undefined : parseInt(supplierFilter),
    status: statusFilter === 'all' ? undefined : statusFilter,
    order_number: orderNumberSearch || undefined,
  });
  const { data: suppliersData, refetch: refetchSuppliers } = useGetSuppliersQuery({
    per_page: 100,
    status: 'active'
  });
  const [createPurchaseOrder, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [supplierFilter, statusFilter, orderNumberSearch]);

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
      toast.success('Purchase order created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create purchase order');
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

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="w-48">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={supplierFilter}
            onValueChange={setSupplierFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliersData?.data.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by order number..."
            value={orderNumberSearch}
            onChange={(e) => setOrderNumberSearch(e.target.value)}
          />
        </div>
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
        suppliers={suppliersData?.data || []}
        isSubmitting={isCreating}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
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
