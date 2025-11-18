"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyMFALogin } from "@/lib/mfa-actions";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function VerifyMFA() {
    const router = useRouter();
    const [verifyCode, setVerifyCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);

    const handleVerify = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsVerifying(true);
        setError("");

        const result = await verifyMFALogin(verifyCode);

        if (result.success) {
            toast.success("Verified successfully!");

            // Check for return URL (e.g., from update-password page)
            const returnUrl = sessionStorage.getItem('returnUrl');
            if (returnUrl) {
                sessionStorage.removeItem('returnUrl');
                router.push(returnUrl);
                router.refresh();
                return;
            }

            // Get user role to redirect appropriately
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const userRole = user?.user_metadata?.role;
            const isAdmin = userRole === "admin" || userRole === "super_admin";

            if (isAdmin) {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        } else {
            setError(result.message || "Verification failed");
            toast.error(result.message || "Verification failed");
            setVerifyCode("");
        }

        setIsVerifying(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && verifyCode.length === 6 && !isVerifying) {
            handleVerify();
        }
    };

    return (
        <Card className="min-w-sm mx-auto max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Enter the 6-digit code from your authenticator app to continue.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="verify-code">Verification Code</Label>
                    <Input
                        id="verify-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={verifyCode}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setVerifyCode(value);
                            setError("");
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || verifyCode.length !== 6}
                    className="w-full"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

