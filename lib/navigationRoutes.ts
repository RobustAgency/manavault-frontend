import type { ComponentType } from "react";
import {
  LayoutDashboard,
  LogOut,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Gift,
  ShieldCheck,
  ClipboardList,
  Layers,
  Tag,
  TrendingUp,
  Shield,
} from "lucide-react";

export type NavigationRoute = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  moduleSlug?: string;
};

export const adminRoutes: NavigationRoute[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/suppliers", label: "Suppliers", icon: Package, moduleSlug: "supplier" },
  { href: "/admin/products", label: "Products", icon: ShoppingCart, moduleSlug: "product" },
  { href: "/admin/digital-stock", label: "Digital Stock", icon: Gift, moduleSlug: "digital_stock" },
  { href: "/admin/purchase-orders", label: "Purchase Orders", icon: FileText, moduleSlug: "purchase_order" },
  { href: "/admin/sale-orders", label: "Sales Orders", icon: TrendingUp, moduleSlug: "sale_order" },
  { href: "/admin/users", label: "Users", icon: Users, moduleSlug: "user" },
  { href: "/admin/login-logs", label: "Login Logs", icon: ShieldCheck, moduleSlug: "activity_log" },
  { href: "/admin/voucher-audit-logs", label: "Voucher Audit", icon: ClipboardList, moduleSlug: "voucher_audit_log" },
  { href: "/admin/brands", label: "Brands", icon: Layers, moduleSlug: "brand" },
  { href: "/admin/pricing-automation", label: "Pricing Automation", icon: Tag, moduleSlug: "price_rule" },
  { href: "/admin/roles", label: "Roles", icon: Shield, moduleSlug: "role" },
  // { href: "/admin/vouchers", label: "Vouchers", icon: Upload },
];

export const userRoutes: NavigationRoute[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },

];

export const baseRoutes: NavigationRoute[] = [
  // { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/logout", label: "Logout", icon: LogOut },
];
