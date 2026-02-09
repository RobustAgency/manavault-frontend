"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { hasAnyPermission, hasAllPermissions } from "@/lib/permissions";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "react-toastify";

type WithPermissionOptions = {
    redirectTo?: string;
    showSpinner?: boolean;
    requireAll?: boolean;
    denyMessage?: string;
};

export const withPermission = <P extends object>(
    requiredPermissions: string[] | string,
    options: WithPermissionOptions = {}
) => {
    const required = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    return (WrappedComponent: ComponentType<P>) => {
        const ComponentWithPermission = (props: P) => {
            const router = useRouter();
            const { user } = useAuth();
            const role = user?.user_metadata?.role ?? "user";
            const { permissionSet, isLoading } = usePermissions();
            const {
                redirectTo = "/dashboard",
                showSpinner = true,
                requireAll = false,
                denyMessage = "You do not have permission to access this page.",
            } = options;
            const hasNotifiedRef = useRef(false);

            const isAllowed = useMemo(
                () =>
                    role === "super_admin" ||
                    (requireAll
                        ? hasAllPermissions(required, permissionSet)
                        : hasAnyPermission(required, permissionSet)),
                [permissionSet, requireAll, role]
            );

            useEffect(() => {
                if (!isLoading && !isAllowed) {
                    if (!hasNotifiedRef.current) {
                        toast.error(denyMessage);
                        hasNotifiedRef.current = true;
                    }
                    router.replace(redirectTo);
                }
            }, [denyMessage, isLoading, isAllowed, redirectTo, router]);

            if (isLoading && showSpinner) {
                return <Spinner />;
            }

            if (!isAllowed) {
                return null;
            }

            return <WrappedComponent {...props} />;
        };

        ComponentWithPermission.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name || "Component"
            })`;

        return ComponentWithPermission;
    };
};
