-- JakOlah Initial Data Seeding
-- File: seed.sql
-- Created: 2025-09-25
-- Purpose: Initial waste categories with Jakarta-specific disposal guidance

-- Insert waste categories
INSERT INTO public.waste_categories (category_name, category_code, description, education_content) VALUES
(
    'Organik',
    'ORG',
    'Sampah organik adalah sampah yang mudah membusuk dan berasal dari makhluk hidup seperti sisa makanan, daun, dan bahan organik lainnya.',
    'PEDOMAN PEMBUANGAN SAMPAH ORGANIK DI JAKARTA:

1. TEMPAT PEMBUANGAN:
   • Tempat Pembuangan Sementara (TPS) terdekat
   • Bank Sampah yang menerima kompos
   • Fasilitas pengomposan komunal
   
2. CARA PEMBUANGAN:
   • Pisahkan dari sampah anorganik
   • Kemas dalam kantong yang mudah terurai
   • Buang sebelum membusuk untuk menghindari bau
   
3. ALTERNATIF PENGELOLAAN:
   • Buat kompos di rumah jika memungkinkan
   • Berikan ke peternakan untuk pakan ternak (sayuran sisa)
   • Gunakan untuk pupuk tanaman rumah
   
4. JADWAL PENGANGKUTAN JAKARTA:
   • Sampah organik diangkut setiap hari
   • Waktu optimal: pagi hari sebelum jam 7
   • Koordinasi dengan petugas kebersihan setempat
   
5. MANFAAT:
   • Dapat dijadikan kompos berkualitas tinggi
   • Mengurangi volume sampah di TPA Bantargebang
   • Mendukung ekonomi sirkular Jakarta'
),
(
    'Anorganik', 
    'ANO',
    'Sampah anorganik adalah sampah yang tidak mudah membusuk dan berasal dari bahan sintetis seperti plastik, kertas, logam, kaca, dan elektronik.',
    'PEDOMAN PEMBUANGAN SAMPAH ANORGANIK DI JAKARTA:

1. TEMPAT PEMBUANGAN:
   • Bank Sampah (prioritas utama untuk daur ulang)
   • TPS dengan pemilahan
   • Pemulung atau pengepul barang bekas
   
2. CARA PEMBUANGAN:
   • BERSIHKAN: Cuci wadah plastik/kaca dari sisa makanan
   • PISAHKAN: Kelompokkan berdasarkan jenis (plastik, kertas, logam)
   • KEMAS: Gunakan kantong terpisah per jenis material
   
3. NILAI EKONOMIS:
   • Plastik PET (botol minuman): Rp 3.000-5.000/kg
   • Kertas bekas: Rp 1.500-2.500/kg
   • Aluminium kaleng: Rp 15.000-20.000/kg
   • Kaca bening: Rp 500-1.000/kg
   
4. BANK SAMPAH JAKARTA:
   • Cari Bank Sampah terdekat via aplikasi Jakarta Smart City
   • Buka hari Senin-Sabtu pukul 08.00-15.00
   • Syarat: KTP Jakarta, buku tabungan sampah
   
5. DAMPAK LINGKUNGAN:
   • Daur ulang 1 ton plastik = hemat 2.000 liter minyak
   • Mengurangi beban TPA Bantargebang
   • Ciptakan lapangan kerja untuk pemulung dan UMKM'
),
(
    'Lainnya',
    'LAI', 
    'Sampah lainnya adalah sampah yang tidak termasuk kategori organik atau anorganik, seperti sampah B3 (Bahan Berbahaya dan Beracun), elektronik rusak, dan material khusus.',
    'PEDOMAN PEMBUANGAN SAMPAH LAINNYA DI JAKARTA:

1. JENIS SAMPAH LAINNYA:
   • Baterai dan aki bekas
   • Lampu neon/LED rusak
   • Elektronik rusak (HP, laptop, TV)
   • Obat-obatan kadaluarsa
   • Cat, thinner, pestisida
   
2. TEMPAT PEMBUANGAN KHUSUS:
   • Fasilitas B3 (Bahan Berbahaya Beracun)
   • E-waste collection center
   • Apotek untuk obat kadaluarsa
   • Service center elektronik
   
3. LOKASI DI JAKARTA:
   • UPTD Pengelolaan Limbah B3 Jakarta
   • Kantor Kelurahan (program khusus)
   • Mall-mall besar (drop-off point elektronik)
   • RS/Puskesmas (obat kadaluarsa)
   
4. CARA AMAN:
   • JANGAN campur dengan sampah biasa
   • Kemas terpisah dan beri label
   • Gunakan sarung tangan saat menangani
   • Koordinasi dengan petugas khusus
   
5. BAHAYA JIKA SALAH BUANG:
   • Pencemaran tanah dan air Jakarta
   • Keracunan petugas pengangkut sampah
   • Pelepasan zat berbahaya ke udara
   • Denda sesuai Perda DKI Jakarta No. 3/2013
   
6. KONTAK DARURAT:
   • Call Center DKI: 106
   • Unit Pengelolaan Limbah B3: (021) 4585-0000'
);

-- Insert sample waste facilities (TPS, Bank Sampah, TPA)
INSERT INTO public.waste_facilities (facility_name, facility_type, latitude, longitude, address) VALUES
-- TPS (Tempat Pembuangan Sementara) samples
('TPS Cipinang Besar Selatan', 'TPS', -6.2249, 106.8716, 'Jl. Cipinang Besar Selatan No.45, Cipinang Besar Selatan, Jatinegara, Jakarta Timur'),
('TPS Manggarai Selatan', 'TPS', -6.2104, 106.8501, 'Jl. Manggarai Selatan VIII No.10, Manggarai Selatan, Tebet, Jakarta Selatan'),
('TPS Kebon Jeruk', 'TPS', -6.1962, 106.7834, 'Jl. Kebon Jeruk Raya No.27, Kebon Jeruk, Jakarta Barat'),
('TPS Kemayoran', 'TPS', -6.1734, 106.8467, 'Jl. Kemayoran Gempol No.15, Kemayoran, Jakarta Pusat'),
('TPS Kelapa Gading', 'TPS', -6.1518, 106.9015, 'Jl. Boulevard Raya Blok QJ5 No.21, Kelapa Gading, Jakarta Utara'),

-- Bank Sampah samples
('Bank Sampah Melati Bersih', 'Bank Sampah', -6.2346, 106.8405, 'Jl. Pulo Raya No.33, Kebayoran Baru, Jakarta Selatan'),
('Bank Sampah Harapan Jaya', 'Bank Sampah', -6.1875, 106.8231, 'Jl. Tanah Abang II No.67, Tanah Abang, Jakarta Pusat'),
('Bank Sampah Hijau Lestari', 'Bank Sampah', -6.1456, 106.8789, 'Jl. Sunter Agung Podomoro Blok L4 No.12, Sunter Agung, Jakarta Utara'),
('Bank Sampah Bumi Sejahtera', 'Bank Sampah', -6.2156, 106.7923, 'Jl. Meruya Utara No.89, Meruya Utara, Kembangan, Jakarta Barat'),
('Bank Sampah Cakung Mandiri', 'Bank Sampah', -6.1834, 106.9456, 'Jl. Cakung Timur Raya No.156, Cakung Timur, Jakarta Timur'),

-- TPA (Tempat Pembuangan Akhir)
('TPA Bantargebang', 'TPA', -6.3789, 107.0123, 'Bantargebang, Bekasi, Jawa Barat (melayani DKI Jakarta)');

-- Set up facility-category relationships
-- TPS accept all types of waste
INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'TPS';

-- Bank Sampah primarily accept Anorganik (recyclable) waste  
INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'Bank Sampah' AND wc.category_code = 'ANO';

-- Some Bank Sampah also accept Organik for composting
INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'Bank Sampah' 
AND wc.category_code = 'ORG'
AND wf.facility_name IN ('Bank Sampah Melati Bersih', 'Bank Sampah Hijau Lestari');

-- TPA accepts processed waste (all categories)
INSERT INTO public.waste_facility_categories (facility_id, waste_category_id)
SELECT 
    wf.facility_id,
    wc.waste_category_id
FROM public.waste_facilities wf, public.waste_categories wc
WHERE wf.facility_type = 'TPA';

-- Comments
COMMENT ON TABLE public.waste_categories IS 'Seeded with three waste types and comprehensive Jakarta-specific disposal guidance';
COMMENT ON TABLE public.waste_facilities IS 'Sample facilities across Jakarta representing TPS, Bank Sampah, and TPA';