#!/usr/bin/env python3
"""Check Omniroute health and best combo for coding task."""
import urllib.request, json, sys

OMNIROUTE_HOST = "127.0.0.1"
OMNIROUTE_PORT = 20128
OMNIROUTE_BASE = f"http://{OMNIROUTE_HOST}:{OMNIROUTE_PORT}"

def check_health():
    try:
        req = urllib.request.Request(f"{OMNIROUTE_BASE}/health")
        resp = urllib.request.urlopen(req, timeout=5)
        data = resp.read().decode()
        print(f"OMNIROUTE HEALTH: {data}")
        return True
    except Exception as e:
        print(f"OMNIROUTE HEALTH CHECK FAILED: {e}")
        return False

def check_models():
    try:
        req = urllib.request.Request(f"{OMNIROUTE_BASE}/v1/models")
        resp = urllib.request.urlopen(req, timeout=5)
        data = json.loads(resp.read().decode())
        print(f"OMNIROUTE MODELS: {json.dumps(data, indent=2)[:1000]}")
        return True
    except Exception as e:
        print(f"OMNIROUTE MODELS CHECK FAILED: {e}")
        return False

def check_best_coding():
    """Try to get best coding model combo."""
    try:
        # Omniroute may have a /best or /route endpoint
        for endpoint in ["/v1/chat/completions", "/best/coding", "/route/coding"]:
            try:
                req = urllib.request.Request(f"{OMNIROUTE_BASE}{endpoint}", method="GET")
                resp = urllib.request.urlopen(req, timeout=5)
                data = resp.read().decode()[:500]
                print(f"OMNIROUTE {endpoint}: {data}")
                break
            except:
                continue
    except Exception as e:
        print(f"OMNIROUTE routing check: {e}")

if __name__ == "__main__":
    healthy = check_health()
    check_models()
    if healthy:
        check_best_coding()
    else:
        print("Omniroute is not reachable - check Docker container and gateway config")
        sys.exit(1)
