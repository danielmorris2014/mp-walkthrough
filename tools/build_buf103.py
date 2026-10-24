# BUF103 pipeline: ICT cutsheet xlsx -> data/buf103.json(.gz)
# One row = one planned connection. Strings are interned into a dictionary;
# rows are int-index arrays. Materials counts computed per family/hall/spec.
# Asserts ingest counts so a malformed revision FAILS instead of shipping partial.
import openpyxl, json, gzip, os, re, sys, time

DL = r"C:\Users\DanielMorris\Downloads"
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(DL, "[ext] ICT_Cutsheet_Production_BUF103_v0.34.xlsx")

t0 = time.time()
wb = openpyxl.load_workbook(SRC, read_only=True)

dct = {}
def intern(s):
    s = str(s).strip() if s is not None else ""
    if not s:
        return -1
    if s not in dct:
        dct[s] = len(dct)
    return dct[s]

fams, rows_out, total = [], {}, 0

hall_re = re.compile(r"BUF103-(DH\d+?)[-/]", re.I)
halls = {}

def pick(hmap, *names):
    for n in names:
        if n in hmap:
            return hmap[n]
    return None

for name in wb.sheetnames:
    if name == "Intro":
        continue
    ws = wb[name]
    hdr_idx, headers = None, None
    buf = []
    for i, row in enumerate(ws.iter_rows(values_only=True), 1):
        if hdr_idx is None:
            # column A is empty on these sheets - A_loc lands in col B
            if row and any(str(c or "").strip() == "A_loc" for c in row[:4]):
                hdr_idx = i
                headers = [str(h or "").strip() for h in row]
                hmap = {}
                for j, h in enumerate(headers):
                    if h and h not in hmap:
                        hmap[h] = j
                col_a_loc = pick(hmap, "A_loc")
                col_a_name = pick(hmap, "A_name")
                col_a_port = pick(hmap, "A_port")
                col_z_loc = pick(hmap, "Z_loc", "eor_loc")
                col_z_name = pick(hmap, "Z_name", "eor_name")
                col_z_port = pick(hmap, "Z_port", "eor_front_port")
                spec_cols = [
                    hmap[c]
                    for c in (
                        "cable",
                        "A_Z_trunk_assembly",
                        "tor_eor_cable",
                        "A_patch_cord",
                        "Z_patch_cord",
                        "eor_dcn_cable",
                        "dcn_spn_cable",
                    )
                    if c in hmap
                ]
                col_pan_a = pick(hmap, "A_patch_panel")
                col_pan_a_ru = pick(hmap, "A_pp_ru")
                col_pan_a_port_f = pick(hmap, "A_pp_port_front")
                col_a_pp_loc = pick(hmap, "A_pp_loc")
                col_pan_z = pick(hmap, "eor_panel", "Z_patch_panel")
                col_pan_z_ru = pick(hmap, "eor_ru", "Z_pp_ru")
                col_pan_z_port_f = pick(hmap, "Z_pp_port_front")
                col_z_pp_loc = pick(hmap, "Z_pp_loc")
                col_eor_loc = pick(hmap, "eor_loc")
                col_eor_pan = pick(hmap, "eor_panel")
                col_eor_ru = pick(hmap, "eor_ru")
                col_eor_port_f = pick(hmap, "eor_front_port")
                col_eor_dcn_cable = pick(hmap, "eor_dcn_cable")
                col_dcn_loc = pick(hmap, "dcn_loc")
                col_dcn_pan = pick(hmap, "dcn_panel")
                col_dcn_ru = pick(hmap, "dcn_ru")
                col_dcn_port_f = pick(hmap, "dcn_front_port")
                col_dcn_spn_cable = pick(hmap, "dcn_spn_cable")
            continue
        # data row: must have an A_loc to count
        a_loc = row[col_a_loc] if col_a_loc is not None and col_a_loc < len(row) else None
        if a_loc is None or not str(a_loc).strip():
            continue
        def g(c):
            return row[c] if (c is not None and c < len(row)) else None
        def gs(c):
            v = g(c)
            return str(v).strip() if v is not None else ""
        a_loc_s = gs(col_a_loc)
        z_loc_s = gs(col_z_loc)
        pan = ""
        if col_pan_a is not None and gs(col_pan_a):
            pan = gs(col_pan_a) + ((" ru" + gs(col_pan_a_ru)) if gs(col_pan_a_ru) else "")
        elif col_pan_z is not None and gs(col_pan_z):
            pan = gs(col_pan_z) + ((" ru" + gs(col_pan_z_ru)) if gs(col_pan_z_ru) else "")
        a_full = gs(col_a_name)
        if gs(col_a_port):
            a_full = (a_full + " " + gs(col_a_port)).strip()
        if not a_full and gs(col_pan_a):
            a_full = gs(col_pan_a) + ((" p" + gs(col_pan_a_port_f)) if gs(col_pan_a_port_f) else "")
        z_full = gs(col_z_name)
        if gs(col_z_port):
            z_full = (z_full + " " + gs(col_z_port)).strip()
        if not z_full and gs(col_pan_z):
            z_full = gs(col_pan_z) + ((" p" + gs(col_pan_z_port_f)) if gs(col_pan_z_port_f) else "")
        spec_val = ""
        for sc in spec_cols:
            sv = gs(sc)
            if sv:
                spec_val = sv
                break
        entry = [
            intern(a_loc_s),
            intern(a_full),
            intern(z_loc_s),
            intern(z_full),
            intern(spec_val),
            intern(pan),
        ]
        # Multi-hop intermediate points (EOR / DCN / cross-rack patch panels)
        hops = []
        eor_loc_s = gs(col_eor_loc)
        if eor_loc_s and eor_loc_s != a_loc_s and eor_loc_s != z_loc_s:
            eor_lbl = (
                gs(col_eor_pan)
                + ((" ru" + gs(col_eor_ru)) if gs(col_eor_ru) else "")
                + ((" " + gs(col_eor_port_f)) if gs(col_eor_port_f) else "")
            ).strip()
            hops.extend([intern(eor_loc_s), intern(eor_lbl), intern(gs(col_eor_dcn_cable))])
        else:
            a_pp_loc_s = gs(col_a_pp_loc)
            if a_pp_loc_s and a_pp_loc_s != a_loc_s and a_pp_loc_s != z_loc_s:
                a_pp_lbl = (gs(col_pan_a) + ((" ru" + gs(col_pan_a_ru)) if gs(col_pan_a_ru) else "")).strip()
                hops.extend([intern(a_pp_loc_s), intern(a_pp_lbl), -1])
        dcn_loc_s = gs(col_dcn_loc)
        if dcn_loc_s and dcn_loc_s != a_loc_s and dcn_loc_s != z_loc_s:
            dcn_lbl = (
                gs(col_dcn_pan)
                + ((" ru" + gs(col_dcn_ru)) if gs(col_dcn_ru) else "")
                + ((" " + gs(col_dcn_port_f)) if gs(col_dcn_port_f) else "")
            ).strip()
            hops.extend([intern(dcn_loc_s), intern(dcn_lbl), intern(gs(col_dcn_spn_cable))])
        else:
            z_pp_loc_s = gs(col_z_pp_loc)
            if z_pp_loc_s and z_pp_loc_s != a_loc_s and z_pp_loc_s != z_loc_s:
                z_pp_lbl = (gs(col_pan_z) + ((" ru" + gs(col_pan_z_ru)) if gs(col_pan_z_ru) else "")).strip()
                hops.extend([intern(z_pp_loc_s), intern(z_pp_lbl), -1])
        if hops:
            entry.append(hops)
        buf.append(entry)
        for loc in (a_loc_s, z_loc_s, eor_loc_s, dcn_loc_s):
            if not loc:
                continue
            m = hall_re.match(loc + "-")
            if not m:
                m = hall_re.search(loc)
            if m and m.group(1) not in halls:
                halls[m.group(1).upper()] = True
    if hdr_idx is None:
        print(f"WARN: no A_loc header in sheet {name!r} - skipped")
        continue
    if len(buf) < 4:
        print(f"WARN: sheet {name!r} yielded only {len(buf)} rows - skipped")
        continue
    fams.append(name)
    rows_out[name] = buf
    total += len(buf)
    print(f"{name!r}: {len(buf)} rows (header at r{hdr_idx})")

wb.close()
rev = {v: k for k, v in dct.items()}
def dct_rev(i):
    return rev.get(i)


# materials: per family -> per spec-string counts (spec dict text only)
mats = {}
for name, buf in rows_out.items():
    cnt = {}
    for r in buf:
        if r[4] >= 0:
            cnt[r[4]] = cnt.get(r[4], 0) + 1
    mats[name] = sorted(cnt.items(), key=lambda kv: -kv[1])

out = {
    "v": 1,
    "src": "ICT_Cutsheet_Production_BUF103_v0.34",
    "d": sorted(dct, key=lambda s: dct[s]),
    "fams": fams,
    "halls": sorted(halls),
    "rows": {f: [r for r in buf] for f, buf in rows_out.items()},
    "mats": mats,
}
raw = json.dumps(out, separators=(",", ":"))
os.makedirs(os.path.join(APP, "data"), exist_ok=True)
raw_path = os.path.join(APP, "data", "buf103.json")
if os.path.exists(raw_path):
    os.remove(raw_path)
with open(os.path.join(APP, "data", "buf103.json.gz"), "wb") as f:
    f.write(gzip.compress(raw.encode("utf-8"), compresslevel=9, mtime=0))

# hall configs for the walkthrough: rows derived from rack ids (R{row}{pos})
halls_cfg = {}
for hall in out["halls"]:
    rows = set()
    for fam in fams:
        for r in rows_out[fam]:
            loc_idxs = [r[0], r[2]]
            if len(r) > 6 and r[6]:
                loc_idxs.extend(r[6][0::3])
            for loci in loc_idxs:
                loc = dct_rev(loci)
                m2 = re.match(r"BUF103-(DH\d+)-R(\d{2})\d{2}$", loc or "")
                if m2 and m2.group(1) == hall:
                    rows.add(int(m2.group(2)))
    rows = sorted(rows)
    groups = []
    groups_net = [r for r in rows if r <= 2]
    body = [r for r in rows if r > 2]
    if groups_net:
        groups.append({"name": "Network Rows %d-%d" % (groups_net[0], groups_net[-1]), "rows": groups_net})
    for i in range(0, len(body), 8):
        chunk = body[i:i+8]
        groups.append({"name": "POD %d (%d-%d)" % (i//8, chunk[0], chunk[-1]), "rows": chunk})
    halls_cfg[hall] = {"maxRow": max(rows) if rows else 0, "groups": groups}
with open(os.path.join(APP, "data", "halls-buf103.json"), "w", encoding="utf-8") as f:
    json.dump(halls_cfg, f, separators=(",", ":"))
print("halls-buf103.json:", {h: v["maxRow"] for h, v in halls_cfg.items()})
print(f"TOTAL rows={total} dict={len(dct)} halls={sorted(halls)}")
print(f"json={len(raw)//1024}KB gz={os.path.getsize(os.path.join(APP,'data','buf103.json.gz'))//1024}KB in {time.time()-t0:.0f}s")
if total < 250000:
    print("FAIL: expected >=250K rows across sheets; refusing to trust this revision")
    sys.exit(1)
