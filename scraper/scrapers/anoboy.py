import cloudscraper
from bs4 import BeautifulSoup
import re
import time
import threading

BASE_URL = "https://anoboy7.com"

def _fetch(url, result_box, timeout=15):
    """Fetch URL in a thread — result_box[0] will hold the response or None."""
    try:
        s = cloudscraper.create_scraper()
        r = s.get(url, timeout=timeout)
        result_box[0] = r if r.status_code == 200 else None
    except Exception as e:
        result_box[0] = None

def get_soup(url, retries=2, timeout=15):
    """Fetch with hard wall-clock timeout using threads."""
    for attempt in range(retries):
        result_box = [None]
        t = threading.Thread(target=_fetch, args=(url, result_box, timeout), daemon=True)
        t.start()
        t.join(timeout + 2)  # wait max timeout+2 seconds
        
        if t.is_alive():
            print(f"  [timeout] {url[:60]}...")
            continue  # skip, retry or give up
        
        if result_box[0] is not None:
            return BeautifulSoup(result_box[0].text, 'html.parser')
        
        if attempt < retries - 1:
            time.sleep(1)
    
    return None


def scrape_home_updates():
    """Scrape 'Update Terbaru' from the homepage"""
    print("[Anoboy] Fetching Home Updates...")
    soup = get_soup(BASE_URL)
    if not soup: return []
    links = []
    
    # "Update Terbaru" is in a container with class .ngiri or directly as .list-anime
    ngiri = soup.find('div', class_='ngiri')
    container = ngiri if ngiri else soup
    
    for a in container.select('a:has(.list-anime)'):
        href = a.get('href', '')
        # Anoboy homepage links to EPISODES (e.g., /boruto-episode-123/). 
        # We want the base anime. We can usually strip the episode part or just grab the title to search.
        # Luckily, the img alt text has the exact Anime Title.
        img = a.find('img')
        if img and img.get('alt'):
            # Convert title like "Boruto: Naruto Next Generations" to slug "boruto-naruto-next-generations"
            raw_title = img.get('alt')
            # Anoboy slugs are just lowercase, spaces to dashes, removing special chars
            slug = re.sub(r'[^a-z0-9]+', '-', raw_title.lower()).strip('-')
            anime_url = f"{BASE_URL}/anime/{slug}/"
            if anime_url not in links:
                links.append(anime_url)
                
    print(f"[Anoboy] Found {len(links)} Home Updates")
    return links

def scrape_popular():
    """Scrape 'Popular' section from the sidebar"""
    print("[Anoboy] Fetching Popular...")
    soup = get_soup(BASE_URL)
    if not soup: return []
    links = []
    
    # Anoboy popular sidebar is in .nganan
    nganan = soup.find('div', class_='nganan')
    if nganan:
        for a in nganan.select('.ztable a[href*="/anime/"]'):
            href = a.get('href', '')
            if '/anime/' in href and href not in links:
                links.append(href if href.startswith('http') else BASE_URL + href)
                
    print(f"[Anoboy] Found {len(links)} Popular Animes")
    return links

def scrape_movies():
    """Scrape 'Movie' section"""
    print("[Anoboy] Fetching Movies...")
    soup = get_soup(f"{BASE_URL}/movie/")
    if not soup: return []
    links = []
    for a in soup.select('a[href*="/anime/"]'):
        href = a.get('href', '')
        if '/anime/' in href and href not in links:
            links.append(href if href.startswith('http') else BASE_URL + href)
    print(f"[Anoboy] Found {len(links)} Movies")
    return links

def scrape_genres(limit_per_genre=None):
    """Get some anime from the Genres page. It's huge, so we might want to limit it."""
    print("[Anoboy] Fetching Genres...")
    soup = get_soup(f"{BASE_URL}/genre/")
    if not soup: return []
    genre_links = []
    for a in soup.select('a[href*="/genres/"]'):
        href = a.get('href', '')
        if href not in genre_links:
            genre_links.append(href if href.startswith('http') else BASE_URL + href)
    
    anime_links = []
    # Limit to first few genres just to avoid doing thousands of requests
    # In production, might want a separate cron job for this
    for g_link in genre_links[:5]:
        g_soup = get_soup(g_link)
        if not g_soup: continue
        for a in g_soup.select('a[href*="/anime/"]'):
            href = a.get('href', '')
            if '/anime/' in href and href not in anime_links:
                anime_links.append(href if href.startswith('http') else BASE_URL + href)
                if limit_per_genre and len(anime_links) >= limit_per_genre:
                    break
    print(f"[Anoboy] Found {len(anime_links)} Animes via Genres")
    return anime_links

def get_jadwal():
    """
    Scrape /jadwal/ to get:
    - schedule_map: slug -> day (rarely populated on Anoboy)
    - ongoing_slugs: set of slugs shown in jadwal (these are ONGOING)
    Everything NOT in ongoing_slugs is assumed COMPLETED.
    """
    print("[Anoboy] Fetching schedule...")
    soup = get_soup(f"{BASE_URL}/jadwal/")
    if not soup:
        return {}, set()

    schedule = {}
    ongoing_slugs = set()
    current_day = None
    days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']

    for tag in soup.find_all(['h2', 'h3', 'td', 'li', 'div', 'p', 'strong', 'b']):
        text = tag.get_text(strip=True)
        if text in days:
            current_day = text
        for a in tag.find_all('a', href=True):
            href = a.get('href', '')
            if '/anime/' in href:
                slug = href.rstrip('/').split('/')[-1]
                ongoing_slugs.add(slug)
                if current_day:
                    schedule[slug] = current_day

    # Also grab all ztable anime links (Popular section = ongoing)
    for a in soup.select('table.ztable a[href*="/anime/"]'):
        slug = a.get('href','').rstrip('/').split('/')[-1]
        ongoing_slugs.add(slug)

    print(f"[Anoboy] Found {len(schedule)} anime with day, {len(ongoing_slugs)} ongoing slugs")
    return schedule, ongoing_slugs


def scrape_anime_detail(url, schedule_map, ongoing_slugs=None):

    """Scrape full anime detail + all episodes"""
    soup = get_soup(url)
    if not soup:
        return None
    
    # Title
    h1 = soup.find('h1') or soup.find('h2')
    title = h1.get_text(strip=True) if h1 else url.rstrip('/').split('/')[-1].replace('-', ' ').title()
    
    # Slug from URL
    slug = url.rstrip('/').split('/')[-1]
    
    # Cover image (relative /img/*.jpg pattern)
    cover_url = ""
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if src and '/img/' in src and not 'gif' in src:
            cover_url = BASE_URL + src if src.startswith('/') else src
            break
    
    # Genres: find <a> tags right after the title sections in the anime meta area
    genres = []
    body_text = soup.get_text(' ', strip=True)
    # Genres appear as individual anchor tags in the genre section
    # Collect by checking for known genre keywords
    known_genres = [
        'Action','Adventure','Fantasy','Comedy','Romance','Drama','Sci-Fi','Shounen',
        'Seinen','Shoujo','Isekai','Supernatural','Mystery','Thriller','Slice of Life',
        'Horror','Historical','School','Sports','Music','Mecha','Psychological',
        'Military','Magic','Reincarnation','Harem','Ecchi','Martial Arts','Super Power',
        'Game','Detective','Space'
    ]
    # Look for genre anchor tags
    for a in soup.find_all('a', href=True):
        href = a.get('href', '')
        text = a.get_text(strip=True)
        if '/genres/' in href and text:
            genres.append(text)
    
    # Status: default COMPLETED. Only Ongoing if slug is in the jadwal whitelist.
    # Anoboy jadwal page doesn't expose status text, so we use the jadwal presence as signal.
    if ongoing_slugs and slug in ongoing_slugs:
        status = "Ongoing"
    else:
        status = "Completed"

    # Rating / Release Year — scan short metadata tags
    rating = None
    release_year = None
    for tag in soup.find_all(['td', 'li', 'b', 'strong', 'span']):
        t = tag.get_text(' ', strip=True)
        if len(t) > 80:
            continue
        tl = t.lower()

        # Year: anime years 1960–2025
        if not release_year:
            yr = re.search(r'\b(19[6-9]\d|20[0-1]\d|202[0-5])\b', t)
            if yr:
                release_year = int(yr.group(1))

        # Rating: decimal like 7.5 or 8.12
        if not rating:
            rm = re.search(r'\b([1-9]\.\d{1,2})\b', t)
            if rm:
                rating = rm.group(1)

    # Schedule
    schedule_day = schedule_map.get(slug)


    # Description
    desc = None
    for tag in soup.find_all(['p', 'div']):
        t = tag.get_text(strip=True)
        if len(t) > 100 and not any(k in t.lower() for k in ['copyright','cookie','home','episode','genre']):
            desc = t[:500]
            break
    
    # All episodes
    episodes = []
    seen_eps = set()
    for a in soup.select('a[href*=episode]'):
        href = a.get('href', '')
        ep_url = href if href.startswith('http') else BASE_URL + href
        
        # Extract episode number
        m = re.search(r'episode[- ]?(\d+)', href, re.IGNORECASE)
        if m:
            ep_no = int(m.group(1))
            if ep_no not in seen_eps:
                seen_eps.add(ep_no)
                episodes.append({
                    "episode_no": ep_no,
                    "title": f"Episode {ep_no}",
                    "source_url": ep_url
                })
    
    episodes.sort(key=lambda x: x['episode_no'])
    
    return {
        "anime": {
            "title": title,
            "slug": slug,
            "description": desc,
            "cover_url": cover_url,
            "status": status,
            "rating": rating,
            "genres": genres,
            "schedule_day": schedule_day,
            "release_year": release_year,
            "episode_count": len(episodes),
            "source_origin": "anoboy",
            "source_url": url
        },
        "episodes": episodes
    }

def scrape_episode_sources(url):
    """Scrape the video iframes/mirrors from an Anoboy episode page"""
    soup = get_soup(url)
    if not soup:
        return []
    
    sources = []
    
    # Check for direct embed or the main iframe first
    main_iframe = soup.select_one('#tontonin')
    if main_iframe and main_iframe.get('src'):
        src = main_iframe.get('src')
        sources.append({
            "provider_name": "Default",
            "video_url": src if src.startswith('http') else BASE_URL + src,
            "quality": "auto",
            "is_embed": True
        })
    
    # Look for the mirror buttons <a class="server" data-video="...">
    for btn in soup.select('.servers a.server'):
        video = btn.get('data-video', '')
        provider = btn.text.strip()
        if video and not any(s['provider_name'] == provider for s in sources):
            sources.append({
                "provider_name": provider,
                "video_url": video if video.startswith('http') else BASE_URL + video,
                "quality": "auto",
                "is_embed": True
            })
            
    return sources

def scrape_anoboy(limit=None):
    """Main function: get anime list, then scrape each anime fully"""
    schedule_map = get_jadwal()
    anime_urls = get_anime_list()
    
    if limit:
        anime_urls = anime_urls[:limit]
    
    results = []
    for i, url in enumerate(anime_urls):
        print(f"[{i+1}/{len(anime_urls)}] Scraping: {url}")
        data = scrape_anime_detail(url, schedule_map)
        if data:
            results.append(data)
        time.sleep(0.5)  # polite delay
    
    return results
