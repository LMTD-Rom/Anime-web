#!/usr/bin/env python3
"""
fix_status.py -- Update status anime 'Update Terbaru' ke Ongoing di DB.

Logika:
- Anime yang masuk kategori "Update Terbaru" berarti baru di-update (ada episode baru),
  artinya anime tersebut masih ONGOING, bukan Completed.
- Script ini PATCH semua anime dengan genre "Update Terbaru" yg saat ini statusnya "Completed"
  menjadi "Ongoing".

Jalankan: python fix_status.py
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def main():
    print("=== Fix Status: Update Terbaru -> Ongoing ===\n")

    # 1. Fetch anime with "Update Terbaru" in genres that are marked as Completed
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/animes?genres=cs.{{\"Update Terbaru\"}}&status=eq.Completed&select=id,slug,title,status",
        headers=HEADERS,
    )
    if r.status_code != 200:
        print(f"[ERROR] Fetching failed: {r.status_code} {r.text[:300]}")
        return

    animes = r.json()
    print(f"Found {len(animes)} anime with 'Update Terbaru' genre but Completed status.\n")

    if not animes:
        print("Nothing to fix!")
        return

    updated = 0
    failed = 0
    for anime in animes:
        slug = anime['slug']
        title = anime['title']
        print(f"  Updating: {title} ({slug})")

        patch = requests.patch(
            f"{SUPABASE_URL}/rest/v1/animes?slug=eq.{slug}",
            headers=HEADERS,
            json={"status": "Ongoing"},
        )
        if patch.status_code in (200, 201, 204):
            updated += 1
            print(f"    [OK] Done")
        else:
            failed += 1
            print(f"    [FAIL] {patch.status_code} {patch.text[:100]}")

    print(f"\n=== Selesai: {updated} anime diupdate, {failed} gagal ===")

if __name__ == "__main__":
    main()
