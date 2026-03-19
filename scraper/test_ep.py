import cloudscraper
from bs4 import BeautifulSoup
import sys

sys.stdout = open('test_ep.log', 'w', encoding='utf-8')

# Grab a known episode URL to see the iframe structure
url = "https://anoboy7.com/tamon-kun-ima-docchi-episode-12/" 
# or any recent episode URL from the previous console logs

s = cloudscraper.create_scraper()
r = s.get(url)
soup = BeautifulSoup(r.text, 'html.parser')

print("--- Iframes found ---")
for iframe in soup.find_all('iframe'):
    print(iframe.get('src', 'no-src'))

print("\n--- Embeds/videos ---")
for video in soup.find_all(['video', 'embed', 'source']):
    print(video.get('src', 'no-src'))

print("\n--- Mirrors / Buttons ---")
for btn in soup.select('.nonton, .mirror, select, option, iframe'):
    # Sometimes mirrors are in a select or custom buttons
    pass

sys.stdout.flush()
sys.stdout.close()
