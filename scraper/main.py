#!/usr/bin/env python3
"""
Sukinime Dual-Source Scraper
==========================
Primary:   Samehadaku.li  — metadata, episodes, video sources, schedule
Secondary: Anoboy7.com    — alternative cover if Samehadaku cover missing,
                            extra video source mirrors per episode

Usage:
  python main.py               # Scrape ALL anime from Samehadaku
  python main.py --limit 20    # Test with first 20 titles
  python main.py --source anoboy  # Scrape from Anoboy only (legacy)
"""
import sys
import time

from scrapers.anoboy import (
    scrape_home_updates,
    scrape_popular,
    scrape_movies,
    scrape_genres,
    get_jadwal,
    scrape_anime_detail,
    scrape_episode_sources,
)
from db import sync_all, upsert_video_sources

BATCH = 5

def run_anoboy(limit=None):
    print("=== Sukinime Scraper — Anoboy Primary ===\n")
    
    # 1. Get schedule to help identify ongoing status
    schedule_map, ongoing_slugs = get_jadwal()
    
    # 2. Scrape category URLs
    categories = {
        "Update Terbaru": scrape_home_updates(),
        "Popular": scrape_popular(),
        "Movie": scrape_movies(),
        "Genre Picks": scrape_genres(limit_per_genre=10)
    }
    
    # Process each category
    for cat_name, urls in categories.items():
        if limit:
            urls = urls[:limit]
            
        # Deduplicate to prevent Postgres ON CONFLICT batch errors if Anoboy has duplicated thumbnails
        urls = list(dict.fromkeys(urls))
            
        # Reverse to ensure the top-most item on Anoboy's page gets scraped/upserted LAST
        # so it receives the absolute newest updated_at timestamp in the DB
        urls = list(reversed(urls))
        
        total = len(urls)
        if total == 0:
            continue
            
        print(f"\n--- Scraping Category: {cat_name} ({total} anime) ---")
        batch = []
        success = 0
        
        for i, url in enumerate(urls):
            print(f"[{i+1}/{total}] {url.split('/')[-2]}")
            try:
                data = scrape_anime_detail(url, schedule_map, ongoing_slugs)
                if data:
                    # Tag the category in genres so frontend can filter easily
                    # (In a real app, a dedicated 'categories' array might be better, but genres works fine for UI filtering)
                    if cat_name not in data['anime']['genres']:
                        data['anime']['genres'].append(cat_name)
                    
                    batch.append(data)
                    success += 1
            except Exception as e:
                print(f"  ERROR: {e}")
                
            # Flush batch
            if len(batch) >= BATCH or (i == total - 1 and batch):
                print(f"  → Syncing {len(batch)} anime to DB...")
                synced = sync_all(batch)
                
                # Scrape video sources for each episode in batch
                if synced:
                    _scrape_video_sources(synced)
                    
                batch = []
                
            time.sleep(0.3)
            
        print(f"Done category {cat_name}: {success}/{total} anime saved.")

def _scrape_video_sources(anime_episode_map):
    """
    anime_episode_map: {episode_id: source_url, ...}
    Scrape video sources from episode page and upsert.
    """
    if not anime_episode_map: return
    print(f"  → Scraping {len(anime_episode_map)} episode sources...")
    
    for episode_id, ep_url in anime_episode_map.items():
        if not ep_url: continue
        try:
            sources = scrape_episode_sources(ep_url)
            if sources:
                upsert_video_sources(episode_id, sources)
                print(f"  ✓ {len(sources)} sources for ep {episode_id[:8]}...")
        except Exception as e:
            print(f"  WARN video sources: {e}")
        time.sleep(0.2)

if __name__ == '__main__':
    limit = None
    if '--limit' in sys.argv:
        idx = sys.argv.index('--limit')
        limit = int(sys.argv[idx + 1])
    
    run_anoboy(limit)
