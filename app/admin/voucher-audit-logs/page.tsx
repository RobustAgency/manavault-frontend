'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
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
import { useGetVoucherAuditLogsQuery } from '@/lib/redux/features';
import { createColumns } from '@/components/admin/voucher-audit-logs/columns';

const actionOptions = [
    { value: 'viewed', label: 'Viewed' },
    { value: 'requested', label: 'Requested' },
    { value: 'copied', label: 'Copied' },
];

export default function VoucherAuditLogsPage() {
    const [page, setPage] = useState(1);
    const [voucherIdFilter, setVoucherIdFilter] = useState('');
    const [userNameFilter, setUserNameFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Debounced filters for API query
    const [debouncedVoucherId, setDebouncedVoucherId] = useState<number | undefined>();
    const [debouncedUserName, setDebouncedUserName] = useState<string>('');
    const perPage = 15;

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

    // Debounce user name filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUserName(userNameFilter.trim());
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [userNameFilter]);

    // Reset page when other filters change
    useEffect(() => {
        setPage(1);
    }, [actionFilter, startDateFilter, endDateFilter]);

    // Only include date filters if both are selected
    const hasBothDates = startDateFilter && endDateFilter;
    const dateFilters = hasBothDates
        ? {
            start_date: startDateFilter,
            end_date: endDateFilter,
        }
        : {};

    const { data, isLoading, error, refetch } = useGetVoucherAuditLogsQuery({
        page,
        per_page: perPage,
        voucher_id: debouncedVoucherId,
        name: debouncedUserName || undefined,
        action: actionFilter || undefined,
        ...dateFilters,
    });

    const handleClearFilters = () => {
        setVoucherIdFilter('');
        setUserNameFilter('');
        setActionFilter('');
        setStartDateFilter('');
        setEndDateFilter('');
        setPage(1);
    };

    const hasActiveFilters = voucherIdFilter || userNameFilter || actionFilter || startDateFilter || endDateFilter;

    const columns = createColumns();

    const errorMessage = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data !== null
        ? (error.data as { message?: string }).message || 'Failed to fetch voucher audit logs'
        : 'Failed to fetch voucher audit logs';

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Voucher Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Track all voucher-related activities and changes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="flex flex-col items-center justify-center py-8 mb-4 rounded-lg border border-destructive/30 bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            ) : null}

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <div className="">
                    <Input
                        placeholder="User name"
                        value={userNameFilter}
                        onChange={(e) => setUserNameFilter(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <Input
                        type="date"
                        placeholder="Start Date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                    />
                </div>
                <div className="w-48">
                    <Input
                        type="date"
                        placeholder="End Date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                    />
                </div>
                {hasActiveFilters && (
                    <Button
                        onClick={handleClearFilters}
                        variant="outline"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                )}
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
        </div>
    );
}
