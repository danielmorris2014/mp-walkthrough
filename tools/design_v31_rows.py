# v31: Change 2 (row redesign) + Change 3 (brush bar) + bugs 7-11
# Row redesign: 66px rows, fold hung, one tap target, mixed cells with cable underlines
# Brush bar: 60px, current brush + undo; palette sheet for changes
import re

raw = open("index.html", encoding="utf-8").read()

# ============================================================
# CHANGE 2: Row redesign — CSS
# ============================================================
# Replace the old side-card/aisle-row CSS with compact 66px versions
old_aisle = """  .aisle-row { display: grid; grid-template-columns: minmax(0,1fr) 52px minmax(0,1fr); gap: 7px; margin-bottom: 7px; align-items: stretch; }"""
new_aisle = """  .aisle-row { display: grid; grid-template-columns: minmax(0,1fr) 44px minmax(0,1fr); gap: 5px; margin-bottom: 5px; align-items: stretch; }"""
assert old_aisle in raw, "aisle grid"
raw = raw.replace(old_aisle, new_aisle, 1)

# Side card: 64px min (down from 64px but strip the badge/pills)
old_side = """  .side-card {
    border-radius: 12px; border: 1px solid var(--border); border-left-width: 4px; padding: 8px 9px; min-height: 64px; min-width: 0;
    display: flex; flex-direction: column; justify-content: space-between;
    cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
    background: var(--card); transition: transform 0.05s;
  }"""
new_side = """  .side-card {
    border-radius: 10px; border: 1px solid var(--border); border-left-width: 4px; padding: 6px 8px;
    min-height: 56px; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px;
    cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
    background: var(--card); transition: transform 0.05s;
  }
  .side-card.empty { border-style: dashed; border-left-style: solid; }"""
assert old_side in raw, "side card"
raw = raw.replace(old_side, new_side, 1)

# Row center pill: smaller, bigger number
old_center = """  .row-center-pill {
    background: var(--bg2); border: 1px solid var(--border2); border-radius: 13px; min-width: 0;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; padding: 4px; text-align: center;
  }"""
new_center = """  .row-center-pill {
    background: var(--bg2); border: 1px solid var(--border2); border-radius: 10px; min-width: 0;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; padding: 2px; text-align: center;
  }"""
assert old_center in raw, "center pill"
raw = raw.replace(old_center, new_center, 1)

# Row number: bigger
old_num = ".row-num { font-weight: 900; font-size: 16px; color: #fff; }"
new_num = ".row-num { font-weight: 900; font-size: 22px; color: #fff; font-variant-numeric: tabular-nums; }"
assert old_num in raw, "row num"
raw = raw.replace(old_num, new_num, 1)

# Remove the BOTH hint (taught by the palette sheet)
old_hint = """  .row-both-hint { font-size: 8px; color: var(--muted); font-weight: 800; margin-top: 2px; letter-spacing: 0.5px; }"""
new_hint = """  .row-both-hint { display: none; }"""
raw = raw.replace(old_hint, new_hint, 1)

# Side ID: bigger, more prominent
old_sid = ".side-id { font-weight: 900; font-size: 15px; letter-spacing: -0.3px; color: #fff; }"
new_sid = ".side-id { font-weight: 800; font-size: 17px; letter-spacing: -0.3px; color: #fff; font-variant-numeric: tabular-nums; }"
raw = raw.replace(old_sid, new_sid, 1)

# Status word: replaces badge, in step-11 color
new_status_css = """
  /* v31 row redesign: status word in step-11 color, no badge */
  .side-status { font-size: 13px; font-weight: 700; line-height: 1.2; }
  .side-status.st-hung { color: var(--st-hung); }
  .side-status.st-ran { color: var(--st-ran); }
  .side-status.st-prog { color: var(--st-prog); }
  .side-status.st-staged { color: var(--st-staged); }
  .side-status.st-remed { color: var(--st-remed); }
  .side-status.st-none { color: var(--faint); }

  /* Mixed side: cable cells with status underlines */
  .mixed-cells { display: flex; gap: 6px; margin-top: 2px; }
  .mc {
    flex: 1; font-size: 11px; font-weight: 700; text-align: center;
    padding: 2px 0 3px 0; border-bottom: 3px solid var(--slate-6);
  }
  .mc.u-hung { border-bottom-color: var(--green-9); color: var(--green-11); }
  .mc.u-ran { border-bottom-color: var(--violet-9); color: var(--violet-11); }
  .mc.u-prog { border-bottom-color: var(--amber-9); color: var(--amber-11); }
  .mc.u-staged { border-bottom-color: var(--blue-9); color: var(--blue-11); }
  .mc.u-remed { border-bottom-color: var(--red-9); color: var(--red-11); }
  .mc.u-none { border-bottom-color: var(--slate-6); color: var(--faint); }

  /* Folded hung row: slim green strip */
  .folded-row {
    display: flex; align-items: center; gap: 10px; padding: 0 12px;
    min-height: 36px; margin-bottom: 4px; border-radius: 8px;
    background: var(--green-2); border: 1px solid #30a46c40;
    cursor: pointer;
  }
  .folded-row .fr-text { font-size: 13px; font-weight: 700; color: var(--green-11); flex: 1; }
  .folded-row .fr-expand { font-size: 11px; color: var(--muted); font-weight: 700; }
"""
# Insert before .pod-header
pod_anchor = "  /* Hall menu sheet (design change 1) */"
assert pod_anchor in raw
raw = raw.replace(pod_anchor, new_status_css + pod_anchor, 1)

# ============================================================
# CHANGE 3: Brush bar CSS (replaces the stamp dock)
# ============================================================
brush_css = """
  /* v31 brush bar: 60px, replaces 119px dock */
  .brush-bar {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px 4px 12px;
  }
  .brush-chip {
    flex: 1; min-height: 44px; display: flex; align-items: center; gap: 8px;
    border-radius: 12px; padding: 0 12px; cursor: pointer;
    background: rgba(255,255,255,0.045); border: 1px solid var(--border);
    user-select: none; -webkit-user-select: none;
  }
  .brush-chip:active { transform: scale(0.97); }
  .brush-chip .bc-name { font-weight: 800; font-size: 16px; }
  .brush-chip .bc-scope { font-size: 13px; color: var(--muted); font-weight: 600; }
  .brush-undo {
    flex: none; min-height: 44px; min-width: 84px; border-radius: 12px;
    background: rgba(255,255,255,0.055); border: 1px solid var(--border);
    color: var(--muted); font-weight: 800; font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 4px;
  }
  .brush-undo:active { transform: scale(0.96); }

  /* Palette sheet */
  .palette-sheet {
    position: fixed; inset: 0; z-index: 170; background: rgba(17,17,19,0.88);
    display: none; align-items: flex-end; justify-content: center;
  }
  .palette-sheet.open { display: flex; }
  .palette-card {
    background: var(--card); border: 1px solid var(--border2); border-radius: 20px 20px 0 0;
    padding: 16px; width: 100%; max-height: 70vh; overflow-y: auto;
  }
  .palette-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 12px; }
  .palette-tile {
    min-height: 72px; border-radius: 14px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px; cursor: pointer;
    background: rgba(255,255,255,0.03); border: 2px solid transparent;
    font-weight: 800; font-size: 15px; color: var(--muted);
  }
  .palette-tile.active { border-color: currentColor; }
  .palette-tile:active { transform: scale(0.96); }
  .palette-scope { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-top: 8px; }
  .ps-btn {
    min-height: 40px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(118,118,128,0.12); color: var(--muted); font-weight: 700; font-size: 12px;
  }
  .ps-btn.active { background: var(--slate-5); color: var(--slate-12); }
"""
raw = raw.replace(pod_anchor, brush_css + pod_anchor, 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("v31 CSS: row redesign + brush bar + palette sheet")
