-- ==============================================================================
-- GitNote — Phase 3: Supabase Storage Configuration & RLS Policies
-- ==============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create the private 'study-resources' bucket (if not already existing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'study-resources',
    'study-resources',
    false, -- Private bucket: file access is controlled via RLS and signed URLs
    26214400, -- 25 MB max file size limit (25 * 1024 * 1024 bytes)
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/zip',
        'application/x-zip-compressed'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 26214400,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/zip',
        'application/x-zip-compressed'
    ];

-- 2. Drop any legacy policies for 'study-resources' to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated students to upload study resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated students to view study resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow students to update only their own study resources" ON storage.objects;
DROP POLICY IF EXISTS "Allow students to delete only their own study resources" ON storage.objects;

-- 3. Storage Policy: INSERT
-- Authenticated students can only upload to their own user-scoped directory: study-resources/<user_id>/...
CREATE POLICY "Allow authenticated students to upload study resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'study-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Storage Policy: SELECT
-- Authenticated students can download / view study resources from the bucket
CREATE POLICY "Allow authenticated students to view study resources"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'study-resources'
);

-- 5. Storage Policy: UPDATE
-- Students can only replace or overwrite files in their own directory
CREATE POLICY "Allow students to update only their own study resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'study-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'study-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Storage Policy: DELETE
-- Students can only delete files in their own directory
CREATE POLICY "Allow students to delete only their own study resources"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'study-resources'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
