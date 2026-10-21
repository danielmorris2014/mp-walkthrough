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
THEME = """
<style id="mp-mobile-fix">
/* Friction fixes on the vendor's own (clean-auditing) light theme:
   diagrams scale to the phone instead of sideways-scrolling (their
   min-width 560px boxes caused the left-right scroll), body text gets
   phone-sized, images clamp. A full Graphite re-theme needs per-element
   work: their tokens are dual-role (text AND background), so a plain
   remap inverts 280+ pairs - measured, reverted, deferred. */
/* diagrams are light-drawn: mount them on light plates, sized to the phone */
figure.fig .svgbox { background: #f5f2eb; border-radius: 12px; padding: 10px;
  overflow-x: visible !important; }
figure.fig svg.dg { min-width: 0 !important; width: 100% !important; height: auto; }
img { max-width: 100%; height: auto; }
/* phone-sized reading: bigger body text, meta no longer print-tiny */
@media (max-width: 720px) {
  html, body { overflow-x: clip; }
  main p, main li, .lesson p, .lesson li { font-size: 15.5px; line-height: 1.62; }
  main .muted, main .meta, .lesson .muted { font-size: 13px !important; }
  /* wide tables (l13 had a 560px one) stack into labeled cards - the same
     treatment the Field Reference got; no content past a scroll edge */
  table { display: block; width: 100%; }
  table thead { display: none; }
  table tr { display: block; background: rgba(0,0,0,.035);
    border: 1px solid rgba(0,0,0,.13); border-radius: 10px;
    padding: 6px 10px; margin: 8px 0; }
  table td { display: block; border: 0; padding: 3px 0; text-align: left; }
  table td[data-label]:not([data-label=""])::before {
    content: attr(data-label) ": "; font-weight: 700; opacity: .55; font-size: .85em; }
}
</style>
<script id="mp-table-labels">
(function () {
  function labelTables() {
    document.querySelectorAll('table').forEach(function (tb) {
      if (tb.getAttribute('mp-labeled')) return;
      var head = tb.querySelectorAll('thead th, tr:first-child th');
      var labels = Array.from(head).map(function (h) { return (h.textContent || '').trim().slice(0, 18); });
      if (!labels.length) return;
      tb.setAttribute('mp-labeled', '1');
      tb.querySelectorAll('tr').forEach(function (tr) {
        if (tr.querySelector('th')) return;
        Array.from(tr.querySelectorAll('td')).forEach(function (td, i) { td.setAttribute('data-label', labels[i] || ''); });
      });
    });
  }
  new MutationObserver(function () { setTimeout(labelTables, 50); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', labelTables);
})();
</script>
"""

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
