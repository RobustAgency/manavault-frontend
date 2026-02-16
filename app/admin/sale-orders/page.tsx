'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createOrderColumns } from './components/createOrderColumns';
import { useGetSalesOrdersQuery } from '@/lib/redux/features/salesOrdersApi';

export default function PurchaseOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderNumberSearch, setOrderNumberSearch] = useState('');
  const perPage = 10;

  const { data, isLoading } = useGetSalesOrdersQuery({
    page: currentPage,
    per_page: perPage,
    order_number: orderNumberSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });


  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentPage, statusFilter, orderNumberSearch]);

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const openViewDialog = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsViewDialogOpen(true);
  };


  const columns = createOrderColumns({ onView: openViewDialog });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">Manage your purchase orders and inventory</p>
        </div>
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
        onPageChange={setCurrentPage}
      />
 
    </div>
  );
}
