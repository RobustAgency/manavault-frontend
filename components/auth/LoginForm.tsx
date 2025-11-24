"use client"
import { useActionState, useEffect, useState, useRef } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/auth-actions"
import { useCreateLoginLogMutation } from "@/lib/redux/features"
import { createLoginLogData } from "@/lib/login-log-utils"

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
        </Button>
    );
}

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [createLoginLog] = useCreateLoginLogMutation();
    const loggedLoginStateRef = useRef<string | null>(null);

    const [state, formAction] = useActionState(
        async (_prev: null | { success: false; message: string } | { success: true; data: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null }, formData: FormData) => {
            try {
                const result = await login(formData);
                return result;
            } catch (error) {
                console.error("Login form error:", error);
                return {
                    success: false,
                    message: error instanceof Error ? error.message : "An unexpected error occurred"
                } as const;
            }
        },
        null as null | { success: false; message: string } | { success: true; data: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null }
    );

    useEffect(() => {
        if (!state) return;
        if (state.success) {
            // Create a unique key for this login state to prevent duplicates
            const stateKey = state.data?.id || state.data?.email || 'unknown';

            // Prevent duplicate login log creation for the same login
            if (loggedLoginStateRef.current === stateKey) return;
            loggedLoginStateRef.current = stateKey;

            toast.success("Logged in successfully");

            // Create login log entry
            const userEmail = state.data?.email || email;
            if (userEmail) {
                createLoginLogData(userEmail, 'login').then((logData) => {
                    createLoginLog(logData).catch((error) => {
                        // Silently fail - don't block login if logging fails
                        console.error('Failed to log login activity:', error);
                    });
                }).catch((error) => {
                    // Silently fail - don't block login if logging fails
                    console.error('Failed to create login log data:', error);
                });
            }

            // Clear inputs only on success
            setEmail("");
            setPassword("");

            const userRole = state.data?.user_metadata?.role;
            const redirectPath = (userRole === "admin" || userRole === "super_admin")
                ? "/admin/dashboard"
                : "/dashboard";
            window.location.href = redirectPath;
        } else if (state.message) {
            toast.error(state.message);
            // Inputs remain unchanged on error
            // Reset the ref on error so it can be called again on retry
            loggedLoginStateRef.current = null;
        }
    }, [state, email, createLoginLog]);

    return (
        <Card className="min-w-sm mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}