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

# Check ongoing anime count
r_ongoing = requests.get(f"{url}/rest/v1/animes?status=eq.Ongoing&select=id", headers=headers)
print(f"Ongoing check: {r_ongoing.status_code}")
if r_ongoing.status_code == 200:
    print(f"Ongoing count: {len(r_ongoing.json())}")

# Check all anime count
r_all = requests.get(f"{url}/rest/v1/animes?select=id", headers=headers)
if r_all.status_code == 200:
    print(f"Total count: {len(r_all.json())}")

# Check updated_at format for one anime
r_one = requests.get(f"{url}/rest/v1/animes?limit=1&select=updated_at,created_at", headers=headers)
if r_one.status_code == 200:
    print(f"Sample data: {r_one.json()}")
