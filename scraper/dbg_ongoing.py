import os, requests
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

r = requests.get(f"{SUPABASE_URL}/rest/v1/animes?status=eq.Ongoing&select=title", headers=HEADERS)
animes = r.json()
print(f"Total Ongoing: {len(animes)}")
for a in animes:
    print(a['title'])
