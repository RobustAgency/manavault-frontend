import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/layouts/AppShell";
import ToastProvider from "@/providers/ToastProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let initialProfile: { id: string; full_name?: string | null; avatar_url?: string | null } | null = null;
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
          initialProfile = (newProfile as typeof initialProfile) ?? null;
        } else if (upsertError?.code === 'PGRST205') {
          // Table doesn't exist - this is a database setup issue
          console.error("Profiles table not found. Please create the table in Supabase.");
          initialProfile = null;
        }
      } else if (!error && data) {
        initialProfile = (data as typeof initialProfile) ?? null;
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
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
