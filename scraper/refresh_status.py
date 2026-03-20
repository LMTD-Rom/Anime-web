#!/usr/bin/env python3
"""
refresh_status.py -- Re-scrape status for all animes from their source page.

Masalah: beberapa anime di DB statusnya salah (Popular ongoing padahal sudah selesai,
atau Update Terbaru yang sudah selesai tetap Ongoing).

Script ini:
1. Ambil semua anime dari DB (filter by category jika perlu)
2. Scrape halaman Anoboy-nya untuk baca status terbaru
3. Patch status di DB sesuai hasil scraping

Jalankan:
  python refresh_status.py           -- semua anime
  python refresh_status.py --popular -- hanya Popular anime
  python refresh_status.py --all     -- semua (sama dengan tanpa flag)
"""
import os
import sys
import re
import time
import requests
import threading
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

BASE_URL = "https://anoboy7.com"


# ── Jadwal (ongoing slugs) ─────────────────────────────────────────

def get_jadwal_slugs():
    """Return set of slugs that are actively airing (from Anoboy jadwal page)."""
    scraper = _make_scraper()
    try:
        r = scraper.get(f"{BASE_URL}/jadwal/", timeout=15)
        if r.status_code != 200:
            return set()
    except Exception:
        return set()

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(r.text, 'html.parser')
    slugs = set()
    for a in soup.find_all('a', href=True):
        href = a.get('href', '')
        if '/anime/' in href:
            slug = href.rstrip('/').split('/')[-1]
            slugs.add(slug)
    print(f"[Jadwal] {len(slugs)} ongoing slugs found")
    return slugs


def _make_scraper():
    import cloudscraper
    return cloudscraper.create_scraper()


# ── Status from page ───────────────────────────────────────────────

def get_status_from_page(slug, ongoing_slugs, scraper):
    """
    Scrape anoboy anime page, determine status.
    Priority: jadwal (definitively Ongoing) > page text > default Completed.
    """
    if slug in ongoing_slugs:
        return "Ongoing"

    url = f"{BASE_URL}/anime/{slug}/"
    try:
        r = scraper.get(url, timeout=15)
        if r.status_code != 200:
            return None  # skip if page not found
    except Exception:
        return None

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(r.text, 'html.parser')
    body_lower = soup.get_text(' ', strip=True).lower()

    # Look for status near the word "status"
    if 'status' in body_lower:
        idx = body_lower.find('status')
        snippet = body_lower[idx:idx+80]
        if 'ongoing' in snippet:
            return "Ongoing"
        elif 'completed' in snippet or 'finished' in snippet or 'tamat' in snippet:
            return "Completed"

    # Try all short tags for status keywords
    for tag in soup.find_all(['td', 'li', 'span', 'b', 'strong', 'div']):
        t = tag.get_text(' ', strip=True).lower()
        if len(t) > 60:
            continue
        if 'ongoing' in t:
            return "Ongoing"
        if 'completed' in t or 'finished' in t or 'tamat' in t:
            return "Completed"

    return "Completed"  # safe default if nothing found


# ── Main ───────────────────────────────────────────────────────────

def main():
    only_popular = '--popular' in sys.argv
    category_name = "Popular" if only_popular else "all"
    print(f"=== Refresh Status ({category_name}) ===\n")

    # 1. Get ongoing slugs from jadwal
    ongoing_slugs = get_jadwal_slugs()

    # 2. Fetch anime list from DB
    if only_popular:
        url = f"{SUPABASE_URL}/rest/v1/animes?genres=cs.{{\"Popular\"}}&select=id,slug,title,status,source_url"
    else:
        url = f"{SUPABASE_URL}/rest/v1/animes?select=id,slug,title,status,source_url&limit=1000"

    r = requests.get(url, headers=HEADERS)
    if r.status_code != 200:
        print(f"[ERROR] {r.status_code} {r.text[:200]}")
        return

    animes = r.json()
    print(f"Found {len(animes)} anime to check.\n")

    scraper = _make_scraper()
    updated = 0
    skipped = 0
    errors = 0

    for i, anime in enumerate(animes):
        slug = anime['slug']
        current_status = anime.get('status', 'Completed')
        title = anime.get('title', slug)[:50]

        new_status = get_status_from_page(slug, ongoing_slugs, scraper)

        if new_status is None:
            print(f"[{i+1}/{len(animes)}] SKIP (page not found): {title}")
            skipped += 1
            time.sleep(0.3)
            continue

        if new_status == current_status:
            print(f"[{i+1}/{len(animes)}] OK ({current_status}): {title}")
            skipped += 1
        else:
            print(f"[{i+1}/{len(animes)}] UPDATE {current_status} -> {new_status}: {title}")
            patch = requests.patch(
                f"{SUPABASE_URL}/rest/v1/animes?slug=eq.{slug}",
                headers=HEADERS,
                json={"status": new_status},
            )
            if patch.status_code in (200, 201, 204):
                updated += 1
            else:
                print(f"  [FAIL] {patch.status_code} {patch.text[:100]}")
                errors += 1

        time.sleep(0.5)

    print(f"\n=== Done: {updated} updated, {skipped} already correct, {errors} errors ===")


if __name__ == "__main__":
    main()
