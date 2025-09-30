import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase";
import {
  calculateDistance,
  isWithinJakartaBounds,
  formatDistance,
  type Coordinates,
} from "../../../lib/location-service";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * GET /api/facilities
 * Geospatial facilities query endpoint for finding waste management facilities.
 */

// Type definitions
interface FacilityData {
  facility_id: string;
  name: string;
  facility_type: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  operating_hours?: string;
  website_url?: string;
  latitude: number;
  longitude: number;
  services: string[];
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  distance?: number;
  formatted_distance?: string;
  travel_time_estimate?: number;
}

interface GeospatialParams {
  lat?: number | null;
  lng?: number | null;
  radius?: number;
  type?: string | null;
  category?: string | null;
  limit?: number;
  offset?: number;
  active_only?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: GeospatialParams = {
      lat: searchParams.get("lat")
        ? parseFloat(searchParams.get("lat")!)
        : null,
      lng: searchParams.get("lng")
        ? parseFloat(searchParams.get("lng")!)
        : null,
      radius: searchParams.get("radius")
        ? parseFloat(searchParams.get("radius")!)
        : 10, // Default 10km
      type: searchParams.get("type") || null,
      category: searchParams.get("category") || null,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
      active_only: searchParams.get("active_only") !== "false", // Default true
    };

    // Validation
    const validationError = validateParams(params);
    if (validationError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: [validationError] },
        { status: 400 }
      );
    }

    // Build base query
    let query = supabase.from("waste_facilities").select(`
        facility_id,
        name,
        facility_type,
        address,
        city,
        phone,
        email,
        operating_hours,
        website_url,
        latitude,
        longitude,
        services,
        capacity,
        is_active,
        created_at,
        updated_at
      `);

    // Apply filters
    if (params.active_only) {
      query = query.eq("is_active", true);
    }

    if (params.type) {
      query = query.eq("facility_type", params.type);
    }

    // Apply category filter through facility-category relationship
    if (params.category) {
      query = query.filter(
        "facility_categories.category_code",
        "eq",
        params.category
      );
    }

    // Apply pagination
    if (params.limit && params.offset !== undefined) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    }

    // Execute query
    const { data: facilities, error: facilityError, count } = await query;

    if (facilityError) {
      // Console warn for debugging
      return NextResponse.json(
        {
          error: "Database query failed",
          details: ["Failed to retrieve facilities"],
        },
        { status: 500 }
      );
    }

    // Process geospatial filtering if coordinates provided
    let processedFacilities: FacilityData[] = facilities || [];

    if (params.lat && params.lng && params.radius) {
      processedFacilities = await filterByDistance(
        processedFacilities,
        params.lat,
        params.lng,
        params.radius,
        supabase
      );
    }

    // Sort by distance if coordinates provided
    if (params.lat && params.lng) {
      processedFacilities = processedFacilities.sort((a, b) => {
        const distA = a.distance || Number.MAX_VALUE;
        const distB = b.distance || Number.MAX_VALUE;
        return distA - distB;
      });
    }

    // Prepare response metadata
    const metadata = {
      total_count: count || processedFacilities.length,
      returned_count: processedFacilities.length,
      has_coordinates: params.lat !== null && params.lng !== null,
      search_radius_km: params.radius || null,
      filters_applied: {
        type: params.type || null,
        category: params.category || null,
        active_only: params.active_only,
      },
      pagination: {
        limit: params.limit,
        offset: params.offset,
        has_more:
          (count || 0) > (params.offset || 0) + processedFacilities.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: processedFacilities,
      metadata,
      generated_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: ["An error occurred while processing the request"],
      },
      { status: 500 }
    );
  }
}

// Helper functions
function validateParams(params: GeospatialParams): string | null {
  // Validate coordinates if provided
  if (
    (params.lat !== null && params.lng === null) ||
    (params.lat === null && params.lng !== null)
  ) {
    return "Both latitude and longitude must be provided together";
  }

  if (
    params.lat !== null &&
    params.lat !== undefined &&
    (params.lat < -90 || params.lat > 90)
  ) {
    return "Latitude must be between -90 and 90";
  }

  if (
    params.lng !== null &&
    params.lng !== undefined &&
    (params.lng < -180 || params.lng > 180)
  ) {
    return "Longitude must be between -180 and 180";
  }

  if (params.radius !== undefined && params.radius <= 0) {
    return "Radius must be greater than 0";
  }

  if (params.limit !== undefined && (params.limit <= 0 || params.limit > 500)) {
    return "Limit must be between 1 and 500";
  }

  if (params.offset !== undefined && params.offset < 0) {
    return "Offset must be non-negative";
  }

  // Validate facility type
  const validTypes = [
    "TPA",
    "TPS3R",
    "Bank Sampah",
    "Komposting",
    "Produk Kreatif",
  ];
  if (params.type && !validTypes.includes(params.type)) {
    return `Invalid facility type. Valid types: ${validTypes.join(", ")}`;
  }

  // Validate category
  const validCategories = ["ORG", "ANO", "LAI"];
  if (params.category && !validCategories.includes(params.category)) {
    return `Invalid category. Valid categories: ${validCategories.join(", ")}`;
  }

  return null;
}

async function filterByDistance(
  facilities: FacilityData[],
  userLat: number,
  userLng: number,
  radiusKm: number,
  supabase: SupabaseClient
): Promise<FacilityData[]> {
  // Validate user location is within Jakarta bounds
  const userLocation: Coordinates = { latitude: userLat, longitude: userLng };

  if (!isWithinJakartaBounds(userLocation)) {
    // If user is outside Jakarta, return all facilities without distance filtering
    return facilities;
  }

  // Use PostGIS for accurate distance calculation if available
  const { data: facilitiesWithDistance, error } = await supabase.rpc(
    "get_facilities_within_radius",
    {
      user_lat: userLat,
      user_lng: userLng,
      radius_km: radiusKm,
    }
  );

  if (error || !facilitiesWithDistance) {
    // Fallback to our improved distance calculation
    return facilities
      .map(facility => {
        const distance = calculateDistance(userLocation, {
          latitude: facility.latitude,
          longitude: facility.longitude,
        });

        return {
          ...facility,
          distance: distance.distance_km,
          formatted_distance: formatDistance(distance.distance_km),
          travel_time_estimate: distance.travel_time_estimate || 0,
        };
      })
      .filter(facility => (facility.distance || 0) <= radiusKm)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance
  }

  return facilitiesWithDistance;
}
