import sys
from main import sync_all, _scrape_video_sources
from scrapers.anoboy import scrape_home_updates, scrape_anime_detail, get_jadwal
import datetime

def restore_terbaru():
    print("Fetching Home Updates...")
    links = scrape_home_updates()
    print(f"Found {len(links)} links. Scraping...")
    
    schedule_map, ongoing_slugs = get_jadwal()
    batch = []
    
    for i, url in enumerate(links):
        print(f"[{i+1}/{len(links)}] {url.split('/')[-2]}")
        data = scrape_anime_detail(url, schedule_map, ongoing_slugs)
        if data:
            if "Update Terbaru" not in data['anime']['genres']:
                data['anime']['genres'].append("Update Terbaru")
            data['anime']['updated_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
            batch.append(data)
            
    if batch:
        print(f"Syncing {len(batch)} anime to DB...")
        synced = sync_all(batch)
        if synced:
            _scrape_video_sources(synced)

if __name__ == "__main__":
    restore_terbaru()
