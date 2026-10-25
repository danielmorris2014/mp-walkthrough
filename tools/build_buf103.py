# BUF103 pipeline CLI adapter -> tools/cutsheet-parser.js (ADR-0003).
# Single-sources all cutsheet parsing, multi-hop channel extraction, string
# interning, material counts, and halls-buf103.json derivation in CutsheetParser.
import base64, gzip, json, os, sys, time
from playwright.sync_api import sync_playwright

DL = r"C:\Users\DanielMorris\Downloads"
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(DL, "[ext] ICT_Cutsheet_Production_BUF103_v0.34.xlsx")

t0 = time.time()
with open(SRC, "rb") as f:
    b64_xlsx = base64.b64encode(f.read()).decode("ascii")

xlsx_js = open(os.path.join(APP, "vendor", "xlsx", "xlsx.full.min.js"), encoding="utf-8").read()
parser_js = open(os.path.join(APP, "tools", "cutsheet-parser.js"), encoding="utf-8").read()

with sync_playwright() as p:
    browser = p.chromium.launch(channel=os.environ.get("MP_BROWSER", "msedge"), headless=True)
    page = browser.new_page()
    page.add_script_tag(content=xlsx_js)
    page.add_script_tag(content=parser_js)
    res = page.evaluate(
        """(b64) => {
          const bin = atob(b64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          const logs = [];
          const out = CutsheetParser.parseArrayBuffer(
            bytes.buffer,
            { fileName: 'ICT_Cutsheet_Production_BUF103_v0.34.xlsx', minRows: 250000 },
            (prog) => {
              if (prog.sheet !== 'Complete' && prog.sheet !== 'Finalizing dictionary & materials') {
                logs.push(prog.sheet);
              }
            }
          );
          return { data: out.data, hallsCfg: out.hallsCfg };
        }""",
        b64_xlsx,
    )
    browser.close()

out = res["data"]
halls_cfg = res["hallsCfg"]
for fam in out["fams"]:
    print(f"{fam!r}: {len(out['rows'][fam])} rows")

raw = json.dumps(out, separators=(",", ":"))
os.makedirs(os.path.join(APP, "data"), exist_ok=True)
with open(os.path.join(APP, "data", "buf103.json.gz"), "wb") as f:
    f.write(gzip.compress(raw.encode("utf-8"), compresslevel=9, mtime=0))
with open(os.path.join(APP, "data", "halls-buf103.json"), "w", encoding="utf-8") as f:
    json.dump(halls_cfg, f, separators=(",", ":"))

total = sum(len(v) for v in out["rows"].values())
print("halls-buf103.json:", {h: v["maxRow"] for h, v in halls_cfg.items()})
print(f"TOTAL rows={total} dict={len(out['d'])} halls={out['halls']}")
print(f"json={len(raw)//1024}KB gz={os.path.getsize(os.path.join(APP,'data','buf103.json.gz'))//1024}KB in {time.time()-t0:.1f}s")
if total < 250000:
    sys.exit(1)
