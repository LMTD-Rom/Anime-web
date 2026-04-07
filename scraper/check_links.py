import requests
import os
import sys
import time
from datetime import datetime, timezone

# Add parent dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import sb_get, sb_patch

def check_video_links():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Scanning for broken video links...")
    
    # Fetch 20 sources that haven't been checked recently or are not marked broken
    sources = sb_get("video_sources", "?select=id,video_url,episode_id&limit=20&order=last_checked_at.asc.nullsfirst")
    
    if not sources:
        print("No sources to check.")
        return

    for src in sources:
        src_id = src['id']
        url = src['video_url']
        
        print(f" Checking: {url[:60]}...", end=" ")
        
        is_broken = False
        try:
            # Try a HEAD request first (faster)
            resp = requests.head(url, timeout=10, allow_redirects=True)
            if resp.status_code >= 400:
                # Some servers block HEAD, try GET with range header
                resp = requests.get(url, timeout=10, stream=True, headers={'Range': 'bytes=0-100'})
                if resp.status_code >= 400:
                    is_broken = True
        except Exception as e:
            print(f"Error: {e}")
            is_broken = True

        status_text = "❌ BROKEN" if is_broken else "✅ OK"
        print(status_text)
        
        # Update DB
        sb_patch("video_sources", {
            "is_broken": is_broken,
            "last_checked_at": datetime.now(timezone.utc).isoformat()
        }, f"id=eq.{src_id}")

if __name__ == "__main__":
    print("=== Sukinime Broken Link Detector ===")
    while True:
        try:
            check_video_links()
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Scanner Error: {e}")
        
        print("Waiting 30 seconds for next batch...")
        time.sleep(30)
