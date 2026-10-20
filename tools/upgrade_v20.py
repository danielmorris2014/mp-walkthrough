# v20 upgrade:
# 1. extract zxing reader wrapper + wasm from guide.html -> vendor/zxing/
# 2. index.html: drop inline DIRECTORY data, replace module with async
#    gz-loader + indexing + scanner; add Scan button; bump version
import re, os, sys

APP = r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app"
os.makedirs(os.path.join(APP, "vendor", "zxing"), exist_ok=True)

# ---------- 1. extract zxing engine ----------
guide = open(os.path.join(APP, "guide.html"), encoding="utf-8").read()
m = re.search(r'<script type="application/octet-stream" id="zxwasm">(.*?)</script>', guide, re.S)
assert m, "zxwasm script not found"
wasm = m.group(1).strip()
import base64
open(os.path.join(APP, "vendor", "zxing", "zxing_reader.wasm"), "wb").write(base64.b64decode(wasm))
m2 = re.search(r'<script>var ZXingWASM=(.*?)</script>', guide, re.S)
assert m2, "ZXingWASM wrapper not found"
open(os.path.join(APP, "vendor", "zxing", "reader.js"), "w", encoding="utf-8", newline="").write(
    "// zxing-wasm reader wrapper (extracted from cable-field-guide; same upstream, Apache-2.0)\n"
    "var ZXingWASM=" + m2.group(1).rstrip() + "\n")
print("vendor/zxing: reader.js", os.path.getsize(os.path.join(APP, 'vendor','zxing','reader.js')), "bytes | wasm",
      os.path.getsize(os.path.join(APP, 'vendor','zxing','zxing_reader.wasm')), "bytes")

# ---------- 2. patch index.html ----------
idx_path = os.path.join(APP, "index.html")
raw = open(idx_path, encoding="utf-8").read()

# 2a. remove the big inline DIRECTORY line
raw, n1 = re.subn(r"^var DIRECTORY = \{.*\};\n", "", raw, count=1, flags=re.M)
assert n1 == 1, "DIRECTORY line not removed"

# 2b. scan button in the panel search row
old_input = '<input type="search" id="dirSearch" placeholder="Barcode last digits (042), rack (R0131), device, port" style="width:100%;" oninput="dirSearchChanged()">'
new_input = ('<div style="display:flex; gap:8px; align-items:stretch;">'
             '<input type="search" id="dirSearch" placeholder="Barcode (042), rack (R0131), device, port" style="flex:1; min-width:0;" oninput="dirSearchChanged()">'
             '<button class="btn" style="min-width:52px;" onclick="dirScan()" aria-label="Scan barcode"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3v14h18z"/><path d="M7 5v14"/><path d="m11.5 8 1.5 8"/><path d="m16 8-1.5 8"/><path d="M18.5 8l1 8"/></svg></span></button>'
             '</div>')
assert old_input in raw, "dirSearch input anchor missing"
raw = raw.replace(old_input, new_input, 1)

# 2c. replace the whole directory module (from its banner to the boot banner)
start = raw.index("/* ---------------- data haul directory ---------------- */")
end = raw.index("/* ---------------- boot ---------------- */")
NEW = open(os.path.join(APP, "tools", "directory_module_v20.js"), encoding="utf-8").read()
raw = raw[:start] + NEW + raw[end:]

# 2d. version bump
raw = raw.replace("var APP_VERSION = 'v19';", "var APP_VERSION = 'v20';", 1)

open(idx_path, "w", encoding="utf-8", newline="").write(raw)
print("index.html patched:", len(raw), "chars")
