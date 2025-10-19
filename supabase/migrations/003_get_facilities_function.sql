-- ============================================================================
-- FIXED RPC FUNCTION: Get Facilities with Categories
-- This fixes the column name issue and handles NULL categories properly
-- ============================================================================

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.get_facilities_with_categories(TEXT, INT);

-- Create fixed function
CREATE OR REPLACE FUNCTION public.get_facilities_with_categories(
    category_filter TEXT DEFAULT NULL,
    limit_count INT DEFAULT 100
)
RETURNS TABLE (
    facility_id UUID,
    facility_name VARCHAR(200),
    facility_type facility_type,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    city VARCHAR(100),
    waste_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wf.facility_id,
        wf.facility_name,
        wf.facility_type,
        wf.latitude,
        wf.longitude,
        wf.address,
        wf.city,
        -- Use COALESCE and FILTER to handle NULL categories properly
        COALESCE(
            array_agg(wc.category_name::TEXT ORDER BY wc.category_name) 
            FILTER (WHERE wc.category_name IS NOT NULL), 
            ARRAY[]::TEXT[]
        ) as waste_categories,
        wf.created_at,
        wf.updated_at
    FROM public.waste_facilities wf
    LEFT JOIN public.waste_facility_categories wfc ON wf.facility_id = wfc.facility_id
    LEFT JOIN public.waste_categories wc ON wfc.waste_category_id = wc.waste_category_id
    WHERE 
        -- Filter by category if provided
        (category_filter IS NULL OR wc.category_name = category_filter)
    GROUP BY wf.facility_id
    ORDER BY wf.facility_name
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION public.get_facilities_with_categories IS 
'Get waste facilities with their accepted categories. Optional filtering by waste category name. Returns empty array for facilities without categories.';

-- ============================================================================
-- TEST QUERIES
-- ============================================================================
-- Get all facilities (should work even with no data):
-- SELECT * FROM get_facilities_with_categories();

-- Get facilities that accept "Organik":
-- SELECT * FROM get_facilities_with_categories('Organik');

-- Get first 10 facilities:
-- SELECT * FROM get_facilities_with_categories(NULL, 10);

