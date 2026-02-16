"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import ActionCell from "./ActionCell"
import { TableUser } from "@/hooks/admin/useUsers"

const getStatusBadge = (status: TableUser["status"]) => {
    const colorMap = {
        approved: "success" as const,
        rejected: "error" as const,
        pending: "warning" as const,
    }

    return (
        <Badge variant="light" color={colorMap[status]} className="capitalize">
            {status}
        </Badge>
    )
}

export const createColumns = (onRefresh?: () => void): ColumnDef<TableUser>[] => [
    {
        accessorKey: "full_name",
        header: "Username",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    // {
    //     accessorKey: "status",
    //     header: "Status",
    //     cell: ({ row }) => {
    //         const status = row.getValue("status") as TableUser["status"]
    //         return getStatusBadge(status)
    //     },
    // },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original
            return <ActionCell user={user} onRefresh={onRefresh} />
        },
    },
]

export const columns = createColumns()
