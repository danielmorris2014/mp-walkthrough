# Screenshot every page of both apps at iPhone size + probe theme vars.
from playwright.sync_api import sync_playwright
import json, os, sys

OUT = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\tools\shots"
os.makedirs(OUT, exist_ok=True)
BASE = "http://127.0.0.1:8123"

def shot(page, name):
    page.wait_for_timeout(450)
    page.screenshot(path=os.path.join(OUT, name + ".png"))
    print("shot:", name)

with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge", headless=True)
    ctx = b.new_context(
        viewport={"width": 390, "height": 844}, device_scale_factor=2,
        is_mobile=True, has_touch=True, locale="en-US",
        permissions=[],  # deny camera by default
        color_scheme="dark",
    )
    ctx.add_init_script(
        "try{localStorage.setItem('mp_walkthrough_v1', JSON.stringify(Object.assign"
        "((window.__s=JSON.parse(localStorage.getItem('mp_walkthrough_v1')||'{}')).settings"
        "=Object.assign(__s.settings||{},{onboarded:true}),__s)));}catch(e){}"
    )
    page = ctx.new_page()
    page.on("pageerror", lambda e: print("PAGEERROR:", str(e)[:160]))
    page.on("console", lambda m: print("CONSOLE-" + m.type + ":", m.text[:160]) if m.type in ("error", "warning") else None)

    # ---------- MP KIT ----------
    page.goto(BASE + "/index.html?shot1", wait_until="domcontentloaded")
    page.evaluate("try{navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister()))}catch(e){}; if(caches.keys){caches.keys().then(ks=>ks.forEach(k=>caches.delete(k)))}")
    page.reload(wait_until="domcontentloaded"); page.wait_for_timeout(900)
    shot(page, "kit-home")
    for tab in ["walk", "crew", "blockers", "report"]:
        page.evaluate(f"switchTab('{tab}')")
        shot(page, "kit-" + tab)
    # walkthrough mid-scroll
    page.evaluate("switchTab('walk')"); page.wait_for_timeout(200)
    page.mouse.wheel(0, 900); shot(page, "kit-walk-scrolled")

    # ---------- GUIDE ----------
    page.goto(BASE + "/guide.html?shot1", wait_until="domcontentloaded")
    page.wait_for_timeout(2500)  # sitepack unlock + boot
    probe = page.evaluate("""(() => {
      const cs = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const btn = document.querySelector('.btn');
      const tabs = document.querySelector('.tabs');
      const back = document.querySelector('.mp-back');
      return {
        bg: cs.getPropertyValue('--bg').trim(),
        accent: cs.getPropertyValue('--accent').trim(),
        surface: cs.getPropertyValue('--surface').trim(),
        fontUI: cs.getPropertyValue('--font-ui').trim().slice(0, 40),
        bodyFont: body.font.slice(0, 60),
        btnH: btn ? getComputedStyle(btn).minHeight : null,
        tabsH: tabs ? getComputedStyle(tabs).height : null,
        backBtn: back ? back.textContent.trim() : "MISSING",
        themeStyleFirst: (() => {
          const ours = document.getElementById('mp-theme');
          const styles = [...document.querySelectorAll('style')];
          return ours ? styles.indexOf(ours) + '/' + styles.length : 'ABSENT';
        })(),
        hash: location.hash, title: document.title,
      };
    })()""")
    print("PROBE:", json.dumps(probe, indent=1))
    shot(page, "guide-home")

    # discover routes/model via their exposed API
    ids = page.evaluate("""(() => {
      try {
        const M = window.SPFG.model;
        const c = M && M.cables && M.cables[0];
        return { cable: c ? c.id : null, racks: M && M.racks ? [...M.racks.keys()].slice(0, 3) : [], nCables: M ? M.cables.length : 0 };
      } catch (e) { return { err: String(e) }; }
    })()""")
    print("MODEL:", json.dumps(ids))

    for h, name in [("#/routes", "guide-routes"), ("#/work", "guide-work"), ("#/more", "guide-more"),
                    ("#/help", "guide-help"), ("#/map", "guide-map"), ("#/report", "guide-report"),
                    ("#/clean", "guide-clean"), ("#/find", "guide-find"), ("#/notes", "guide-notes")]:
        page.evaluate(f"location.hash = '{h}'")
        page.wait_for_timeout(700)
        shot(page, name)

    if ids.get("cable"):
        cid = ids["cable"]
        page.evaluate(f"location.hash = '#/cable/' + encodeURIComponent('{cid}')")
        page.wait_for_timeout(800); shot(page, "guide-cable")
        page.evaluate(f"location.hash = '#/walk/' + encodeURIComponent('{cid}') + '/1'")
        page.wait_for_timeout(900); shot(page, "guide-walk")
    if ids.get("racks"):
        rid = ids["racks"][0]
        page.evaluate(f"location.hash = '#/rack/' + encodeURIComponent('{rid}')")
        page.wait_for_timeout(800); shot(page, "guide-rack")

    b.close()
print("DONE ->", OUT)
