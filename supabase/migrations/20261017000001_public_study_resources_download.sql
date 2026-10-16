-- ==============================================================================
-- GitNote: Allow Public Download of Study Resources & Ensure Buckets Exist
-- ==============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- This allows all students and visitors to download/view uploaded lecture notes,
-- past papers, and study resources without permission errors.
-- ==============================================================================

-- 1. Ensure 'academic-resources' bucket exists alongside 'study-resources'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'academic-resources',
    'academic-resources',
    false,
    26214400,
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/zip',
        'application/x-zip-compressed'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop restrictive SELECT policies on storage.objects for study resources
DROP POLICY IF EXISTS "Allow authenticated students to view study resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view study resources" ON storage.objects;

-- 3. Allow all students and visitors (public & authenticated) to download resources
CREATE POLICY "Allow public to view study resources"
ON storage.objects FOR SELECT
TO public
USING (
    bucket_id = 'study-resources' OR bucket_id = 'academic-resources'
);

-- 4. Allow authenticated students to upload to 'academic-resources' as well
DROP POLICY IF EXISTS "Allow authenticated students to upload academic resources" ON storage.objects;
CREATE POLICY "Allow authenticated students to upload academic resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'academic-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
