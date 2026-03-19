"""
Samehadaku scraper — primary data source.
"""
import cloudscraper
from bs4 import BeautifulSoup
import re
import time
BASE = "https://samehadaku.li"
DAYS_MAP = {
    'monday': 'Senin', 'tuesday': 'Selasa', 'wednesday': 'Rabu',
    'thursday': 'Kamis', 'friday': 'Jumat', 'saturday': 'Sabtu',
    'sunday': 'Minggu',
    'senin': 'Senin', 'selasa': 'Selasa', 'rabu': 'Rabu',
    'kamis': 'Kamis', 'jumat': 'Jumat', 'sabtu': 'Sabtu',
    'minggu': 'Minggu',
}

# Reuse one scraper session across all requests
_scraper = cloudscraper.create_scraper()

# ── HTTP helpers ──────────────────────────────────────────────────

def get_soup(url, timeout=12, retries=2):
    """Fetch URL and return BeautifulSoup. Returns None on failure/timeout."""
    for attempt in range(retries):
        try:
            r = _scraper.get(url, timeout=timeout)
            if r.status_code == 200:
                return BeautifulSoup(r.text, 'html.parser')
            print(f"  [HTTP {r.status_code}] {url[:60]}")
        except Exception as e:
            print(f"  [timeout/error attempt {attempt+1}] {url[:60]}: {e}")
            if attempt < retries - 1:
                time.sleep(1)
    return None


# ── Schedule (disabled) ───────────────────────────────────────────

def get_jadwal():
    """Jadwal disabled — returns empty maps immediately."""
    print("[Samehadaku] Skipping jadwal (disabled)...")
    return {}, set()


# ── Anime list ────────────────────────────────────────────────────

def get_anime_list():
    """Returns all anime detail URLs from AZ list (paginated)."""
    print("[Samehadaku] Fetching anime list from AZ list...")
    urls = set()
    page = 1
    while True:
        url = f"{BASE}/az-list/" if page == 1 else f"{BASE}/az-list/page/{page}/"
        soup = get_soup(url)
        if not soup:
            print(f"  Page {page}: failed/timeout, stopping.")
            break

        found = 0
        for a in soup.select('a[href*="/anime/"]'):
            href = a.get('href', '')
            if '/anime/' in href and href not in urls and not re.search(r'-episode-\d+', href):
                # Must be an anime slug URL (not the /anime/ category page itself)
                slug = href.rstrip('/').split('/')[-1]
                if len(slug) > 3:
                    urls.add(href)
                    found += 1

        print(f"  Page {page}: +{found} anime (total {len(urls)})")

        if found == 0:
            break

        # Find next page — try multiple selectors
        nxt = (soup.select_one('.hpage a[href*="page"]') or
               soup.select_one('a.r') or
               soup.select_one('.page-nav a[rel="next"]') or
               soup.select_one('a[href*="az-list/page"]'))
        if not nxt:
            break
        page += 1
        time.sleep(0.8)

    result = list(urls)
    print(f"[Samehadaku] Found {len(result)} total anime")
    return result


# ── Anime detail ──────────────────────────────────────────────────

def scrape_anime_detail(url, schedule_map, ongoing_slugs=None):
    """Scrape one anime page. Returns {anime, episodes} dict."""
    soup = get_soup(url)
    if not soup:
        return None

    slug = url.rstrip('/').split('/')[-1]

    # Title
    h1 = soup.find('h1', class_=re.compile(r'entry|title', re.I)) or soup.find('h1')
    title = h1.get_text(strip=True) if h1 else slug.replace('-', ' ').title()

    # Cover
    cover_url = None
    poster = soup.select_one('.thumb img, .poster img, img[itemprop="image"]')
    if poster:
        cover_url = poster.get('src') or poster.get('data-src')
        if cover_url:
            cover_url = re.sub(r'\?resize=.*', '', cover_url)

    # Genres
    genres = []
    for a in soup.select('a[href*="/genres/"]'):
        g = a.get_text(strip=True)
        if g and g not in genres:
            genres.append(g)

    # Status, rating, year
    status = "Completed"
    release_year = None
    rating = None
    schedule_day = schedule_map.get(slug)

    for span in soup.find_all(['span', 'div']):
        t = span.get_text(' ', strip=True)
        if len(t) > 120:
            continue
        tl = t.lower()
        if 'status' in tl:
            if 'ongoing' in tl:
                status = "Ongoing"
            elif 'completed' in tl:
                status = "Completed"
        if not release_year:
            yr = re.search(r'\b(19[6-9]\d|20[0-2]\d)\b', t)
            if yr:
                release_year = int(yr.group(1))
        if not rating:
            rm = re.search(r'\b([1-9]\.\d{1,2})\b', t)
            if rm:
                rating = rm.group(1)
        if not schedule_day:
            for day_en, day_id in DAYS_MAP.items():
                if day_en in tl:
                    schedule_day = day_id
                    break

    # span.release-year (Samehadaku-specific)
    ry = soup.find('span', class_='release-year')
    if ry and not release_year:
        try:
            release_year = int(ry.get_text(strip=True))
        except Exception:
            pass

    if ongoing_slugs and slug in ongoing_slugs:
        status = "Ongoing"

    # Description
    desc = None
    for sel in ['.entry-content p', '.synops p', '.desc p', 'p.story']:
        p = soup.select_one(sel)
        if p:
            t = p.get_text(strip=True)
            if len(t) > 50:
                desc = t[:600]
                break

    # Episodes
    episodes = []
    seen = set()
    for a in soup.select('.eplister a, .episodelist a, .bxcl a'):
        href = a.get('href', '')
        m = re.search(r'episode[- ]?(\d+)', href, re.I) or re.search(r'ep[- ]?(\d+)', href, re.I)
        if m:
            ep_no = int(m.group(1))
            if ep_no not in seen:
                seen.add(ep_no)
                episodes.append({"episode_no": ep_no, "title": f"Episode {ep_no}", "source_url": href, "provider": "samehadaku"})

    if not episodes:
        for a in soup.select('a[href*="-episode-"]'):
            href = a.get('href', '')
            m = re.search(r'-episode-(\d+)', href, re.I)
            if m:
                ep_no = int(m.group(1))
                if ep_no not in seen:
                    seen.add(ep_no)
                    episodes.append({"episode_no": ep_no, "title": f"Episode {ep_no}", "source_url": href, "provider": "samehadaku"})

    episodes.sort(key=lambda x: x['episode_no'])

    return {
        "anime": {
            "title": title, "slug": slug, "description": desc,
            "cover_url": cover_url, "status": status, "rating": rating,
            "genres": genres, "schedule_day": schedule_day,
            "release_year": release_year, "episode_count": len(episodes),
            "source_origin": "samehadaku", "source_url": url,
        },
        "episodes": episodes,
    }


# ── Episode video sources ─────────────────────────────────────────

def scrape_episode_sources(episode_url):
    """Scrape video embed/source URLs from a Samehadaku episode page."""
    soup = get_soup(episode_url)
    if not soup:
        return []

    sources = []
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src', '')
        if src and src.startswith('http'):
            sources.append({"provider_name": _provider_name(src), "video_url": src, "quality": "auto", "is_embed": True})

    for a in soup.select('.mirrorx li a, .server-list a'):
        href = a.get('href', '') or a.get('data-src', '')
        if href and href.startswith('http'):
            sources.append({"provider_name": _provider_name(href), "video_url": href, "quality": "HD", "is_embed": True})

    seen = set()
    return [s for s in sources if not (s['video_url'] in seen or seen.add(s['video_url']))]


def _provider_name(url):
    try:
        host = re.search(r'https?://([^/]+)', url).group(1)
        parts = host.split('.')
        return parts[-2].capitalize() if len(parts) >= 2 else host
    except Exception:
        return "Unknown"
