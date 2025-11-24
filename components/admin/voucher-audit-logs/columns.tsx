"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { VoucherAuditLog } from "@/lib/redux/features";
import { formatDate } from "@/utils/formatDate";

const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const truncateText = (text: string | null, maxLength: number = 50) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

const getActionBadge = (action: string) => {
    const colorMap: Record<string, "success" | "error" | "warning" | "default"> = {
        created: "success",
        updated: "warning",
        deleted: "error",
        redeemed: "success",
        activated: "success",
        deactivated: "error",
        viewed: "default",
    };

    return (
        <Badge
            variant="light"
            color={colorMap[action.toLowerCase()] || "default"}
            className="capitalize"
        >
            {action}
        </Badge>
    );
};

export const createColumns = (): ColumnDef<VoucherAuditLog>[] => [
    {
        accessorKey: "voucher_code",
        header: "Voucher Code",
        cell: ({ row }) => {
            const code = row.original.voucher?.code;
            return <div className="font-medium">{code || "N/A"}</div>;
        },
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
            const action = row.getValue("action") as string;
            return getActionBadge(action);
        },
    },
    {
        accessorKey: "user_email",
        header: "User",
        cell: ({ row }) => {
            const email = row.original.user?.email;
            const name = row.original.user?.name;
            return (
                <div>
                    {name ? (
                        <div>
                            <div className="font-medium">{name}</div>
                            <div className="text-sm text-muted-foreground">{email || "N/A"}</div>
                        </div>
                    ) : (
                        <div>{email || "N/A"}</div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "ip_address",
        header: "IP Address",
        cell: ({ row }) => {
            const ip = row.original.ip_address;
            return <div>{ip || "N/A"}</div>;
        },
    },
    {
        accessorKey: "created_at",
        header: "Timestamp",
        cell: ({ row }) => {
            const createdAt = row.getValue("created_at") as string;
            return <div className="text-sm">{formatDateTime(createdAt)}</div>;
        },
    },
    // {
    //     accessorKey: "details",
    //     header: "Details",
    //     cell: ({ row }) => {
    //         const details = row.original.details;
    //         if (!details) return "N/A";
    //         const detailsStr = JSON.stringify(details);
    //         return (
    //             <div className="max-w-[200px] truncate" title={detailsStr}>
    //                 {truncateText(detailsStr, 30)}
    //             </div>
    //         );
    //     },
    // },
];

export const columns = createColumns();

