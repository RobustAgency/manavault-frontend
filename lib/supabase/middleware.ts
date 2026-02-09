import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  return { supabase, response };
}

export async function updateSession(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const authRoutes = [
    "/login",
    "/forgot-password",
    "/update-password",
    "/auth/confirm",
    "/setup-mfa",
    "/verify-mfa",
  ];

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isLogoutRoute = pathname === "/logout";
  const isMFARoute = pathname === "/setup-mfa" || pathname === "/verify-mfa";

  const redirectWithCookies = (toPath: string) => {
    const target = request.nextUrl.clone();
    target.pathname = toPath;
    const redirectResponse = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };


  // Block access to signup route
  if (pathname === "/signup") {
    return redirectWithCookies("/login");
  }

  if (!user) {
    if (!isAuthRoute) {
      return redirectWithCookies("/login");
    }
    return response;
  }

  // Allow /update-password for password reset flows - skip ALL MFA checks
  // This must be checked before any MFA logic to prevent redirects
  // Normalize pathname to handle any edge cases (trailing slashes, etc.)
  const normalizedPath = pathname.replace(/\/$/, ""); // Remove trailing slash
  if (normalizedPath === "/update-password" || pathname.startsWith("/update-password")) {
    return response;
  }

  // User is authenticated - check MFA status
  if (user) {
    // Get MFA status with error handling
    let hasMFAEnrolled = false;
    let needsMFAVerification = false;
    let isMFAVerified = false;

    try {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      hasMFAEnrolled = !!(factorsData?.totp && factorsData.totp.length > 0);
      needsMFAVerification = !!(
        aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2"
      );
      isMFAVerified = aalData?.currentLevel === "aal2";
    } catch (error) {
      // If MFA API calls fail, assume MFA is not set up
      // This allows users to proceed (they'll be prompted to set up MFA)
      console.error("Error checking MFA status:", error);
    }

    // If user doesn't have MFA enrolled, redirect to setup (unless already on MFA routes)
    if (!hasMFAEnrolled && !isMFARoute && !isAuthRoute && pathname !== "/update-password") {
      return redirectWithCookies("/setup-mfa");
    }

    // If user has MFA enrolled but not verified, redirect to verify (unless already on MFA routes)
    if (hasMFAEnrolled && needsMFAVerification && !isMFARoute && !isAuthRoute && pathname !== "/update-password") {
      return redirectWithCookies("/verify-mfa");
    }

    // If user has MFA enrolled and is on setup-mfa, redirect away
    if (hasMFAEnrolled && pathname === "/setup-mfa") {
      if (needsMFAVerification) {
        return redirectWithCookies("/verify-mfa");
      } else {
        // MFA is already set up and verified, go to dashboard
        if (user.user_metadata?.role === "admin") {
          return redirectWithCookies("/admin/dashboard");
        } else {
          return redirectWithCookies("/dashboard");
        }
      }
    }

    // If MFA is verified, allow access to app but redirect away from MFA routes
    if (isMFAVerified && isMFARoute) {
      if (user.user_metadata?.role === "admin") {
        return redirectWithCookies("/admin/dashboard");
      } else {
        return redirectWithCookies("/dashboard");
      }
    }
  }

  if (user && isAuthRoute && !isLogoutRoute && !isMFARoute) {
    // Allow /update-password for password reset flows - don't redirect away
    // This is a safety check in case the early return above didn't catch it
    const normalizedPath = pathname.replace(/\/$/, "");
    if (normalizedPath === "/update-password" || pathname.startsWith("/update-password")) {
      return response;
    }

    // Check MFA status before redirecting to dashboard
    let hasMFAEnrolled = false;
    let needsMFAVerification = false;

    try {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      hasMFAEnrolled = !!(factorsData?.totp && factorsData.totp.length > 0);
      needsMFAVerification = !!(
        aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2"
      );
    } catch (error) {
      console.error("Error checking MFA status:", error);
    }

    if (!hasMFAEnrolled && pathname !== "/update-password") {
      return redirectWithCookies("/setup-mfa");
    }

    if (needsMFAVerification && pathname !== "/update-password") {
      return redirectWithCookies("/verify-mfa");
    }

    const userRole = user.user_metadata?.role;
    if (userRole === "admin" || userRole === "super_admin") {
      return redirectWithCookies("/admin/dashboard");
    } else {
      return redirectWithCookies("/dashboard");
    }
  }

  if (user && pathname === "/") {
    // Check MFA status
    let hasMFAEnrolled = false;
    let needsMFAVerification = false;

    try {
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      hasMFAEnrolled = !!(factorsData?.totp && factorsData.totp.length > 0);
      needsMFAVerification = !!(
        aalData?.nextLevel === "aal2" && aalData?.currentLevel !== "aal2"
      );
    } catch (error) {
      console.error("Error checking MFA status:", error);
    }

    if (!hasMFAEnrolled) {
      return redirectWithCookies("/setup-mfa");
    }

    if (needsMFAVerification) {
      return redirectWithCookies("/verify-mfa");
    }

    const userRole = user.user_metadata?.role;
    if (userRole === "admin" || userRole === "super_admin") {
      return redirectWithCookies("/admin/dashboard");
    } else {
      return redirectWithCookies("/admin/dashboard");
    }
  }

  return response;
}
