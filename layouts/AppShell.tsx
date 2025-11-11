"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "./AuthLayout";

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    const pathname = usePathname();
    const isAuthRoute = useMemo(() => {
        const authRoutes = [
            "/login",
            "/forgot-password",
            "/reset-password",
            "/update-password",
            "/auth/confirm",
            "/logout",
            "/error",
            "/onboarding",
            "/setup-mfa",
            "/verify-mfa",
        ];
        return authRoutes.some(
            (route) => pathname === route || pathname.startsWith(`${route}/`)
        );
    }, [pathname]);

    if (isAuthRoute) return <AuthLayout>{children}</AuthLayout>;

    return <MainLayout>{children}</MainLayout>;
}


