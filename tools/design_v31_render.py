# v31: Rewrite buildSideHtml + renderWalk + brush bar rendering
import re

raw = open("index.html", encoding="utf-8").read()

# ============================================================
# CHANGE 2: buildSideHtml — compact rows with status words
# and mixed cable cells (replaces badge + pills)
# ============================================================
old_build = """function buildSideHtml(hall, r, side) {
  var seg = hall.rows[r][side];
  var sum = sideSummary(seg);
  var cardCls = sum.uniform ? STATUS_META[sum.status].cardCls : 'sc-mixed';
  var badge = sum.uniform
    ? (sum.status === 'none' ? 'Tap to stamp' : STATUS_META[sum.status].badge)
    : 'Mixed';
  var span = side === '11' ? (r + '01–' + r + '11') : (r + '13–' + r + '22');
  var pills = CABLES.map(function (c) {
    var m = STATUS_META[seg[c]];
    var lbl = c === 'CAT6' ? 'CAT6' : CABLE_LABEL[c];
    return '<div class="mini-pill ' + m.pillCls + '" onclick="tapPill(event, ' + r + ', \\'' + side + '\\', \\'' + c + '\\')">' + lbl + ': ' + m.short + '</div>';
  }).join('');
  return '<div class="side-card ' + cardCls + '" onclick="tapSide(' + r + ', \\'' + side + '\\')">' +
    '<div><div class="side-top"><span class="side-id">' + r + side + '</span><span class="side-span">' + span + '</span></div>' +
    '<span class="side-status-badge stb-' + (sum.uniform ? sum.status : 'mixed') + '">' + badge + '</span></div>' +
    '<div class="mini-cables">' + pills + '</div></div>';
}"""

new_build = """function buildSideHtml(hall, r, side) {
  var seg = hall.rows[r][side];
  var sum = sideSummary(seg);
  var cardCls = sum.uniform ? STATUS_META[sum.status].cardCls : 'sc-mixed';
  if (sum.uniform && sum.status === 'none') cardCls += ' empty';
  var span = side === '11' ? r + '01' : r + '22';
  var stWord = sum.uniform ? STATUS_META[sum.status].report : 'Mixed';
  var stCls = sum.uniform ? sum.status : 'none';

  // Uniform side: rack ID + status word (no badge, no pills)
  if (sum.uniform) {
    return '<div class="side-card ' + cardCls + '" onclick="tapSide(' + r + ', \\'' + side + '\\')">' +
      '<span class="side-id">' + span + '</span>' +
      (sum.status === 'none' ? '' : '<span class="side-status st-' + stCls + '">' + stWord + '</span>') +
      '</div>';
  }

  // Mixed side: rack ID + three cable cells with status underlines
  var cells = CABLES.map(function (c) {
    var st = seg[c];
    var lbl = c === 'CAT6' ? 'CAT6' : CABLE_LABEL[c];
    return '<div class="mc u-' + st + '">' + lbl + '</div>';
  }).join('');
  return '<div class="side-card ' + cardCls + '" onclick="tapSide(' + r + ', \\'' + side + '\\')">' +
    '<span class="side-id">' + span + '</span>' +
    '<div class="mixed-cells">' + cells + '</div></div>';
}"""

assert old_build in raw, "buildSideHtml anchor"
raw = raw.replace(old_build, new_build, 1)
print("buildSideHtml rewritten")

# ============================================================
# CHANGE 2: renderWalk — fold hung rows, compact pods
# ============================================================
# Find renderWalk and add folding logic
old_rw = "function renderWalk() {\n  renderHallStrip();"
new_rw = """function renderWalk() {
  renderHallStrip();
  var hall = state.halls[state.activeHall];
  var fold = state.settings.foldHung !== false; // default true"""
assert old_rw in raw, "renderWalk anchor"
raw = raw.replace(old_rw, new_rw, 1)

# Find the row rendering loop inside renderWalk and add folding
# The loop looks like: rows.forEach(function(r) { ... renderAisleRow(hall, r, orient) ... })
# We need to intercept and check if both sides are hung
old_render = "renderAisleRow(hall, r, orient);"
new_render = """var bothHung = sideOverall(hall.rows[r]['11'], null) === 'hung' && sideOverall(hall.rows[r]['13'], null) === 'hung';
    if (fold && bothHung) {
      gridHtml += '<div class="folded-row" onclick="unfoldRow(' + r + ')">' +
        '<span class="fr-text">' + r + '11 \\u0026 ' + r + '13 \\u00b7 ran \\u0026 hung</span>' +
        '<span class="fr-expand">tap to expand</span></div>';
    } else {
      renderAisleRow(hall, r, orient);
    }"""
# We need to find where renderAisleRow is called and replace it
# But it might be called differently — let me check
if old_render in raw:
    raw = raw.replace(old_render, new_render)
    print("renderWalk: folding added")
else:
    print("renderAisleRow call pattern differs — checking...")
    # Look for the actual call
    idx = raw.index("function renderWalk")
    chunk = raw[idx:idx+2000]
    print("renderWalk first 500:", chunk[:500])

# Add unfoldRow function
if "function unfoldRow" not in raw:
    raw = raw.replace("function renderWalk() {",
        """function unfoldRow(r) {
  // Toggle: temporarily unfold this row by scrolling to it
  var el = document.querySelector('.aisle-row[data-row="' + r + '"]');
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('flash'); }
}
function renderWalk() {""", 1)

# ============================================================
# CHANGE 3: Replace stamp dock HTML with brush bar
# ============================================================
old_dock = """  <div class="status-dock">
    <div class="dock-label"><span id="activeBrushLabel" style="color:var(--accent)">Stamps: Ran &amp; Hung &bull; All cables</span></div>
    <div class="dock-brush">
      <button class="brush-btn b-hung active" onclick="setBrush('hung')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg></span>Hung</button>
      <button class="brush-btn b-ran" onclick="setBrush('ran')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12H3"/><path d="m11 18 6-6-6-6"/><path d="M21 5v14"/></svg></span>Ran</button>
      <button class="brush-btn b-prog" onclick="setBrush('prog')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/></svg></span>In&nbsp;Prog</button>
      <button class="brush-btn b-staged" onclick="setBrush('staged')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg></span>Staged</button>
      <button class="brush-btn b-remed" onclick="setBrush('remed')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg></span>Remed</button>
      <button class="brush-btn b-none" onclick="setBrush('none')"><span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/></svg></span>Clear</button>
    </div>
    <div class="dock-scope">
      <button class="scope-btn active" id="sc-ALL" onclick="setScope('ALL')">All cables</button>
      <button class="scope-btn" id="sc-F144" onclick="setScope('F144')">144F</button>
      <button class="scope-btn" id="sc-OCS" onclick="setScope('OCS')">OCS</button>
      <button class="scope-btn" id="sc-CAT6" onclick="setScope('CAT6')">Copper</button>
    </div>
  </div>"""

new_dock = """  <div class="status-dock brush-bar">
    <div class="brush-chip" id="brushChip" onclick="openPalette()">
      <span id="brushDot" style="width:12px;height:12px;border-radius:99px;flex:none;"></span>
      <div>
        <div class="bc-name" id="brushName">Ran &amp; Hung</div>
        <div class="bc-scope" id="brushScope">All cables</div>
      </div>
    </div>
    <button class="brush-undo" id="undoBtn" onclick="doUndo()">
      <span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></span>
      <span id="undoLabel">Undo</span>
    </button>
  </div>
  <div class="palette-sheet" id="paletteSheet">
    <div class="palette-card">
      <div class="card-title" id="paletteTitle">Stamp brush</div>
      <div class="palette-scope" id="paletteScope"></div>
      <div class="palette-grid" id="paletteGrid"></div>
      <button class="btn btn-ghost" style="width:100%; margin-top:12px;" onclick="closePalette()">Cancel</button>
    </div>
  </div>"""

assert old_dock in raw, "dock HTML anchor"
raw = raw.replace(old_dock, new_dock, 1)
print("stamp dock -> brush bar + palette sheet")

# ============================================================
# CHANGE 3: Palette sheet functions
# ============================================================
if "function openPalette" not in raw:
    palette_js = """
/* ---- palette sheet (design change 3) ---- */
function openPalette(row, side) {
  var sheet = document.getElementById('paletteSheet');
  var grid = document.getElementById('paletteGrid');
  var scope = document.getElementById('paletteScope');
  var title = document.getElementById('paletteTitle');
  if (!sheet || !grid) return;
  title.textContent = row ? ('Stamp ' + row + side) : 'Stamp brush';
  var statuses = ['hung', 'ran', 'prog', 'staged', 'remed', 'none'];
  grid.innerHTML = statuses.map(function (st) {
    var meta = STATUS_META[st];
    var active = state.brush === st ? ' active' : '';
    var color = st === 'none' ? 'var(--faint)' : 'var(--st-' + st + ')';
    return '<div class="palette-tile' + active + '" style="color:' + color + '" onclick="pickBrush(\\'' + st + '\\'' + (row ? ', ' + row + ', \\'' + side + '\\'' : '') + ')">' +
      '<span>' + meta.badge + '</span></div>';
  }).join('');
  var scopes = [['ALL', 'All'], ['F144', '144F'], ['OCS', 'OCS'], ['CAT6', 'Copper']];
  scope.innerHTML = scopes.map(function (s) {
    return '<button class="ps-btn' + (state.scope === s[0] ? ' active' : '') + '" onclick="setScope(\\'' + s[0] + '\\')">' + s[1] + '</button>';
  }).join('');
  sheet.classList.add('open');
}
function closePalette() {
  var sheet = document.getElementById('paletteSheet');
  if (sheet) sheet.classList.remove('open');
}
function pickBrush(st, row, side) {
  if (row && side) {
    // one-off stamp for this row-side only; don't change the brush
    applyStamp(row, side, st);
    closePalette();
    return;
  }
  setBrush(st);
  closePalette();
}
function updateBrushBar() {
  var name = document.getElementById('brushName');
  var scope = document.getElementById('brushScope');
  var dot = document.getElementById('brushDot');
  if (name) name.textContent = STATUS_META[state.brush].badge;
  if (scope) scope.textContent = state.scope === 'ALL' ? 'All cables' : CABLE_LABEL[state.scope];
  if (dot) dot.style.background = STATUS_COLOR[state.brush] || STATUS_COLOR.none;
}
"""
    raw = raw.replace("function setBrush(", palette_js + "\nfunction setBrush(", 1)
    print("palette functions added")

# Update updateBrushLabel to also call updateBrushBar
if "updateBrushBar()" not in raw.split("function updateBrushLabel")[1][:200]:
    raw = raw.replace(
        "function updateBrushLabel() {",
        "function updateBrushLabel() {\n  updateBrushBar();", 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("v31 render + brush bar complete")
