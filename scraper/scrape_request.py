"""
Script untuk scrape anime dari database scraper_queue (tabel Supabase).
Mengecek task yang berstatus 'pending', lalu menjalankan scraper untuk masing-masing.

Jalankan: python scraper/scrape_request.py
"""
import sys
import os
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.anoboy import scrape_anime_detail, scrape_episode_sources, get_soup, BASE_URL
from db import upsert_anime, upsert_episode, sb_post, sb_get, sb_patch

# Tanggal lama biar tidak muncul di Home/Terbaru (set ke masa lalu)
OLD_DATE = "2022-01-01T00:00:00+00:00"

# ══════════════════════════════════════════════════════════

def fetch_pending_tasks():
    """Ambil semua task dari scraper_queue yang statusnya 'pending'."""
    tasks = sb_get("scraper_queue", "?status=eq.pending&order=created_at.asc")
    return tasks if tasks else []


def update_task_status(task_id, status, error_message=None):
    """Update status task di scraper_queue."""
    payload = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if error_message:
        payload["error_message"] = error_message
    sb_patch("scraper_queue", payload, f"id=eq.{task_id}")


def scrape_and_save(task):
    """Scrape satu anime dari task queue dan simpan ke database."""
    task_id = task["id"]
    name = task.get("title", "Unknown")
    url = task.get("url", "")

    print(f"\n{'='*50}")
    print(f"  Scraping: {name}")
    print(f"  URL: {url}")
    print(f"{'='*50}")

    if not url:
        print(f"  [!] URL kosong untuk task '{name}'")
        update_task_status(task_id, "failed", "URL kosong")
        return False

    # Mark as processing
    update_task_status(task_id, "processing")

    try:
        data = scrape_anime_detail(url, schedule_map={}, ongoing_slugs=set())
        if not data:
            raise Exception(f"Gagal scrape detail dari {url}. Cek apakah URL-nya benar.")

        anime = data["anime"]
        episodes = data["episodes"]

        # Override updated_at biar tidak muncul di Home/Terbaru
        anime["updated_at"] = OLD_DATE
        # Pastikan status Completed (bukan Ongoing)
        if anime.get("status") == "Ongoing":
            anime["status"] = "Completed"

        print(f"  Title   : {anime['title']}")
        print(f"  Status  : {anime['status']}")
        print(f"  Genres  : {anime['genres']}")
        print(f"  Episodes: {len(episodes)}")

        # Simpan anime ke DB
        anime_id = upsert_anime(anime)
        if not anime_id:
            raise Exception(f"Gagal simpan anime ke DB: {name}")
        print(f"  [OK] Anime disimpan (id: {anime_id})")

        # Simpan episodes + sources
        saved_eps = 0
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

            # Scrape sources pakai source_url dari scraper
            sources = scrape_episode_sources(ep["source_url"])
            for src in sources:
                src["episode_id"] = ep_id
                existing = sb_get("video_sources", f"?episode_id=eq.{ep_id}&provider_name=eq.{src['provider_name']}&select=id")
                if not existing:
                    sb_post("video_sources", src)

            saved_eps += 1
            print(f"    Ep {ep['episode_no']:3d} OK  ({len(sources)} sources) [{i+1}/{total_eps}]", end="\r")
            time.sleep(0.4)  # polite delay

        print(f"\n  [OK] {saved_eps}/{total_eps} episode disimpan untuk {name}")

        # Mark as completed
        update_task_status(task_id, "completed")
        return True

    except Exception as e:
        print(f"\n  [!] Error: {str(e)}")
        update_task_status(task_id, "failed", str(e))
        return False


if __name__ == "__main__":
    print("\n=== Sukinime - Scrape Request (from Database Queue) ===\n")

    # Cek pending tasks dari database
    pending = fetch_pending_tasks()

    if not pending:
        print("  Tidak ada task pending di scraper_queue.")
        print("  Tambahkan task lewat Sukinime Dev Dashboard, lalu jalankan ulang script ini.\n")
        sys.exit(0)

    print(f"  Ditemukan {len(pending)} task pending:\n")
    for i, task in enumerate(pending, 1):
        print(f"    {i}. {task.get('title', '???')} — {task.get('url', '???')}")

    print()

    success = 0
    for idx, task in enumerate(pending, 1):
        print(f"\n[{idx}/{len(pending)}]", end="")
        ok = scrape_and_save(task)
        if ok:
            success += 1
        time.sleep(1)

    print(f"\n{'='*50}")
    print(f"[DONE] {success}/{len(pending)} anime berhasil disimpan.")
    print("   Anime tidak akan muncul di Home/Terbaru karena updated_at diset ke masa lalu.")
    print("   Tapi bisa dicari via Search dan ditemukan di halaman Genre.\n")
