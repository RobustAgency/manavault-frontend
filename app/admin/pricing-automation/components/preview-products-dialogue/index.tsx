'use client';

import * as React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/custom/DataTable';
import { PreviewRulesColumns } from '../preview-product-column';
import { PaginationMeta, PostViewProduct, PreviewAffectedProduct } from '@/types';
import { PostViewColumns } from '../post-product-column';

/** Which product payload shape / columns to render (preview API vs post-view API). */
export type PreviewProductsTableVariant = 'preview' | 'postview';

interface PreviewProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableVariant: PreviewProductsTableVariant;
  products: PreviewAffectedProduct[] | PostViewProduct[];
  isLoading?: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export const PreviewProductsDialog = ({
  open,
  onOpenChange,
  tableVariant,
  products,
  pagination,
  isLoading = false,
  onPageChange,
}: PreviewProductsDialogProps) => {
  const productColumns = PreviewRulesColumns();
  const postViewProductColumns = PostViewColumns();

  const serverSide = Boolean(pagination && onPageChange);
  const isPreviewTable = tableVariant === 'preview';

  const heading =
    tableVariant === 'preview'
      ? 'Preview Affected Products'
      : 'Postview Affected Products';

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
          <DialogTitle className="text-lg font-semibold">{heading}</DialogTitle>
        </div>
        {/* Content */}
        <div className="max-h-[500px] overflow-auto rounded-lg ">
          {isPreviewTable ? (
            <DataTable<PreviewAffectedProduct, unknown>
              columns={productColumns}
              data={products as PreviewAffectedProduct[]}
              loading={isLoading}
              serverSide={serverSide}
              onPageChange={onPageChange}
              pagination={{
                page: pagination?.current_page ?? 1,
                limit: pagination?.per_page ?? 10,
                total: pagination?.total ?? 0,
                totalPages: pagination?.last_page ?? 1,
              }}
            />
          ) : (
            <DataTable<PostViewProduct, unknown>
              columns={postViewProductColumns}
              data={products as PostViewProduct[]}
              loading={isLoading}
              serverSide={serverSide}
              onPageChange={onPageChange}
              pagination={{
                page: pagination?.current_page ?? 1,
                limit: pagination?.per_page ?? 10,
                total: pagination?.total ?? 0,
                totalPages: pagination?.last_page ?? 1,
              }}
            />
          )}
        </div>
        {/* Footer */}
        <div className="mt-2 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
