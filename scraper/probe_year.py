import cloudscraper
import requests
from bs4 import BeautifulSoup

def probe_url(url):
    print(f"Probing {url}")
    try:
        s = cloudscraper.create_scraper()
        r = s.get(url, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        items = soup.select('.home_index a[title], .column-content a[title], .amv a[title], a[href*="/anime/"]')
        titles = set()
        for item in items:
            t = item.get('title') or item.text.strip()
            if t and len(t) > 3:
                titles.add(t)
        print(f"Found {len(titles)} titles. Sample:")
        for t in list(titles)[:5]:
            print(f" - {t}")
    except Exception as e:
        print("Error:", e)

probe_url('https://anoboy7.com/tahun/2022/')
probe_url('https://anoboy7.com/?s=2022')
