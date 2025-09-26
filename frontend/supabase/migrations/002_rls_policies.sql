-- JakOlah Row-Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- Created: 2025-09-25
-- Constitutional compliance: Complete user control over personal data (FR-014)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_facility_categories ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
-- Users can read/update their own profile only
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all user records (no personal data modification)
CREATE POLICY "users_admin_select" ON public.users
    FOR SELECT USING (public.is_admin());

-- Waste Categories table policies
-- Read access for all authenticated users
CREATE POLICY "waste_categories_select_authenticated" ON public.waste_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write access for admins only
CREATE POLICY "waste_categories_admin_all" ON public.waste_categories
    FOR ALL USING (public.is_admin());

-- Classifications table policies
-- Users can read/create/delete their own classifications only
CREATE POLICY "classifications_select_own" ON public.classifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "classifications_insert_own" ON public.classifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "classifications_delete_own" ON public.classifications
    FOR DELETE USING (user_id = auth.uid());

-- Admins can read all classifications for analytics
CREATE POLICY "classifications_admin_select" ON public.classifications
    FOR SELECT USING (public.is_admin());

-- Waste Facilities table policies
-- Read access for all authenticated users
CREATE POLICY "waste_facilities_select_authenticated" ON public.waste_facilities
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write access for admins only
CREATE POLICY "waste_facilities_admin_all" ON public.waste_facilities
    FOR ALL USING (public.is_admin());

-- Waste Facility Categories junction table policies
-- Read access for all authenticated users
CREATE POLICY "waste_facility_categories_select_authenticated" ON public.waste_facility_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Write access for admins only
CREATE POLICY "waste_facility_categories_admin_all" ON public.waste_facility_categories
    FOR ALL USING (public.is_admin());

-- Grant necessary permissions
-- Public schema access
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Table permissions for authenticated users
GRANT SELECT ON public.waste_categories TO authenticated;
GRANT SELECT ON public.waste_facilities TO authenticated;
GRANT SELECT ON public.waste_facility_categories TO authenticated;

-- Users table permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Classifications table permissions
GRANT SELECT, INSERT, DELETE ON public.classifications TO authenticated;

-- Sequence permissions (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Storage bucket policies (for image uploads)
-- Note: These will be applied in Supabase dashboard or via Supabase CLI
-- CREATE POLICY "users_upload_own" ON storage.objects FOR INSERT WITH CHECK (
--     bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- 
-- CREATE POLICY "users_select_own" ON storage.objects FOR SELECT USING (
--     bucket_id = 'waste-images' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- 
-- CREATE POLICY "admin_select_all" ON storage.objects FOR SELECT USING (
--     bucket_id = 'waste-images' AND public.is_admin()
-- );

-- Comments for documentation
COMMENT ON FUNCTION public.is_admin() IS 'Helper function to check if current user has admin role';

-- Security audit logging (optional - for compliance tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    user_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR SELECT USING (public.is_admin());