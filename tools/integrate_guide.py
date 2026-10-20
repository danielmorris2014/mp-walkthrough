# Integrate cable-field-guide.html into the MP Kit repo (Graphite Pro edition).
# - copy to walkthrough-app/guide.html
# - drop icon/manifest links that would 404 on our host
# - inject Graphite Pro theme override AFTER their stylesheet (wins the cascade):
#   their design is fully CSS-variable driven, so this is a token remap onto
#   our palette + sizing normalization + logo recolor
# - inject a MutationObserver that keeps a "< MP Kit" button pinned as the
#   first item of their header across their re-renders (replaces floating pill)
# - integrity checks
import re, sys, hashlib

SRC = r"C:\Users\DanielMorris\Downloads\cable-field-guide.html"
DST = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\guide.html"

raw = open(SRC, encoding="utf-8").read()
orig_len = len(raw)

# 1) strip apple-touch-icon (x2) and manifest links -> files we don't host
raw, n1 = re.subn(r'<link rel="apple-touch-icon" href="icon-180\.png">', '', raw)
raw, n2 = re.subn(r'<link rel="manifest" href="manifest\.webmanifest">', '', raw)

THEME = """
<style id="mp-theme">
/* ===== MP Kit "Graphite Pro" override (matches index.html) =====
   Radix slate surfaces, white accent, system font, tighter sizing.
   Selector list mirrors theirs (:root[data-theme...], :root:not(...))
   so we match their specificity and win by document order — the app
   stays graphite even if the phone is in light mode or their
   settings pick light. */
:root, :root[data-theme], :root[data-theme="light"], :root[data-theme="dark"], :root:not([data-theme]) {
  --bg:#111113; --surface:#18191b; --surface-2:#212225; --line:#363a3f;
  --text:#edeef0; --text-2:#b0b4ba; --text-3:#777b84;
  --fiber:#ffc53d; --fiber-t:#ffca16; --fiber-ink:#16120c;
  --copper:#0090ff; --copper-t:#70b8ff; --copper-ink:#0d1520;
  --ok:#30a46c; --ok-bg:#121b17; --bad:#e5484d; --bad-bg:#201314;
  --warn:#ffc53d; --warn-bg:#1d180f; --info:#b0b4ba;
  --accent:#ffffff; --accent-ink:#111113;
  --sp:#7ce2fe; --mp:#baa7ff;
  --tabbar:#080d18; --shadow:0 12px 15px -5px rgba(0,0,0,.32);
  --font-ui:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  --font-head:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  --font-id:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  --r1:10px; --r2:12px; --r3:14px;
  color-scheme: dark;
}
body { font:400 14px/1.45 var(--font-ui); }
.top { padding:calc(env(safe-area-inset-top,0px) + 6px) 12px 7px; gap:8px; }
.brand { font:800 16px var(--font-head); gap:7px; }
.brand .logo > rect:first-child { fill:#212225; }
.brand .logo > path { stroke:#ffffff; }
.brand .logo > rect:nth-child(3), .brand .logo > rect:nth-child(4) { fill:#30a46c; }
.brand .logo > circle { fill:#111113; }
.burger { width:40px; height:40px; border-radius:10px; font-size:19px; }
.crumb { padding:6px 12px; font:600 12px var(--font-ui); }
.card { padding:12px; border-radius:14px; }
.btn { min-height:44px; font:700 14px var(--font-ui); padding:0 14px; border-radius:10px; }
.tabs { height:calc(62px + env(safe-area-inset-bottom,0px)); padding-top:5px; }
.tab { width:64px; min-height:48px; font:800 10.5px var(--font-ui); }
.tab i { font-size:19px; }
#view { padding:12px 12px calc(86px + env(safe-area-inset-bottom,0px)); gap:12px; }
.helpbtn { width:46px; height:46px; font:700 18px var(--font-ui); bottom:calc(78px + env(safe-area-inset-bottom,0px)); border-width:1.5px; }
.mp-back {
  min-height:38px; padding:0 12px 0 9px; border-radius:999px; flex:none;
  background:rgba(255,255,255,.055); border:1px solid var(--line); color:var(--text-2);
  font:800 12.5px var(--font-ui); cursor:pointer;
}
.mp-back:active { transform:scale(.96); }

/* identity: white primary actions + neutral active states, like our app.
   Fiber/copper media colors stay (they're status, not chrome). */
.tab.cur { color: var(--text); }
.tab.scan { background: var(--accent); color: var(--accent-ink); border-radius: 14px; box-shadow: 0 6px 18px rgba(255,255,255,.18); }
.hl { border-color: var(--accent); }
.burger { display: none; }
@media (max-width:480px) { .brand span { display:none; } }
</style>
<script>
(function () {
  function addBack() {
    var h = document.querySelector('header.top');
    if (!h || h.querySelector('.mp-back')) return;
    var b = document.createElement('button');
    b.className = 'mp-back';
    b.setAttribute('aria-label', 'Back to MP Kit');
    b.innerHTML = '&#8249; MP Kit';
    b.addEventListener('click', function () { window.location.href = './index.html#/home'; });
    h.insertBefore(b, h.firstChild);
  }
  function start() {
    addBack();
    var app = document.getElementById('app');
    if (app) new MutationObserver(addBack).observe(app, { childList: true });
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>
"""

# 2) inject theme + back-button right after their stylesheet closes
assert raw.count('</style>') == 1, "expected exactly one style block"
raw = raw.replace('</style>', '</style>' + THEME, 1)

open(DST, "w", encoding="utf-8", newline="").write(raw)

# 3) integrity checks
checks = {
    "zxwasm decoder embedded": 'id="zxwasm"' in raw,
    "ZXingWASM wrapper present": 'var ZXingWASM=' in raw,
    "sitepack BUF102 embedded": '"site":"BUF102"' in raw,
    "fonts embedded (woff2)": raw.count("data:font/woff2;base64") >= 2,
    "theme override injected": 'id="mp-theme"' in raw,
    "back-button observer injected": "MutationObserver(addBack)" in raw,
    "old floating pill gone": 'id="mpkit-back"' not in raw,
    "icon links removed": 'icon-180.png' not in raw,
    "manifest link removed": 'manifest.webmanifest' not in raw,
    "style blocks balanced (theirs + ours)": raw.count('<style') == 2 and raw.count('</style>') == 2,
    "size sane": 2_000_000 < len(raw) < 3_200_000,
}
ok = True
for k, v in checks.items():
    print(("PASS " if v else "FAIL ") + k)
    ok = ok and v
print(f"stripped: {n1} icon links, {n2} manifest link")
print(f"size: {orig_len} -> {len(raw)} bytes | sha256 {hashlib.sha256(raw.encode()).hexdigest()[:16]}")
sys.exit(0 if ok else 1)
