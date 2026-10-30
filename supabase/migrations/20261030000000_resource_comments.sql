-- ==============================================================================
-- GitNote: Resource Comments & Discussion Schema and RLS Policies
-- ==============================================================================
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 2. TABLE: resource_comments
CREATE TABLE IF NOT EXISTS public.resource_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource_id ON public.resource_comments(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_user_id ON public.resource_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_created_at ON public.resource_comments(created_at DESC);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trigger_resource_comments_updated_at ON public.resource_comments;
CREATE TRIGGER trigger_resource_comments_updated_at
    BEFORE UPDATE ON public.resource_comments
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow safe re-running
DROP POLICY IF EXISTS "Resource comments are viewable by everyone" ON public.resource_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.resource_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.resource_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.resource_comments;

-- A. SELECT: Everyone (public & authenticated) can view comments on resources
CREATE POLICY "Resource comments are viewable by everyone"
    ON public.resource_comments FOR SELECT
    USING (true);

-- B. INSERT: Authenticated users can insert their own comment
CREATE POLICY "Authenticated users can create comments"
    ON public.resource_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- C. UPDATE: Users can update ONLY their own comments
CREATE POLICY "Users can update their own comments"
    ON public.resource_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- D. DELETE: Users can delete ONLY their own comments
CREATE POLICY "Users can delete their own comments"
    ON public.resource_comments FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
