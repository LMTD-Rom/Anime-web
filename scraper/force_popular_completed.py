import os, requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

# List of anime slugs that should definitely be ongoing
# We can exclude One Piece 
exceptions = ['one-piece']

r = requests.get(f"{SUPABASE_URL}/rest/v1/animes?genres=cs.{{\"Popular\"}}&select=id,slug,title,status", headers=HEADERS)
animes = r.json()

for a in animes:
    if a['slug'] not in exceptions:
        print(f"Fixing {a['title']} to Completed...")
        requests.patch(f"{SUPABASE_URL}/rest/v1/animes?id=eq.{a['id']}", headers=HEADERS, json={"status": "Completed"})
    else:
        print(f"Skipping {a['title']} (Still Ongoing)")

print("Done fixing Popular anime statuses!")
