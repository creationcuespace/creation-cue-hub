import json
import os
import subprocess
from datetime import datetime, timezone

JSON_FILES = ["manager.json", "badge_text_faces.json"]
MAX_NEW_DAYS = 90

def clean_file(json_path):
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        return False
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    now = datetime.now(timezone.utc)
    changed = False
    
    for item in data.get("watch_faces", []):
        release_date_str = item.get("release_date")
        if not release_date_str:
            continue
            
        badge_text = item.get("badge_text", "")
        filters = item.get("filters", [])
        is_new_flag = item.get("is_new", False)
        
        has_new_badge = badge_text in ("NEW", "NEW RELEASE")
        has_new_filter = isinstance(filters, list) and "NEW" in filters
        
        if has_new_badge or has_new_filter or is_new_flag:
            try:
                release_date = datetime.strptime(release_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                age_days = (now - release_date).days
                print(f"[{os.path.basename(json_path)}] Checking {item.get('id')}: Age = {age_days} days (Release: {release_date_str})")
                
                if age_days > MAX_NEW_DAYS:
                    print(f"--> Removing expired NEW markers from {item.get('id')} (Age {age_days} > {MAX_NEW_DAYS} days)")
                    if has_new_badge:
                        del item["badge_text"]
                    if has_new_filter:
                        item["filters"] = [flt for flt in filters if flt != "NEW"]
                    if "is_new" in item and item["is_new"]:
                        item["is_new"] = False
                    changed = True
            except ValueError as e:
                print(f"Error parsing release_date for {item.get('id')}: {e}")
                
    if changed:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"Updated {os.path.basename(json_path)} successfully.")
    else:
        print(f"No NEW badges needed removal in {os.path.basename(json_path)} today.")
        
    return changed

def clean_expired_new_badges():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    any_changed = False
    for filename in JSON_FILES:
        path = os.path.join(base_dir, filename)
        if clean_file(path):
            any_changed = True
            # Stage file here so workflow commits manager.json even if workflow YAML only adds badge_text_faces.json
            subprocess.run(["git", "add", path], check=False)
    return any_changed

if __name__ == "__main__":
    clean_expired_new_badges()
