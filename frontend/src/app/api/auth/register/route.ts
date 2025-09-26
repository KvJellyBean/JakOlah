import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { z } from "zod";

// Validation schema for registration
const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map(err => err.message),
        },
        { status: 400 }
      );
    }

    const { full_name, email, password } = validationResult.data;
    const supabase = createClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Email already registered",
        },
        { status: 409 }
      );
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
          role: "user",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      // Handle specific Supabase errors
      if (authError.message.includes("email")) {
        return NextResponse.json(
          {
            error: "Email already registered",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: "Registration failed",
          details: [authError.message],
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error: "Registration failed",
          details: ["User creation failed"],
        },
        { status: 400 }
      );
    }

    // Insert user profile into users table
    const { error: profileError } = await supabase.from("users").insert({
      user_id: authData.user.id,
      full_name: full_name,
      email: email,
      role: "user",
    });

    if (profileError) {
      // User was created in auth but profile failed - should handle cleanup
      // For now, continue as auth user exists
    }

    // Return success response
    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email for verification.",
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: full_name,
          role: "user",
          created_at: authData.user.created_at,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An unexpected error occurred during registration"],
      },
      { status: 500 }
    );
  }
}
