# Survey cable-field-guide.html: structure, screens, JS surface, network deps.
# Prints an outline while skipping giant base64 lines.
import re, sys, json

SRC = r"C:\Users\DanielMorris\Downloads\cable-field-guide.html"
raw = open(SRC, encoding="utf-8", errors="replace").read()
lines = raw.splitlines()
print(f"total lines: {len(lines)} | total chars: {len(raw)}")

# 1) tag/structure outline (skip base64-ish lines)
print("\n=== STRUCTURE OUTLINE (non-blob lines) ===")
for i, ln in enumerate(lines, 1):
    s = ln.strip()
    if len(s) > 400 and ("base64" in s or re.fullmatch(r"[A-Za-z0-9+/=]+", s[:200] or "x")):
        continue
    if re.match(r"<(/?)(body|head|title|style|script|main|section|div id=|nav|header|footer|canvas|iframe|video|audio|form)", s) or "function " in s[:80] or "id=" in s[:60]:
        print(f"{i:5}: {s[:150]}")

# 2) all external URLs
print("\n=== EXTERNAL URLS ===")
urls = sorted(set(re.findall(r'https?://[A-Za-z0-9._~:/?#\[\]@!$&\'()*+,;=%-]+', raw)))
for u in urls:
    print(u[:160])

# 3) network APIs used
print("\n=== NETWORK API USAGE ===")
for pat in ["fetch(", "XMLHttpRequest", "WebSocket", "EventSource", "navigator.onLine", "import(", "caches.open", "serviceWorker"]:
    n = raw.count(pat)
    if n:
        print(f"{pat}: {n}")

# 4) storage keys
print("\n=== STORAGE KEYS ===")
keys = sorted(set(re.findall(r"localStorage\.(?:getItem|setItem|removeItem)\(\s*['\"]([^'\"]+)", raw)))
for k in keys:
    print(k)
keys2 = sorted(set(re.findall(r"localStorage\[\s*['\"]([^'\"]+)", raw)))
for k in keys2:
    print("[indexed] " + k)

# 5) function inventory (top-level-ish)
print("\n=== FUNCTIONS (first 120) ===")
fns = re.findall(r"function\s+([A-Za-z_$][\w$]*)\s*\(", raw)
print(f"count: {len(fns)}")
print(", ".join(fns[:120]))

# 6) likely screens/views
print("\n=== SCREEN/VIEW CANDIDATES ===")
ids = sorted(set(re.findall(r'id="([^"]{2,40})"', raw)))
scr = [x for x in ids if re.search(r"screen|view|page|panel|tab|route|home|report|scan|map|guide|step|fiber", x, re.I)]
for x in scr:
    print(x)

# 7) barcode / map libs
print("\n=== LIB MARKERS ===")
for pat in ["zxing", "ZXing", "html5-qrcode", "BarcodeDetector", "leaflet", "Leaflet", "mapbox", "google.maps", "openstreetmap", "tile", "qrcode", "jsQR", "wasm"]:
    n = raw.count(pat)
    if n:
        print(f"{pat}: {n}")
