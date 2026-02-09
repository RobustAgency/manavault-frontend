"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  confirmed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface GetUsersResult {
  success: boolean;
  data?: {
    users: SupabaseUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Create a new user (Admin only)
 * This uses Supabase Admin API to create users
 */
export async function createUser(formData: FormData) {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "Not authenticated" } as const;
  }

  const userRole = user.user_metadata?.role;
  if (userRole !== "super_admin") {
    return {
      success: false,
      message: "Unauthorized. Only admins can create users.",
    } as const;
  }

  const email = formData.get("email") as string;
  const fullName = formData.get("full-name") as string;
  const password = formData.get("password") as string;

  if (!email || !fullName || !password) {
    return { success: false, message: "All fields are required" } as const;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "Invalid email format" } as const;
  }

  // Validate password length
  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters",
    } as const;
  }

  try {
    // Use admin client to create user
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (adminError) {
      console.error("Admin client creation error:", adminError);
      return {
        success: false,
        message:
          adminError instanceof Error
            ? adminError.message
            : "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. See SETUP_ADMIN_USER_CREATION.md for instructions.",
      } as const;
    }

    const { data: signUpData, error } = await adminClient.auth.admin.createUser(
      {
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
          role: "admin", // All created users have "admin" role
        },
      }
    );

    if (error) {
      if (
        error.message.includes("already registered") ||
        error.message.includes("already exists")
      ) {
        return {
          success: false,
          message: "A user with this email already exists.",
        } as const;
      }
      return { success: false, message: error.message } as const;
    }

    if (!signUpData.user) {
      return { success: false, message: "Failed to create user" } as const;
    }

    // Create profile record using admin client
    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: signUpData.user.id,
        full_name: fullName,
        email: email,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Failed to create profile:", profileError);
      // Don't fail user creation if profile creation fails
    }

    revalidatePath("/admin/dashboard", "page");
    return {
      success: true,
      message: "User created successfully",
      data: {
        id: signUpData.user.id,
        email: signUpData.user.email,
      },
    } as const;
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    } as const;
  }
}

/**
 * Get list of users from Supabase (Admin only)
 * This uses Supabase Admin API to list users
 */
export async function getUsers(
  filters: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<GetUsersResult> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "Not authenticated" };
  }

  const userRole = user.user_metadata?.role;
  if (userRole !== "super_admin") {
    return {
      success: false,
      message: "Unauthorized. Only admins can view users.",
    };
  }

  try {
    // Use admin client to list users
    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (adminError) {
      console.error("Admin client creation error:", adminError);
      return {
        success: false,
        message:
          adminError instanceof Error
            ? adminError.message
            : "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.",
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const perPage = limit;
    const offset = (page - 1) * perPage;

    // List all users (Supabase admin API doesn't support pagination directly, so we fetch all and paginate)
    const { data: usersData, error: listError } =
      await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return { success: false, message: listError.message };
    }

    if (!usersData || !usersData.users) {
      return {
        success: true,
        data: {
          users: [],
          total: 0,
          page,
          limit: perPage,
          totalPages: 0,
        },
      };
    }

    let users = usersData.users;

    // Filter out users without email (shouldn't happen, but just in case)
    users = users.filter((u) => u.email);

    // Filter out super_admin users - they shouldn't appear in the regular users list
    users = users.filter((u) => {
      const role = u.user_metadata?.role;
      return role !== "super_admin";
    });

    // Apply search filter if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      users = users.filter((u) => {
        const email = u.email?.toLowerCase() || "";
        const fullName = u.user_metadata?.full_name?.toLowerCase() || "";
        return email.includes(searchTerm) || fullName.includes(searchTerm);
      });
    }

    // Calculate pagination
    const total = users.length;
    const totalPages = Math.ceil(total / perPage);

    // Apply pagination
    const paginatedUsers = users.slice(
      offset,
      offset + perPage
    ) as SupabaseUser[];

    return {
      success: true,
      data: {
        users: paginatedUsers,
        total,
        page,
        limit: perPage,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

/**
 * Delete a user via API (Admin only)
 */
export async function deleteUser(userId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "Not authenticated" };
  }

  const userRole = user.user_metadata?.role;
  if (userRole !== "super_admin") {
    return {
      success: false,
      message: "Unauthorized. Only admins can delete users.",
    };
  }

  // Prevent deleting yourself
  if (user.id === userId) {
    return {
      success: false,
      message: "You cannot delete your own account.",
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { success: false, message: "Not authenticated" };
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    const response = await fetch(`${normalizedBaseUrl}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    let responseBody: {
      message?: string;
      error?: boolean;
    } | null = null;

    try {
      responseBody = await response.json();
    } catch {
      responseBody = null;
    }

    if (!response.ok || responseBody?.error) {
      const message =
        responseBody?.message || "Failed to delete user via API";
      return { success: false, message };
    }

    revalidatePath("/admin/dashboard", "page");
    return {
      success: true,
      message: responseBody?.message || "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}
