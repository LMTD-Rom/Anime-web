-- Drop existing tables if re-running
DROP TABLE IF EXISTS video_sources CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS animes CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: animes (Master Data)
CREATE TABLE animes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_url TEXT,
    status TEXT DEFAULT 'Ongoing',
    rating TEXT,
    genres TEXT[] DEFAULT '{}',           -- Array of genre strings
    schedule_day TEXT,                     -- 'Senin', 'Selasa', etc.
    release_year INT,                      -- Tahun rilis, e.g. 2024
    episode_count INT DEFAULT 0,
    source_origin TEXT,                    -- 'anoboy' or 'samehadaku'
    source_url TEXT,                       -- Original URL for re-scraping
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Table: episodes
CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anime_id UUID REFERENCES animes(id) ON DELETE CASCADE,
    episode_no INT NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(anime_id, episode_no)
);

-- 3. Table: video_sources (Streaming Links)
CREATE TABLE video_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    video_url TEXT NOT NULL,
    quality TEXT DEFAULT '720p',
    is_embed BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_sources ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Enable Read for All" ON animes FOR SELECT USING (true);
CREATE POLICY "Enable Read for All" ON episodes FOR SELECT USING (true);
CREATE POLICY "Enable Read for All" ON video_sources FOR SELECT USING (true);
