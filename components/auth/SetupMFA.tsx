"use client";

import { useState, useEffect } from "react";
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
import { enrollMFA, verifyMFAEnrollment } from "@/lib/mfa-actions";
import { signout } from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Copy, Check, LogOut } from "lucide-react";

export function SetupMFA() {
    const router = useRouter();
    const [factorId, setFactorId] = useState<string>("");
    const [qrCode, setQrCode] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [verifyCode, setVerifyCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        const startEnrollment = async () => {
            setIsLoading(true);
            setError("");

            const supabase = createClient();

            try {
                const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

                if (factorsError) {
                    console.error("Error listing factors:", factorsError);
                } else if (factorsData) {
                    // Use 'all' array which contains all factors regardless of type
                    const allFactors = factorsData.all || [];

                    // Check for verified factors
                    const verifiedFactors = allFactors.filter(
                        (factor) => factor.status === 'verified' && factor.factor_type === 'totp'
                    );

                    // Check for unverified factors (incomplete enrollments)
                    const unverifiedFactors = allFactors.filter(
                        (factor) => factor.status === 'unverified' && factor.factor_type === 'totp'
                    );

                    // Clean up any unverified factors from previous incomplete enrollments
                    if (unverifiedFactors.length > 0) {
                        console.log(`Found ${unverifiedFactors.length} unverified factor(s), cleaning up...`);
                        for (const factor of unverifiedFactors) {
                            try {
                                await supabase.auth.mfa.unenroll({ factorId: factor.id });
                                console.log(`Unenrolled factor: ${factor.id}`);
                            } catch (unenrollError) {
                                console.error(`Failed to unenroll factor ${factor.id}:`, unenrollError);
                            }
                        }
                    }

                    if (verifiedFactors.length > 0) {
                        console.log("MFA already enrolled, redirecting...");
                        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                        const needsMFAVerification = aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2';

                        if (needsMFAVerification) {
                            router.push("/verify-mfa");
                        } else {
                            const { data: { user } } = await supabase.auth.getUser();
                            const userRole = user?.user_metadata?.role;
                            const isAdmin = userRole === "admin" || userRole === "super_admin";
                            router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
                        }
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking MFA status:", error);
            }

            // No MFA enrolled, proceed with enrollment
            try {
                const result = await enrollMFA();
                console.log("EnrollMFA result:", result);

                if (result.success) {
                    if (!result.factorId || !result.qrCode || !result.secret) {
                        const errorMsg = "Failed to get MFA enrollment data. The server did not return a QR code or secret.";
                        setError(errorMsg);
                        toast.error(errorMsg);
                        console.error("Enrollment result missing data:", {
                            hasFactorId: !!result.factorId,
                            hasQrCode: !!result.qrCode,
                            hasSecret: !!result.secret,
                            result
                        });
                    } else {
                        setFactorId(result.factorId);
                        setQrCode(result.qrCode);
                        setSecret(result.secret);
                        setError("");
                    }
                } else {
                    if (result.message?.includes("already exists")) {
                        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                        const needsMFAVerification = aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2';

                        if (needsMFAVerification) {
                            router.push("/verify-mfa");
                        } else {
                            const { data: { user } } = await supabase.auth.getUser();
                            const userRole = user?.user_metadata?.role;
                            const isAdmin = userRole === "admin" || userRole === "super_admin";
                            router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
                        }
                    } else {
                        const errorMsg = result.message || "Failed to start MFA enrollment. Please check your browser console for details.";
                        setError(errorMsg);
                        toast.error(errorMsg);
                        console.error("Enrollment error:", result);
                    }
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred during MFA enrollment";
                setError(errorMsg);
                toast.error(errorMsg);
                console.error("Enrollment exception:", error);
            }
            setIsLoading(false);
        };

        startEnrollment();
    }, [router]);

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }

        setIsVerifying(true);
        setError("");

        const result = await verifyMFAEnrollment(factorId, verifyCode);

        if (result.success) {
            toast.success("MFA enabled successfully!");

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const isAdmin = user?.user_metadata?.role === "admin";

            if (isAdmin) {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        } else {
            setError(result.message || "Verification failed");
            toast.error(result.message || "Verification failed");
        }

        setIsVerifying(false);
    };

    const handleLogout = async () => {
        try {
            const result = await signout();
            if (result.success) {
                toast.success("Logged out successfully");
                window.location.href = "/login";
            } else {
                toast.error(result.message || "Failed to logout");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("An error occurred during logout");
        }
    };

    const handleRetry = async () => {
        setError("");
        setIsLoading(true);

        const supabase = createClient();
        try {
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const unverifiedFactors = factorsData?.all?.filter(
                (factor) => factor.status === 'unverified' && factor.factor_type === 'totp'
            ) || [];

            for (const factor of unverifiedFactors) {
                await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }

        try {
            const result = await enrollMFA();
            console.log("Retry result:", result);
            if (result.success && result.factorId && result.qrCode && result.secret) {
                setFactorId(result.factorId);
                setQrCode(result.qrCode);
                setSecret(result.secret);
                setError("");
            } else {
                setError(result.message || "Failed to start MFA enrollment. Please check console for details.");
            }
        } catch (err) {
            console.error("Retry error:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
        }

        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <Card className="min-w-sm mx-auto max-w-md">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="min-w-sm mx-auto max-w-md">
            <CardHeader>
                <CardTitle className="text-xl">Set Up Two-Factor Authentication</CardTitle>
                <CardDescription>
                    Scan the QR code with your authenticator app to enable 2FA. This is required to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                        {error}
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {!error && !qrCode && !isLoading && (
                    <div className="p-3 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="font-medium mb-2">No QR code available.</p>
                        <p className="mb-2">This could be due to:</p>
                        <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>MFA enrollment failed silently</li>
                            <li>Supabase MFA service is unavailable</li>
                            <li>Session or authentication issue</li>
                        </ul>
                        <p className="text-xs mt-2">Check the browser console (F12) for detailed error messages.</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRetry}
                        >
                            Retry Enrollment
                        </Button>
                    </div>
                )}

                {qrCode && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                                <img
                                    src={qrCode}
                                    alt="QR Code for MFA"
                                    className="w-48 h-48"
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Scan this QR code with your authenticator app
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secret">Or enter this code manually:</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="secret"
                                    value={secret}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopySecret}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verify-code">
                                Enter the 6-digit code from your app:
                            </Label>
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
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest font-mono"
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
                                "Enable 2FA"
                            )}
                        </Button>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full text-muted-foreground hover:text-foreground"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout instead
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}