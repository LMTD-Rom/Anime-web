import os
import requests
import time
from dotenv import load_dotenv
from scrapers.anoboy import scrape_historic_anime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def fix_database():
    print("Fetching 10 pages of Update Terbaru from Anoboy to find active Ongoing anime...")
    urls = scrape_historic_anime(max_pages=10)
    
    # Extract slugs from URLs
    slugs = []
    for url in urls:
        # e.g., https://anoboy7.com/2026/03/kimetsu-no-yaiba/ -> kimetsu-no-yaiba
        parts = url.rstrip('/').split('/')
        if len(parts) > 0:
            slugs.append(parts[-1])
            
    print(f"Found {len(slugs)} active anime slugs. Patching database...")
    
    # We will patch the database in batches
    BATCH_SIZE = 50
    success = 0
    
    for i in range(0, len(slugs), BATCH_SIZE):
        batch = slugs[i:i+BATCH_SIZE]
        
        # We want to set status = 'Ongoing' for all slugs in this batch
        # Supabase REST API doesn't support bulk PATCH with different values easily, 
        # but we can do an IN query to patch multiple rows with the SAME value:
        in_query = ",".join(batch)
        patch_url = f"{SUPABASE_URL}/rest/v1/animes?slug=in.({in_query})"
        
        r = requests.patch(patch_url, headers=HEADERS, json={"status": "Ongoing"})
        if r.status_code in (200, 204):
            success += len(batch)
            print(f"  -> Patched {success}/{len(slugs)}")
        else:
            print(f"  [ERROR] {r.status_code} {r.text[:200]}")
            
    print(f"Done! Set 'Ongoing' status for {success} anime.")

if __name__ == "__main__":
    fix_database()
