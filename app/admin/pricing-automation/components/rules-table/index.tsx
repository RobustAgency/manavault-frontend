'use client'
import ConfirmationDialog from "@/components/custom/ConfirmationDialog";
import { DataTable } from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, ProductStatus, SupplierStatus, SupplierType, useGetSuppliersQuery } from "@/lib/redux/features";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createRulesColumns } from "../rules-column";
import { ColumnDef } from "@tanstack/react-table";
import { PriceRule, RuleStatus, useDeletePriceRuleMutation, useGetPriceRulesListQuery } from "@/lib/redux/features/priceAutomationApi";

const RulesTable = () => {
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [deleteProduct, { isLoading: isDeleting }] =  useDeletePriceRuleMutation();

  const openEditPage = (rules: Product) => {
    router.push(`/admin/pricing-automation/edit/${rules.id}`);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const columns = createRulesColumns({
    onEdit: openEditPage,
    onDelete: openDeleteDialog,
  });

  const perPage = 10;
  // Debounce name search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameSearch(nameSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [nameSearch]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);


  const { data: priceRuleListData, isLoading: PriceRuleListLoading } = useGetPriceRulesListQuery({
    page,
    per_page: perPage,
    name: debouncedNameSearch || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as RuleStatus)
});

console.log(statusFilter)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Automation</h1>
          <p className="text-muted-foreground mt-1">Manage pricing rules for your products</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/pricing-automation/create')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="w-64">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductStatus | 'all')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_active">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns as ColumnDef<PriceRule>[]}
        data={priceRuleListData?.data ?? []}
        loading={PriceRuleListLoading}
        pagination={{
          page: priceRuleListData?.pagination?.current_page || 1,
          limit: perPage,
          total: priceRuleListData?.pagination?.total || 0,
          totalPages: priceRuleListData?.pagination?.last_page || 1, 
        }} 
        serverSide
        onPageChange={setPage}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default RulesTable;