import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

r = requests.get(f"{url}/rest/v1/animes?limit=3", headers=headers)
print(f"Status: {r.status_code}")
print(r.text[:500])
