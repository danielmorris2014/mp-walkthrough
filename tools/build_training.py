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
    s = s.replace("</head>", LINK.format(up=up) + "</head>", 1)
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
