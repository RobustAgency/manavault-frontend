'use client';

import { useParams, useRouter } from 'next/navigation';
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

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string, 10);

  const {
    data: order,
    isLoading,
    error,
    refetch: refetchOrder,
  } = useGetPurchaseOrderQuery(orderId, {
    skip: !orderId || isNaN(orderId),
  });

  const getUnitPrice = () => {
    if (!order) return 0;
    const unitPrice = order.purchase_price;
    if (unitPrice == null || isNaN(unitPrice)) {
      const totalPrice = parseFloat(order.total_price || '0');
      const quantity = order.quantity || 1;
      return quantity > 0 ? totalPrice / quantity : 0;
    }
    return unitPrice;
  };

  const getTotalAmount = () => {
    if (!order) return 0;
    const totalAmount = order.total_amount;
    if (totalAmount == null || isNaN(totalAmount)) {
      return parseFloat(order.total_price || '0');
    }
    return totalAmount;
  };

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'secondary';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return 'default';
    if (lowerStatus === 'inactive' || lowerStatus === 'in_active') return 'secondary';
    return 'outline';
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
            <h1 className="text-3xl font-bold">Purchase Order Details</h1>
            <p className="text-muted-foreground mt-1">
              Order Number:{" "}
              <code className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                {order.order_number}
              </code>
            </p>
          </div>
          <ImportVouchersDialog order={order} onSuccess={() => refetchOrder()} />
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
                <p className="text-sm text-muted-foreground mb-1">Quantity</p>
                <p className="text-2xl font-bold">{order.quantity} units</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unit Price</p>
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

        {/* Product Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              Product Information
            </CardTitle>
            <CardDescription>Details about the product in this order</CardDescription>
          </CardHeader>
          <CardContent>
            {order.product ? (
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Product Name</p>
                  <p className="text-lg font-semibold">{order.product.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">SKU</p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-semibold">
                      {order.product.sku}
                    </code>
                  </div>
                  {order.product.status && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge variant={'filled'}>
                        {order.product.status}
                      </Badge>
                    </div>
                  )}
                </div>
                {order.product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{order.product.description}</p>
                  </div>
                )}
                <div className="border-t my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.product.purchase_price && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Purchase Price</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(parseFloat(order.product.purchase_price))}
                      </p>
                    </div>
                  )}
                  {order.product.selling_price && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Selling Price</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(parseFloat(order.product.selling_price))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Product information not available</p>
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
            <CardDescription>Details about the supplier for this order</CardDescription>
          </CardHeader>
          <CardContent>
            {order.supplier ? (
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Supplier Name</p>
                  <p className="text-lg font-semibold">{order.supplier.name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <p className="text-sm text-muted-foreground mb-1">Slug</p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-semibold">
                      {order.supplier.slug}
                    </code>
                  </div> */}
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
        <PurchaseOrderVouchersCard vouchers={order.vouchers} />
      </div>
    </div>
  );
}

