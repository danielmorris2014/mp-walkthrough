# Full-data pipeline: Downloads exports -> walkthrough-app/data/directory.json[.gz]
# - Assigned_Barcodes_and_A-Z.txt: two sections, header-aware parse, dedupe by barcode
# - Preset_A-Z_All_Halls.txt: preset rows; keep BUF102-referenced + barcode-less design rows
# Emits compact JSON {v, gen, barcodes:[[code,a,z,fam,src?]], presets:[[fam,a,z,ref,ab]]}
import re, json, gzip, os, sys, collections

DL = r"C:\Users\DanielMorris\Downloads"
OUTDIR = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\data"
os.makedirs(OUTDIR, exist_ok=True)

BARROW = re.compile(r"^([A-Z0-9]{3,8}#\d{4,})\t")
PREROW = re.compile(r"^\t?([A-Z0-9/]+)-DH\d/LINK-")
LBL_D = re.compile(r"^[A-Z0-9]{3,6}-DH\d{1,2}-R\d{4}-")
LBL_S = re.compile(r"^[A-Z0-9]{3,6} / DH\d{1,2} / R\d{4} / ")
is_lbl = lambda s: bool(LBL_D.match(s or "") or LBL_S.match(s or ""))

def parse_barcode_file(path):
    barcodes, order = {}, []
    sec2 = 0
    for ln in open(path, encoding="utf-8", errors="replace"):
        if not BARROW.match(ln):
            continue
        c = ln.rstrip("\n").split("\t")
        code = c[0].strip()
        # section 1 layout: code, A, Z, family, sheet, row
        a, z, fam = c[1].strip(), c[2].strip(), c[3].strip()
        if not (is_lbl(a) and is_lbl(z)):
            # shifted layout (source A/Z section): find first two label-ish cols after code
            labs = [x.strip() for x in c[1:] if is_lbl(x.strip())]
            if len(labs) < 2:
                continue
            a, z = labs[0], labs[1]
            fam = ""
            for x in c[1:]:
                x = x.strip()
                if "<>" in x and len(x) < 40:
                    fam = x; break
            sec2 += 1
        if code not in barcodes:
            barcodes[code] = [code, a, z, fam]
            order.append(code)
        elif fam and not barcodes[code][3]:
            barcodes[code][3] = fam
    return [barcodes[k] for k in order], sec2

def parse_preset_file(path):
    presets, seen = [], set()
    for ln in open(path, encoding="utf-8", errors="replace"):
        if not PREROW.match(ln):
            continue
        c = ln.rstrip("\n").split("\t")
        if len(c) < 5:
            continue
        fam, a, z = c[2].strip(), c[3].strip(), c[4].strip()
        src = c[6].strip() if len(c) > 6 else ""
        ab = c[0].strip()
        if not (is_lbl(a) and is_lbl(z)):
            continue
        keep = src.startswith("BUF102#") or src == ""  # our site, or design-only rows
        if not keep:
            continue
        k = (fam, a, z)
        if k in seen:
            continue
        seen.add(k)
        presets.append([fam, a, z, src, ab])
    return presets

bcs, sec2 = parse_barcode_file(os.path.join(DL, "Assigned_Barcodes_and_A-Z.txt"))
pres = parse_preset_file(os.path.join(DL, "Preset_A-Z_All_Halls.txt"))

fams = collections.Counter(r[3] or "?" for r in bcs)
data = {"v": 2, "site": "BUF102", "gen": "2026-10-20", "barcodes": bcs, "presets": pres}
js = json.dumps(data, separators=(",", ":"), ensure_ascii=False)
jspath = os.path.join(OUTDIR, "directory.json")
gzpath = jspath + ".gz"
open(jspath, "w", encoding="utf-8", newline="").write(js)
with open(gzpath, "wb") as f:
    f.write(gzip.compress(js.encode("utf-8"), 9))

print(f"barcodes: {len(bcs):,} (sec2 repaired {sec2:,}) | presets kept: {len(pres):,}")
print("families:", json.dumps(dict(sorted(fams.items(), key=lambda x: -x[1])[:20])))
print(f"json {len(js)/1e6:.2f}MB | gz {os.path.getsize(gzpath)/1e6:.2f}MB")
sys.exit(0 if bcs else 1)
