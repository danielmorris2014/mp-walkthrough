# Build training/ from the vendor zips - ONE reproducible pipeline (was hand-built).
#  - extracts the course-only zip (the FULL zip adds only MP4s)
#  - copies the 17 videos from the FULL zip
#  - injects the MP Kit back pill via the SHARED chrome.css (linked relatively)
#  - the kit precaches chrome.css + START_HERE.html, so the Training tile
#    works offline on a phone that has never opened it (the v53 field bug)
import zipfile, os, shutil, io, re, json

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.expanduser("~") + "\\Downloads"
DEST = os.path.join(APP, "training")
COURSE_ZIP = os.path.join(DL, "DataHall4_Cable_Training_Course_Only.zip")
FULL_ZIP = os.path.join(DL, "DataHall4_Cable_Training_FULL.zip")

# 1) wipe + re-extract the course (pills and all ride the pipeline now)
if os.path.isdir(DEST):
    shutil.rmtree(DEST)
z = zipfile.ZipFile(COURSE_ZIP)
z.extractall(DEST)
root = os.path.join(DEST, "DataHall4_Cable_Training")
count = sum(1 for n in z.namelist() if not n.endswith("/"))

# 2) videos from the FULL zip
vids = 0
zf = zipfile.ZipFile(FULL_ZIP)
for i in zf.infolist():
    if i.filename.endswith(".mp4"):
        with zf.open(i) as src, open(os.path.join(DEST, i.filename), "wb") as out:
            out.write(src.read())
        vids += 1


# v57: Graphite mobile re-theme for the course pages. Their CSS is fully
# token-driven (28 variables) - one remap onto the kit palette after their
# stylesheet wins the cascade. Diagrams are drawn for light backgrounds, so
# they ride on light plates; their 560px min-width sideways-scroll boxes are
# replaced by scale-to-fit (viewBox scales cleanly; rotate for detail).
GRAPHITE_CSS = '<style id="mp-graphite">\n/* MP Kit Graphite identity - component-level overrides (v65).\n   The v57 token-remap failed because their CSS vars are dual-role (text\n   AND background). This layer targets their actual components with\n   explicit values instead. Diagrams (svg.dg) stay on light plates. */\n:root { color-scheme: dark; }\nhtml, body { background: #0b0c0e !important; color: #edeef0 !important; }\nbody { font-family: -apple-system, \'SF Pro Text\', system-ui, sans-serif !important; }\n\n/* surfaces */\n.card, .box, .lsec, figure.fig, .checklists, .matchrow { background: #111113 !important;\n  border: 1px solid #363a3f !important; border-radius: 14px !important;\n  box-shadow: 0 1px 2px rgba(0,0,0,.4), 0 4px 14px rgba(0,0,0,.3) !important; }\n.hero { background: linear-gradient(180deg, #141519, #0b0c0e) !important; }\n\n/* text */\nbody, p, li, td, th, dt, dd, figcaption, .muted { color: #b0b4ba !important; }\nh1, h2, h3, h4, b, strong, .brand b, .term { color: #edeef0 !important; }\na { color: #55d0d6 !important; }\ncode, pre, .mono { background: #1b1d20 !important; color: #d3d6db !important;\n  border: 1px solid #2a2d33 !important; border-radius: 6px !important; }\n::placeholder { color: #777b84 !important; }\n\n/* buttons + interactive */\n.btn, button { background: rgba(255,255,255,.06) !important; color: #edeef0 !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\n.btn.pri, .btn.fib, button.pri { background: #fff !important; color: #111 !important;\n  border-color: #fff !important; font-weight: 700 !important; }\n.btn:active, button:active { transform: scale(0.96) !important; }\n\n/* progress + status */\n.prog, .pbar { background: rgba(255,255,255,.08) !important; }\n.prog .pbar, .pbar > div { background: #30a46c !important; }\n.done-badge { background: #12271a !important; color: #46a758 !important;\n  border: 1px solid rgba(48,164,108,.4) !important; }\n\n/* inputs */\ninput, select, textarea { background: #18191b !important; color: #edeef0 !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\n\n/* diagrams: light plates (they are drawn for light backgrounds) */\nfigure.fig .svgbox { background: #f5f2eb !important; border-radius: 12px !important;\n  padding: 10px !important; overflow-x: visible !important; }\nfigure.fig svg.dg { min-width: 0 !important; width: 100% !important; height: auto !important; }\nimg { max-width: 100% !important; height: auto !important; }\n\n/* tables: stacked labeled cards on phones (the proven pattern) */\n@media (max-width: 720px) {\n  html, body { overflow-x: clip !important; }\n  table { display: block !important; width: 100% !important; }\n  table thead { display: none !important; }\n  table tr { display: block !important; background: rgba(255,255,255,.03) !important;\n    border: 1px solid rgba(255,255,255,.08) !important; border-radius: 10px !important;\n    padding: 8px 10px !important; margin: 8px 0 !important; }\n  table td { display: block !important; border: 0 !important; padding: 3px 0 !important;\n    text-align: left !important; color: #b0b4ba !important; }\n  table td[data-label]:not([data-label=""])::before {\n    content: attr(data-label) ": "; font-weight: 700; opacity: .55; font-size: .85em; }\n}\n/* phone reading sizes */\n@media (max-width: 720px) {\n  main p, main li, .lesson p, .lesson li { font-size: 15.5px !important; line-height: 1.62 !important; }\n  main .muted, .lesson .muted { font-size: 13px !important; }\n}\n\n/* accent callout boxes + specific light-bg components (v65 finding:\n   objectives/connector-lists/etc. carry inline soft-accent bgs) */\n.objectives, .notice, .callout, .tip, .warning, .info-box,\n.pgrid li, ol.stripe li, .matchrow { background: #18191b !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\nh2, h3 { background: transparent !important; }\na { background: transparent !important; }\ntd, th, li { background: transparent !important; }\ntable { background: transparent !important; }\ntable.t { background: #111113 !important; border: 1px solid #363a3f !important; border-radius: 10px !important; }\n/* kill ALL remaining soft-accent inline backgrounds in content areas */\nmain [style*="background"], .lesson [style*="background"],\nmain [style*="--teal-soft"], main [style*="--amber-soft"],\nmain [style*="--hl-soft"], main [style*="--ok-soft"],\nmain [style*="--bad-soft"], main [style*="--info-soft"], main [style*="--warn-soft"] {\n  background: #18191b !important; border-radius: 10px !important; border: 1px solid #363a3f;\n}\n/* the connector-color chart: li items with white bg - dark them */\nol li, ul li { background: transparent !important; }\n\n/* NUCLEAR: kill every background in content areas, then restore known-good.\n   This catches inline styles, JS-set bgs, and any vendor class we missed. */\nmain *, .lesson *, #content *, article *, section *,\n.pgrid *, ol *, ul *, .fig-tools * { background-color: transparent !important; }\n/* restore surfaces + status elements */\nmain .card, .lesson .card, main .box, .lesson .box,\nmain table.t, .lesson table.t, main .objectives, .lesson .objectives {\n  background-color: #111113 !important; }\nmain pre, main code, .lesson pre, .lesson code { background-color: #1b1d20 !important; }\nfigure.fig .svgbox { background-color: #f5f2eb !important; }\n.prog .pbar, .prog .pbar > div { background-color: #30a46c !important; }\n.done-badge { background-color: #12271a !important; }\n/* kicker + sub text: bump to readable on dark */\n.kicker, .sub, .muted, figcaption { color: #777b84 !important; opacity: 1 !important; }\nem { color: #9aa0a8 !important; }\n.formula { background-color: #1b1d20 !important; color: #d3d6db !important;\n  border: 1px solid #2a2d33 !important; border-radius: 8px !important; }\n\n/* final stragglers: specific text colors + the last light-bg elements */\nspan.stage-tag { color: #6aa9e8 !important; }\n.kicker, .sub { color: #8a919c !important; }\np.muted, .muted { color: #8a919c !important; }\nem { color: #a0a7b0 !important; }\na { background: transparent !important; }\nh2, h3 { background: transparent !important; }\ntitle { color: inherit !important; }\n/* kill the #EEE9DF bg anywhere it still exists */\n[style*="238, 233, 223"], [style*="#EEE9DF"], [style*="#eee9df"] {\n  background: #18191b !important; }\n/* broader: any heading or link inside the topbar/brand area */\n.topbar *, .brand *, .side *, .menu-btn { background: transparent !important; }\n.topbar { background: rgba(11,12,14,.96) !important; }\n</style>'
TABLE_JS = '<script id="mp-table-labels">\n(function () {\n  function labelTables() {\n    document.querySelectorAll(\'table\').forEach(function (tb) {\n      if (tb.getAttribute(\'mp-labeled\')) return;\n      var head = tb.querySelectorAll(\'thead th, tr:first-child th\');\n      var labels = Array.from(head).map(function (h) { return (h.textContent || \'\').trim().slice(0, 18); });\n      if (!labels.length) return;\n      tb.setAttribute(\'mp-labeled\', \'1\');\n      tb.querySelectorAll(\'tr\').forEach(function (tr) {\n        if (tr.querySelector(\'th\')) return;\n        Array.from(tr.querySelectorAll(\'td\')).forEach(function (td, i) { td.setAttribute(\'data-label\', labels[i] || \'\'); });\n      });\n    });\n  }\n  new MutationObserver(function () { setTimeout(labelTables, 50); })\n    .observe(document.documentElement, { childList: true, subtree: true });\n  document.addEventListener(\'DOMContentLoaded\', labelTables);\n})();\n</script>'

# 3) back pill via the shared chrome stylesheet (path computed per depth)
LINK = '<link rel="stylesheet" href="{up}chrome.css">'
PILL = '<a class="mp-back-pill" href="{up}index.html#/home">&#8249; MP Kit</a>'
TARGETS = [
    "START_HERE.html",
    "course/index.html",
    "course/drs-explained/DRS_Explained.html",
    "reference/Reference_Guide.html",
]
for rel in TARGETS:
    path = os.path.join(root, rel)
    depth = rel.count("/") + 1            # files under training/DataHall4_Cable_Training/
    up = "../" * depth
    s = io.open(path, encoding="utf-8", errors="replace").read()
    s = s.replace("</head>", LINK.format(up=up) + THEME[:THEME.find("<script")] + "</head>", 1)
    mb = re.search(r"<body[^>]*>", s)
    s = s[:mb.end()] + TABLE_JS + s[mb.end():]
    mb = re.search(r"<body[^>]*>", s)
    s = s[:mb.end()] + THEME[THEME.find("<script"):] + s[mb.end():]
    m = re.search(r"<body[^>]*>", s)
    s = s[:m.end()] + PILL.format(up=up) + s[m.end():]
    io.open(path, "w", encoding="utf-8", newline="").write(s)

# 4) assertions - a malformed vendor package must fail here, not in the field
assert count >= 70, f"course files: {count} (expected >= 70)"
assert vids == 17, f"videos: {vids} (expected 17)"
for rel in TARGETS:
    s = io.open(os.path.join(root, rel), encoding="utf-8", errors="replace").read()
    assert "mp-back-pill" in s and "chrome.css" in s, f"pill missing in {rel}"
# 5) manifest for the service worker: every course file except videos, so
#    the Training tile works offline on a phone that has never opened it
manifest = []
for base, _, files in os.walk(DEST):
    for f in files:
        rel = os.path.relpath(os.path.join(base, f), APP).replace("\\", "/")
        if not rel.endswith(".mp4"):
            manifest.append("./" + rel)
manifest.sort()
io.open(os.path.join(APP, "training", "manifest.json"), "w", encoding="utf-8").write(
    json.dumps(manifest, separators=(",", ":")))
print(f"training/ rebuilt: {count} course files + {vids} videos + pills in {len(TARGETS)} pages + manifest({len(manifest)})")
