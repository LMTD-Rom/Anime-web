import time
import os
import sys
from datetime import datetime, timezone

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import sb_get, sb_patch, upsert_anime, upsert_episode, sb_post

# Date to use for manual scrapes (Old date so it stays in Genre menu, not Home/Terbaru)
OLD_DATE = "2022-01-01T00:00:00+00:00"

def process_queue():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking scraper_queue for pending tasks...")
    
    # 1. Get pending tasks
    tasks = sb_get("scraper_queue", "?status=eq.pending&order=created_at.asc&limit=1")
    
    if not tasks:
        return

    task = tasks[0]
    task_id = task['id']
    url = task['url']
    title_req = task['title']

    print(f"🚀 Processing: {title_req} ({url})")
    
    # 2. Mark as processing
    sb_patch("scraper_queue", {"status": "processing", "updated_at": datetime.now(timezone.utc).isoformat()}, f"id=eq.{task_id}")

    try:
        from scrapers.anoboy import scrape_anime_detail, scrape_episode_sources
        
        # 3. Scrape detail
        data = scrape_anime_detail(url, schedule_map={}, ongoing_slugs=set())
        if not data:
            raise Exception(f"Gagal scrape detail dari {url}")

        anime = data["anime"]
        episodes = data["episodes"]

        # Override for "Genre Menu" (Not Terbaru)
        anime["updated_at"] = OLD_DATE
        if anime.get("status") == "Ongoing":
            anime["status"] = "Completed"

        # 4. Upsert Anime
        anime_id = upsert_anime(anime)
        if not anime_id:
            raise Exception("Gagal upsert anime ke database")

        # 5. Upsert Episodes & Sources
        total_eps = len(episodes)
        for i, ep in enumerate(episodes):
            ep_data = {
                "anime_id": anime_id,
                "episode_no": ep["episode_no"],
                "title": ep["title"],
            }
            ep_id = upsert_episode(ep_data)
            if not ep_id:
                continue

            # Scrape sources
            sources = scrape_episode_sources(ep["source_url"])
            if sources:
                # Clear and insert sources
                # Use environment variables directly for security
                supp_url = os.getenv('SUPABASE_URL')
                supp_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
                headers = {"apikey": supp_key, "Authorization": f"Bearer {supp_key}"}
                import requests
                requests.delete(f"{supp_url}/rest/v1/video_sources?episode_id=eq.{ep_id}", headers=headers)
                
                payloads = [{
                    "episode_id": ep_id,
                    "provider_name": s.get("provider_name", "Unknown"),
                    "video_url": s["video_url"],
                    "quality": s.get("quality", "auto"),
                    "is_embed": s.get("is_embed", True),
                } for s in sources if s.get("video_url")]
                
                if payloads:
                    sb_post("video_sources", payloads)

            print(f"   Progress: {i+1}/{total_eps} episodes done", end="\r")

        # 6. Mark as completed
        sb_patch("scraper_queue", {"status": "completed", "updated_at": datetime.now(timezone.utc).isoformat()}, f"id=eq.{task_id}")
        print(f"\n✅ Successfully processed: {anime['title']}")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sb_patch("scraper_queue", {
            "status": "failed", 
            "error_message": str(e),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, f"id=eq.{task_id}")

if __name__ == "__main__":
    print("=== Sukinime Admin Queue Worker ===")
    print("Watching scraper_queue table for tasks...")
    while True:
        try:
            process_queue()
        except Exception as e:
            print(f"Worker Error: {e}")
        time.sleep(10) # check every 10 seconds
