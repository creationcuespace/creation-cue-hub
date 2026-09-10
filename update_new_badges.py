import json
import os
from datetime import datetime, timezone

JSON_PATH = os.path.join(os.path.dirname(__file__), "badge_text_faces.json")
MAX_NEW_DAYS = 90

def clean_expired_new_badges():
    if not os.path.exists(JSON_PATH):
        print(f"File not found: {JSON_PATH}")
        return False
        
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    now = datetime.now(timezone.utc)
    changed = False
    
    for item in data.get("watch_faces", []):
        release_date_str = item.get("release_date")
        badge_text = item.get("badge_text")
        
        # Only evaluate items that currently have the "NEW" badge
        if badge_text == "NEW" and release_date_str:
            try:
                release_date = datetime.strptime(release_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                age_days = (now - release_date).days
                print(f"Checking {item.get('id')}: Age = {age_days} days (Release: {release_date_str})")
                
                if age_days > MAX_NEW_DAYS:
                    print(f"--> Removing 'NEW' badge from {item.get('id')} (Age {age_days} > {MAX_NEW_DAYS} days)")
                    del item["badge_text"]
                    changed = True
            except ValueError as e:
                print(f"Error parsing release_date for {item.get('id')}: {e}")
                
    if changed:
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print("Updated badge_text_faces.json successfully.")
    else:
        print("No NEW badges needed removal today.")
        
    return changed

if __name__ == "__main__":
    clean_expired_new_badges()
