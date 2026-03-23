import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def sb_get(path, params=""):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{path}{params}", headers=HEADERS)
    return r.json() if r.status_code in (200, 201) else []

def sb_post(path, data, prefer="return=representation", resolution="merge-duplicates"):
    h = HEADERS.copy()
    prefer_parts = [prefer]
    if resolution:
        prefer_parts.append(f"resolution={resolution}")
    h["Prefer"] = ",".join(prefer_parts)
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{path}", headers=h, json=data)
    if r.status_code not in (200, 201):
        print(f"  [DB ERROR] POST /{path} → {r.status_code}: {r.text[:300]}")
    return r

def sb_patch(path, data, match_param):
    r = requests.patch(f"{SUPABASE_URL}/rest/v1/{path}?{match_param}", headers=HEADERS, json=data)
    return r

def upsert_anime(anime_data):
    """Insert or update an anime record."""
    existing = sb_get("animes", f"?slug=eq.{anime_data['slug']}&select=id")
    if existing:
        anime_id = existing[0]['id']
        sb_patch("animes", anime_data, f"slug=eq.{anime_data['slug']}")
        return anime_id
    else:
        res = sb_post("animes", anime_data)
        if res.status_code in (200, 201):
            data = res.json()
            return data[0]['id'] if data else None
    return None

def upsert_episode(episode_data):
    """Insert episode if not exists, return its ID."""
    existing = sb_get("episodes", f"?anime_id=eq.{episode_data['anime_id']}&episode_no=eq.{episode_data['episode_no']}&select=id")
    if existing:
        return existing[0]['id']
    res = sb_post("episodes", episode_data)
    if res.status_code in (200, 201):
        data = res.json()
        return data[0]['id'] if data else None
    return None

def sync_all(results):
    """Sync a batch of scraped anime+episodes. Returns {episode_id: source_url} map."""
    if not results:
        return {}

    import datetime
    # Step 1: Batch upsert all animes. Only rely on existing updated_at or what the scraper passed.
    anime_payloads = []
    for i, item in enumerate(results):
        anime_payloads.append(item['anime'])

    res = sb_post("animes?on_conflict=slug", anime_payloads, prefer="return=representation", resolution="merge-duplicates")

    if res.status_code not in (200, 201):
        print(f"  [ERROR] Batch anime insert failed: {res.text[:200]}")
        return {}

    upserted_animes = res.json()
    slug_to_id = {a['slug']: a['id'] for a in upserted_animes if 'slug' in a and 'id' in a}

    # Step 1.5: Query existing episodes to avoid re-scraping videos for episodes we already have
    all_anime_ids = list(set([a for a in slug_to_id.values() if a]))
    existing_eps_map = {}
    if all_anime_ids:
        in_query = ",".join(all_anime_ids)
        r = requests.get(f"{SUPABASE_URL}/rest/v1/episodes?anime_id=in.({in_query})&select=anime_id,episode_no", headers=HEADERS)
        if r.status_code == 200:
            for row in r.json():
                aid = row['anime_id']
                if aid not in existing_eps_map: existing_eps_map[aid] = set()
                existing_eps_map[aid].add(row['episode_no'])

    # Step 2: Collect all episodes with their source_url
    all_episodes = []
    ep_source_map = {}  # index_in_all_episodes -> source_url
    for item in results:
        slug = item['anime']['slug']
        anime_id = slug_to_id.get(slug)
        if not anime_id:
            r = sb_get("animes", f"?slug=eq.{slug}&select=id")
            if r:
                anime_id = r[0]['id']
        if anime_id:
            for ep in item['episodes']:
                is_existing = anime_id in existing_eps_map and ep['episode_no'] in existing_eps_map[anime_id]
                idx = len(all_episodes)
                all_episodes.append({
                    "anime_id": anime_id,
                    "episode_no": ep['episode_no'],
                    "title": ep['title'],
                })
                # Only map source URL if it's a NEW episode that needs video scraping
                if not is_existing:
                    ep_source_map[idx] = ep.get('source_url')

    # Step 3: Batch upsert episodes, get back IDs
    CHUNK = 500
    episode_id_source = {}  # episode_id -> source_url
    for i in range(0, len(all_episodes), CHUNK):
        chunk = all_episodes[i:i+CHUNK]
        ep_res = sb_post("episodes?on_conflict=anime_id,episode_no", chunk, prefer="return=representation", resolution="merge-duplicates")
        if ep_res.status_code in (200, 201):
            returned = ep_res.json()
            for j, ep_row in enumerate(returned):
                src_url = ep_source_map.get(i + j)
                if ep_row.get('id') and src_url:
                    episode_id_source[ep_row['id']] = src_url
        else:
            print(f"  [ERROR] Episode chunk failed: {ep_res.text[:200]}")

    print(f"  [OK] {len(results)} anime, {len(all_episodes)} episodes synced")
    return episode_id_source


def upsert_video_sources(episode_id, sources):
    """
    Insert multiple video_sources for an episode.
    sources: list of {provider_name, video_url, quality, is_embed}
    """
    if not sources:
        return
    payloads = [
        {
            "episode_id": episode_id,
            "provider_name": s.get("provider_name", "Unknown"),
            "video_url": s["video_url"],
            "quality": s.get("quality", "auto"),
            "is_embed": s.get("is_embed", True),
        }
        for s in sources
        if s.get("video_url")
    ]
    if not payloads:
        return
        
    # Clear old sources to simulate UPSERT (since there's no unique constraint on video_sources)
    try:
        requests.delete(f"{SUPABASE_URL}/rest/v1/video_sources?episode_id=eq.{episode_id}", headers=HEADERS)
    except:
        pass
        
    res = sb_post("video_sources", payloads, prefer="return=minimal")
    if res.status_code not in (200, 201, 204):
        print(f"  [WARN] video_sources insert failed: {res.text[:100]}")
