"use client"

import { ColumnDef } from "@tanstack/react-table"
import ActionCell from "./ActionCell"
import { TableUser } from "@/hooks/admin/useUsers"


export const createColumns = (onRefresh?: () => void): ColumnDef<TableUser>[] => [
    {
        accessorKey: "full_name",
        header: "Username",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.original.role
            return role?.name || '-';
        },
    },
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
