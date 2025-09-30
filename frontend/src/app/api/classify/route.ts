import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase";
import { uploadImage, StoredImageInfo } from "../../../lib/image-storage";
import {
  generateEducationContent,
  generateConfidenceRecommendation,
} from "../../../lib/education-generator";

// ML Service URL - in production this would be from environment variables
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8001";
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || "30000"); // 30 seconds default

/**
 * POST /api/classify
 *
 * Image classification endpoint for waste categorization.
 * Integrates with ML microservice and stores results in database.
 *
 * Purpose:
 * - Accept and validate image uploads (JPEG/PNG/WebP, max 10MB)
 * - Forward images to ML inference microservice
 * - Store classification results in database
 * - Return detailed classification with recommendations
 * - Include nearby facilities based on waste category
 *
 * Authentication: Required (Bearer token or cookies)
 * Content-Type: multipart/form-data
 *
 * Request Body:
 * {
 *   image: File // JPEG/PNG/WebP, max 10MB
 * }
 *
 * Response 200 (Success):
 * {
 *   classification_id: string;
 *   result: {
 *     category: "Organik" | "Anorganik" | "Lainnya";
 *     category_code: "ORG" | "ANO" | "LAI";
 *     confidence: number;
 *     low_confidence_warning?: boolean;
 *   };
 *   confidence_scores: {
 *     organik: number;
 *     anorganik: number;
 *     lainnya: number;
 *   };
 *   recommendations: {
 *     disposal_guidance: string;
 *     education_content: string;
 *     local_facilities: string[];
 *     tips: string[];
 *     confidence_recommendation: string;
 *     confidence_note?: string;
 *   };
 *   nearby_facilities: Array<{...}>;
 *   processing_time: number;
 *   ml_processing_time: number;
 *   created_at: string;
 * }
 *
 * Response 400 (Bad Request):
 * {
 *   error: "Invalid image format or size";
 *   details?: string;
 *   processing_time?: number;
 * }
 *
 * Response 408 (Timeout):
 * {
 *   error: "Classification request timed out";
 *   retry_after: number;
 *   processing_time: number;
 * }
 *
 * Response 422 (Unprocessable Entity):
 * {
 *   error: "Unable to classify: image does not contain recognizable waste";
 *   suggestion: string;
 *   processing_time: number;
 * }
 *
 * Response 503 (Service Unavailable):
 * {
 *   error: "Classification service temporarily unavailable";
 *   retry_after: number;
 *   processing_time: number;
 * }
 */

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Category mappings
const CATEGORY_CODES = {
  Organik: "ORG" as const,
  Anorganik: "ANO" as const,
  Lainnya: "LAI" as const,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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
          error: "Authentication required for classification",
        },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        {
          error: "Invalid image format or size",
          details: "No image file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        {
          error: "Invalid image format or size",
          details: `Unsupported file type: ${imageFile.type}. Accepted types: JPEG, PNG, WebP`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Image size exceeds 10MB limit",
        },
        { status: 413 }
      );
    }

    // Forward image to ML service with timeout and better error handling
    const mlFormData = new FormData();
    mlFormData.append("image", imageFile);

    let mlResponse;
    const mlStartTime = Date.now();

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ML_SERVICE_TIMEOUT
      );

      const response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        body: mlFormData,
        signal: controller.signal,
        headers: {
          // Let browser set multipart boundary
        },
      });

      clearTimeout(timeoutId);

      const mlProcessingTime = Date.now() - mlStartTime;

      if (!response.ok) {
        // Enhanced error handling based on ML service response
        if (response.status === 422) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json(
            {
              error:
                "Unable to classify: image does not contain recognizable waste",
              suggestion:
                errorData.details?.suggestion ||
                "Please upload a clear image of waste items",
              processing_time: mlProcessingTime,
            },
            { status: 422 }
          );
        }

        if (response.status === 503 || response.status >= 500) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json(
            {
              error: "Classification service temporarily unavailable",
              retry_after: errorData.details?.retry_after || 60,
              processing_time: mlProcessingTime,
            },
            { status: 503 }
          );
        }

        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          return NextResponse.json(
            {
              error: errorData.detail || "Invalid image format or content",
              processing_time: mlProcessingTime,
            },
            { status: 400 }
          );
        }

        throw new Error(`ML service responded with status: ${response.status}`);
      }

      mlResponse = await response.json();

      // Log performance if exceeding targets (in development)
      if (mlProcessingTime > 3000 && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn(
          `ML service processing time exceeded target: ${mlProcessingTime}ms > 3000ms`
        );
      }
    } catch (error) {
      const mlProcessingTime = Date.now() - mlStartTime;

      if (error instanceof Error) {
        // Handle timeout specifically
        if (error.name === "AbortError") {
          return NextResponse.json(
            {
              error: "Classification request timed out",
              retry_after: 30,
              processing_time: mlProcessingTime,
            },
            { status: 408 }
          );
        }

        // Handle network errors
        if (error.message.includes("fetch")) {
          return NextResponse.json(
            {
              error: "Unable to connect to classification service",
              retry_after: 60,
              processing_time: mlProcessingTime,
            },
            { status: 503 }
          );
        }
      }

      // Generic ML service error
      return NextResponse.json(
        {
          error: "Classification service temporarily unavailable",
          retry_after: 60,
          processing_time: mlProcessingTime,
        },
        { status: 503 }
      );
    }

    // Process ML response - handle both /classify and /predict response formats
    const category = (mlResponse.category ||
      mlResponse.prediction) as keyof typeof CATEGORY_CODES;
    const confidence = mlResponse.confidence;
    const scores = mlResponse.scores || {
      organik: mlResponse.probabilities?.Organik || 0,
      anorganik: mlResponse.probabilities?.Anorganik || 0,
      lainnya: mlResponse.probabilities?.Lainnya || 0,
    };
    const mlProcessingTime = mlResponse.processing_time || 0;
    const lowConfidenceWarning = confidence < 70;

    // Validate category
    if (!category || !(category in CATEGORY_CODES)) {
      return NextResponse.json(
        {
          error: "Invalid classification result from ML service",
          details: [`Unknown category: ${category}`],
        },
        { status: 500 }
      );
    }

    // Upload image to Supabase Storage with compression
    let storedImageInfo: StoredImageInfo;
    try {
      storedImageInfo = await uploadImage(imageFile, user.id, {
        compress: true,
        folder: "classifications",
      });
    } catch (storageError) {
      // If image storage fails, continue with classification but log error
      // This ensures the main functionality works even if storage has issues
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("Image storage failed:", storageError);
      }

      // Use fallback temporary storage info
      storedImageInfo = {
        filename: `temp_${Date.now()}.jpg`,
        path: "/temp/path",
        metadata: {
          originalName: imageFile.name,
          mimeType: imageFile.type,
          originalSize: imageFile.size,
          compressedSize: imageFile.size,
          width: 0,
          height: 0,
        },
      };
    }

    // Get waste category ID
    const { data: wasteCategory, error: categoryError } = await supabase
      .from("waste_categories")
      .select("waste_category_id")
      .eq("category_name", category)
      .single();

    if (categoryError || !wasteCategory) {
      return NextResponse.json(
        {
          error: "Failed to classify",
          details: ["Invalid category mapping"],
        },
        { status: 500 }
      );
    }

    // Store classification in database with image storage info
    const { data: classification, error: dbError } = await supabase
      .from("classifications")
      .insert({
        user_id: user.id,
        waste_category_id: wasteCategory.waste_category_id,
        image_filename: storedImageInfo.filename,
        image_path: storedImageInfo.path,
        original_filename: storedImageInfo.metadata.originalName,
        confidence_organik: scores.organik,
        confidence_anorganik: scores.anorganik,
        confidence_lainnya: scores.lainnya,
      })
      .select("classification_id, created_at")
      .single();

    if (dbError) {
      return NextResponse.json(
        {
          error: "Failed to store classification result",
          details: ["Database error occurred"],
        },
        { status: 500 }
      );
    }

    // Get nearby facilities (simplified - in production would use PostGIS queries)
    const { data: facilities } = await supabase
      .from("waste_facilities")
      .select("*")
      .limit(5);

    const nearbyFacilities =
      facilities?.map(facility => ({
        facility_id: facility.facility_id,
        facility_name: facility.facility_name,
        facility_type: facility.facility_type,
        distance: 2.5, // Mock distance - would be calculated with PostGIS
        address: facility.address,
        coordinates: {
          latitude: facility.latitude,
          longitude: facility.longitude,
        },
        accepts_category: true, // Simplified - would check facility capabilities
      })) || [];

    const processingTime = Date.now() - startTime;

    // Generate dynamic education content based on classification result
    const educationContent = generateEducationContent({
      categoryCode: CATEGORY_CODES[category],
      confidence,
      allConfidences: {
        organik: scores.organik,
        anorganik: scores.anorganik,
        lainnya: scores.lainnya,
      },
    });

    const confidenceRecommendation = generateConfidenceRecommendation({
      organik: scores.organik,
      anorganik: scores.anorganik,
      lainnya: scores.lainnya,
    });

    // Return complete classification response with enhanced performance metrics
    return NextResponse.json({
      classification_id: classification.classification_id,
      result: {
        category,
        category_code: CATEGORY_CODES[category],
        confidence,
        ...(lowConfidenceWarning && { low_confidence_warning: true }),
      },
      confidence_scores: {
        organik: scores.organik,
        anorganik: scores.anorganik,
        lainnya: scores.lainnya,
      },
      image_info: {
        filename: storedImageInfo.filename,
        public_url: storedImageInfo.publicUrl,
        signed_url: storedImageInfo.signedUrl,
        original_size: storedImageInfo.metadata.originalSize,
        compressed_size: storedImageInfo.metadata.compressedSize,
        dimensions: {
          width: storedImageInfo.metadata.width,
          height: storedImageInfo.metadata.height,
        },
      },
      recommendations: {
        disposal_guidance: educationContent.disposal_guidance,
        education_content: educationContent.environmental_impact,
        local_facilities: educationContent.local_facilities,
        tips: educationContent.tips,
        confidence_recommendation: confidenceRecommendation,
        confidence_note: educationContent.confidence_note,
      },
      nearby_facilities: nearbyFacilities,
      processing_time: processingTime,
      ml_processing_time: mlProcessingTime,
      created_at: classification.created_at,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An unexpected error occurred during classification"],
      },
      { status: 500 }
    );
  }
}
