CREATE INDEX idx_classifications_user_created ON public.classifications(user_id, created_at DESC);

CREATE INDEX idx_classifications_category ON public.classifications(waste_category_id);

CREATE INDEX idx_classifications_user_category_date ON public.classifications(user_id, waste_category_id, created_at);

CREATE INDEX idx_classifications_low_confidence ON public.classifications(
    GREATEST(confidence_organik, confidence_anorganik, confidence_lainnya)
) WHERE GREATEST(confidence_organik, confidence_anorganik, confidence_lainnya) < 70.0;

CREATE INDEX idx_facilities_location ON public.waste_facilities USING GIST(
    ST_Point(longitude, latitude)
);

CREATE INDEX idx_facilities_type ON public.waste_facilities(facility_type);

CREATE INDEX idx_facilities_city ON public.waste_facilities(city);

CREATE INDEX idx_facilities_type_location ON public.waste_facilities(facility_type) 
INCLUDE (latitude, longitude, facility_name);

CREATE INDEX idx_users_role ON public.users(role) WHERE role = 'admin';

CREATE INDEX idx_users_location_enabled ON public.users(location_permission, latitude, longitude)
WHERE location_permission = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_facility_categories_facility ON public.waste_facility_categories(facility_id);

CREATE INDEX idx_facility_categories_category ON public.waste_facility_categories(waste_category_id);

CREATE INDEX idx_facilities_name_search ON public.waste_facilities USING GIN(
    to_tsvector('indonesian', facility_name)
);

CREATE INDEX idx_facilities_address_search ON public.waste_facilities USING GIN(
    to_tsvector('indonesian', address)
) WHERE address IS NOT NULL;

CREATE INDEX idx_categories_description_search ON public.waste_categories USING GIN(
    to_tsvector('indonesian', description)
);

-- CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
-- CREATE INDEX idx_audit_logs_user_date ON public.audit_logs(user_id, created_at DESC);
-- CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

CREATE INDEX idx_classifications_recent ON public.classifications(user_id, created_at DESC);

CREATE INDEX idx_facilities_jakarta ON public.waste_facilities(facility_type, latitude, longitude)
WHERE latitude BETWEEN -6.4 AND -6.0 AND longitude BETWEEN 106.5 AND 107.2;

CREATE INDEX idx_classifications_created_at ON public.classifications(created_at DESC);
CREATE INDEX idx_classifications_category_created ON public.classifications(waste_category_id, created_at DESC);

CREATE INDEX idx_users_last_activity ON public.users(updated_at DESC);

COMMENT ON INDEX idx_classifications_user_created IS 'Primary index for user classification history pagination';
COMMENT ON INDEX idx_facilities_location IS 'PostGIS spatial index for geospatial facility queries';
COMMENT ON INDEX idx_classifications_low_confidence IS 'Partial index for analyzing classifications with confidence < 70%';
COMMENT ON INDEX idx_facilities_jakarta IS 'Partial index limited to Jakarta geographic bounds for performance';
COMMENT ON INDEX idx_classifications_recent IS 'Primary index for recent classifications query performance';
COMMENT ON INDEX idx_classifications_created_at IS 'Index for time-based classification queries';

CREATE OR REPLACE VIEW public.index_usage_stats AS
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

COMMENT ON VIEW public.index_usage_stats IS 'Monitor index usage for performance optimization';