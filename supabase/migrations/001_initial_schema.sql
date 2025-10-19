CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE facility_type AS ENUM ('TPA', 'TPS3R', 'Produk Kreatif', 'Komposting', 'Bank Sampah');
CREATE TYPE waste_category_code AS ENUM ('ORG', 'ANO', 'LAI');

CREATE TABLE public.waste_categories (
    waste_category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) NOT NULL CHECK (category_name IN ('Organik', 'Anorganik', 'Lainnya')),
    category_code waste_category_code UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.waste_facilities (
    facility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_name VARCHAR(200) NOT NULL CHECK (length(trim(facility_name)) > 0),
    facility_type facility_type NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address TEXT,
    city VARCHAR(100) DEFAULT 'Jakarta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.waste_facility_categories (
    facility_id UUID NOT NULL REFERENCES public.waste_facilities(facility_id) ON DELETE CASCADE,
    waste_category_id UUID NOT NULL REFERENCES public.waste_categories(waste_category_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (facility_id, waste_category_id)
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_waste_categories_updated_at BEFORE UPDATE ON public.waste_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_facilities_updated_at BEFORE UPDATE ON public.waste_facilities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_facility_categories_updated_at BEFORE UPDATE ON public.waste_facility_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.waste_categories IS 'Three waste classification types: Organik, Anorganik, Lainnya - education content generated dynamically';
COMMENT ON TABLE public.waste_facilities IS 'Jakarta waste management facilities - supports CSV import with coordinates only';
COMMENT ON TABLE public.waste_facility_categories IS 'Junction table defining which waste types each facility accepts';