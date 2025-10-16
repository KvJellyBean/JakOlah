/**
 * API utility functions for JakOlah
 * Handles communication with backend services
 */

// API Base URLs
const ML_SERVICE_URL =
  process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Fetch waste disposal facilities from Supabase
 * @param {Object} options - Query options
 * @param {string} options.wasteCategory - Filter by waste category ('Organik', 'Anorganik', 'Lainnya')
 * @param {number} options.limit - Limit number of results
 * @returns {Promise<Array>} Array of facilities
 */
export async function getFacilities({
  wasteCategory = null,
  limit = 100,
} = {}) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error(
        "[API] Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
      throw new Error(
        "Supabase credentials not configured. Check .env.local file."
      );
    }

    // Supabase RPC endpoint
    const url = `${SUPABASE_URL}/rest/v1/rpc/get_facilities_with_categories`;

    const response = await fetch(url, {
      method: "POST", // RPC requires POST
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category_filter: wasteCategory || null,
        limit_count: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase RPC error:", errorText);
      throw new Error(`Facilities API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
}

/**
 * Classify waste in image using ML service
 * @param {Blob|File} imageBlob - Image to classify
 * @returns {Promise<Object>} Classification results
 */
export async function classifyFrame(imageBlob) {
  try {
    console.log("[API] classifyFrame called");
    console.log(`[API] Image blob size: ${imageBlob.size} bytes`);
    console.log(`[API] ML Service URL: ${ML_SERVICE_URL}`);

    if (!ML_SERVICE_URL) {
      console.error(
        "[API] ML Service not configured. Please set NEXT_PUBLIC_ML_SERVICE_URL in .env.local"
      );
      throw new Error("ML Service URL not configured");
    }

    const formData = new FormData();
    formData.append("image", imageBlob, "frame.jpg");

    console.log(`[API] Sending POST to ${ML_SERVICE_URL}/api/classify-frame`);

    const response = await fetch(`${ML_SERVICE_URL}/api/classify-frame`, {
      method: "POST",
      body: formData,
    });

    console.log(
      `[API] Response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[API] Classification failed:", errorData);
      throw new Error(
        errorData.detail || `Classification failed: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("[API] Classification success:");
    console.log("[API] Full response:", JSON.stringify(data, null, 2));
    console.log(`[API] Success: ${data.success}`);
    console.log(
      `[API] Detections count: ${data.data?.detections?.length || 0}`
    );
    if (data.data?.detections) {
      console.log("[API] Detections:", data.data.detections);
    }
    if (data.data?.metadata) {
      console.log("[API] Metadata:", data.data.metadata);
    }
    return data;
  } catch (error) {
    console.error("[API] Error classifying frame:", error);
    console.error("[API] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}

/**
 * Check ML service health
 * @returns {Promise<Object>} Health status
 */
export async function checkMLServiceHealth() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`);

    if (!response.ok) {
      throw new Error(`ML service unhealthy: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("ML service health check failed:", error);
    throw error;
  }
}

/**
 * Optimize image before uploading
 * @param {HTMLCanvasElement} canvas - Canvas with image
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} Optimized image blob
 */
export async function optimizeImage(
  canvas,
  { quality = 0.8, maxWidth = 1280, maxHeight = 720 } = {}
) {
  return new Promise((resolve, reject) => {
    try {
      // Check if resize needed
      let targetWidth = canvas.width;
      let targetHeight = canvas.height;

      if (canvas.width > maxWidth || canvas.height > maxHeight) {
        const ratio = Math.min(
          maxWidth / canvas.width,
          maxHeight / canvas.height
        );
        targetWidth = Math.floor(canvas.width * ratio);
        targetHeight = Math.floor(canvas.height * ratio);
      }

      // Create resized canvas if needed
      if (targetWidth !== canvas.width || targetHeight !== canvas.height) {
        const resizedCanvas = document.createElement("canvas");
        resizedCanvas.width = targetWidth;
        resizedCanvas.height = targetHeight;

        const ctx = resizedCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        resizedCanvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create optimized blob"));
            }
          },
          "image/jpeg",
          quality
        );
      } else {
        // Use original size
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          quality
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}
