'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PurchaseOrder } from '@/lib/redux/features';
import { formatCurrency, formatDate } from './orderColumns';

interface ViewOrderDialogProps {
  isOpen: boolean;
  order: PurchaseOrder | null;
  onClose: () => void;
}

export const ViewOrderDialog = ({ isOpen, order, onClose }: ViewOrderDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Purchase Order Details</DialogTitle>
          <DialogDescription>
            View detailed information about this purchase order
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Order Number</Label>
                <p className="font-semibold mt-1">{order.order_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date Created</Label>
                <p className="font-semibold mt-1">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-muted-foreground">Product</Label>
              <p className="font-semibold mt-1">{order.product?.name}</p>
              {order.product?.sku && (
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                  {order.product.sku}
                </code>
              )}
            </div>

            <div>
              <Label className="text-muted-foreground">Supplier</Label>
              <p className="font-semibold mt-1">{order.supplier?.name}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="font-semibold mt-1">{order.quantity} units</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Unit Price</Label>
                <p className="font-semibold mt-1">{formatCurrency(order.purchase_price)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Total Amount</Label>
                <p className="font-semibold text-xl text-primary mt-1">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

