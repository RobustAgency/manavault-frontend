"use client";

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify';

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isCheckingAAL, setIsCheckingAAL] = useState(true)
    const router = useRouter()

    // Check AAL level on mount
    useEffect(() => {
        const checkAAL = async () => {
            const supabase = createClient()
            try {
                const { data: aalData, error: aalError } =
                    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

                if (aalError) {
                    setError('Failed to check authentication level')
                    setIsCheckingAAL(false)
                    return
                }

                // Check if user has MFA enrolled
                const { data: factorsData } = await supabase.auth.mfa.listFactors()
                const hasMFAEnrolled = factorsData?.totp && factorsData.totp.length > 0

                // If MFA is enrolled but session is not AAL2, redirect to verify
                if (hasMFAEnrolled && aalData?.currentLevel !== 'aal2') {
                    // Store the return URL so user can come back after MFA verification
                    sessionStorage.setItem('returnUrl', '/update-password')
                    router.push('/verify-mfa')
                    return
                }

                setIsCheckingAAL(false)
            } catch (error) {
                console.error('Error checking AAL:', error)
                setError('Failed to verify authentication level')
                setIsCheckingAAL(false)
            }
        }

        checkAAL()
    }, [router])

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            // Validate passwords match
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                setIsLoading(false)
                return
            }

            // Double-check AAL level before updating
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            const { data: factorsData } = await supabase.auth.mfa.listFactors()
            const hasMFAEnrolled = factorsData?.totp && factorsData.totp.length > 0

            if (hasMFAEnrolled && aalData?.currentLevel !== 'aal2') {
                toast.error('MFA verification required. Redirecting...')
                sessionStorage.setItem('returnUrl', '/update-password')
                setTimeout(() => {
                    router.push('/verify-mfa')
                }, 1000)
                return
            }

            const {data, error } = await supabase.auth.updateUser({ password })
            if(data.user){
              toast.success("Password Updated Successfully")
            }
            if (error) throw error
            router.push('/')
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    if (isCheckingAAL) {
        return (
            <div className={cn('flex flex-col gap-6', className)} {...props}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">Verifying authentication...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                    <CardDescription>Please enter your new password below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>
                                <PasswordInput
                                    id="password"
                                    placeholder="New password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm_password">Confirm new password</Label>
                                <PasswordInput
                                    id="confirm_password"
                                    placeholder="Confirm new password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                {error && <p className="text-sm text-red-500">{error}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save new password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}