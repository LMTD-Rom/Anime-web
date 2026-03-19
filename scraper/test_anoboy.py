import cloudscraper
import os
import sys

sys.stdout = open('test_scrape.log', 'w', encoding='utf-8')
sys.stderr = sys.stdout

def print_section(title, elements):
    print(f"\n--- {title} ---")
    for el in elements[:5]:
        print(el.get('href', 'no-href')[:80])
    print(f"Total found: {len(elements)}")

try:
    s = cloudscraper.create_scraper()
    r = s.get('https://anoboy7.com')
    print("STATUS:", r.status_code)
    
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(r.text, 'html.parser')

    # All anime links
    all_links = soup.select('a[href*="/anime/"]')
    print_section("ALL LINKS", all_links)

    # Home Index
    home_links = soup.select('.home_index a[href*="/anime/"]')
    print_section(".home_index", home_links)

    # Alternate home options
    print_section(".post-item", soup.select('.post-item a[href*="/anime/"]'))
    print_section("article", soup.select('article a[href*="/anime/"]'))
    print_section(".grid", soup.select('.grid a[href*="/anime/"]'))

    # Popular widget options
    print_section("#wp-jadwal", soup.select('#wp-jadwal a[href*="/anime/"]'))
    print_section(".areajadwal", soup.select('.areajadwal a[href*="/anime/"]'))
    print_section(".widget", soup.select('.widget a[href*="/anime/"]'))
    print_section("aside", soup.select('aside a[href*="/anime/"]'))
    
except Exception as e:
    print("ERROR:", e)

sys.stdout.flush()
sys.stdout.close()
