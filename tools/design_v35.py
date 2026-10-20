# v35: Restore always-visible stamp dock (Daniel's feedback) + simplify hall menu
import re

raw = open("index.html", encoding="utf-8").read()

# ============================================================
# 1. RESTORE the always-visible stamp dock
# Replace the brush bar + palette with the original dock layout
# (slightly tightened for the new row heights)
# ============================================================

# Replace brush bar HTML with full dock
old_dock_start = raw.index('  <div class="status-dock brush-bar">')
old_dock_end = raw.index('</div>\n  <nav class="bottom-nav">')
new_dock = """  <div class="status-dock">
    <div class="dock-brush">
      <button class="brush-btn b-hung active" onclick="setBrush('hung')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg></span>Hung</button>
      <button class="brush-btn b-ran" onclick="setBrush('ran')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H3"/><path d="m11 18 6-6-6-6"/><path d="M21 5v14"/></svg></span>Ran</button>
      <button class="brush-btn b-prog" onclick="setBrush('prog')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>Prog</button>
      <button class="brush-btn b-staged" onclick="setBrush('staged')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5"/><path d="M12 12v9"/><path d="M12 12L4 7.5"/></svg></span>Staged</button>
      <button class="brush-btn b-remed" onclick="setBrush('remed')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg></span>Remed</button>
      <button class="brush-btn b-none" onclick="setBrush('none')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg></span>Clear</button>
    </div>
    <div class="dock-scope">
      <button class="scope-btn active" id="sc-ALL" onclick="setScope('ALL')">All cables</button>
      <button class="scope-btn" id="sc-F144" onclick="setScope('F144')">144F</button>
      <button class="scope-btn" id="sc-OCS" onclick="setScope('OCS')">OCS</button>
      <button class="scope-btn" id="sc-CAT6" onclick="setScope('CAT6')">Copper</button>
    </div>
  </div>
"""
raw = raw[:old_dock_start] + new_dock + raw[old_dock_end:]

# ============================================================
# 2. SIMPLIFY the 3-dot hall menu — just add/manage halls
# Move notes to the Blockers tab
# ============================================================

# Rewrite toggleHallMenu to only show hall management
old_menu_start = raw.index("function toggleHallMenu() {")
old_menu_end = raw.index("function renderHallTabs() {")
new_menu = """function toggleHallMenu() {
  var mEl = document.getElementById('hallMenu');
  var b = document.getElementById('hallMenuBody');
  if (!mEl || !b) return;
  if (mEl.classList.contains('open')) { mEl.classList.remove('open'); return; }
  var halls = Object.values(state.halls);
  b.innerHTML =
    '<div class="card-title" style="margin-bottom:12px;">Manage halls</div>' +
    halls.map(function (h) {
      return '<div class="batch-row" style="margin-bottom:8px; align-items:center;">' +
        '<span style="flex:1; font-weight:700; font-size:14px;">' + escapeHtml(h.name) + '</span>' +
        '<span class="muted" style="font-size:11px;">' + h.maxRow + ' rows</span>' +
        '<button class="btn btn-secondary" style="min-height:36px; padding:0 10px; font-size:11px;" onclick="switchHall(\\'' + h.id + '\\'); toggleHallMenu();">Switch</button>' +
        '<button class="btn btn-danger" style="min-height:36px; padding:0 10px; font-size:11px;" onclick="deleteHall(\\'' + h.id + '\\'); toggleHallMenu();">Delete</button>' +
        '</div>';
    }).join('') +
    '<button class="btn" style="width:100%; margin-top:12px; min-height:48px;" onclick="addHallPrompt()">+ Add ' + (halls.length === 3 ? 'CB/DH' : 'hall') + '</button>' +
    '<button class="btn btn-ghost" style="width:100%; margin-top:8px;" onclick="toggleHallMenu()">Close</button>';
  mEl.classList.add('open');
}
function switchHall(id) {
  state.activeHall = id; saveState();
  renderHallTabs(); renderWalk(); renderHallStrip();
  flashHall(state.halls[id]);
}
function deleteHall(id) {
  var h = state.halls[id];
  if (!h) return;
  if (!confirm('Delete ' + h.name + ' and all its row data?')) return;
  pushUndo();
  delete state.halls[id];
  if (state.activeHall === id) {
    var ks = Object.keys(state.halls);
    state.activeHall = ks.length ? ks[0] : null;
  }
  saveState(); renderHallTabs(); renderWalk(); renderHallStrip();
  showToast('Hall deleted');
}
"""
raw = raw[:old_menu_start] + new_menu + raw[old_menu_end:]

# ============================================================
# 3. Move hall notes to the Blockers tab
# ============================================================
# Add a hall notes card to the blockers panel
old_blockers = '<div class="card">\n      <div class="card-title">Areas of concern</div>'
new_blockers = """<div class="card">
      <div class="card-title">Hall notes</div>
      <div class="batch-row">
        <input type="text" id="noteInput" placeholder="e.g. HAC 17, Rows 33–36 – Staged (8 hrs per person)" style="flex:1; min-width:150px;">
        <button class="btn btn-secondary" onclick="addNote()">+ Note</button>
      </div>
      <div id="notesWrap"></div>
    </div>
    <div class="card">
      <div class="card-title">Areas of concern</div>"""
assert old_blockers in raw, "blockers anchor"
raw = raw.replace(old_blockers, new_blockers, 1)

# Version bump
raw = raw.replace("var APP_VERSION = 'v34';", "var APP_VERSION = 'v35';", 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("v35: dock restored, hall menu simplified, notes to blockers")
