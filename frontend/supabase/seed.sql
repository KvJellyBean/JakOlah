INSERT INTO public.waste_categories (category_name, category_code, description) VALUES
(
    'Organik',
    'ORG',
    'Sampah organik adalah sampah yang mudah membusuk dan berasal dari makhluk hidup seperti sisa makanan, daun, dan bahan organik lainnya.'
),
(
    'Anorganik', 
    'ANO',
    'Sampah anorganik adalah sampah yang tidak mudah membusuk dan berasal dari bahan sintetis seperti plastik, kertas, logam, kaca, dan elektronik.'
),
(
    'Lainnya',
    'LAI', 
    'Sampah lainnya adalah sampah yang tidak termasuk kategori organik atau anorganik, seperti sampah B3 (Bahan Berbahaya dan Beracun), elektronik rusak, dan material khusus.'
);

INSERT INTO public.waste_facilities (facility_name, facility_type, latitude, longitude) VALUES
('TPA Bantar Gebang', 'TPA', -6.3482596, 106.9976916),
('Daur Ulang Pulau Pramuka', 'Produk Kreatif', -5.7459620, 106.6136577),
('TPS Kencana', 'TPS3R', -6.1314458, 106.8903644),
('Saung Budidaya Maggot', 'Komposting', -6.1361763, 106.8856933),
('Buah Menteng Jagakarsa', 'Bank Sampah', -6.3370750, 106.8301200);

INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf
CROSS JOIN public.waste_categories wc
WHERE wf.facility_type = 'TPA';

INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf
CROSS JOIN public.waste_categories wc
WHERE wf.facility_type = 'TPS3R';

INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'Bank Sampah' 
AND wc.category_code IN ('ANO', 'LAI');

INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'Komposting' 
AND wc.category_code = 'ORG';

INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'Produk Kreatif' 
AND wc.category_code = 'ANO';

COMMENT ON TABLE public.waste_categories IS 'Seeded with three waste types';
COMMENT ON TABLE public.waste_facilities IS 'Sample Jakarta facilities representing all 5 facility types';
COMMENT ON TABLE public.waste_facility_categories IS 'Facility-category relationships based on facility specialization';