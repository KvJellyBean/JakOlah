import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * DELETE /api/user/profile
 * User profile deletion endpoint with cascade deletion and cleanup.
 */

interface DeletionRequest {
  confirmation: string;
  reason?: string;
  backup_requested?: boolean;
}

interface DeletionAudit {
  user_id: string;
  deletion_type: "self_requested" | "admin_action";
  reason?: string;
  data_backup_created: boolean;
  images_deleted: number;
  classifications_deleted: number;
  deletion_timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();

    // Authentication check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          details: ["Please log in to delete your profile"],
        },
        { status: 401 }
      );
    }

    // Parse request body
    let deletionRequest: DeletionRequest;
    try {
      deletionRequest = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: ["Request body must be valid JSON"],
        },
        { status: 400 }
      );
    }

    // Validate deletion confirmation
    const validationError = validateDeletionRequest(deletionRequest);
    if (validationError) {
      return NextResponse.json(
        { error: "Validation failed", details: [validationError] },
        { status: 400 }
      );
    }

    // Get user profile for audit trail
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          error: "User profile not found",
          details: ["Unable to find user profile for deletion"],
        },
        { status: 404 }
      );
    }

    // Start deletion process
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    const deletionAudit: DeletionAudit = {
      user_id: user.id,
      deletion_type: "self_requested",
      data_backup_created: deletionRequest.backup_requested || false,
      images_deleted: 0,
      classifications_deleted: 0,
      deletion_timestamp: new Date().toISOString(),
    };

    // Add optional fields if they exist
    if (deletionRequest.reason) {
      deletionAudit.reason = deletionRequest.reason;
    }
    if (ipAddress) {
      deletionAudit.ip_address = ipAddress;
    }
    if (userAgent) {
      deletionAudit.user_agent = userAgent;
    }

    // Create backup if requested
    let backupData = null;
    if (deletionRequest.backup_requested) {
      backupData = await createUserDataBackup(user.id, supabase);
    }

    // 1. Delete user images from storage
    const imagesDeletionResult = await deleteUserImages(user.id, supabase);
    deletionAudit.images_deleted = imagesDeletionResult.deleted_count;

    // 2. Get count of classifications before deletion
    const { count: classificationsCount } = await supabase
      .from("classifications")
      .select("classification_id", { count: "exact", head: true })
      .eq("user_id", user.id);

    deletionAudit.classifications_deleted = classificationsCount || 0;

    // 3. Start cascade deletion transaction
    const deletionResult = await performCascadeDeletion(user.id, supabase);

    if (!deletionResult.success) {
      return NextResponse.json(
        {
          error: "Deletion failed",
          details: [
            deletionResult.error || "Failed to complete profile deletion",
          ],
        },
        { status: 500 }
      );
    }

    // 4. Log audit trail
    await logDeletionAudit(deletionAudit, supabase);

    // 5. Sign out the user from Supabase Auth
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
      deletion_summary: {
        user_id: user.id,
        images_deleted: deletionAudit.images_deleted,
        classifications_deleted: deletionAudit.classifications_deleted,
        backup_created: deletionAudit.data_backup_created,
        deletion_timestamp: deletionAudit.deletion_timestamp,
      },
      backup_data: deletionRequest.backup_requested ? backupData : null,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An error occurred while processing profile deletion"],
      },
      { status: 500 }
    );
  }
}

// Helper functions
function validateDeletionRequest(request: DeletionRequest): string | null {
  if (!request.confirmation) {
    return "Confirmation field is required";
  }

  if (request.confirmation.toLowerCase() !== "delete my account") {
    return "Confirmation must be exactly 'delete my account' (case insensitive)";
  }

  if (request.reason && request.reason.length > 500) {
    return "Reason must be 500 characters or less";
  }

  return null;
}

async function createUserDataBackup(userId: string, supabase: SupabaseClient) {
  try {
    // Get all user data
    const [
      { data: userProfile },
      { data: classifications },
      { data: educationProgress },
    ] = await Promise.all([
      supabase.from("users").select("*").eq("user_id", userId).single(),
      supabase.from("classifications").select("*").eq("user_id", userId),
      supabase
        .from("user_education_progress")
        .select("*")
        .eq("user_id", userId),
    ]);

    const backupData = {
      user_profile: userProfile,
      classifications: classifications || [],
      education_progress: educationProgress || [],
      export_timestamp: new Date().toISOString(),
      export_version: "1.0",
    };

    return backupData;
  } catch {
    return null;
  }
}

async function deleteUserImages(
  userId: string,
  supabase: SupabaseClient
): Promise<{ deleted_count: number; errors: string[] }> {
  try {
    // Get all images associated with user classifications
    const { data: classifications } = await supabase
      .from("classifications")
      .select("image_url")
      .eq("user_id", userId)
      .not("image_url", "is", null);

    if (!classifications || classifications.length === 0) {
      return { deleted_count: 0, errors: [] };
    }

    const imageUrls = classifications
      .map((c: { image_url: string }) => c.image_url)
      .filter(Boolean);
    const errors: string[] = [];
    let deletedCount = 0;

    // Delete images from Supabase Storage
    for (const imageUrl of imageUrls) {
      try {
        // Extract file path from URL
        const filePath = imageUrl.replace(
          /.*\/storage\/v1\/object\/public\/[^/]+\//,
          ""
        );

        const { error } = await supabase.storage
          .from("classification-images")
          .remove([filePath]);

        if (error) {
          errors.push(`Failed to delete image: ${filePath}`);
        } else {
          deletedCount++;
        }
      } catch {
        errors.push(`Error processing image: ${imageUrl}`);
      }
    }

    return { deleted_count: deletedCount, errors };
  } catch {
    return { deleted_count: 0, errors: ["Failed to process image deletion"] };
  }
}

async function performCascadeDeletion(
  userId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete in correct order to respect foreign key constraints

    // 1. Delete user education progress
    const { error: educationError } = await supabase
      .from("user_education_progress")
      .delete()
      .eq("user_id", userId);

    if (educationError) {
      return { success: false, error: "Failed to delete education progress" };
    }

    // 2. Delete classifications (this will also remove associated images)
    const { error: classificationsError } = await supabase
      .from("classifications")
      .delete()
      .eq("user_id", userId);

    if (classificationsError) {
      return { success: false, error: "Failed to delete classifications" };
    }

    // 3. Delete user profile
    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userId);

    if (userError) {
      return { success: false, error: "Failed to delete user profile" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Database transaction failed" };
  }
}

async function logDeletionAudit(
  audit: DeletionAudit,
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Log to audit table (if exists) or create audit log entry
    await supabase.from("user_deletion_audit").insert([
      {
        user_id: audit.user_id,
        deletion_type: audit.deletion_type,
        reason: audit.reason,
        data_backup_created: audit.data_backup_created,
        images_deleted: audit.images_deleted,
        classifications_deleted: audit.classifications_deleted,
        deletion_timestamp: audit.deletion_timestamp,
        ip_address: audit.ip_address,
        user_agent: audit.user_agent,
      },
    ]);
  } catch {
    // If audit table doesn't exist, we can continue - audit logging is not critical for deletion
  }
}
