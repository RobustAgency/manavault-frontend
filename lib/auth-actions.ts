"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    try {
        const supabase = await createClient();

        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };

        const { data: { user }, error } = await supabase.auth.signInWithPassword(data);

        if (error) {
            return { success: false, message: error.message } as const;
        }

        if (!user) {
            return { success: false, message: "Login failed. Please try again." } as const;
        }

        revalidatePath("/", "layout");
        
        // Only return serializable user data
        return { 
            success: true, 
            data: {
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
            }
        } as const;
    } catch (error) {
        console.error("Login error:", error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : "An unexpected error occurred" 
        } as const;
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const fullName = formData.get("full-name") as string;

    const data = {
        email: email,
        password: formData.get("password") as string,
        options: {
            data: {
                full_name: fullName,
                email: email,
                role: "user",
            },
        },
    };

    const { data: signUpData, error } = await supabase.auth.signUp(data);

    if (error) {
        if (error.message.includes("User already registered")) {
            return { success: false, message: "A user with this email already exists. Please sign in instead." } as const;
        }
        return { success: false, message: error.message } as const;
    }

    // Create profile record if user was created (even if email confirmation is required)
    if (signUpData.user) {
        const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
                {
                    id: signUpData.user.id,
                    full_name: fullName,
                    email: email,
                },
                { onConflict: "id" }
            );

        // Log profile creation error but don't fail signup if profile creation fails
        // The profile can be created later during email confirmation or first login
        if (profileError) {
            console.error("Failed to create profile during signup:", profileError);
            // Don't return error here - user is created, profile can be created later
        }
    }

    return { success: true } as const;
}

export async function signout() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { success: false, message: error.message } as const;
    }
    return { success: true } as const;
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error) {
        console.log(error);
        redirect("/error");
    }

    redirect(data.url);
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const fullName = (formData.get("full_name") as string)?.trim();

    if (!fullName) {
        return { success: false, message: "Full name is required" } as const;
    }

    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !user) {
        return { success: false, message: "Not authenticated" } as const;
    }

    const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
    });

    if (error) {
        return { success: false, message: error.message } as const;
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });
    if (profileError) {
        return { success: false, message: profileError.message } as const;
    }

    revalidatePath("/settings", "page");
    return { success: true } as const;
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();

    const currentPassword = formData.get("current_password") as string;
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: "All fields are required" } as const;
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: "New passwords do not match" } as const;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
        return { success: false, message: "Not authenticated" } as const;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        return { success: false, message: "Current password is incorrect" } as const;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        return { success: false, message: error.message } as const;
    }

    revalidatePath("/settings", "page");
    return { success: true } as const;
}