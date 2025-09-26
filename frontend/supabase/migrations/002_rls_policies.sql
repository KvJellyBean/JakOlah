ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_facility_categories ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_admin_select" ON public.users
    FOR SELECT USING (public.is_admin());

CREATE POLICY "waste_categories_select_authenticated" ON public.waste_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "waste_categories_admin_all" ON public.waste_categories
    FOR ALL USING (public.is_admin());

CREATE POLICY "classifications_select_own" ON public.classifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "classifications_insert_own" ON public.classifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "classifications_delete_own" ON public.classifications
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "classifications_admin_select" ON public.classifications
    FOR SELECT USING (public.is_admin());

CREATE POLICY "waste_facilities_select_authenticated" ON public.waste_facilities
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "waste_facilities_admin_all" ON public.waste_facilities
    FOR ALL USING (public.is_admin());

CREATE POLICY "waste_facility_categories_select_authenticated" ON public.waste_facility_categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "waste_facility_categories_admin_all" ON public.waste_facility_categories
    FOR ALL USING (public.is_admin());

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.waste_categories TO authenticated;
GRANT SELECT ON public.waste_facilities TO authenticated;
GRANT SELECT ON public.waste_facility_categories TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.classifications TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON FUNCTION public.is_admin() IS 'Helper function to check if current user has admin role';

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

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR SELECT USING (public.is_admin());