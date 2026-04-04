import cloudscraper

def test_scrape():
    url = "https://anoboy7.com"
    print(f"Fetching {url}")
    try:
        scraper = cloudscraper.create_scraper()
        res = scraper.get(url, timeout=15)
        print(f"Status: {res.status_code}")
        print(f"Length: {len(res.text)}")
        print(res.text[:1000])
        with open('test_output.html', 'w', encoding='utf-8') as f:
            f.write(res.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_scrape()
