"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Check if user has MFA enrolled
 */
export async function checkMFAStatus() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Not authenticated" } as const;
  }

  const { data: factors, error } = await supabase.auth.mfa.listFactors();
  if (error) {
    return { success: false, message: error.message } as const;
  }

  const hasMFA = factors.totp && factors.totp.length > 0;
  return { success: true, hasMFA, factors: factors.totp || [] } as const;
}

/**
 * Get Authenticator Assurance Level (AAL)
 * Returns current and next level to determine if MFA is required
 */
export async function getAAL() {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) {
    return { success: false, message: error.message } as const;
  }

  return {
    success: true,
    currentLevel: data.currentLevel,
    nextLevel: data.nextLevel,
    needsMFA: data.nextLevel === "aal2" && data.currentLevel !== "aal2",
  } as const;
}

/**
 * Unenroll ALL existing MFA factors (both verified and unverified)
 * This is used when we want to force a fresh enrollment
 */
export async function unenrollAllFactors() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      success: false,
      message: userError?.message || "Not authenticated",
    } as const;
  }

  try {
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      console.error("Error listing factors for cleanup:", factorsError);
      return { success: false, message: factorsError.message } as const;
    }

    // Unenroll ALL existing TOTP factors
    if (factorsData?.totp && factorsData.totp.length > 0) {
      let unenrolledCount = 0;
      const errors: string[] = [];

      for (const factor of factorsData.totp) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id,
        });

        if (unenrollError) {
          console.error(
            `Error unenrolling factor ${factor.id}:`,
            unenrollError
          );
          errors.push(`Factor ${factor.id}: ${unenrollError.message}`);
        } else {
          console.log(`Successfully unenrolled factor ${factor.id}`);
          unenrolledCount++;
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Failed to unenroll some factors: ${errors.join(", ")}`,
          unenrolledCount,
        } as const;
      }

      return { success: true, unenrolledCount } as const;
    }

    return { success: true, unenrolledCount: 0 } as const;
  } catch (error) {
    console.error("Error handling factor cleanup:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to unenroll factors",
    } as const;
  }
}

/**
 * Start MFA enrollment - returns QR code
 * Automatically cleans up existing factors before enrolling
 */
export async function enrollMFA() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      success: false,
      message: userError?.message || "Not authenticated",
    } as const;
  }

  // First, check if there are any existing factors
  const { data: existingFactors } = await supabase.auth.mfa.listFactors();
  const hasExistingFactors =
    existingFactors?.totp && existingFactors.totp.length > 0;

  if (hasExistingFactors) {
    console.log("Found existing factors, cleaning up...");
    const cleanupResult = await unenrollAllFactors();

    if (!cleanupResult.success) {
      console.error(
        "Failed to cleanup existing factors:",
        cleanupResult.message
      );
      return {
        success: false,
        message: `Cannot enroll: ${cleanupResult.message}. Please try logging out and back in.`,
      } as const;
    }

    if (cleanupResult.unenrolledCount > 0) {
      console.log(
        `Cleaned up ${cleanupResult.unenrolledCount} existing factor(s)`
      );
    }
  }

  // Now try to enroll
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });

  if (error) {
    console.error("MFA enrollment error:", error);

    // If we still get a conflict error after cleanup, something is wrong
    if (error.code === "mfa_factor_name_conflict") {
      return {
        success: false,
        message:
          "MFA factor conflict detected. Please log out and log back in to reset your MFA setup.",
      } as const;
    }

    return { success: false, message: error.message } as const;
  }

  if (!data) {
    console.error("MFA enrollment returned no data");
    return {
      success: false,
      message: "No data returned from enrollment",
    } as const;
  }

  // Log the data structure for debugging
  console.log("MFA enrollment data:", JSON.stringify(data, null, 2));

  // Extract QR code and secret from the totp object
  const qrCode = data.totp?.qr_code || "";
  const secret = data.totp?.secret || "";
  const factorId = data.id || "";

  console.log("Extracted values:", {
    hasFactorId: !!factorId,
    hasQrCode: !!qrCode,
    hasSecret: !!secret,
    qrCodeLength: qrCode?.length || 0,
    secretLength: secret?.length || 0,
  });

  if (!factorId) {
    console.error("Missing factor ID in enrollment response:", data);
    return {
      success: false,
      message: "Failed to get factor ID from enrollment. Please try again.",
    } as const;
  }

  if (!qrCode || !secret) {
    console.error("Missing QR code or secret in enrollment response:", {
      qrCode: !!qrCode,
      secret: !!secret,
      data,
    });
    return {
      success: false,
      message:
        "Failed to get QR code or secret from enrollment. Please try again.",
    } as const;
  }

  return {
    success: true,
    factorId: data.id,
    qrCode,
    secret,
  } as const;
}

/**
 * Create MFA challenge
 */
export async function createMFAChallenge(factorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) {
    return { success: false, message: error.message } as const;
  }

  return { success: true, challengeId: data.id } as const;
}

/**
 * Verify MFA code during enrollment
 */
export async function verifyMFAEnrollment(factorId: string, code: string) {
  const supabase = await createClient();

  // Create challenge first
  const challengeResult = await createMFAChallenge(factorId);
  if (!challengeResult.success) {
    return challengeResult;
  }

  // Verify the code
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeResult.challengeId!,
    code: code.trim(),
  });

  if (error) {
    return { success: false, message: error.message } as const;
  }

  revalidatePath("/", "layout");
  return { success: true } as const;
}

/**
 * Verify MFA code during login
 */
export async function verifyMFALogin(code: string) {
  const supabase = await createClient();

  // Get user's factors
  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  if (factorsError || !factors.totp || factors.totp.length === 0) {
    return { success: false, message: "No MFA factor found" } as const;
  }

  const factorId = factors.totp[0].id;

  // Create challenge
  const challengeResult = await createMFAChallenge(factorId);
  if (!challengeResult.success) {
    return challengeResult;
  }

  // Verify the code
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeResult.challengeId!,
    code: code.trim(),
  });

  if (error) {
    return { success: false, message: error.message } as const;
  }

  revalidatePath("/", "layout");
  return { success: true } as const;
}
