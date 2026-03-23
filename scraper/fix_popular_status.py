#!/usr/bin/env python3
"""
fix_popular_status.py -- Correct status for Popular anime in DB.
Specifically handles the case where finished popular anime stay 'Ongoing'.
"""
import os
import sys
import requests
import cloudscraper
from bs4 import BeautifulSoup
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

def get_ongoing_slugs():
    scraper = cloudscraper.create_scraper()
    try:
        r = scraper.get(f"{BASE_URL}/jadwal/", timeout=15)
        if r.status_code != 200: return set()
        soup = BeautifulSoup(r.text, 'html.parser')
        slugs = set()
        for a in soup.find_all('a', href=True):
            if '/anime/' in a['href']:
                slug = a['href'].rstrip('/').split('/')[-1]
                slugs.add(slug)
        return slugs
    except:
        return set()

def main():
    print("Checking Jadwal for ongoing anime...")
    ongoing_slugs = get_ongoing_slugs()
    print(f"Found {len(ongoing_slugs)} ongoing slugs from jadwal.")

    print("Fetching Popular anime from DB...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/animes?genres=cs.{{\"Popular\"}}&select=id,slug,title,status", headers=HEADERS)
    if r.status_code != 200:
        print(f"Error fetching: {r.status_code}")
        return

    animes = r.json()
    print(f"Checking {len(animes)} popular anime...")

    updated = 0
    for anime in animes:
        slug = anime['slug']
        current = anime['status']
        # If it's not in jadwal, we check if it's currently Ongoing and should be Completed
        # OR if it's currently Completed and should be Ongoing (rare for popular unless it's new)
        
        # User said: popular often wrongly show ONGOING.
        if slug not in ongoing_slugs and current == "Ongoing":
            # If it's NOT in jadwal, it's completed.
            print(f"Updating {slug} -> Completed")
            requests.patch(f"{SUPABASE_URL}/rest/v1/animes?slug=eq.{slug}", headers=HEADERS, json={"status": "Completed"})
            updated += 1

    print(f"Done. Updated {updated} popular anime to Completed.")

if __name__ == "__main__":
    main()
