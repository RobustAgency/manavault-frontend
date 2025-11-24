"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LoginLog } from "@/lib/redux/features";
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

const getActivityBadge = (activity: string) => {
    const colorMap: Record<string, "success" | "error" | "warning" | "default"> = {
        login: "success",
        logout: "error",
        failed_login: "error",
    };

    return (
        <Badge
            variant="light"
            color={colorMap[activity.toLowerCase()] || "default"}
            className="capitalize"
        >
            {activity}
        </Badge>
    );
};

export const createColumns = (): ColumnDef<LoginLog>[] => [
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("email")}</div>;
        },
    },
    {
        accessorKey: "ip_address",
        header: "IP Address",
    },
    {
        accessorKey: "user_agent",
        header: "User Agent",
        cell: ({ row }) => {
            const userAgent = row.getValue("user_agent") as string | null;
            return (
                <div className="max-w-[300px] truncate" title={userAgent || ""}>
                    {truncateText(userAgent, 40)}
                </div>
            );
        },
    },
    {
        accessorKey: "activity",
        header: "Activity",
        cell: ({ row }) => {
            const activity = row.getValue("activity") as string;
            return getActivityBadge(activity);
        },
    },
    {
        accessorKey: "logged_in_at",
        header: "Logged In",
        cell: ({ row }) => {
            const loggedInAt = row.getValue("logged_in_at") as string | null;
            return <div className="text-sm">{formatDateTime(loggedInAt)}</div>;
        },
    },
    // {
    //     accessorKey: "logged_out_at",
    //     header: "Logged Out",
    //     cell: ({ row }) => {
    //         const loggedOutAt = row.getValue("logged_out_at") as string | null;
    //         return <div className="text-sm">{formatDateTime(loggedOutAt)}</div>;
    //     },
    // },
];

export const columns = createColumns();

