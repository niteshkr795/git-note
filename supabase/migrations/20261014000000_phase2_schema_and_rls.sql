-- ==============================================================================
-- GitNote — Phase 2: PostgreSQL Database Design, Triggers, and RLS Policies
-- ==============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLE: profiles
-- Linked directly to Supabase auth.users with automatic synchronization
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    college TEXT NOT NULL DEFAULT 'SRMCEM Lucknow',
    branch TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    semester TEXT NOT NULL DEFAULT 'Semester 4',
    bio TEXT DEFAULT 'Engineering student sharing academic notes and exam solutions.',
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    reputation_points INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_sem ON public.profiles(branch, semester);

-- ==============================================================================
-- 2. TABLE: subjects
-- Academic subjects classified by branch and semester
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT,
    name TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    semester TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_subject_name_sem_branch UNIQUE (name, semester, branch)
);

CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_name ON public.subjects(name);

-- ==============================================================================
-- 3. TABLE: resources
-- Core academic sharing unit (PYQs, Notes, Assignments, Lab Manuals)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('PYQ', 'Notes', 'Assignment', 'Lab Manual', 'Study Material')),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    subject_name TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2024-25',
    file_format TEXT NOT NULL DEFAULT 'PDF' CHECK (file_format IN ('PDF', 'DOCX', 'ZIP')),
    file_size TEXT DEFAULT '1.0 MB',
    file_size_bytes BIGINT DEFAULT 1048576,
    storage_path TEXT,
    page_count INTEGER,
    download_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Essential query performance indexes
CREATE INDEX IF NOT EXISTS idx_resources_uploader ON public.resources(uploader_id);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON public.resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject_name);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_downloads ON public.resources(download_count DESC);

-- ==============================================================================
-- 4. TABLE: bookmarks
-- User saved library items with duplicate prevention
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_resource_bookmark UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON public.bookmarks(resource_id);

-- ==============================================================================
-- 5. TABLE: download_activity (Optional audit & metrics tracking)
-- Logs resource downloads while incrementing counter atomically
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.download_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_hash TEXT,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_download_activity_resource ON public.download_activity(resource_id);
CREATE INDEX IF NOT EXISTS idx_download_activity_user ON public.download_activity(user_id);

-- ==============================================================================
-- 6. AUTOMATION TRIGGERS: User Synchronization & Timestamp Management
-- ==============================================================================

-- A. Auto-create Profile when a new user signs up via Email or Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        college,
        branch,
        semester,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Student Contributor'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'college', 'SRMCEM Lucknow'),
        COALESCE(NEW.raw_user_meta_data->>'branch', 'Computer Science & Engineering'),
        COALESCE(NEW.raw_user_meta_data->>'semester', 'Semester 4'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_resources_updated_at ON public.resources;
CREATE TRIGGER trigger_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- C. Atomic Download Counter Function
CREATE OR REPLACE FUNCTION public.increment_resource_downloads(resource_id_param UUID, user_id_param UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.resources
    SET download_count = download_count + 1
    WHERE id = resource_id_param;

    INSERT INTO public.download_activity (resource_id, user_id)
    VALUES (resource_id_param, user_id_param);
END;
$$;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict access control for security and multi-tenant student safety
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_activity ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone (authenticated or public) can view student contributor profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (trigger is security definer, but allows client fallback)
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SUBJECTS POLICIES
-- ------------------------------------------------------------------------------
-- Subjects are readable by everyone
CREATE POLICY "Subjects are viewable by everyone"
    ON public.subjects FOR SELECT
    USING (true);

-- Authenticated users can suggest/add a subject
CREATE POLICY "Authenticated users can create subjects"
    ON public.subjects FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- RESOURCES POLICIES
-- ------------------------------------------------------------------------------
-- Any visitor can view academic resources
CREATE POLICY "Resources are viewable by everyone"
    ON public.resources FOR SELECT
    USING (true);

-- Authenticated students can upload resources under their own id
CREATE POLICY "Authenticated students can upload resources"
    ON public.resources FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = uploader_id);

-- Students can ONLY update resources they created
CREATE POLICY "Students can update their own resources"
    ON public.resources FOR UPDATE
    TO authenticated
    USING (auth.uid() = uploader_id)
    WITH CHECK (auth.uid() = uploader_id);

-- Students can ONLY delete resources they created
CREATE POLICY "Students can delete their own resources"
    ON public.resources FOR DELETE
    TO authenticated
    USING (auth.uid() = uploader_id);

-- ------------------------------------------------------------------------------
-- BOOKMARKS POLICIES
-- ------------------------------------------------------------------------------
-- Students can only view their own saved bookmarks
CREATE POLICY "Students can view their own bookmarks"
    ON public.bookmarks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Students can save a resource to their bookmarks
CREATE POLICY "Students can create bookmarks"
    ON public.bookmarks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Students can remove their own bookmarks
CREATE POLICY "Students can delete their own bookmarks"
    ON public.bookmarks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DOWNLOAD ACTIVITY POLICIES
-- ------------------------------------------------------------------------------
-- Anyone can record a download (for analytics)
CREATE POLICY "Anyone can log download activity"
    ON public.download_activity FOR INSERT
    WITH CHECK (true);

-- Students can view their own download history
CREATE POLICY "Students can view their own download history"
    ON public.download_activity FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. INITIAL SUBJECT SEED DATA
-- Populate standard curriculum subjects from GitNote design
-- ==============================================================================
INSERT INTO public.subjects (name, branch, semester)
VALUES
    ('Data Structures & Algorithms', 'Computer Science & Engineering', 'Semester 3'),
    ('Engineering Mathematics III', 'Computer Science & Engineering', 'Semester 3'),
    ('Digital Electronics & Logic Design', 'Computer Science & Engineering', 'Semester 3'),
    ('Operating Systems', 'Computer Science & Engineering', 'Semester 4'),
    ('Theory of Computation', 'Computer Science & Engineering', 'Semester 4'),
    ('Object Oriented Programming in Java', 'Computer Science & Engineering', 'Semester 4'),
    ('Database Management Systems', 'Computer Science & Engineering', 'Semester 5'),
    ('Compiler Design', 'Computer Science & Engineering', 'Semester 5'),
    ('Computer Networks', 'Computer Science & Engineering', 'Semester 5'),
    ('Software Engineering & Agile', 'Computer Science & Engineering', 'Semester 6'),
    ('Machine Learning & AI', 'Computer Science & Engineering', 'Semester 6'),
    ('Cloud Computing & Distributed Systems', 'Computer Science & Engineering', 'Semester 7'),
    ('Cryptography & Network Security', 'Computer Science & Engineering', 'Semester 7')
ON CONFLICT (name, semester, branch) DO NOTHING;
