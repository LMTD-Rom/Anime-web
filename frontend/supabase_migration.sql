-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Script ini aman dijalankan berulang kali (idempotent)

-- ═══════════════════════════════════════════════
-- TABLE: user_watchlist
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_watchlist (
    id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug          text NOT NULL,
    title         text NOT NULL,
    cover_url     text,
    genres        text[] DEFAULT '{}',
    episode_count integer DEFAULT 0,
    added_at      timestamptz DEFAULT now(),
    UNIQUE (user_id, slug)
);
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "watchlist_owner" ON user_watchlist;
CREATE POLICY "watchlist_owner" ON user_watchlist
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════
-- TABLE: watch_history
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS watch_history (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    episode_id  uuid NOT NULL,
    anime_slug  text NOT NULL,
    anime_title text NOT NULL,
    cover_url   text,
    episode_no  integer NOT NULL,
    watched_at  timestamptz DEFAULT now(),
    UNIQUE (user_id, episode_id)
);
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "history_owner" ON watch_history;
CREATE POLICY "history_owner" ON watch_history
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ═══════════════════════════════════════════════
-- TABLE: profiles
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
    id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    avatar_url   text,
    updated_at   timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_owner" ON profiles;
CREATE POLICY "profiles_owner" ON profiles
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Auto-create profile row saat user baru sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════
-- STORAGE: avatars bucket
-- ═══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatar_upload" ON storage.objects;
CREATE POLICY "avatar_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatar_update" ON storage.objects;
CREATE POLICY "avatar_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatar_delete" ON storage.objects;
CREATE POLICY "avatar_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
CREATE POLICY "avatar_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
