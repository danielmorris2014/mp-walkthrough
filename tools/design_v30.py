# Design audit changes 1, 2, 4: grid screen back + row redesign + hall identity
# Run from walkthrough-app root. Bumps APP_VERSION and CACHE_VERSION.
import re

raw = open("index.html", encoding="utf-8").read()

# ============================================================
# CHANGE 4: Hall segmented control replaces the pill row
# ============================================================
# Replace the .hall-tabs CSS with a segmented control style
old_ht_css = """  .hall-tabs { display: flex; gap: 6px; overflow-x: auto; padding: 8px 0 2px 0; scrollbar-width: none; }
  .hall-tabs::-webkit-scrollbar { display: none; }
  .hall-tab {
    flex: 0 0 auto; padding: 7px 14px; border-radius: 999px; min-height: 34px;
    background: rgba(255,255,255,0.045); border: 1px solid var(--border);
    color: var(--muted); font-weight: 700; font-size: 12.5px; cursor: pointer;
  }
  .hall-tab.active { background: #ffffff; color: #111113; border-color: #ffffff; font-weight: 800; box-shadow: 0 2px 10px rgba(255,255,255,0.18); }"""
new_ht_css = """  /* Hall segmented control (design change 4) */
  .hall-seg {
    display: flex; gap: 0; border-radius: 10px; overflow: hidden;
    border: 1px solid var(--border); flex: 1; min-width: 0;
  }
  .hall-seg-btn {
    flex: 1; min-height: 44px; border: none; background: transparent;
    color: var(--muted); font-weight: 600; font-size: 13px; cursor: pointer;
    position: relative; padding: 4px 2px; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hall-seg-btn.active {
    background: #ffffff; color: #111113; font-weight: 800;
  }
  .hall-seg-btn .seg-bar {
    position: absolute; bottom: 0; left: 20%; right: 20%; height: 2px;
    border-radius: 1px; background: var(--green-9); opacity: 0.6;
  }
  .hall-seg-btn.active .seg-bar { opacity: 1; }
  @keyframes hallFlash {
    0% { opacity: 0; transform: scale(0.9); }
    15% { opacity: 1; transform: scale(1); }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }
  .hall-flash {
    position: fixed; inset: 0; z-index: 150; display: flex;
    align-items: center; justify-content: center; flex-direction: column;
    background: rgba(17,17,19,0.92); pointer-events: none;
    animation: hallFlash 600ms ease-out forwards;
  }
  .hall-flash .hf-name { font-weight: 900; font-size: 46px; color: #fff; letter-spacing: -1px; }
  .hall-flash .hf-meta { font-weight: 600; font-size: 16px; color: var(--muted); margin-top: 6px; }"""
assert old_ht_css in raw, "hall-tabs CSS"
raw = raw.replace(old_ht_css, new_ht_css, 1)

# Replace the hall-tabs markup in the header with the segmented control + hall menu
old_hdr = """  <div class="hall-tabs" id="hallTabs"></div>"""
new_hdr = """  <div style="display:flex; align-items:center; gap:8px; padding:6px 12px;">
    <div class="hall-seg" id="hallTabs"></div>
    <button class="btn btn-secondary" style="min-width:44px; min-height:44px; padding:0; font-size:18px;" onclick="toggleHallMenu()" aria-label="Hall menu">&#8943;</button>
  </div>"""
assert old_hdr in raw, "hall-tabs markup"
raw = raw.replace(old_hdr, new_hdr, 1)

# ============================================================
# CHANGE 1: Header restructure — one 60px row + hall strip
# ============================================================
# Replace the two-line title + sub with a compact single row
old_topbar = """  <div class="top-bar">
    <button class="kit-back" onclick="switchTab('home')">&#8249; Home</button>
    <div>
      <div class="app-title">MP Walkthrough &amp; Shift Report</div>
      <div class="app-sub" id="saveIndicator">Offline &bull; auto-saves to this phone</div>
    </div>
    <div style="display:flex; gap:6px;">
      <button class="undo-btn" id="undoBtn" onclick="doUndo()"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></span><span id="undoLabel">Undo (0)</span></button>
    </div>
  </div>"""
new_topbar = """  <div class="top-bar" style="min-height:60px; align-items:center;">
    <button class="kit-back" onclick="switchTab('home')">&#8249;</button>
    <div style="flex:1; min-width:0;">
      <div class="app-title" id="appTitle">MP Kit</div>
    </div>
    <div class="app-sub" id="saveIndicator" style="font-size:10px; flex:none;"></div>
  </div>"""
assert old_topbar in raw, "top-bar"
raw = raw.replace(old_topbar, new_topbar, 1)

# ============================================================
# CHANGE 1: Hall strip — mini-map of every row's status
# ============================================================
# Add CSS for the hall strip
hall_strip_css = """
  /* Hall strip (design change 1): mini-map of the hall */
  .hall-strip {
    display: flex; align-items: flex-end; gap: 1px; padding: 6px 12px;
    border-bottom: 1px solid var(--border); overflow-x: auto; scrollbar-width: none;
    position: sticky; top: 60px; z-index: 15; background: rgba(17,17,19,0.96);
  }
  .hall-strip::-webkit-scrollbar { display: none; }
  .hs-col {
    flex: 0 0 6px; display: flex; flex-direction: column; gap: 1px; cursor: pointer;
    border-radius: 1px; overflow: hidden;
  }
  .hs-col.current { outline: 2px solid #fff; outline-offset: 1px; border-radius: 2px; }
  .hs-cell { height: 10px; border-radius: 1px; }
  .hs-cell.s-none { background: var(--slate-6); }
  .hs-cell.s-staged { background: var(--blue-9); }
  .hs-cell.s-prog { background: var(--amber-9); }
  .hs-cell.s-ran { background: var(--violet-9); }
  .hs-cell.s-hung { background: var(--green-9); }
  .hs-cell.s-remed { background: var(--red-9); }
  .hs-cell.s-mixed { background: var(--slate-7); }
  .hs-info {
    flex: 0 0 auto; margin-left: auto; padding-left: 10px;
    font-size: 10px; font-weight: 700; color: var(--muted);
    font-variant-numeric: tabular-nums; white-space: nowrap;
  }
"""
# Insert before the .pod-header CSS
pod_anchor = "  .pod-header {"
assert pod_anchor in raw
raw = raw.replace(pod_anchor, hall_strip_css + pod_anchor, 1)

# Add hall strip markup to the walk panel (before the grid)
old_walkgrid = '<div id="walkGrid"></div>'
new_walkgrid = '<div class="hall-strip" id="hallStrip"></div>\n    <div id="walkGrid"></div>'
assert old_walkgrid in raw
raw = raw.replace(old_walkgrid, new_walkgrid, 1)

# ============================================================
# CHANGE 1: Move stats/notes/tools into a hall menu sheet
# ============================================================
hall_menu_css = """
  /* Hall menu sheet (design change 1) */
  .hall-menu {
    position: fixed; inset: 0; z-index: 160; background: rgba(17,17,19,0.88);
    display: none; align-items: flex-end; justify-content: center;
  }
  .hall-menu.open { display: flex; }
  .hall-menu-card {
    background: var(--card); border: 1px solid var(--border2); border-radius: 20px 20px 0 0;
    padding: 16px; width: 100%; max-height: 70vh; overflow-y: auto;
  }
"""
raw = raw.replace(pod_anchor, hall_menu_css + pod_anchor, 1)

# Add hall menu markup before the container close
hall_menu_html = """
  <div class="hall-menu" id="hallMenu">
    <div class="hall-menu-card" id="hallMenuBody"></div>
  </div>
"""
# Insert before the closing of panel-walk
walk_panel_end = "</div>\n\n  <!-- ===================== CREW ====================="
assert walk_panel_end in raw
raw = raw.replace(walk_panel_end, hall_menu_html + walk_panel_end, 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("changes 1+4 structural: header, hall seg, hall strip, hall menu")
