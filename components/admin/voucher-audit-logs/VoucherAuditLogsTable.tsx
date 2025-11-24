'use client';

import React, { useMemo, useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import { createColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { useGetVoucherAuditLogsQuery } from '@/lib/redux/features';

export interface VoucherAuditLogsTableRef {
    refresh: () => void;
}

const actionOptions = [
    { value: 'viewed', label: 'Viewed' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'redeemed', label: 'Redeemed' },
    { value: 'activated', label: 'Activated' },
    { value: 'deactivated', label: 'Deactivated' },
];

const VoucherAuditLogsTable = forwardRef<VoucherAuditLogsTableRef>((props, ref) => {
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);
    const [voucherIdFilter, setVoucherIdFilter] = useState<string>('');
    const [userIdFilter, setUserIdFilter] = useState<string>('');
    const [actionFilter, setActionFilter] = useState<string>('');
    const [startDateFilter, setStartDateFilter] = useState<string>('');
    const [endDateFilter, setEndDateFilter] = useState<string>('');

    // Debounced filters for API query
    const [debouncedVoucherId, setDebouncedVoucherId] = useState<number | undefined>();
    const [debouncedUserId, setDebouncedUserId] = useState<number | undefined>();

    // Debounce voucher_id filter
    useEffect(() => {
        const timer = setTimeout(() => {
            const voucherId = voucherIdFilter.trim();
            const parsed = voucherId ? parseInt(voucherId, 10) : undefined;
            setDebouncedVoucherId(isNaN(parsed as number) ? undefined : parsed);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [voucherIdFilter]);

    // Debounce user_id filter
    useEffect(() => {
        const timer = setTimeout(() => {
            const userId = userIdFilter.trim();
            const parsed = userId ? parseInt(userId, 10) : undefined;
            setDebouncedUserId(isNaN(parsed as number) ? undefined : parsed);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [userIdFilter]);

    // Reset page when other filters change
    useEffect(() => {
        setPage(1);
    }, [actionFilter, startDateFilter, endDateFilter]);

    const { data, isLoading, error, refetch } = useGetVoucherAuditLogsQuery({
        page,
        per_page: perPage,
        voucher_id: debouncedVoucherId,
        user_id: debouncedUserId,
        action: actionFilter || undefined,
        start_date: startDateFilter || undefined,
        end_date: endDateFilter || undefined,
    });

    useImperativeHandle(ref, () => ({
        refresh: () => {
            refetch();
        }
    }));

    const columns = useMemo(() => createColumns(), []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleClearFilters = useCallback(() => {
        setVoucherIdFilter('');
        setUserIdFilter('');
        setActionFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
        setPage(1);
    }, []);

    const hasActiveFilters = voucherIdFilter || userIdFilter || actionFilter || startDateFilter || endDateFilter;

    const errorMessage = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data !== null
        ? (error.data as { message?: string }).message || 'Failed to fetch voucher audit logs'
        : 'Failed to fetch voucher audit logs';

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                <p className="text-red-600 mb-4">{errorMessage}</p>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            type="number"
                            placeholder="Voucher ID"
                            value={voucherIdFilter}
                            onChange={(e) => setVoucherIdFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            type="number"
                            placeholder="User ID"
                            value={userIdFilter}
                            onChange={(e) => setUserIdFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <Select value={actionFilter || undefined} onValueChange={(value) => setActionFilter(value || '')}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Actions" />
                            </SelectTrigger>
                            <SelectContent>
                                {actionOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            type="date"
                            placeholder="Start Date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <Input
                            type="date"
                            placeholder="End Date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            size="sm"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>
            <DataTable
                columns={columns}
                data={data?.data || []}
                pagination={data?.pagination ? {
                    page: data.pagination.current_page,
                    limit: data.pagination.per_page,
                    total: data.pagination.total,
                    totalPages: data.pagination.last_page,
                } : undefined}
                onPageChange={handlePageChange}
                loading={isLoading}
                serverSide={true}
            />
        </div>
    );
});

VoucherAuditLogsTable.displayName = 'VoucherAuditLogsTable';

export default VoucherAuditLogsTable;
