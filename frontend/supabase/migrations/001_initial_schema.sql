CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE facility_type AS ENUM ('TPA', 'TPS3R', 'Produk Kreatif', 'Komposting', 'Bank Sampah');
CREATE TYPE waste_category_code AS ENUM ('ORG', 'ANO', 'LAI');

CREATE TABLE public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL CHECK (length(full_name) >= 2),
    role user_role DEFAULT 'user',
    profile_image TEXT,
    latitude DECIMAL(10,8) CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11,8) CHECK (longitude BETWEEN -180 AND 180),
    location_permission BOOLEAN DEFAULT false,
    location_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.waste_categories (
    waste_category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) NOT NULL CHECK (category_name IN ('Organik', 'Anorganik', 'Lainnya')),
    category_code waste_category_code UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.classifications (
    classification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    waste_category_id UUID NOT NULL REFERENCES public.waste_categories(waste_category_id),
    image_filename VARCHAR(255) NOT NULL,
    image_path TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    confidence_organik DECIMAL(5,2) NOT NULL CHECK (confidence_organik BETWEEN 0.00 AND 100.00),
    confidence_anorganik DECIMAL(5,2) NOT NULL CHECK (confidence_anorganik BETWEEN 0.00 AND 100.00),
    confidence_lainnya DECIMAL(5,2) NOT NULL CHECK (confidence_lainnya BETWEEN 0.00 AND 100.00),
    education_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT confidence_sum_check CHECK (
        ABS((confidence_organik + confidence_anorganik + confidence_lainnya) - 100.00) <= 0.01
    )
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

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_categories_updated_at BEFORE UPDATE ON public.waste_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classifications_updated_at BEFORE UPDATE ON public.classifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_facilities_updated_at BEFORE UPDATE ON public.waste_facilities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waste_facility_categories_updated_at BEFORE UPDATE ON public.waste_facility_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users with additional Jakarta-specific data';
COMMENT ON TABLE public.waste_categories IS 'Three waste classification types: Organik, Anorganik, Lainnya - education content generated dynamically';
COMMENT ON TABLE public.classifications IS 'Individual waste classification attempts with ML confidence scores';
COMMENT ON TABLE public.waste_facilities IS 'Jakarta waste management facilities - supports CSV import with coordinates only';
COMMENT ON TABLE public.waste_facility_categories IS 'Junction table defining which waste types each facility accepts';

COMMENT ON COLUMN public.classifications.confidence_organik IS 'ML confidence score for Organik category (0.00-100.00)';
COMMENT ON COLUMN public.classifications.confidence_anorganik IS 'ML confidence score for Anorganik category (0.00-100.00)';
COMMENT ON COLUMN public.classifications.confidence_lainnya IS 'ML confidence score for Lainnya category (0.00-100.00)';
COMMENT ON COLUMN public.users.location_permission IS 'User consent for storing and using location data for facility recommendations';