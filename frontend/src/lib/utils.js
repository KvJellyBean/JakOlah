import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Menggabungkan dan menggabungkan kelas Tailwind CSS
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Fungsi utilitas untuk aplikasi JakOlah
 */

// Format persentase confidence untuk ditampilkan
export function formatConfidence(confidence) {
  return `${Math.round(confidence * 100)}%`;
}

// Format waktu pemrosesan dalam milidetik
export function formatProcessingTime(timeMs) {
  if (timeMs < 1000) {
    return `${Math.round(timeMs)}ms`;
  }
  return `${(timeMs / 1000).toFixed(1)}s`;
}

// Menghitung jarak antara dua koordinat
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Konversi derajat ke radian
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Format jarak untuk ditampilkan
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// Memeriksa apakah koordinat berada dalam batas Jakarta
export function isWithinJakartaBounds(lat, lng) {
  // Jakarta bounds
  const JAKARTA_BOUNDS = {
    north: -5.9,
    south: -6.4,
    east: 107.1,
    west: 106.6,
  };

  return (
    lat >= JAKARTA_BOUNDS.south &&
    lat <= JAKARTA_BOUNDS.north &&
    lng >= JAKARTA_BOUNDS.west &&
    lng <= JAKARTA_BOUNDS.east
  );
}

// Memeriksa validitas file gambar berdasarkan ukuran dan tipe
export function validateImageFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (file.size > MAX_SIZE) {
    return {
      success: false,
      error: `File size too large. Maximum size is ${formatFileSize(MAX_SIZE)}`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed",
    };
  }

  return { success: true };
}

// Format ukuran file untuk ditampilkan
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Generate unique session ID
export function generateSessionId() {
  return `jak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Dapatkan warna berdasarkan kategori sampah
export function getCategoryColor(category) {
  const colors = {
    organik: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      badge: "bg-green-100 text-green-800",
      button: "bg-green-600 hover:bg-green-700",
      progress: "bg-green-500",
    },
    anorganik: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-800",
      button: "bg-blue-600 hover:bg-blue-700",
      progress: "bg-blue-500",
    },
    lainnya: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
      button: "bg-yellow-600 hover:bg-yellow-700",
      progress: "bg-yellow-500",
    },
  };

  return colors[category] || colors.lainnya;
}

// Untuk menunda pemanggilan fungsi
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Untuk membatasi frekuensi pemanggilan fungsi
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memeriksa apakah kamera tersedia
export function isCameraAvailable() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Mendapatkan lokasi geolokasi pengguna
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      error => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Salin teks ke clipboard
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

// Formats date for display
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Formats time for display
export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Download file from blob
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Converts canvas to blob
export function canvasToBlob(canvas, type = "image/jpeg", quality = 0.8) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

// Ubah ukuran gambar sambil mempertahankan rasio aspek
export async function resizeImage(file, maxWidth = 800, maxHeight = 600) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, "image/jpeg", 0.8);
    };

    img.src = URL.createObjectURL(file);
  });
}
