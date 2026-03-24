import sys
from scrapers.anoboy import scrape_historic_anime, scrape_anime_detail

print("Fetching page 1...")
urls = scrape_historic_anime(max_pages=1)
himesama_url = next((u for u in urls if 'himesama' in u), None)

if himesama_url:
    print(f"Found URL: {himesama_url}")
    print("Scraping details...")
    data = scrape_anime_detail(himesama_url, {}, set())
    if data:
        print("Success!")
        print(f"Title: {data['anime']['title']}")
        print(f"Episodes: {len(data['episodes'])}")
    else:
        print("FAILED to get data! (Returns None)")
else:
    print("Himesama not found on page 1 anymore.")
