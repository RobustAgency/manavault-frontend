import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/layouts/AppShell";
import ToastProvider from "@/providers/ToastProvider";
import StoreProvider from "@/providers/StoreProvider";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { ComponentType } from "react";
import ErrorPage from "./error/page";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let initialProfile: { id: string; full_name?: string | null; avatar_url?: string | null; email: string; plan_id: number | null } | null = null;
  if (user?.id) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", user.id)
        .single();

      // If profile doesn't exist (PGRST116) or table doesn't exist (PGRST205), try to create it
      if (error && (error.code === 'PGRST116' || error.code === 'PGRST205')) {
        // PGRST116 = no rows returned, profile doesn't exist
        // PGRST205 = table not found in schema cache (table might exist but not be exposed, or needs to be created)
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        const email = user.email || '';

        const { data: newProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              full_name: fullName,
              email: email,
            },
            { onConflict: "id" }
          )
          .select("id, full_name, avatar_url")
          .single();

        if (!upsertError && newProfile) {
          initialProfile = {
            id: newProfile.id,
            full_name: newProfile.full_name,
            avatar_url: newProfile.avatar_url,
            email: email,
            plan_id: null,
          };
        } else if (upsertError?.code === 'PGRST205') {
          // Table doesn't exist - this is a database setup issue
          console.error("Profiles table not found. Please create the table in Supabase.");
          initialProfile = null;
        }
      } else if (!error && data) {
        initialProfile = {
          id: data.id,
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || null,
          email: (data as any).email || user?.email || '',
          plan_id: (data as any).plan_id || null,
        };
      }
    } catch (err) {
      // Silently handle errors - profile will be null and can be created later
      console.error("Error fetching profile:", err);
      initialProfile = null;
    }
  }

  return (
    <html lang="en" translate="no">
      <body suppressHydrationWarning={true}>
        <AuthProvider initialUser={user} initialProfile={initialProfile}>
          <StoreProvider>
            <ErrorBoundary FallbackComponent={ErrorPage as unknown as ComponentType<FallbackProps>}>
              <AppShell>{children}</AppShell>
            </ErrorBoundary>
          </StoreProvider>
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  )
}
