-- ==============================================================================
-- GitNote: Fix & Purge oversized base64 avatar metadata from auth.users
-- ==============================================================================
-- Run this in the Supabase SQL Editor if users experience 494 REQUEST_HEADER_TOO_LARGE.
-- This strips base64 image strings from JWT session payloads.
-- ==============================================================================

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'avatar_url' - 'avatar'
WHERE raw_user_meta_data->>'avatar_url' LIKE 'data:%'
   OR raw_user_meta_data->>'avatar' LIKE 'data:%';

-- Ensure public.profiles table also has clean URLs
UPDATE public.profiles
SET avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
WHERE avatar_url LIKE 'data:%';
