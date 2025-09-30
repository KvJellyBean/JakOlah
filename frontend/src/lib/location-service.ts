/**
 * Location Services for Jakarta Waste Classification
 *
 * Provides geolocation functionality, distance calculations, and privacy-controlled
 * location services for facility recommendations.
 */

// Jakarta geographical bounds for validation
const JAKARTA_BOUNDS = {
  north: -5.9,
  south: -6.4,
  east: 107.1,
  west: 106.6,
};

// Default coordinates for Jakarta center
const JAKARTA_CENTER = {
  latitude: -6.2088,
  longitude: 106.8456,
};

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface DistanceCalculation {
  distance_km: number;
  distance_m: number;
  bearing: number;
  travel_time_estimate?: number; // minutes
}

export interface GeolocationResult {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
  isWithinJakarta: boolean;
}

export interface LocationError {
  code: number;
  message: string;
  type:
    | "PERMISSION_DENIED"
    | "POSITION_UNAVAILABLE"
    | "TIMEOUT"
    | "NOT_SUPPORTED";
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Check current location permission status
 */
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  if (!("permissions" in navigator)) {
    return {
      granted: false,
      denied: false,
      prompt: true,
      error: "Permissions API not supported",
    };
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });

    return {
      granted: permission.state === "granted",
      denied: permission.state === "denied",
      prompt: permission.state === "prompt",
    };
  } catch (error) {
    return {
      granted: false,
      denied: false,
      prompt: true,
      error:
        error instanceof Error ? error.message : "Unknown permission error",
    };
  }
}

/**
 * Request user location with privacy controls and validation
 */
export async function getUserLocation(options?: {
  timeout?: number;
  highAccuracy?: boolean;
  maxAge?: number;
}): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: 0,
        message: "Geolocation is not supported by this browser",
        type: "NOT_SUPPORTED",
      } as LocationError);
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: options?.highAccuracy ?? true,
      timeout: options?.timeout ?? 10000, // 10 seconds
      maximumAge: options?.maxAge ?? 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      position => {
        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const result: GeolocationResult = {
          coordinates,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          isWithinJakarta: isWithinJakartaBounds(coordinates),
        };

        resolve(result);
      },
      error => {
        let errorType: LocationError["type"];
        let message: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = "PERMISSION_DENIED";
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorType = "POSITION_UNAVAILABLE";
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorType = "TIMEOUT";
            message = "Location request timed out";
            break;
          default:
            errorType = "POSITION_UNAVAILABLE";
            message = "Unknown location error";
        }

        reject({
          code: error.code,
          message,
          type: errorType,
        } as LocationError);
      },
      defaultOptions
    );
  });
}

/**
 * Check if coordinates are within Jakarta bounds
 */
export function isWithinJakartaBounds(coordinates: Coordinates): boolean {
  return (
    coordinates.latitude >= JAKARTA_BOUNDS.south &&
    coordinates.latitude <= JAKARTA_BOUNDS.north &&
    coordinates.longitude >= JAKARTA_BOUNDS.west &&
    coordinates.longitude <= JAKARTA_BOUNDS.east
  );
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): DistanceCalculation {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance_km = R * c;

  // Calculate bearing
  const y = Math.sin(dLon) * Math.cos(toRadians(to.latitude));
  const x =
    Math.cos(toRadians(from.latitude)) * Math.sin(toRadians(to.latitude)) -
    Math.sin(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360

  // Estimate travel time based on Jakarta traffic conditions
  // Very rough estimate: walking speed ~5 km/h, driving ~15 km/h in Jakarta traffic
  const travel_time_estimate = Math.round(distance_km * 4); // minutes, assuming walking

  return {
    distance_km: Math.round(distance_km * 100) / 100, // Round to 2 decimal places
    distance_m: Math.round(distance_km * 1000),
    bearing: Math.round(bearing),
    travel_time_estimate,
  };
}

/**
 * Get default Jakarta location when user location is unavailable
 */
export function getDefaultLocation(): Coordinates {
  return { ...JAKARTA_CENTER };
}

/**
 * Find nearest facilities to a given location
 */
export function sortFacilitiesByDistance(
  userLocation: Coordinates,
  facilities: Array<{
    facility_id: string;
    latitude: number;
    longitude: number;
    [key: string]: unknown;
  }>
): Array<{
  facility_id: string;
  latitude: number;
  longitude: number;
  distance: DistanceCalculation;
  [key: string]: unknown;
}> {
  return facilities
    .map(facility => ({
      ...facility,
      distance: calculateDistance(userLocation, {
        latitude: facility.latitude,
        longitude: facility.longitude,
      }),
    }))
    .sort((a, b) => a.distance.distance_km - b.distance.distance_km);
}

/**
 * Format distance for display
 */
export function formatDistance(distance_km: number): string {
  if (distance_km < 1) {
    return `${Math.round(distance_km * 1000)}m`;
  } else {
    return `${distance_km.toFixed(1)}km`;
  }
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}j ${remainingMinutes}m`;
  }
}

/**
 * Get compass direction from bearing
 */
export function getCompassDirection(bearing: number): string {
  const directions = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ] as const;

  const index = Math.round(bearing / 45) % 8;
  return directions[index] || "Utara";
}

/**
 * Create a location-aware search query for facilities API
 */
export function createLocationQuery(
  userLocation?: Coordinates,
  maxDistance?: number // in kilometers
): {
  lat?: number;
  lng?: number;
  radius?: number;
} {
  if (!userLocation) {
    return {};
  }

  return {
    lat: userLocation.latitude,
    lng: userLocation.longitude,
    radius: maxDistance || 10, // Default 10km radius
  };
}

/**
 * Privacy-aware location sharing prompt
 */
export function getLocationSharingPrompt(): {
  title: string;
  message: string;
  benefits: string[];
  privacy_notes: string[];
} {
  return {
    title: "Bagikan Lokasi Anda",
    message:
      "JakOlah ingin mengakses lokasi Anda untuk memberikan rekomendasi fasilitas pengelolaan sampah terdekat.",
    benefits: [
      "Rekomendasi fasilitas terdekat",
      "Estimasi waktu perjalanan",
      "Rute navigasi ke fasilitas",
      "Informasi fasilitas khusus daerah Jakarta",
    ],
    privacy_notes: [
      "Lokasi tidak disimpan secara permanen",
      "Data hanya digunakan untuk pencarian fasilitas",
      "Anda dapat menonaktifkan akses lokasi kapan saja",
      "Aplikasi tetap berfungsi tanpa akses lokasi",
    ],
  };
}

// Utility functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// Types are already exported above
