import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase";
import { getImageUrl } from "../../../lib/image-storage";
import { z } from "zod";

/**
 * GET /api/classifications
 *
 * User classification history endpoint with pagination and filtering.
 * Returns user's classification history with privacy controls.
 *
 * Purpose:
 * - Retrieve user's classification history
 * - Support pagination and filtering
 * - Privacy-controlled access (users only see their own data)
 * - Include signed URLs for images (when implemented)
 *
 * Authentication: Required (Bearer token or cookies)
 *
 * Query Parameters:
 * - page?: number (default: 1)
 * - limit?: number (default: 20, max: 100)
 * - category?: "Organik" | "Anorganik" | "Lainnya"
 * - start_date?: string (ISO 8601 date)
 * - end_date?: string (ISO 8601 date)
 *
 * Response 200 (Success):
 * {
 *   classifications: Array<{
 *     classification_id: string;
 *     category: string;
 *     category_code: string;
 *     confidence: number;
 *     image_url?: string;
 *     created_at: string;
 *     low_confidence_warning?: boolean;
 *   }>;
 *   pagination: {
 *     current_page: number;
 *     total_pages: number;
 *     total_items: number;
 *     items_per_page: number;
 *   }
 * }
 */

// Query parameters validation schema
const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform(val => {
      const parsed = val ? parseInt(val, 10) : 20;
      return Math.min(Math.max(parsed, 1), 100); // Clamp between 1 and 100
    }),
  category: z.enum(["Organik", "Anorganik", "Lainnya"]).optional(),
  start_date: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start_date format, expected ISO 8601",
    }),
  end_date: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end_date format, expected ISO 8601",
    }),
});

export async function GET(request: NextRequest) {
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
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    let parsedQuery;
    try {
      parsedQuery = querySchema.parse(queryParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: error.issues.map(
              err => `${err.path.join(".")}: ${err.message}`
            ),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { page, limit, category, start_date, end_date } = parsedQuery;
    const offset = (page - 1) * limit;

    // Build query with filters - join with waste_categories to get category name
    let query = supabase
      .from("classifications")
      .select(
        `
        classification_id,
        user_id,
        waste_categories!inner(category_name, category_code),
        confidence_organik,
        confidence_anorganik,
        confidence_lainnya,
        image_path,
        created_at
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("waste_categories.category_name", category);
    }

    if (start_date) {
      query = query.gte("created_at", new Date(start_date).toISOString());
    }

    if (end_date) {
      query = query.lte("created_at", new Date(end_date).toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: classifications, error: queryError, count } = await query;

    if (queryError) {
      return NextResponse.json(
        {
          error: "Failed to retrieve classification history",
          details: ["Database query error"],
        },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Transform data for response with signed URLs
    const formattedClassifications = await Promise.all(
      classifications?.map(async classification => {
        const category = classification.waste_categories?.[0];
        const maxConfidence = Math.max(
          classification.confidence_organik,
          classification.confidence_anorganik,
          classification.confidence_lainnya
        );

        return {
          classification_id: classification.classification_id,
          category: category?.category_name || "Unknown",
          category_code: category?.category_code || "UNK",
          confidence: maxConfidence,
          image_url: classification.image_path
            ? await getImageUrl(classification.image_path)
            : undefined,
          created_at: classification.created_at,
          ...(maxConfidence < 70 && {
            low_confidence_warning: true,
          }),
        };
      }) || []
    );

    return NextResponse.json({
      classifications: formattedClassifications,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: limit,
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: [
          "An unexpected error occurred while retrieving classification history",
        ],
      },
      { status: 500 }
    );
  }
}
