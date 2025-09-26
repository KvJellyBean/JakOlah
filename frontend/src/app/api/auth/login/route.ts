import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map(err => err.message),
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const supabase = createClient();

    // Authenticate user with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      // Handle specific authentication errors
      if (
        authError.message.includes("invalid") ||
        authError.message.includes("wrong") ||
        authError.message.includes("not found")
      ) {
        return NextResponse.json(
          {
            error: "Invalid email or password",
          },
          { status: 401 }
        );
      }

      if (
        authError.message.includes("email not confirmed") ||
        authError.message.includes("verify")
      ) {
        return NextResponse.json(
          {
            error: "Please verify your email before logging in",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Login failed",
          details: [authError.message],
        },
        { status: 400 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        {
          error: "Login failed",
          details: ["Authentication data not available"],
        },
        { status: 401 }
      );
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("user_id, full_name, email, role, profile_image")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      // Continue with basic user data if profile not found
    }

    // Prepare user data with profile or fallback to auth data
    const userData = userProfile
      ? {
          id: userProfile.user_id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role as "user" | "admin",
          profile_image: userProfile.profile_image || undefined,
        }
      : {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata?.full_name || "",
          role: (authData.user.user_metadata?.role || "user") as
            | "user"
            | "admin",
          profile_image: undefined,
        };

    // Create response with secure cookie for session
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: userData,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: new Date(
            authData.session.expires_at! * 1000
          ).toISOString(),
        },
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookies for session management
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    response.cookies.set("sb-access-token", authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    response.cookies.set("sb-refresh-token", authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge * 4, // Refresh tokens last longer
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An unexpected error occurred during login"],
      },
      { status: 500 }
    );
  }
}
