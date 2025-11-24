'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, AlertCircle, X } from 'lucide-react';
import { DataTable } from '@/components/custom/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetLoginLogsQuery } from '@/lib/redux/features';
import { createColumns } from '@/components/admin/login-logs/columns';

export default function LoginLogsPage() {
    const [page, setPage] = useState(1);
    const [emailFilter, setEmailFilter] = useState('');
    const [ipAddressFilter, setIpAddressFilter] = useState('');

    // Debounced filters for API query
    const [debouncedEmail, setDebouncedEmail] = useState('');
    const [debouncedIpAddress, setDebouncedIpAddress] = useState('');
    const perPage = 15;

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

    // Memoize query parameters to prevent unnecessary re-renders
    const queryParams = useMemo(() => ({
        page,
        per_page: perPage,
        email: debouncedEmail || undefined,
        ip_address: debouncedIpAddress || undefined,
    }), [page, perPage, debouncedEmail, debouncedIpAddress]);

    const { data, isLoading, error, refetch } = useGetLoginLogsQuery(queryParams);

    const handleClearFilters = () => {
        setEmailFilter('');
        setIpAddressFilter('');
        setPage(1);
    };

    const hasActiveFilters = emailFilter || ipAddressFilter;

    const columns = createColumns();

    const errorMessage = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data !== null
        ? (error.data as { message?: string }).message || 'Failed to fetch login logs'
        : 'Failed to fetch login logs';

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Login Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        View and monitor user login activities
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
                <div className="flex-1">
                    <Input
                        placeholder="Filter by email..."
                        value={emailFilter}
                        onChange={(e) => setEmailFilter(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <Input
                        placeholder="Filter by IP address..."
                        value={ipAddressFilter}
                        onChange={(e) => setIpAddressFilter(e.target.value)}
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
