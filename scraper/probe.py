import cloudscraper
from bs4 import BeautifulSoup

s = cloudscraper.create_scraper()
out = []

domains = [
    'samehadaku.email',
    'samehadaku.li', 
    'samehadaku.me',
    'samehadaku.id',
    'samehadaku.cc',
]

for domain in domains:
    try:
        r = s.get(f'https://{domain}/', timeout=12)
        soup = BeautifulSoup(r.text, 'html.parser')
        t = soup.find('title')
        out.append(f"{domain}: {r.status_code} | {t.text.strip()[:60] if t else 'no title'}")
    except Exception as e:
        out.append(f"{domain}: ERROR - {str(e)[:80]}")

with open('domain_check.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
