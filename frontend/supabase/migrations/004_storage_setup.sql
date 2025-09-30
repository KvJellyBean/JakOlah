-- Create Supabase Storage bucket for classification images
-- Run this in Supabase Dashboard > SQL Editor

-- Create storage bucket for classification images
INSERT INTO storage.buckets (id, name, public)
VALUES ('classification-images', 'classification-images', false);

-- Set up Row Level Security policies for the bucket
-- Allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload images to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL 
  AND bucket_id = 'classification-images'
  AND (SPLIT_PART(name, '/', 2) = auth.uid()::text OR name LIKE 'classifications/' || auth.uid()::text || '/%')
);

-- Allow users to view their own images
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND bucket_id = 'classification-images'
  AND (SPLIT_PART(name, '/', 2) = auth.uid()::text OR name LIKE 'classifications/' || auth.uid()::text || '/%')
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  auth.uid() IS NOT NULL 
  AND bucket_id = 'classification-images'
  AND (SPLIT_PART(name, '/', 2) = auth.uid()::text OR name LIKE 'classifications/' || auth.uid()::text || '/%')
);

-- Admin access to all images (for moderation)
CREATE POLICY "Admins can manage all images" ON storage.objects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);