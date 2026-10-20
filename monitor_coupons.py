"""
Coupon Depletion Monitor for Creation Cue Promotions
Monitors Firebase RTDB for promotion claims and sends push notifications to ntfy.sh/creationcue-alerts-9873
when giveaway coupons are running low or completely gone.
"""

import sys
import time
import json
import urllib.request
import urllib.error

NTFY_TOPIC = "creationcue-alerts-9873"
NTFY_URL = f"https://ntfy.sh/{NTFY_TOPIC}"
FIREBASE_RTDB_BASE = "https://creation-cue-manage-default-rtdb.europe-west1.firebasedatabase.app"

def send_ntfy(title: str, message: str, priority: str = "default", tags: list = None, click_url: str = None):
    try:
        headers = {
            "Title": title.encode("utf-8"),
            "Priority": priority,
        }
        if tags:
            headers["Tags"] = ",".join(tags)
        if click_url:
            headers["Click"] = click_url

        req = urllib.request.Request(NTFY_URL, data=message.encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Failed to send ntfy notification: {e}", file=sys.stderr)
        return False

def get_promo_status(promo_id: str):
    url = f"{FIREBASE_RTDB_BASE}/promotions/{promo_id.lower()}/public.json"
    req = urllib.request.Request(url, headers={"User-Agent": "CreationCue-Monitor/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def monitor_promo(promo_id: str, poll_interval: int = 10):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Starting coupon depletion monitor for '{promo_id.upper()}'...")
    print(f"Notifications will be pushed to {NTFY_URL}")

    status = get_promo_status(promo_id)
    if not status:
        print(f"Error: Promo '{promo_id}' not found in database.", file=sys.stderr)
        return

    claimed = status.get("claimedCount", 0)
    total = status.get("totalCoupons", 0)
    cap = status.get("claimsCap")
    limit = cap if (cap is not None and cap > 0) else total
    remaining = max(0, limit - claimed)

    # Initial start count of claimed codes at the moment monitor was launched
    start_claimed = claimed

    print(f"Status: Total Claimed = {claimed}, Cap = {limit}, Remaining for giveaway = {remaining}")

    alerted_low = False
    alerted_depleted = False

    while True:
        try:
            status = get_promo_status(promo_id)
            if not status:
                time.sleep(poll_interval)
                continue

            claimed = status.get("claimedCount", 0)
            total = status.get("totalCoupons", 0)
            cap = status.get("claimsCap")
            limit = cap if (cap is not None and cap > 0) else total
            remaining = max(0, limit - claimed)

            # Check depleted (0 coupons left)
            if remaining == 0 and not alerted_depleted:
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] ALL GIVEAWAY COUPONS DEPLETED! (Reached Cap #{limit})")
                send_ntfy(
                    title=f"🚨 COUPONS GONE: {promo_id.upper()}!",
                    message=f"All giveaway coupons for {promo_id.upper()} have been claimed!\n\nOpen Reddit generator to post the 'Giveaway Ended' template.",
                    priority="urgent",
                    tags=["rotating_light", "warning", "checkered_flag"],
                    click_url="https://creationcue.web.app/reddit-generator"
                )
                alerted_depleted = True
                print("Final alert sent. Campaign completed. Monitor shutting down cleanly.")
                break

            # Check low stock (<= 5 remaining)
            elif remaining <= 5 and remaining > 0 and not alerted_low:
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] LOW STOCK ALERT! Only {remaining} remaining.")
                send_ntfy(
                    title=f"⚠️ Low Coupons: {promo_id.upper()} ({remaining} left)",
                    message=f"Only {remaining} coupons left for the {promo_id.upper()} giveaway!",
                    priority="high",
                    tags=["warning", "hourglass_flowing_sand"],
                    click_url="https://creationcue.web.app/reddit-generator"
                )
                alerted_low = True

            # If user increased cap later, reset flags
            if remaining > 5 and alerted_low:
                alerted_low = False
            if remaining > 0 and alerted_depleted:
                alerted_depleted = False

        except Exception as e:
            pass

        time.sleep(poll_interval)

if __name__ == "__main__":
    promo = sys.argv[1] if len(sys.argv) > 1 else "cue097"
    interval = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    monitor_promo(promo, interval)
