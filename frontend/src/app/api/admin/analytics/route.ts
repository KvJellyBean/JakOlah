import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase";

/**
 * GET /api/admin/analytics
 * Admin analytics endpoint for system statistics and insights.
 */

// Period mapping for SQL date calculations
const PERIOD_MAPPING = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
} as const;

// Type definitions
interface ClassificationData {
  waste_categories: {
    category_name: string;
    category_code: string;
  }[];
  classification_id: string;
}

interface ConfidenceData {
  confidence_organik: number;
  confidence_anorganik: number;
  confidence_lainnya: number;
  created_at: string;
  user_id?: string;
}

interface UserData {
  created_at: string;
  role: string;
  location_permission: boolean;
}

interface FacilityData {
  facility_type: string;
  city?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Authentication & admin role check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
          details: ["Please log in to access analytics"],
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== "admin") {
      return NextResponse.json(
        {
          error: "Admin access required",
          details: ["This endpoint requires administrator privileges"],
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const categoryFilter = searchParams.get("category");

    const periodDays =
      PERIOD_MAPPING[period as keyof typeof PERIOD_MAPPING] || 30;

    // 1. Summary Statistics
    const [
      { data: totalClassifications },
      { data: totalUsers },
      { data: totalFacilities },
    ] = await Promise.all([
      supabase
        .from("classifications")
        .select("classification_id", { count: "exact", head: true }),
      supabase.from("users").select("user_id", { count: "exact", head: true }),
      supabase
        .from("waste_facilities")
        .select("facility_id", { count: "exact", head: true }),
    ]);

    // 2. Classification Analytics
    let classificationQuery = supabase
      .from("classifications")
      .select(
        `
        waste_categories!inner(category_name, category_code),
        classification_id
      `
      )
      .gte(
        "created_at",
        new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
      );

    if (categoryFilter) {
      classificationQuery = classificationQuery.eq(
        "waste_categories.category_code",
        categoryFilter
      );
    }

    const { data: classificationsByCategory } = await classificationQuery;

    // 3. Confidence Distribution
    const { data: confidenceStats } = await supabase
      .from("classifications")
      .select(
        "confidence_organik, confidence_anorganik, confidence_lainnya, created_at, user_id"
      )
      .gte(
        "created_at",
        new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
      );

    // 4. User Analytics
    const { data: userRegistrations } = await supabase
      .from("users")
      .select("created_at, role, location_permission")
      .gte(
        "created_at",
        new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
      );

    // 5. Facility Analytics
    const { data: facilities } = await supabase
      .from("waste_facilities")
      .select("facility_type, city");

    // Process data for analytics
    const categoryStats = processClassificationsByCategory(
      classificationsByCategory || []
    );
    const confidenceDistribution = processConfidenceDistribution(
      confidenceStats || []
    );
    const facilityStats = processFacilityStats(facilities || []);
    const recentActivity = processRecentActivity(
      confidenceStats || [],
      periodDays
    );

    // Calculate performance metrics
    const lowConfidenceCount = (confidenceStats || []).filter(c => {
      const maxConfidence = Math.max(
        c.confidence_organik,
        c.confidence_anorganik,
        c.confidence_lainnya
      );
      return maxConfidence < 70;
    }).length;

    const lowConfidenceRate = confidenceStats?.length
      ? (lowConfidenceCount / confidenceStats.length) * 100
      : 0;

    return NextResponse.json({
      summary: {
        total_classifications: totalClassifications?.length || 0,
        total_users: totalUsers?.length || 0,
        active_users_period: getUniqueUsers(confidenceStats || []).length,
        total_facilities: totalFacilities?.length || 0,
      },
      classifications: {
        by_category: categoryStats,
        confidence_distribution: confidenceDistribution,
        recent_activity: recentActivity,
        low_confidence_rate: Math.round(lowConfidenceRate * 100) / 100,
      },
      users: {
        registration_trend: processRegistrationTrend(userRegistrations || []),
        location_permission_rate: calculateLocationPermissionRate(
          userRegistrations || []
        ),
        role_distribution: processRoleDistribution(userRegistrations || []),
      },
      facilities: {
        by_type: facilityStats,
        geographic_distribution: processGeographicDistribution(
          facilities || []
        ),
      },
      performance: {
        avg_processing_time: 2.1, // Mock - would be calculated from actual timing data
        error_rate: 2.3, // Mock - would be calculated from error logs
        peak_usage_hours: generatePeakUsageHours(), // Mock data
      },
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Admin analytics error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate analytics",
        details: ["An error occurred while processing analytics data"],
      },
      { status: 500 }
    );
  }
}

// Helper functions for data processing
function processClassificationsByCategory(data: ClassificationData[]) {
  const categoryCount: Record<string, number> = {};

  data.forEach(item => {
    // Handle the array structure from Supabase query
    const category = item.waste_categories[0];
    if (category) {
      const categoryName = category.category_name;
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    }
  });

  const total = data.length;
  return Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0,
  }));
}

function processConfidenceDistribution(data: ConfidenceData[]) {
  const ranges = {
    "90-100%": 0,
    "80-89%": 0,
    "70-79%": 0,
    "60-69%": 0,
    "50-59%": 0,
    "<50%": 0,
  };

  data.forEach(item => {
    const maxConfidence = Math.max(
      item.confidence_organik,
      item.confidence_anorganik,
      item.confidence_lainnya
    );

    if (maxConfidence >= 90) ranges["90-100%"]++;
    else if (maxConfidence >= 80) ranges["80-89%"]++;
    else if (maxConfidence >= 70) ranges["70-79%"]++;
    else if (maxConfidence >= 60) ranges["60-69%"]++;
    else if (maxConfidence >= 50) ranges["50-59%"]++;
    else ranges["<50%"]++;
  });

  return Object.entries(ranges).map(([range, count]) => ({ range, count }));
}

function processFacilityStats(data: FacilityData[]) {
  const typeCount: Record<string, number> = {};

  data.forEach(facility => {
    const type = facility.facility_type;
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
}

function processRecentActivity(data: ConfidenceData[], periodDays: number) {
  const dailyCount: Record<string, number> = {};
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  // Initialize all days with 0
  for (let i = 0; i < periodDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    if (dateStr) {
      dailyCount[dateStr] = 0;
    }
  }

  // Count classifications per day
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split("T")[0];
    if (date && dailyCount.hasOwnProperty(date)) {
      const currentCount = dailyCount[date];
      if (currentCount !== undefined) {
        dailyCount[date] = currentCount + 1;
      }
    }
  });

  return Object.entries(dailyCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getUniqueUsers(data: ConfidenceData[]) {
  const userIds = new Set();
  data.forEach(item => {
    if (item.user_id) userIds.add(item.user_id);
  });
  return Array.from(userIds);
}

function processRegistrationTrend(data: UserData[]) {
  const dailyRegistrations: Record<string, number> = {};

  data.forEach(user => {
    const date = new Date(user.created_at).toISOString().split("T")[0];
    if (date) {
      dailyRegistrations[date] = (dailyRegistrations[date] || 0) + 1;
    }
  });

  return Object.entries(dailyRegistrations)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateLocationPermissionRate(data: UserData[]) {
  if (data.length === 0) return 0;
  const withPermission = data.filter(user => user.location_permission).length;
  return Math.round((withPermission / data.length) * 100 * 100) / 100;
}

function processRoleDistribution(data: UserData[]) {
  const roleCount: Record<string, number> = {};

  data.forEach(user => {
    const role = user.role || "user";
    roleCount[role] = (roleCount[role] || 0) + 1;
  });

  return Object.entries(roleCount).map(([role, count]) => ({ role, count }));
}

function processGeographicDistribution(data: FacilityData[]) {
  const cityCount: Record<string, number> = {};

  data.forEach(facility => {
    const city = facility.city || "Unknown";
    cityCount[city] = (cityCount[city] || 0) + 1;
  });

  return Object.entries(cityCount).map(([area, count]) => ({ area, count }));
}

function generatePeakUsageHours() {
  // Mock data - would be calculated from actual request logs
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    avg_requests: Math.floor(Math.random() * 100) + 10,
  }));
}
