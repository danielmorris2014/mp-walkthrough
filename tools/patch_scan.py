# Replace the directory scanner block (var SCAN ... dirScanClose) with the
# hardened version: ROI strip crop, frame pacing via timer, 2-frame voting,
# regex gate, WebAudio beep, session dedupe. Tolerates CRLF/LF.
import re, sys

NEW = open(r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\tools\scan_block_v20.js", encoding="utf-8").read().strip() + "\n"
PAT = re.compile(r"var SCAN = null;.*?SCAN = null;\s*\}", re.S)

for fn in [r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\index.html",
           r"C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\tools\directory_module_v20.js"]:
    raw = open(fn, encoding="utf-8").read()
    hits = PAT.findall(raw)
    assert len(hits) == 1, f"{fn}: expected 1 match, got {len(hits)}"
    raw = PAT.sub(lambda m: NEW, raw, count=1)
    open(fn, "w", encoding="utf-8", newline="").write(raw)
    print("patched", fn)
