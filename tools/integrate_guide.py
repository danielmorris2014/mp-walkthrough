# Integrate cable-field-guide.html into the MP Kit repo:
# - copy to walkthrough-app/guide.html
# - drop icon/manifest links that would 404 on our host
# - inject a floating "Back to Home" pill (returns to the launcher)
# - verify the offline decoder + sitepack survived intact
import re, sys, hashlib

SRC = r"C:\Users\DanielMorris\Downloads\cable-field-guide.html"
DST = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\guide.html"

raw = open(SRC, encoding="utf-8").read()
orig_len = len(raw)

# 1) strip apple-touch-icon (x2) and manifest links -> they point at files we don't host
raw, n1 = re.subn(r'<link rel="apple-touch-icon" href="icon-180\.png">', '', raw)
raw, n2 = re.subn(r'<link rel="manifest" href="manifest\.webmanifest">', '', raw)

# 2) inject back-to-launcher pill right after <div id="app"></div>
PILL = ('<div id="app"></div>\n'
        '<a id="mpkit-back" href="./index.html#/home" aria-label="Back to MP Kit Home" '
        'style="position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:8px;z-index:99999;'
        'background:rgba(17,17,19,0.88);color:#edeef0;border:1px solid #43484e;border-radius:999px;'
        'padding:7px 13px 7px 9px;font:800 12px/1 -apple-system,BlinkMacSystemFont,sans-serif;'
        'text-decoration:none;letter-spacing:.2px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">'
        '\u2039 Home</a>')
assert raw.count('<div id="app"></div>') == 1, "app mount not found exactly once"
raw = raw.replace('<div id="app"></div>', PILL)

open(DST, "w", encoding="utf-8", newline="").write(raw)

# 3) integrity checks
checks = {
    "zxwasm decoder embedded": 'id="zxwasm"' in raw,
    "ZXingWASM wrapper present": 'var ZXingWASM=' in raw,
    "sitepack BUF102 embedded": '"site":"BUF102"' in raw,
    "fonts embedded (woff2)": raw.count("data:font/woff2;base64") >= 2,
    "back pill injected": 'id="mpkit-back"' in raw,
    "icon links removed": 'icon-180.png' not in raw,
    "manifest link removed": 'manifest.webmanifest' not in raw,
    "size sane": 2_000_000 < len(raw) < 3_200_000,
}
ok = True
for k, v in checks.items():
    print(("PASS " if v else "FAIL ") + k)
    ok = ok and v
print(f"stripped: {n1} icon links, {n2} manifest link")
print(f"size: {orig_len} -> {len(raw)} bytes | sha256 {hashlib.sha256(raw.encode()).hexdigest()[:16]}")
sys.exit(0 if ok else 1)
