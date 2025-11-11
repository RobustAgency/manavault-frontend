import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    if (token_hash && type) {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        
        if (!error && data.user) {
            // Ensure profile exists after email confirmation
            const user = data.user;
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
            const email = user.email || '';

            // Try to create/update profile if it doesn't exist
            await supabase
                .from("profiles")
                .upsert(
                    {
                        id: user.id,
                        full_name: fullName,
                        email: email,
                    },
                    { onConflict: "id" }
                );

            // Check MFA status after email verification
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
            const hasMFAEnrolled = factorsData?.totp && factorsData.totp.length > 0;

            // Redirect to MFA setup if not enrolled, otherwise check verification status
            if (!hasMFAEnrolled) {
                redirectTo.pathname = '/setup-mfa';
            } else {
                // If MFA is already set up, check if verification is needed
                const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
                const needsMFAVerification = aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2';
                
                if (needsMFAVerification) {
                    redirectTo.pathname = '/verify-mfa';
                } else {
                    redirectTo.pathname = '/dashboard';
                }
            }

            redirectTo.searchParams.delete('next')
            return NextResponse.redirect(redirectTo)
        }
    }

    // return the user to an error page with some instructions
    redirectTo.pathname = '/error'
    return NextResponse.redirect(redirectTo)
}