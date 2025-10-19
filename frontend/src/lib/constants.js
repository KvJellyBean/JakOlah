/**
 * Application constants and configuration for JakOlah
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ML_SERVICE_URL:
    process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
}

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
}

// Application Information
export const APP_INFO = {
  NAME: 'JakOlah',
  TITLE: 'JakOlah - Klasifikasi Sampah Jakarta',
  DESCRIPTION:
    'Aplikasi klasifikasi sampah real-time untuk warga Jakarta menggunakan teknologi machine learning',
  VERSION: '1.0.0',
  AUTHOR: 'Tim JakOlah',
  KEYWORDS: [
    'sampah',
    'jakarta',
    'klasifikasi',
    'machine learning',
    'lingkungan',
  ],
}

// Jakarta Geographic Bounds
export const JAKARTA_BOUNDS = {
  north: -5.9,
  south: -6.4,
  east: 107.1,
  west: 106.6,
  center: {
    lat: -6.2088,
    lng: 106.8456,
  },
}

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 11,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

// Waste Categories
export const WASTE_CATEGORIES = {
  ORGANIK: {
    id: 'organik',
    name: 'Organik',
    description: 'Sampah yang dapat terurai secara alami',
    color: '#22c55e',
    icon: '🥬',
    examples: [
      'Sisa makanan',
      'Daun kering',
      'Kulit buah',
      'Sayuran busuk',
      'Ampas teh/kopi',
    ],
    tips: [
      'Dapat dijadikan kompos',
      'Pisahkan dari sampah lainnya',
      'Proses dalam 1-2 hari',
    ],
  },
  ANORGANIK: {
    id: 'anorganik',
    name: 'Anorganik',
    description: 'Sampah yang dapat didaur ulang',
    color: '#3b82f6',
    icon: '♻️',
    examples: [
      'Botol plastik',
      'Kaleng minuman',
      'Kertas bekas',
      'Kardus',
      'Gelas plastik',
    ],
    tips: [
      'Bersihkan sebelum dibuang',
      'Pisahkan berdasarkan jenis',
      'Bawa ke bank sampah',
    ],
  },
  LAINNYA: {
    id: 'lainnya',
    name: 'Lainnya',
    description: 'Sampah yang memerlukan penanganan khusus',
    color: '#eab308',
    icon: '🗑️',
    examples: [
      'Popok bekas',
      'Pembalut',
      'Kaca pecah',
      'Obat kadaluarsa',
      'Baterai bekas',
    ],
    tips: [
      'Buang ke TPS umum',
      'Hindari daur ulang',
      'Perlu penanganan khusus',
    ],
  },
}

// Facility Types
export const FACILITY_TYPES = {
  TPS: {
    id: 'tps',
    name: 'TPS 3R',
    description: 'Tempat Pemrosesan Sampah Reduce, Reuse, Recycle',
    icon: '🏢',
    color: '#16a34a',
  },
  BANK_SAMPAH: {
    id: 'bank_sampah',
    name: 'Bank Sampah',
    description: 'Tempat menukar sampah anorganik dengan uang',
    icon: '🏦',
    color: '#2563eb',
  },
  TPA: {
    id: 'tpa',
    name: 'TPA',
    description: 'Tempat Pembuangan Akhir',
    icon: '🏭',
    color: '#dc2626',
  },
  DAUR_ULANG: {
    id: 'daur_ulang',
    name: 'Pusat Daur Ulang',
    description: 'Fasilitas pengolahan sampah menjadi produk baru',
    icon: '♻️',
    color: '#7c3aed',
  },
}

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  CLASSIFY: '/klasifikasi',
  INFO: '/informasi',
  API: {
    FACILITIES: '/api/facilities',
    CLASSIFY_FRAME: '/api/classify-frame',
  },
}

// Camera Configuration
export const CAMERA_CONFIG = {
  VIDEO_CONSTRAINTS: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'environment', // Use back camera on mobile
  },
  CAPTURE_FORMAT: 'image/jpeg',
  CAPTURE_QUALITY: 0.8,
  PROCESSING_INTERVAL: 500, // Process frame every 500ms
  MAX_PROCESSING_TIME: 5000, // 5 seconds timeout
}

// Image Processing Configuration
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  RESIZE_WIDTH: 224,
  RESIZE_HEIGHT: 224,
  COMPRESSION_QUALITY: 0.8,
}

// Machine Learning Configuration
export const ML_CONFIG = {
  MODEL_VERSION: '1.0.0',
  INPUT_SIZE: [224, 224],
  CONFIDENCE_THRESHOLD: 0.5,
  PREPROCESSING: {
    normalize: true,
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
  },
}

// UI Configuration
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
}

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  CLASSIFICATION_TIME: 500, // ms
  CAMERA_FPS: 15,
  API_RESPONSE_TIME: 2000, // ms
  BUNDLE_SIZE: 2 * 1024 * 1024, // 2MB
}

// Error Messages
export const ERROR_MESSAGES = {
  CAMERA_NOT_AVAILABLE: 'Kamera tidak tersedia atau tidak didukung',
  CAMERA_PERMISSION_DENIED: 'Izin akses kamera ditolak',
  LOCATION_NOT_AVAILABLE: 'Lokasi tidak tersedia',
  LOCATION_PERMISSION_DENIED: 'Izin akses lokasi ditolak',
  NETWORK_ERROR: 'Koneksi internet bermasalah',
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  CLASSIFICATION_FAILED: 'Gagal mengklasifikasikan gambar',
  FILE_TOO_LARGE: 'Ukuran file terlalu besar',
  INVALID_FILE_TYPE: 'Jenis file tidak didukung',
  PROCESSING_TIMEOUT: 'Waktu pemrosesan habis',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  CLASSIFICATION_SUCCESS: 'Klasifikasi berhasil',
  IMAGE_CAPTURED: 'Gambar berhasil diambil',
  LOCATION_FOUND: 'Lokasi berhasil ditemukan',
  DATA_SAVED: 'Data berhasil disimpan',
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'jak_user_preferences',
  CLASSIFICATION_HISTORY: 'jak_classification_history',
  LOCATION_CACHE: 'jak_location_cache',
  TUTORIAL_COMPLETED: 'jak_tutorial_completed',
}

// Feature Flags
export const FEATURES = {
  REAL_TIME_CLASSIFICATION: true,
  LOCATION_SERVICES: true,
  CLASSIFICATION_HISTORY: true,
  OFFLINE_MODE: false,
  ANALYTICS: true,
  PUSH_NOTIFICATIONS: false,
}

// Contact Information
export const CONTACT_INFO = {
  DLH_JAKARTA: {
    name: 'Dinas Lingkungan Hidup DKI Jakarta',
    address: 'Jl. Casablanca Raya Kav. 99, Jakarta Selatan',
    phone: '(021) 8520610',
    email: 'dlh@jakarta.go.id',
    website: 'lingkunganhidup.jakarta.go.id',
  },
  EMERGENCY: {
    call_center: '112',
    whatsapp: '08111000112',
    app: 'Jakarta Smart City (JAKI)',
  },
}

// Social Media Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/jakolah/jakolah',
  TWITTER: 'https://twitter.com/jakolah',
  INSTAGRAM: 'https://instagram.com/jakolah',
}

// Analytics Events
export const ANALYTICS_EVENTS = {
  CLASSIFICATION_STARTED: 'classification_started',
  CLASSIFICATION_COMPLETED: 'classification_completed',
  FACILITY_VIEWED: 'facility_viewed',
  CAMERA_OPENED: 'camera_opened',
  LOCATION_REQUESTED: 'location_requested',
  PAGE_VIEW: 'page_view',
}

// Tutorial Steps
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Selamat Datang di JakOlah!',
    description: 'Aplikasi klasifikasi sampah untuk warga Jakarta',
    target: null,
  },
  {
    id: 'camera',
    title: 'Gunakan Kamera',
    description: 'Arahkan kamera ke sampah untuk klasifikasi otomatis',
    target: '.camera-button',
  },
  {
    id: 'results',
    title: 'Lihat Hasil',
    description: 'Hasil klasifikasi akan muncul dengan tingkat akurasi',
    target: '.results-panel',
  },
  {
    id: 'facilities',
    title: 'Temukan Fasilitas',
    description: 'Cari fasilitas pengelolaan sampah terdekat',
    target: '.map-toggle',
  },
]

// Default User Preferences
export const DEFAULT_PREFERENCES = {
  language: 'id',
  notifications: true,
  location_sharing: false,
  camera_quality: 'medium',
  tutorial_completed: false,
  theme: 'light',
}

// Rate Limiting
export const RATE_LIMITS = {
  CLASSIFICATION_PER_MINUTE: 60,
  API_REQUESTS_PER_MINUTE: 100,
  IMAGE_UPLOADS_PER_HOUR: 200,
}

// Cache Configuration
export const CACHE_CONFIG = {
  FACILITIES_TTL: 24 * 60 * 60 * 1000, // 24 hours
  LOCATION_TTL: 5 * 60 * 1000, // 5 minutes
  CLASSIFICATION_HISTORY_SIZE: 100,
}
