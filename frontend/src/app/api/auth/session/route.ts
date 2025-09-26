import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase";

/**
 * GET /api/auth/session
 *
 * Session validation and user context retrieval endpoint.
 * Validates the current user session and returns user information.
 *
 * Purpose:
 * - Validate user session from cookies
 * - Retrieve current user context
 * - Support frontend authentication state management
 * - Handle session expiration gracefully
 *
 * Authentication: Required (HTTP-only cookies)
 *
 * Response 200 (Valid Session):
 * {
 *   user: {
 *     id: string;
 *     email: string;
 *     full_name: string;
 *     role: "user" | "admin";
 *     profile_image?: string;
 *   },
 *   session: {
 *     expires_at: string; // ISO 8601
 *   }
 * }
 *
 * Response 401 (Invalid/Expired Session):
 * {
 *   error: "Unauthorized",
 *   details: ["Invalid or expired session"]
 * }
 */
export async function GET() {
  try {
    const supabase = createClient();

    // Get user from session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: ["Invalid or expired session"],
        },
        { status: 401 }
      );
    }

    // Get user profile data from users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("full_name, role, profile_image")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, return basic user data
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email!,
          full_name: user.email!.split("@")[0], // Fallback name
          role: "user" as const,
        },
        session: {
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
        },
      });
    }

    // Return complete user session data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        role: profile.role,
        ...(profile.profile_image && { profile_image: profile.profile_image }),
      },
      session: {
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An unexpected error occurred during session validation"],
      },
      { status: 500 }
    );
  }
}
