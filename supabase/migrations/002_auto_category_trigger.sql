-- ============================================================================
-- AUTO-CONNECT TRIGGER untuk waste_facility_categories
-- Otomatis assign kategori sampah berdasarkan facility_type saat insert
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_assign_facility_categories()
RETURNS TRIGGER AS $$
DECLARE
    org_category_id UUID;
    ano_category_id UUID;
    lai_category_id UUID;
BEGIN
    -- Get category IDs
    SELECT waste_category_id INTO org_category_id 
    FROM public.waste_categories WHERE category_code = 'ORG';
    
    SELECT waste_category_id INTO ano_category_id 
    FROM public.waste_categories WHERE category_code = 'ANO';
    
    SELECT waste_category_id INTO lai_category_id 
    FROM public.waste_categories WHERE category_code = 'LAI';
    
    -- Auto-assign berdasarkan facility_type
    CASE NEW.facility_type
        -- TPA menerima semua jenis sampah
        WHEN 'TPA' THEN
            INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
            VALUES 
                (NEW.facility_id, org_category_id),
                (NEW.facility_id, ano_category_id),
                (NEW.facility_id, lai_category_id)
            ON CONFLICT DO NOTHING;
            
        -- TPS3R menerima semua jenis sampah (reduce, reuse, recycle)
        WHEN 'TPS3R' THEN
            INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
            VALUES 
                (NEW.facility_id, org_category_id),
                (NEW.facility_id, ano_category_id),
                (NEW.facility_id, lai_category_id)
            ON CONFLICT DO NOTHING;
            
        -- Bank Sampah fokus pada sampah anorganik yang bisa dijual
        WHEN 'Bank Sampah' THEN
            INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
            VALUES 
                (NEW.facility_id, ano_category_id),
                (NEW.facility_id, lai_category_id)
            ON CONFLICT DO NOTHING;
            
        -- Komposting hanya menerima sampah organik
        WHEN 'Komposting' THEN
            INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
            VALUES (NEW.facility_id, org_category_id)
            ON CONFLICT DO NOTHING;
            
        -- Produk Kreatif fokus pada sampah anorganik untuk kerajinan
        WHEN 'Produk Kreatif' THEN
            INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
            VALUES (NEW.facility_id, ano_category_id)
            ON CONFLICT DO NOTHING;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke waste_facilities table
CREATE TRIGGER trigger_auto_assign_categories
    AFTER INSERT ON public.waste_facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_facility_categories();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION public.auto_assign_facility_categories() IS 
'Automatically assigns waste categories to facilities based on facility_type when a new facility is inserted';

COMMENT ON TRIGGER trigger_auto_assign_categories ON public.waste_facilities IS 
'Triggers after facility insert to auto-populate waste_facility_categories junction table';
