import os
import json
import requests
from bs4 import BeautifulSoup

def scrape_jadwal():
    url = "https://s12.nontonanimeid.boats/jadwal-rilis/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
    except Exception as e:
        print(f"[Jadwal] Error fetching jadwal: {e}")
        return None

    schedule = {}
    days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
    
    for day in days:
        day_cap = day.capitalize()
        schedule[day_cap] = []
        tab_content = soup.find('div', id=day)
        if not tab_content:
            continue
            
        cards = tab_content.find_all('a', class_='as-anime-card')
        for card in cards:
            title_el = card.find('h3', class_='as-anime-title')
            time_el = card.find('span', class_='as-release-time')
            cov_img = card.find('img')
            
            if title_el and time_el:
                title = title_el.text.strip()
                time_str = time_el.text.replace('🕒', '').strip()
                cover_url = cov_img['src'] if cov_img else ''
                
                # clean cover url if it has resizing query params
                if '?' in cover_url:
                    cover_url = cover_url.split('?')[0]
                
                schedule[day_cap].append({
                    "title": title,
                    "time": time_str,
                    "cover_url": cover_url
                })
                
    return schedule

def update_jadwal():
    print("[Jadwal] Fetching new schedule...")
    data = scrape_jadwal()
    if not data:
        print("[Jadwal] Failed to fetch data.")
        return

    # Write to frontend/public/jadwal.json
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'frontend', 'public')
    
    if not os.path.exists(public_dir):
        os.makedirs(public_dir, exist_ok=True)
            
    out_path = os.path.join(public_dir, 'jadwal.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    num_animes = sum(len(v) for v in data.values())
    print(f"[Jadwal] Successfully updated {out_path} with {num_animes} animes.")

if __name__ == "__main__":
    update_jadwal()
