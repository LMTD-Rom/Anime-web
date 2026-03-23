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
    print("Fixing updated_at for all anime based on latest episode...")
    
    # 1. Get all anime IDs
    r = requests.get(f"{SUPABASE_URL}/rest/v1/animes?select=id,created_at,title", headers=HEADERS)
    if r.status_code != 200:
        print("Error fetching anime")
        return
    animes = r.json()
    print(f"Found {len(animes)} anime")

    updated = 0
    
    for i, a in enumerate(animes):
        a_id = a['id']
        # Get latest episode for this anime
        ep_req = requests.get(
            f"{SUPABASE_URL}/rest/v1/episodes?anime_id=eq.{a_id}&order=episode_no.desc&limit=1&select=created_at",
            headers=HEADERS
        )
        if ep_req.status_code == 200:
            eps = ep_req.json()
            if eps:
                best_time = eps[0]['created_at']
            else:
                best_time = a['created_at']
                
            # Update anime's updated_at
            patch = requests.patch(
                f"{SUPABASE_URL}/rest/v1/animes?id=eq.{a_id}",
                headers=HEADERS,
                json={"updated_at": best_time}
            )
            if patch.status_code in (200, 204):
                updated += 1
                if updated % 50 == 0:
                    print(f"  Fixed {updated}/{len(animes)} anime...")

    print(f"Done! Fixed {updated} anime updated_at timestamps.")

if __name__ == "__main__":
    main()
