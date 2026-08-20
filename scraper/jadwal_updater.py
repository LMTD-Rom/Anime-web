import os
import json
import requests
from bs4 import BeautifulSoup
import urllib3.util.connection as connection

def setup_dns_over_https():
    target_host = "s13.nontonanimeid.boats"
    resolved_ip = None
    
    # Try resolvingNormally first
    try:
        import socket
        socket.gethostbyname(target_host)
        return
    except Exception:
        pass

    # Standard resolution failed, resolve via DoH
    for doh_url in [
        "https://cloudflare-dns.com/dns-query?name=s13.nontonanimeid.boats&type=A",
        "https://dns.google/resolve?name=s13.nontonanimeid.boats&type=A"
    ]:
        try:
            r = requests.get(doh_url, headers={"accept": "application/dns-json"}, timeout=5)
            if r.status_code == 200:
                data = r.json()
                if "Answer" in data and len(data["Answer"]) > 0:
                    resolved_ip = data["Answer"][0]["data"]
                    break
        except Exception:
            continue
            
    if not resolved_ip:
        resolved_ip = "104.21.27.197"  # fallback Cloudflare IP
        
    org_create_connection = connection.create_connection
    def patched_create_connection(address, *args, **kwargs):
        host, port = address
        if host == target_host:
            host = resolved_ip
        return org_create_connection((host, port), *args, **kwargs)
    connection.create_connection = patched_create_connection

def scrape_jadwal():
    setup_dns_over_https()
    url = "https://s13.nontonanimeid.boats/jadwal-rilis/"
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
            # Look for either the updated time-text class or legacy class names
            time_el = card.find(class_='time-text') or card.find(class_='as-release-time')
            cov_img = card.find('img')
            
            if title_el and time_el:
                title = title_el.text.strip()
                
                # Decompose the inner icon span if present to avoid extra icon text
                icon_el = time_el.find(class_='icon') or time_el.find('span')
                if icon_el:
                    icon_el.decompose()
                
                time_str = time_el.text.replace('🕒', '').strip()
                cover_url = cov_img['src'] if cov_img else ''
                
                # clean cover url if it has resizing query params
                if '?' in cover_url:
                    cover_url = cover_url.split('?')[0]
                
                # Replace legacy s12 links with s13
                if cover_url:
                    cover_url = cover_url.replace("s12.nontonanimeid.boats", "s13.nontonanimeid.boats")
                
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
