import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase Admin Client
 * This uses the service role key which has admin privileges
 * WARNING: This should ONLY be used in server-side code
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. " +
        "Please add it to your .env.local file. " +
        "You can find it in Supabase Dashboard → Settings → API → service_role key"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
