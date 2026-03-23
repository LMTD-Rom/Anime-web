import os, requests
from dotenv import load_dotenv
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
r = requests.get(f"{SUPABASE_URL}/rest/v1/animes?genres=cs.{{\"Popular\"}}&select=title,status,genres", headers=HEADERS)
for a in r.json():
    print(f"{a['title'][:30]}: {a['status']}")
