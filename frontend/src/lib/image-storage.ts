/**
 * Image Storage Service for Jakarta Waste Classification
 *
 * Handles image upload, compression, storage, and cleanup with Supabase Storage.
 * Provides secure signed URLs with user access control and automatic cleanup.
 */

import { createClient } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Storage configuration
const STORAGE_BUCKET = "classification-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB after compression
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const SIGNED_URL_EXPIRY = 3600; // 1 hour
const IMAGE_QUALITY = 0.8; // JPEG quality for compression

export interface ImageMetadata {
  originalName: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}

export interface StoredImageInfo {
  filename: string;
  path: string;
  publicUrl?: string;
  signedUrl?: string | undefined;
  metadata: ImageMetadata;
}

/**
 * Compress image using Canvas API (browser) or return original if server-side
 */
async function compressImage(
  imageFile: File
): Promise<{ file: File; metadata: ImageMetadata }> {
  return new Promise((resolve, reject) => {
    // Create image element for processing
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calculate compression ratio to maintain quality while reducing size
      let { width, height } = img;
      const maxDimension = 1024; // Max width or height

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Cannot create canvas context"));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }

          // Create compressed file
          const compressedFile = new File([blob], imageFile.name, {
            type: "image/jpeg", // Always convert to JPEG for consistency
            lastModified: Date.now(),
          });

          const metadata: ImageMetadata = {
            originalName: imageFile.name,
            mimeType: imageFile.type,
            originalSize: imageFile.size,
            compressedSize: blob.size,
            width,
            height,
          };

          resolve({ file: compressedFile, metadata });
        },
        "image/jpeg",
        IMAGE_QUALITY
      );
    };

    img.onerror = () =>
      reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Server-side image compression fallback (basic validation only)
 */
function validateImageServer(imageFile: File): {
  file: File;
  metadata: ImageMetadata;
} {
  const metadata: ImageMetadata = {
    originalName: imageFile.name,
    mimeType: imageFile.type,
    originalSize: imageFile.size,
    compressedSize: imageFile.size,
    width: 0, // Unknown on server
    height: 0, // Unknown on server
  };

  return { file: imageFile, metadata };
}

/**
 * Upload image to Supabase Storage with compression and user access control
 */
export async function uploadImage(
  imageFile: File,
  userId: string,
  options?: {
    compress?: boolean;
    folder?: string;
  }
): Promise<StoredImageInfo> {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
    throw new Error(`Unsupported image type: ${imageFile.type}`);
  }

  // Validate file size
  if (imageFile.size > MAX_IMAGE_SIZE * 2) {
    // Allow 2x for pre-compression
    throw new Error(
      `Image too large: ${imageFile.size} bytes (max: ${MAX_IMAGE_SIZE * 2})`
    );
  }

  const supabase = createClient();

  // Compress image if requested and in browser environment
  let processedFile: File;
  let metadata: ImageMetadata;

  if (options?.compress !== false && typeof window !== "undefined") {
    try {
      const compressed = await compressImage(imageFile);
      processedFile = compressed.file;
      metadata = compressed.metadata;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Image compression failed, using original:", error);
      const fallback = validateImageServer(imageFile);
      processedFile = fallback.file;
      metadata = fallback.metadata;
    }
  } else {
    const fallback = validateImageServer(imageFile);
    processedFile = fallback.file;
    metadata = fallback.metadata;
  }

  // Final size check after compression
  if (processedFile.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `Compressed image still too large: ${processedFile.size} bytes (max: ${MAX_IMAGE_SIZE})`
    );
  }

  // Generate unique filename with user prefix for organization
  const fileExtension = processedFile.type === "image/jpeg" ? "jpg" : "png";
  const uniqueId = uuidv4();
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const folder = options?.folder || "classifications";
  const filename = `${folder}/${userId}/${timestamp}/${uniqueId}.${fileExtension}`;

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, processedFile, {
        cacheControl: "3600", // 1 hour cache
        upsert: false, // Don't overwrite existing files
        contentType: processedFile.type,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Upload succeeded but no data returned");
    }

    // Get public URL (if bucket is public) or signed URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    // Generate signed URL for secure access
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filename, SIGNED_URL_EXPIRY);

    if (signedError) {
      // eslint-disable-next-line no-console
      console.warn("Failed to create signed URL:", signedError.message);
    }

    return {
      filename: data.path,
      path: filename,
      publicUrl: publicUrlData.publicUrl,
      signedUrl: signedUrlData?.signedUrl,
      metadata,
    };
  } catch (error) {
    throw new Error(
      `Image storage failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get signed URL for existing image
 */
export async function getImageUrl(
  filename: string,
  expiresIn: number = SIGNED_URL_EXPIRY
): Promise<string | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filename, expiresIn);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to get signed URL:", error.message);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating signed URL:", error);
    return null;
  }
}

/**
 * Delete image from storage
 */
export async function deleteImage(filename: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete image:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting image:", error);
    return false;
  }
}

/**
 * Delete all images for a user (for account deletion)
 */
export async function deleteUserImages(
  userId: string
): Promise<{ deleted: number; errors: string[] }> {
  const supabase = createClient();

  try {
    // List all files for the user
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`classifications/${userId}`, {
        limit: 1000, // Adjust as needed
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      throw new Error(`Failed to list user images: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      return { deleted: 0, errors: [] };
    }

    // Build full paths for deletion
    const filePaths = files
      .filter(file => file.name !== ".emptyFolderPlaceholder") // Skip placeholder files
      .map(file => `classifications/${userId}/${file.name}`);

    if (filePaths.length === 0) {
      return { deleted: 0, errors: [] };
    }

    // Delete files in batches
    const batchSize = 50; // Supabase recommended batch size
    let totalDeleted = 0;
    const errors: string[] = [];

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(batch);

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        totalDeleted += batch.length;
      }
    }

    return { deleted: totalDeleted, errors };
  } catch (error) {
    return {
      deleted: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Clean up old images (for maintenance)
 */
export async function cleanupOldImages(
  olderThanDays: number = 30
): Promise<{ deleted: number; errors: string[] }> {
  // This would require admin access or a server-side function
  // For now, return placeholder implementation
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  try {
    // eslint-disable-next-line no-console
    console.warn(
      "cleanupOldImages requires server-side implementation with admin access"
    );
    return { deleted: 0, errors: ["Not implemented - requires admin access"] };
  } catch (error) {
    return {
      deleted: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

// Utility function for client-side usage
export function isStorageAvailable(): boolean {
  return (
    typeof window !== "undefined" && "File" in window && "FileReader" in window
  );
}

// Types are already exported above
