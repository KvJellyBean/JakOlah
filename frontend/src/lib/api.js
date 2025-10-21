/**
 * Fungsi utilitas API untuk JakOlah Interface
 * Menangani komunikasi dengan layanan backend
 */

// URL Base API
const ML_SERVICE_URL =
  process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mengambil data fasilitas pembuangan sampah dari Supabase
export async function getFacilities({
  wasteCategory = null,
  limit = 100,
} = {}) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase credentials not configured. Check .env.local file."
      );
    }

    // Endpoint RPC Supabase
    const url = `${SUPABASE_URL}/rest/v1/rpc/get_facilities_with_categories`;

    const response = await fetch(url, {
      method: "POST", // RPC memerlukan POST
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
      throw new Error(`Facilities API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Klasifikasi sampah dalam gambar menggunakan layanan ML
export async function classifyFrame(imageBlob) {
  try {
    if (!ML_SERVICE_URL) {
      throw new Error("ML Service URL not configured");
    }

    const formData = new FormData();
    formData.append("image", imageBlob, "frame.jpg");

    const response = await fetch(`${ML_SERVICE_URL}/api/classify-frame`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Classification failed: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Cek health layanan ML
export async function checkMLServiceHealth() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`);

    if (!response.ok) {
      throw new Error(`ML service unhealthy: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Optimalkan gambar sebelum upload
export async function optimizeImage(
  canvas,
  { quality = 0.8, maxWidth = 1280, maxHeight = 720 } = {}
) {
  return new Promise((resolve, reject) => {
    try {
      // Cek apakah perlu resize
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

      // Buat canvas baru dengan ukuran yang di-resize jika perlu
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
        // Gunakan ukuran original
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
