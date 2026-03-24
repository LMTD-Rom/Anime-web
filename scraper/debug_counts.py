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

# Ongoing excluding Popular
r1 = requests.get(f"{url}/rest/v1/animes?select=id&status=eq.Ongoing&genres=not.cs.%7B%22Popular%22%7D", headers=headers)
print(f"Ongoing excluding Popular count: {len(r1.json())}")

# All Ongoing
r2 = requests.get(f"{url}/rest/v1/animes?select=id&status=eq.Ongoing", headers=headers)
print(f"All Ongoing count: {len(r2.json())}")

# All anime
r3 = requests.get(f"{url}/rest/v1/animes?select=id", headers=headers)
print(f"Total anime: {len(r3.json())}")
