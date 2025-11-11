'use client'

import React, { useMemo, useImperativeHandle, forwardRef } from 'react'
import { DataTable } from '@/components/custom/DataTable'
import { createColumns } from './columns'
import TableCard from '@/components/custom/TableCard'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useUsers } from '@/hooks/admin/useUsers'

export interface UsersTableRef {
    refresh: () => void;
}

const UsersTable = forwardRef<UsersTableRef>((props, ref) => {
    const {
        users,
        loading,
        error,
        pagination,
        handleSearch,
        handlePageChange,
        handleRefresh
    } = useUsers()

    useImperativeHandle(ref, () => ({
        refresh: handleRefresh
    }));

    const columns = useMemo(() => createColumns(handleRefresh), [handleRefresh])

    if (error) {
        return (
            <TableCard title="Users">
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </TableCard>
        )
    }

    return (
        <TableCard title="Users">
            <DataTable
                columns={columns}
                data={users}
                searchKey="full_name"
                searchPlaceholder="Search users by name..."
                pagination={pagination}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                loading={loading}
                serverSide={false}
            />
        </TableCard>
    )
})

UsersTable.displayName = 'UsersTable'

export default UsersTable
