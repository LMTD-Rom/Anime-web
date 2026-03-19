import sys
import os
sys.stdout = open('out.txt', 'w', encoding='utf-8')
sys.stderr = sys.stdout

import requests
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("URL:", url)
print("KEY:", (key or "")[:30])

headers = {
    "apikey": key,
    "Authorization": "Bearer " + (key or ""),
    "Content-Type": "application/json",
    "Prefer": "return=representation,resolution=merge-duplicates"
}

# READ
try:
    r = requests.get(url + "/rest/v1/animes?limit=2&select=id,title", headers=headers, timeout=10)
    print("READ status:", r.status_code)
    print("READ body:", r.text[:300])
except Exception as e:
    print("READ error:", str(e))

# INSERT test
payload = {
    "title": "Debug Test Anime",
    "slug": "debug-test-anime-001",
    "status": "Completed",
    "genres": ["Action"],
    "episode_count": 0,
    "source_origin": "debug"
}
try:
    r2 = requests.post(url + "/rest/v1/animes", headers=headers, json=payload, timeout=10)
    print("INSERT status:", r2.status_code)
    print("INSERT body:", r2.text[:400])
except Exception as e:
    print("INSERT error:", str(e))

sys.stdout.flush()
sys.stdout.close()
