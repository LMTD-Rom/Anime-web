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
import re

from scrapers.anoboy import (
    scrape_home_updates,
    scrape_popular,
    scrape_movies,
    scrape_genres,
    scrape_anime_detail,
    scrape_episode_sources,
    scrape_historic_anime,
)
from db import sync_all, upsert_video_sources, sb_get
from jadwal_updater import update_jadwal


BATCH = 5

def run_anoboy(limit=None):
    print("=== Sukinime Scraper — Anoboy Primary ===\n")
    
    from scrapers.anoboy import get_jadwal
    # Restore Anoboy jadwal fetching to correctly identify Ongoing series
    schedule_map, ongoing_slugs = get_jadwal()
    
    # 2. Define category processing order
    category_configs = [
        ("Update Terbaru", lambda: scrape_historic_anime(max_pages=2)), # Reduced to 2 pages per user request
        ("Anime 2018 - Sekarang", lambda: scrape_historic_anime(max_pages=15)),
        ("Movie 2020 - Sekarang", lambda: scrape_movies(max_pages=3)),
        ("Popular", lambda: scrape_popular())
    ]
    
    global_ongoing_slugs = set()
    
    # Pre-load existing Ongoing anime from DB so they aren't marked Completed by historic scrapes
    db_ongoing = sb_get("animes", "?select=slug&status=eq.Ongoing")
    if db_ongoing:
        for row in db_ongoing:
            if 'slug' in row:
                global_ongoing_slugs.add(row['slug'])
        print(f"[*] Pre-loaded {len(global_ongoing_slugs)} 'Ongoing' anime from database to protect their status.")
        
    # Process each category
    for cat_name, fetch_func in category_configs:
        urls = fetch_func()
        if limit:
            urls = urls[:limit]
            
        # Deduplicate to prevent Postgres ON CONFLICT batch errors if Anoboy has duplicated thumbnails
        urls = list(dict.fromkeys(urls))
            
        total = len(urls)
        if total == 0:
            continue
            
        print(f"\n--- Scraping Category: {cat_name} ({total} anime) ---")
        all_data = []
        success = 0
        for i, url in enumerate(urls):
            print(f"[{i+1}/{total}] {url.rstrip('/').split('/')[-1]}")
            try:
                data = scrape_anime_detail(url, schedule_map, ongoing_slugs)
                if not data:
                    continue
                
                # --- YEAR FILTERING LOGIC ---
                release_date = data['anime'].get('release_date', '')
                year_match = re.search(r'\b(20\d\d)\b', release_date)
                year = int(year_match.group(1)) if year_match else 9999
                
                if cat_name == "Anime 2018 - Sekarang" and year < 2018:
                    print(f"    -> [Skip] Release year {year} is older than 2018 limit.")
                    continue
                if cat_name == "Movie 2020 - Sekarang" and year < 2020:
                    print(f"    -> [Skip] Movie release year {year} is older than 2020 limit.")
                    continue
                # ---------------------------

                # Append the category to genres and ensure status is Ongoing
                if cat_name == "Update Terbaru":
                    if "Update Terbaru" not in data['anime']['genres']:
                        data['anime']['genres'].append("Update Terbaru")
                    data['anime']['status'] = "Ongoing"
                    global_ongoing_slugs.add(data['anime']['slug'])
                    
                elif cat_name == "Popular":
                    if "Popular" not in data['anime']['genres']:
                        data['anime']['genres'].append("Popular")
                    data['anime']['status'] = "Ongoing"
                    global_ongoing_slugs.add(data['anime']['slug'])

                elif "Movie" in cat_name:
                    if "Movie" not in data['anime']['genres']:
                        data['anime']['genres'].append("Movie")
                    data['anime']['status'] = "Completed"
                    
                # PROTECT ONGOING STATUS: If it was marked ongoing in a previous category (like Update Terbaru), keep it ongoing
                elif data['anime']['slug'] in global_ongoing_slugs:
                    data['anime']['status'] = "Ongoing"
                    
                all_data.append(data)
                success += 1
            except Exception as e:
                print(f"  ERROR: {e}")
            time.sleep(0.3)

        # Sync all collected data in REVERSE order (oldest first, newest last)
        # This ensures the newest items (processed last) get the latest timestamps in DB.
        if all_data:
            to_sync = list(reversed(all_data))
            print(f"\n  -> Syncing {len(to_sync)} anime to DB in chronological order...")
            for j in range(0, len(to_sync), BATCH):
                chunk = to_sync[j:j+BATCH]
                synced = sync_all(chunk)
                if synced:
                    _scrape_video_sources(synced)

        print(f"Done category {cat_name}: {success}/{total} anime saved.")

def _scrape_video_sources(anime_episode_map):
    """
    anime_episode_map: {episode_id: source_url, ...}
    Scrape video sources from episode page and upsert.
    """
    if not anime_episode_map: return
    print(f"  -> Scraping {len(anime_episode_map)} episode sources...")
    
    for episode_id, ep_url in anime_episode_map.items():
        if not ep_url: continue
        try:
            sources = scrape_episode_sources(ep_url)
            if sources:
                upsert_video_sources(episode_id, sources)
                print(f"  [OK] {len(sources)} sources for ep {episode_id[:8]}...")
        except Exception as e:
            print(f"  WARN video sources: {e}")
        time.sleep(0.2)

if __name__ == '__main__':
    limit = None
    if '--limit' in sys.argv:
        idx = sys.argv.index('--limit')
        limit = int(sys.argv[idx + 1])
    
    run_anoboy(limit)
    
    # Update frontend schedule JSON after scraping
    update_jadwal()
