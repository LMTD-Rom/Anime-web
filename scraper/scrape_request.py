"""
Script khusus untuk scrape anime tertentu dari Anoboy dan memasukkannya ke database
dengan updated_at lama (agar tidak muncul di Home/Terbaru).

Jalankan: python scraper/scrape_request.py
"""
import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.anoboy import scrape_anime_detail, scrape_episode_sources, get_soup, BASE_URL
from db import upsert_anime, upsert_episode, sb_post, sb_get

# ══════════════════════════════════════════════════════════
# LIST ANIME YANG MAU DI-SCRAPE (pakai full URL langsung)
# ══════════════════════════════════════════════════════════
TARGET_ANIME = [
    {
        "name":  "5-toubun no Hanayome S1",
        "url":   "https://anoboy7.com/anime/5-toubun-no-hanayome/",
        "slug":  None,  # pakai slug dari Anoboy
    },
    {
        "name":  "5-toubun no Hanayome S2",
        "url":   "https://anoboy7.com/anime/5-toubun-no-hanayome-\u222c/",
        "slug":  "5-toubun-no-hanayome-s2",  # override: hapus karakter Unicode
    },
    {
        "name":  "5-toubun no Hanayome Movie",
        "url":   "https://anoboy7.com/anime/5-toubun-no-hanayome-movie/",
        "slug":  None,
    },
    {
        "name":  "5-toubun no Hanayome Special",
        "url":   "https://anoboy7.com/anime/5-toubun-no-hanayome\u223d/",
        "slug":  "5-toubun-no-hanayome-special",  # override
    },
]

# Tanggal lama biar tidak muncul di Home/Terbaru (set ke tahun kapan anime itu keluar)
OLD_DATE = "2022-01-01T00:00:00+00:00"

# ══════════════════════════════════════════════════════════

def scrape_and_save(name, url, slug_override):
    print(f"\n{'='*50}")
    print(f"  Scraping: {name}")
    print(f"  URL: {url}")
    print(f"{'='*50}")

    data = scrape_anime_detail(url, schedule_map={}, ongoing_slugs=set())
    if not data:
        print(f"  [!] Gagal scrape {name} dari {url}")
        print(f"  [!] Coba cek apakah slug-nya benar di browser.")
        return False

    anime = data["anime"]
    episodes = data["episodes"]

    # Override updated_at biar tidak muncul di Home/Terbaru
    anime["updated_at"] = OLD_DATE
    # Pastikan status Completed (bukan Ongoing)
    if anime.get("status") == "Ongoing":
        anime["status"] = "Completed"

    # Override slug kalau ada spesial karakter Unicode
    if slug_override:
        anime["slug"] = slug_override

    print(f"  Title   : {anime['title']}")
    print(f"  Status  : {anime['status']}")
    print(f"  Genres  : {anime['genres']}")
    print(f"  Episodes: {len(episodes)}")

    # Simpan anime ke DB
    anime_id = upsert_anime(anime)
    if not anime_id:
        print(f"  [!] Gagal simpan anime ke DB: {name}")
        return False
    print(f"  [OK] Anime disimpan (id: {anime_id})")

    # Simpan episodes + sources
    saved_eps = 0
    for ep in episodes:
        ep_data = {
            "anime_id": anime_id,
            "episode_no": ep["episode_no"],
            "title": ep["title"],
            # source_url tidak ada di tabel episodes, hanya dipakai untuk scrape sources
        }
        ep_id = upsert_episode(ep_data)
        if not ep_id:
            continue

        # Scrape sources pakai source_url dari scraper (bukan dari DB)
        sources = scrape_episode_sources(ep["source_url"])
        for src in sources:
            src["episode_id"] = ep_id
            existing = sb_get("video_sources", f"?episode_id=eq.{ep_id}&provider_name=eq.{src['provider_name']}&select=id")
            if not existing:
                sb_post("video_sources", src)

        saved_eps += 1
        print(f"    Ep {ep['episode_no']:3d} OK  ({len(sources)} sources)", end="\r")
        time.sleep(0.4)  # polite delay

    print(f"\n  [OK] {saved_eps}/{len(episodes)} episode disimpan untuk {name}")
    return True


if __name__ == "__main__":
    print("\n=== Sukinime - Targeted Anime Scraper ===")
    print(f"   Target: {len(TARGET_ANIME)} anime\n")

    success = 0
    for idx, item in enumerate(TARGET_ANIME, 1):
        print(f"\n[{idx}/{len(TARGET_ANIME)}]", end="")
        ok = scrape_and_save(item["name"], item["url"], item["slug"])
        if ok:
            success += 1
        time.sleep(1)

    print(f"\n[DONE] {success}/{len(TARGET_ANIME)} anime berhasil disimpan.")
    print("   Anime tidak akan muncul di Home/Terbaru karena updated_at diset ke masa lalu.")
    print("   Tapi bisa dicari via Search dan ditemukan di halaman Genre.\n")
