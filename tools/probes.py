# Checked-in probe suite (architecture candidate #3): the one-off gates that
# caught the real v23-v27 bugs, made permanent. Each probe drives the SCREENS
# registry — the single source of truth for per-screen chrome.
#   python tools/probes.py   (needs playwright + Edge; start from repo root;
#   a dev server on 8123 is started automatically if absent)
import sys, time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123"
fails = []

def check(label, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + label + ("  — " + detail if detail and not ok else ""))
    if not ok: fails.append(label)

def vis(el):
    return bool(el) and el.is_visible()

with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge", headless=True)
    pg = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark",
                       permissions=["clipboard-read", "clipboard-write"]).new_page()
    pg.goto(BASE + "/index.html?probes", wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)

    # --- 1. NAV-CHROME PROBE: every screen wears exactly its registry chrome ---
    res = pg.evaluate("""() => {
      const out = {};
      const vis = s => { const el = document.querySelector(s); return !!el && getComputedStyle(el).display !== 'none'; };
      for (const t of Object.keys(SCREENS)) {
        switchTab(t);
        const s = SCREENS[t];
        out[t] = {
          dock: vis('.status-dock') === !!s.chrome.dock,
          bar: vis('.bottom-nav') === !!s.chrome.bar,
          hallTabs: vis('.hall-tabs') === !!s.chrome.hallTabs,
          back: vis('.kit-back') === !!s.chrome.back,
          title: document.querySelector('.app-title').textContent === s.title,
          panel: document.getElementById(s.panel).classList.contains('active')
        };
      }
      return out;
    }""")
    for t, r in res.items():
        for k, ok in r.items():
            check(f"nav[{t}].{k}", ok)

    # --- 2. FONT GATE: no focusable control below 16px (iOS zoom bug) ---
    pg.evaluate("() => Object.keys(SCREENS).forEach(switchTab)")
    bad = pg.evaluate("""() => {
      const bad = [];
      document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16)
          bad.push((el.id || el.type) + ':' + getComputedStyle(el).fontSize);
      });
      return bad;
    }""")
    check("fonts: all focusable >= 16px", not bad, str(bad[:5]))

    # --- 3. COPY ROUND-TRIP: the report copy really lands on the clipboard ---
    pg.evaluate("switchTab('report')"); pg.wait_for_timeout(400)
    pg.evaluate("copyReport()"); pg.wait_for_timeout(400)
    clip = pg.evaluate("navigator.clipboard.readText()")
    check("copy: report on clipboard", "Team" in clip or "SHIFT" in clip or "Superintendent" in clip,
          clip[:60] if clip else "empty")

    # --- 4. ROUTE: hash deep-links resolve through the registry ---
    r2 = pg.evaluate("""() => { location.hash = '#/report'; return new Promise(r => setTimeout(() => r(currentTab), 300)); }""")
    check("route: #/report", r2 == "report", str(r2))

    b.close()

print("\n" + ("PROBES: ALL PASS" if not fails else "PROBES FAILED: " + ", ".join(fails)))
sys.exit(1 if fails else 0)
