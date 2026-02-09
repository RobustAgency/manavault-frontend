"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import Spinner from "@/components/ui/spinner";
import DesktopLayout from "@/layouts/DesktopLayout";
import MobileLayout from "@/layouts/MobileLayout";
import { adminRoutes } from "@/lib/navigationRoutes";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUserRole } from "@/lib/redux/features";
import { toast } from "react-toastify";
import { getModulePermission, hasAnyPermission } from "@/lib/permissions";

type MainLayoutProps = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoading, user } = useAuth();
    const role = useAppSelector(selectUserRole);
    const effectiveRole = role ?? "user";
    const isRoleReady = role !== null;
    const { permissionSet, isLoading: permissionsLoading } = usePermissions();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    const matchedAdminRoute = useMemo(
        () =>
            adminRoutes.find(
                (route) =>
                    pathname === route.href || pathname.startsWith(`${route.href}/`)
            ),
        [pathname]
    );

    const shouldBlockOnPermissions =
        Boolean(user) &&
        isRoleReady &&
        effectiveRole !== "super_admin" &&
        pathname.startsWith("/admin") &&
        Boolean(matchedAdminRoute?.moduleSlug);

    useEffect(() => {
        if (!shouldBlockOnPermissions || permissionsLoading) return;

        if (
            matchedAdminRoute?.moduleSlug && 
            !hasAnyPermission([getModulePermission("view", matchedAdminRoute.moduleSlug)], permissionSet)
        ) {
            router.replace("/admin/dashboard");
        }
    }, [
        matchedAdminRoute,
        permissionSet,
        permissionsLoading,
        router,
        shouldBlockOnPermissions,
    ]);

    if (isLoading || (shouldBlockOnPermissions && permissionsLoading)) return <Spinner />


    return (
        <div className="bg-background text-foreground">
            <MobileLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                desktopCollapsed={desktopCollapsed}
                setDesktopCollapsed={setDesktopCollapsed}>
                {children}
            </MobileLayout>
            <DesktopLayout desktopCollapsed={desktopCollapsed}>
                {children}
            </DesktopLayout>

        </div>
    );
}