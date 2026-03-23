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

print(f"URL: {url}")

# Check 'animes' table
r_animes = requests.get(f"{url}/rest/v1/animes?select=count", headers=headers)
print(f"animes check: {r_animes.status_code}")
print(f"animes response: {r_animes.text}")

# Check 'anime' table
r_anime = requests.get(f"{url}/rest/v1/anime?select=count", headers=headers)
print(f"anime check: {r_anime.status_code}")
print(f"anime response: {r_anime.text}")
