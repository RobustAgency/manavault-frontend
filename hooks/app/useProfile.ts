import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { profileService, type Profile } from "@/service/app/profile";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface UseProfileReturn {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfile = (
  user: User | null,
  initialProfile: Profile | null
): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let { data: supabaseData, error: supabaseError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (supabaseError) {
        // If table doesn't exist (PGRST205) or profile doesn't exist (PGRST116), try to create it
        if (
          supabaseError.code === "PGRST205" ||
          supabaseError.code === "PGRST116"
        ) {
          const fullName =
            user.user_metadata?.full_name || user.email?.split("@")[0] || "";
          const email = user.email || "";

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
            .select("*")
            .single();

          if (upsertError) {
            if (upsertError.code === "PGRST205") {
              toast.error(
                "Profiles table not found. Please set up the database schema."
              );
              setError("Database setup required. Please contact support.");
            } else {
              toast.error(upsertError.message);
              setError(upsertError.message);
            }
            return;
          }

          // Use the newly created profile
          if (newProfile) {
            supabaseData = newProfile;
          } else {
            toast.error("Failed to create profile");
            setError("Failed to create profile");
            return;
          }
        } else {
          toast.error(supabaseError.message);
          setError(supabaseError.message);
          return;
        }
      }

      if (!supabaseData) {
        setError("Profile data is null");
        return;
      }

      if (user?.user_metadata?.role === "user") {
        const profileResult = await profileService.getProfile();

        if (profileResult.success && profileResult.data) {
          setProfile({
            ...supabaseData,
            has_payment_method: profileResult.data.has_payment_method ?? null,
            plan_id: profileResult.data.plan_id ?? null,
          });
          if (!profileResult.data.has_payment_method) {
            router.push("/onboarding?mode=add-payment-method");
          }
        } else if (profileResult.error) {
          if (profileResult.errorCode === 403) {
            router.push("/onboarding?mode=unapproved-account");
          } else {
            toast.error(profileResult.message || "An error occurred");
            setError(profileResult.message || "An error occurred");
          }
        }
      } else {
        setProfile(supabaseData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.user_metadata?.role, supabase, router]);

  // useEffect(() => {
  //     fetchProfile();
  // }, [fetchProfile]);

  return {
    profile,
    setProfile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
