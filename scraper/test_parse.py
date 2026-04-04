import re
from bs4 import BeautifulSoup

def test_parse():
    with open('test_output.html', 'r', encoding='utf-8') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    BASE_URL = "https://anoboy7.com"
    links = []
    
    ngiri = soup.find('div', class_='ngiri')
    container = ngiri if ngiri else soup
    
    tags = container.select('a:has(.list-anime)')
    print(f"Found {len(tags)} a:has(.list-anime)")
    for a in tags:
        img = a.find('img')
        if img and img.get('alt'):
            raw_title = img.get('alt')
            slug = re.sub(r'[^a-z0-9]+', '-', raw_title.lower()).strip('-')
            anime_url = f"{BASE_URL}/anime/{slug}/"
            if anime_url not in links:
                links.append(anime_url)
    print(f"Found {len(links)} links")
    for link in links:
        print(link)

if __name__ == '__main__':
    test_parse()
