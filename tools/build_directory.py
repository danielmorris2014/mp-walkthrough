# Parse the two Service Field Guide pastes into the Kit's embedded
# data-haul directory (compact arrays). Rerun when full files arrive —
# same parser handles complete exports.
import re, json, sys, os

SRC_DIR = r"C:\Users\DanielMorris\.zcode\tmp\paste-attachments\2026-10-20"
OUT = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\tools\directory-data.js"

BAR_RE = re.compile(r"^([A-Z0-9]{3,8}#\d{4,})$")
LBL_DASH = re.compile(r"^[A-Z0-9]{3,6}-DH\d{1,2}-R\d{4}-")
LBL_SLASH = re.compile(r"^[A-Z0-9]{3,6} / DH\d{1,2} / R\d{4} / .+")

def is_label(s):
    return bool(LBL_DASH.match(s or "")) or bool(LBL_SLASH.match(s or ""))

barcodes, presets = [], []
for fn in sorted(os.listdir(SRC_DIR)):
    lines = open(os.path.join(SRC_DIR, fn), encoding="utf-8", errors="replace").read().splitlines()
    is_barcodes = any("ASSIGNED BARCODE DIRECTORY" in l for l in lines[:10])
    is_presets = any("PRESET A/Z" in l for l in lines[:10])
    if not (is_barcodes or is_presets):
        continue
    for ln in lines:
        cols = ln.split("\t")
        if is_barcodes and len(cols) >= 4:
            s, a, z, f = cols[0].strip(), cols[1].strip(), cols[2].strip(), cols[3].strip()
            if BAR_RE.match(s) and is_label(a) and is_label(z):
                barcodes.append([s, a, z, f])
        elif is_presets and len(cols) >= 5:
            ab, ref, fam, a, z = cols[0].strip(), cols[1].strip(), cols[2].strip(), cols[3].strip(), cols[4].strip()
            src = cols[6].strip() if len(cols) > 6 else ""
            if ref.startswith(("CB", "CBL")) and is_label(a) and is_label(z):
                presets.append([fam, a, z, src, ab])

seen = set(); bc = []
for r in barcodes:
    if r[0] not in seen:
        seen.add(r[0]); bc.append(r)
seenp = set(); pr = []
for r in presets:
    k = (r[0], r[1], r[2])
    if k not in seenp:
        seenp.add(k); pr.append(r)

fam_counts = {}
for r in bc:
    fam_counts[r[3]] = fam_counts.get(r[3], 0) + 1

data = {"v": 1, "site": "BUF102", "gen": "2026-10-20", "barcodes": bc, "presets": pr}
js = "var DIRECTORY = " + json.dumps(data, separators=(",", ":")) + ";"
open(OUT, "w", encoding="utf-8").write(js)

print(f"barcodes: {len(bc)} | presets: {len(pr)}")
print("families:", json.dumps(fam_counts))
print("js bytes:", len(js.encode()))
pf = {}
for r in pr:
    pf[r[0]] = pf.get(r[0], 0) + 1
print("preset families:", json.dumps(pf))
sys.exit(0 if (bc and pr) else 1)
