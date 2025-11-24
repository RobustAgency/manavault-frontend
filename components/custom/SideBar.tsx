import Link from "next/link";
import {
    LayoutDashboard,
    Settings as SettingsIcon,
    LogOut,
    CreditCard,
    FileChartColumnIncreasing,
    Users,
    Package,
    ShoppingCart,
    FileText,
    Upload,
    Gift,
    ShieldCheck,
    ClipboardList
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";

const adminRoutes = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/suppliers", label: "Suppliers", icon: Package },
    { href: "/admin/products", label: "Products", icon: ShoppingCart },
    { href: "/admin/digital-stock", label: "Digital Stock", icon: Gift },
    { href: "/admin/purchase-orders", label: "Purchase Orders", icon: FileText },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/login-logs", label: "Login Logs", icon: ShieldCheck },
    { href: "/admin/voucher-audit-logs", label: "Voucher Audit", icon: ClipboardList },
    // { href: "/admin/vouchers", label: "Vouchers", icon: Upload },
];
const userRoutes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/plans", label: "Plans", icon: CreditCard },
    { href: "/invoices", label: "Invoices", icon: FileChartColumnIncreasing },
];

const baseRoutes = [
    // { href: "/settings", label: "Settings", icon: SettingsIcon },
    { href: "/logout", label: "Logout", icon: LogOut },
];

export function Sidebar({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate: () => void;
}) {
    const { user } = useAuth();
    const role = user?.user_metadata?.role ?? "user"

    // Determine base routes based on role
    let navigationRoutes = (role === "admin" || role === "super_admin") ? adminRoutes : userRoutes;

    // Filter out Users route if not super_admin
    if (role === "admin") {
        navigationRoutes = navigationRoutes.filter(route => route.href !== "/admin/users");
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
                                <div className='absolute top-1/2 -translate-y-1/2 rounded-full -left-1 w-1 h-[calc(100%-10px)] bg-gradient-to-r from-black via-neutral-800 to-gray-900'></div>
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