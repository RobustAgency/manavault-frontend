'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  DollarSignIcon,
  PackageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetPurchaseOrderQuery } from '@/lib/redux/features';
import { formatCurrency, formatDate } from '../components/orderColumns';
import { ImportVouchersDialog, PurchaseOrderVouchersCard } from '../components';

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const orderId = parseInt(id, 10);

  const {
    data: order,
    isLoading,
    error,
    refetch: refetchOrder,
  } = useGetPurchaseOrderQuery(orderId, {
    skip: !orderId || isNaN(orderId),
  });

  const isExternalSupplier =
    order?.suppliers?.every((supplier: any) => supplier?.type?.toLowerCase?.() === 'external');

  const getTotalQuantity = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const getUnitPrice = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    const totalCost = order.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal || '0');
    }, 0);
    const quantity = getTotalQuantity();
    return quantity > 0 ? totalCost / quantity : 0;
  };

  const getTotalAmount = () => {
    if (!order || !order.items || order.items.length === 0) return 0;
    return order.items.reduce((sum, item) => {
      return sum + parseFloat(item.subtotal || '0');
    }, 0);
  };

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'outlined';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'completed' || lowerStatus === 'active') return 'filled';
    if (lowerStatus === 'inactive' || lowerStatus === 'in_active') return 'outlined';
    return 'outlined';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error ? 'Failed to load purchase order details' : 'Purchase order not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Purchase Orders
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Purchase Order Details</h1>
              {order.status && (
                <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                  {order.status}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Order Number:{" "}
              <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                {order.order_number}
              </code>
            </p>
          </div>
          {!isExternalSupplier && (
            <ImportVouchersDialog order={order} onSuccess={() => refetchOrder()} />
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>Financial details of this purchase order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Quantity</p>
                <p className="text-2xl font-bold">{getTotalQuantity()} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Unit Price</p>
                <p className="text-2xl font-bold">{formatCurrency(getUnitPrice())}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(getTotalAmount())}</p>
              </div>
            </div>
            <div className="border-t my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date Created</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>
              {order.items && order.items.length > 0
                ? `${order.items.length} item${order.items.length > 1 ? 's' : ''} in this order`
                : 'Items in this purchase order'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {item.digital_product ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-lg font-semibold">{item.digital_product.name}</p>
                              {item.digital_product.status && (
                                <Badge variant="outlined" className="text-xs">
                                  {item.digital_product.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <code className="bg-gray-100 px-2 py-1 rounded">
                                {item.digital_product.sku}
                              </code>
                              {item.digital_product.brand && (
                                <span>{item.digital_product.brand}</span>
                              )}
                            </div>
                            {item.digital_product.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.digital_product.description}
                              </p>
                            )}
                          </>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Digital Product ID</p>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {item.digital_product_id}
                            </code>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity</p>
                          <p className="text-lg font-semibold">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Unit Cost</p>
                          <p className="text-base font-medium">
                            {formatCurrency(parseFloat(item.unit_cost || '0'))}
                          </p>
                        </div>
                        <div className="border-t pt-2 mt-1">
                          <p className="text-xs text-muted-foreground">Subtotal</p>
                          <p className="text-xl font-bold text-primary">
                            {formatCurrency(parseFloat(item.subtotal || '0'))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No items found in this order</p>
            )}
          </CardContent>
        </Card>

        {/* Supplier Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5" />
              Supplier Information
            </CardTitle>
            <CardDescription>
              {order.suppliers && order.suppliers.length > 0
                ? `${order.suppliers.length} supplier${order.suppliers.length > 1 ? 's' : ''} for this order`
                : 'Details about the supplier for this order'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.suppliers && order.suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.suppliers.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Supplier Name</p>
                      <p className="text-lg font-semibold">{supplier.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {supplier.type && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Type</p>
                          <Badge variant="outlined" className="capitalize">
                            {supplier.type}
                          </Badge>
                        </div>
                      )}
                      {supplier.status && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge variant="outlined">
                            {supplier.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {(supplier.contact_email || supplier.contact_phone) && (
                      <>
                        <div className="border-t pt-3" />
                        <div className="space-y-2">
                          {supplier.contact_email && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Contact Email</p>
                              <a
                                href={`mailto:${supplier.contact_email}`}
                                className="text-sm text-blue-600 hover:underline break-all"
                              >
                                {supplier.contact_email}
                              </a>
                            </div>
                          )}
                          {supplier.contact_phone && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Contact Phone</p>
                              <a
                                href={`tel:${supplier.contact_phone}`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {supplier.contact_phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : order.supplier ? (
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Supplier Name</p>
                  <p className="text-lg font-semibold">{order.supplier.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.supplier.type && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <Badge variant="outlined" className="capitalize">
                        {order.supplier.type}
                      </Badge>
                    </div>
                  )}
                  {order.supplier.status && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge variant="outlined">
                        {order.supplier.status}
                      </Badge>
                    </div>
                  )}
                </div>
                {(order.supplier.contact_email || order.supplier.contact_phone) && (
                  <>
                    <div className="border-t my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.supplier.contact_email && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Contact Email</p>
                          <a
                            href={`mailto:${order.supplier.contact_email}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {order.supplier.contact_email}
                          </a>
                        </div>
                      )}
                      {order.supplier.contact_phone && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Contact Phone</p>
                          <a
                            href={`tel:${order.supplier.contact_phone}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {order.supplier.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Supplier information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Voucher Codes Card */}
        <PurchaseOrderVouchersCard
          purchaseOrderId={order.id}
          isExternalSupplier={isExternalSupplier}
        />
      </div>
    </div>
  );
}

