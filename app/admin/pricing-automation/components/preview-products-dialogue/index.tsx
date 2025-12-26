'use client';

import * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/redux/features/priceAutomationApi';
import { DataTable } from '@/components/custom/DataTable';
import { PreviewRulesColumns } from '../preview-product-column';

interface PreviewProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  isLoading?: boolean;
}


export const PreviewProductsDialog = ({
  open,
  onOpenChange,
  products,
  isLoading = false,
}: PreviewProductsDialogProps) => {
    const productColumns = PreviewRulesColumns();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="
            fixed left-1/2 top-1/2 w-full sm:max-w-[800px]
            -translate-x-1/2 -translate-y-1/2
            rounded-xl bg-white p-6 shadow-xl
            focus:outline-none
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Preview Affected Products
            </DialogTitle>
          </div>
          {/* Content */}
            <div className="max-h-[500px] overflow-auto rounded-lg ">
             <DataTable
                columns={productColumns}
                data={products}
                loading={isLoading}
                 pagination={{
                    page:  1,
                    limit: 10,
                    total:  0,
                    totalPages:  1,
                }}
              />
            </div>
          {/* Footer */}
          <div className="mt-2 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
    </Dialog>
  )
}


