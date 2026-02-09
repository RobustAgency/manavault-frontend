import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminRoutes, userRoutes, baseRoutes } from "@/lib/navigationRoutes";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUserRole } from "@/lib/redux/features";

export function Sidebar({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate: () => void;
}) {
    const role = useAppSelector(selectUserRole) ?? "user";
    const { modules } = usePermissions();

    // Determine base routes based on role
    const allowedModuleSlugs = new Set(modules.map((module) => module.slug));
    const moduleRoutes = adminRoutes.filter(
        (route) =>
            route.moduleSlug &&
            allowedModuleSlugs.has(route.moduleSlug)
    );
    const dashboardRoute = adminRoutes.find((route) => route.href === "/admin/dashboard");
    const adminDynamicRoutes = [
        ...(dashboardRoute ? [dashboardRoute] : []),
        ...moduleRoutes,
    ];

    let navigationRoutes =
        role === "super_admin"
            ? adminRoutes
            : role === "admin"
                ? (adminDynamicRoutes.length > 0 ? adminDynamicRoutes : adminRoutes)
                : [...userRoutes, ...moduleRoutes];

    // Filter out Users and Roles routes if not super_admin
    if (role === "admin") {
        navigationRoutes = navigationRoutes.filter(route =>
            route.href !== "/admin/users" && route.href !== "/admin/roles"
        );
    }

    const pathname = usePathname();
    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div
                aria-details="logo"
                className="flex items-center justify-between md:hidden">
                <Link href="/">
                    <div className='text-2xl font-bold'>Mana Vault</div>
                </Link>
            </div>

            <nav className="flex flex-col gap-1 p-2 md:p-3 mt-6">
                {navigationRoutes.map((item) => {
                    const isActive = pathname.includes(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={"relative flex items-center rounded-md hover:bg-accent hover:text-accent-foreground gap-2 px-3 py-2 text-sm"}
                        >
                            {item.icon ? <item.icon className="shrink-0 size-4" /> : null}
                            {!collapsed && (
                                <span className={`whitespace-nowrap`}>{item.label}</span>
                            )}
                            {isActive && (
                                <div className='absolute top-1/2 -translate-y-1/2 rounded-full -left-1 w-1 h-[calc(100%-10px)] bg-linear-to-r from-black via-neutral-800 to-gray-900'></div>
                            )}
                        </Link>
                    )
                })}
            </nav>
            <div className={"mt-auto border-t p-2 md:p-3"}>
                {baseRoutes.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={"flex items-center rounded-md hover:bg-accent hover:text-accent-foreground gap-2 px-3 py-2 text-sm"}
                    >
                        {item.icon ? <item.icon className="shrink-0 size-4" /> : null}
                        {!collapsed && (
                            <span className={`whitespace-nowrap`}>{item.label}</span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Sidebar;