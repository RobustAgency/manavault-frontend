'use client';

import React, { useMemo, useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';
import { DataTable } from '@/components/custom/DataTable';
import { createColumns } from './columns';
import TableCard from '@/components/custom/TableCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { useGetLoginLogsQuery } from '@/lib/redux/features';

export interface LoginLogsTableRef {
    refresh: () => void;
}

const LoginLogsTable = forwardRef<LoginLogsTableRef>((props, ref) => {
    const [page, setPage] = useState(1);
    const [perPage] = useState(15);
    const [emailFilter, setEmailFilter] = useState<string>('');
    const [ipAddressFilter, setIpAddressFilter] = useState<string>('');

    // Debounced filters for API query
    const [debouncedEmail, setDebouncedEmail] = useState('');
    const [debouncedIpAddress, setDebouncedIpAddress] = useState('');

    // Debounce email filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedEmail(emailFilter);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [emailFilter]);

    // Debounce IP address filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedIpAddress(ipAddressFilter);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [ipAddressFilter]);

    const { data, isLoading, error, refetch } = useGetLoginLogsQuery({
        page,
        per_page: perPage,
        email: debouncedEmail || undefined,
        ip_address: debouncedIpAddress || undefined,
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
        setEmailFilter('');
        setIpAddressFilter('');
        setPage(1);
    }, []);

    const hasActiveFilters = emailFilter || ipAddressFilter;

    const errorMessage = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data !== null
        ? (error.data as { message?: string }).message || 'Failed to fetch login logs'
        : 'Failed to fetch login logs';

    if (error) {
        return (
            <TableCard title="Login Logs">
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </TableCard>
        );
    }

    return (
        <TableCard title="Login Logs">
            <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Filter by email..."
                            value={emailFilter}
                            onChange={(e) => setEmailFilter(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Filter by IP address..."
                            value={ipAddressFilter}
                            onChange={(e) => setIpAddressFilter(e.target.value)}
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
        </TableCard>
    );
});

LoginLogsTable.displayName = 'LoginLogsTable';

export default LoginLogsTable;
