'use client';
import ConfirmationDialog from "@/components/custom/ConfirmationDialog";
import { DataTable } from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createRulesColumns } from "../rules-column";
import { ColumnDef } from "@tanstack/react-table";
import { useDeletePriceRuleMutation, useGetPriceRulesListQuery } from "@/lib/redux/features/priceAutomationApi";
import { PriceRule } from "@/types";
import { toast } from "react-toastify";
import { usePermissions } from "@/hooks/usePermissions";
import { getModulePermission, hasPermission } from "@/lib/permissions";

type RuleStatusFilter = "all" | "active" | "in_active";

const RulesTable = () => {
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RuleStatusFilter>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rulePendingDelete, setRulePendingDelete] = useState<PriceRule | null>(
    null
  );
  const { permissionSet } = usePermissions();
  const canCreate = hasPermission(getModulePermission('create', 'price_rule'), permissionSet);
  const canEdit = hasPermission(getModulePermission('edit', 'price_rule'), permissionSet);
  const canDelete = hasPermission(getModulePermission('delete', 'price_rule'), permissionSet);

  const [deletePriceRule, { isLoading: isDeleting }] =
    useDeletePriceRuleMutation();

  const openEditPage = (rules: PriceRule) => {
    if (rules.id == null) return;
    router.push(`/admin/pricing-automation/edit/${rules.id}`);
  };

  const openDeleteDialog = (rules: PriceRule) => {
    setRulePendingDelete(rules);
    setIsDeleteDialogOpen(true);
  };

  const columns = createRulesColumns({
    onEdit: openEditPage,
    onDelete: openDeleteDialog,
    canEdit,
    canDelete,
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
  }, [statusFilter]);


  const { data: priceRuleListData, isLoading: PriceRuleListLoading } = useGetPriceRulesListQuery({
    page,
    per_page: perPage,
    name: debouncedNameSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handleDelete = async () => {
    if (rulePendingDelete?.id == null) return;
    try {
      await deletePriceRule(rulePendingDelete.id).unwrap();
      setIsDeleteDialogOpen(false);
      setRulePendingDelete(null);
      toast.success("Price rule deleted successfully");
    } catch {
      toast.error("Failed to delete price rule");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Pricing Automation</h1>
          <p className="text-muted-foreground mt-1">Manage pricing rules for your products</p>
        </div>
        <div className="flex md:gap-2">
          {canCreate && (
            <Button onClick={() => router.push('/admin/pricing-automation/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          )}
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="md:w-64 w-full">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RuleStatusFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_active">Inactive</SelectItem>
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
        columns={columns as ColumnDef<PriceRule, unknown>[]}
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
        title="Delete Price Rule"
        description={`Are you sure you want to delete "${rulePendingDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
};

export default RulesTable;