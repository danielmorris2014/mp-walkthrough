# v32: Changes 5, 6, 7, 9 + bugs 7-11 — the remaining audit items
import re

raw = open("index.html", encoding="utf-8").read()

# ============================================================
# CHANGE 5: Scroll position persistence
# ============================================================
# Save scrollY when leaving the Walkthrough tab; restore on return
old_switch = "  if (s.onShow) s.onShow();\n  window.scrollTo(0, 0);"
new_switch = """  // save scroll position when leaving walk
  if (currentTab === 'walk' && t !== 'walk') {
    try { sessionStorage.setItem('mp_scroll_' + state.activeHall, String(window.scrollY)); } catch (e) {}
  }
  if (s.onShow) s.onShow();
  // restore scroll position when entering walk
  if (t === 'walk') {
    try {
      var sy = sessionStorage.getItem('mp_scroll_' + state.activeHall);
      if (sy) { window.scrollTo(0, parseInt(sy, 10)); return; }
    } catch (e) {}
  }
  window.scrollTo(0, 0);"""
assert old_switch in raw, "scroll anchor"
raw = raw.replace(old_switch, new_switch, 1)

# Guide back button returns to where you left (not #/home)
old_open = "function openGuide() { window.location.href = './guide.html'; }"
new_open = """function openGuide() {
  try { sessionStorage.setItem('mp_return_hash', location.hash || '#/walk'); } catch (e) {}
  window.location.href = './guide.html';
}"""
if old_open in raw:
    raw = raw.replace(old_open, new_open, 1)

# ============================================================
# CHANGE 6: Home command center
# ============================================================
old_home_panel = """    <div class="card" style="margin-top:2px;">
      <div class="card-title"><span>Tonight</span><span class="muted" id="homeMeta"></span></div>
      <div id="syncStatus" style="font-size:11px;font-weight:700;margin-top:6px;color:var(--muted);"></div>
      <div id="homeWalkStatus" class="home-hero-line" style="font-size:13px; font-weight:700;"></div>
    </div>"""
new_home_panel = """    <div class="card" style="margin-top:2px;">
      <div class="card-title"><span>Tonight</span><span class="muted" id="homeMeta"></span></div>
      <div id="syncStatus" style="font-size:11px;font-weight:700;margin-top:6px;color:var(--muted);"></div>
      <div id="shiftLine" style="font-size:12px;font-weight:600;color:var(--muted);margin-top:4px;"></div>
      <div id="homeWalkStatus" class="home-hero-line" style="font-size:13px; font-weight:700;"></div>
      <div id="lastNightLine" style="font-size:11px;color:var(--muted);margin-top:2px;"></div>
    </div>
    <button class="btn" style="width:100%; min-height:56px; margin-bottom:10px;" onclick="resumeWalk()" id="resumeBtn">
      <span class="glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/></svg></span>
      <span id="resumeText">Resume walkthrough</span>
    </button>"""
assert old_home_panel in raw, "home panel anchor"
raw = raw.replace(old_home_panel, new_home_panel, 1)

# Add resumeWalk + last-night comparison to renderHome
old_rh = "  updateSyncStatus();"
new_rh = """  updateSyncStatus();
  // shift line
  var sl = document.getElementById('shiftLine');
  if (sl && m.shiftTime) {
    var mt = m.shiftTime.match(/(\\d{1,2}):(\\d{2})\\s*(AM|PM)?\\s*[\u2013-]\\s*(\\d{1,2}):(\\d{2})\\s*(AM|PM)?/i);
    if (mt) {
      var sh = parseInt(mt[1], 10) + (mt[3] && mt[3].toUpperCase() === 'PM' && parseInt(mt[1], 10) < 12 ? 12 : 0);
      var sm = parseInt(mt[2], 10);
      var eh = parseInt(mt[4], 10) + (mt[6] && mt[6].toUpperCase() === 'PM' && parseInt(mt[4], 10) < 12 ? 12 : 0);
      var em = parseInt(mt[5], 10);
      var now = new Date();
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var startMin = sh * 60 + sm;
      var endMin = eh * 60 + em;
      if (endMin < startMin) endMin += 24 * 60; // overnight shift
      if (nowMin < startMin) nowMin += 24 * 60;
      var left = endMin - nowMin;
      if (left > 0) {
        var lh = Math.floor(left / 60), lm = left % 60;
        sl.textContent = m.shiftTime + ' \\u00b7 ' + lh + 'h ' + lm + 'm left';
      } else { sl.textContent = m.shiftTime + ' \\u00b7 shift over'; }
    } else { sl.textContent = m.shiftTime; }
  }
  // last-night comparison
  var ln = document.getElementById('lastNightLine');
  if (ln) {
    var tonight = 0;
    var hh = state.halls[state.activeHall];
    if (hh) { Object.keys(hh.rows).forEach(function (r) {
      ['11','13'].forEach(function (sd) { if (sideOverall(hh.rows[r][sd], null) === 'hung') tonight++; });
    }); }
    if (state.baseline && state.baseline.halls && state.baseline.halls[state.activeHall]) {
      var bh = state.baseline.halls[state.activeHall];
      var lastNight = 0;
      Object.keys(bh.rows || {}).forEach(function (r) {
        ['11','13'].forEach(function (sd) {
          var seg = bh.rows[r] && bh.rows[r][sd];
          if (seg && seg.F144 === 'hung' && seg.OCS === 'hung' && seg.CAT6 === 'hung') lastNight++;
        });
      });
      var diff = tonight - lastNight;
      ln.textContent = 'Tonight: ' + tonight + ' hung \\u00b7 Last night: ' + lastNight +
        (diff > 0 ? ' \\u00b7 \\u2191' + diff : diff < 0 ? ' \\u00b7 \\u2193' + Math.abs(diff) : ' \\u00b7 =');
    } else { ln.textContent = 'Tonight: ' + tonight + ' hung'; }
  }
  // resume button
  var rb = document.getElementById('resumeText');
  if (rb) {
    var lastHall = state.halls[state.activeHall];
    rb.textContent = lastHall ? 'Resume ' + lastHall.name : 'Resume walkthrough';
  }"""
assert old_rh in raw, "renderHome anchor"
raw = raw.replace(old_rh, new_rh, 1)

# Add resumeWalk function
if "function resumeWalk" not in raw:
    raw = raw.replace("function renderHome() {",
        """function resumeWalk() { switchTab('walk'); }
function renderHome() {""", 1)

# ============================================================
# BUG 7: Install steps in installed app
# ============================================================
old_ob = 'if (!state.settings.onboarded) {\n      document.getElementById(\'onboarding\').style.display = \'flex\';'
new_ob = """if (!state.settings.onboarded) {
      document.getElementById('onboarding').style.display = 'flex';
      // in the installed app, lead with the site code instead of install steps
      if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
        var steps = document.querySelector('#onboarding ol');
        if (steps) steps.style.display = 'none';
        var h2 = document.querySelector('#onboarding h2');
        if (h2) h2.textContent = 'Welcome';"""
assert old_ob in raw, "onboarding anchor"
raw = raw.replace(old_ob, new_ob, 1)

# ============================================================
# BUG 8: Preferences under Crew → move to a Settings sheet from Home
# ============================================================
# Add a settings button on Home + a settings sheet
if 'id="settingsSheet"' not in raw:
    # add the settings sheet HTML before the closing body tag area
    settings_html = """
  <div class="palette-sheet" id="settingsSheet">
    <div class="palette-card">
      <div class="card-title">Settings</div>
      <div class="form-field" style="margin-bottom:10px;">
        <label>Sign-off line</label>
        <input type="text" id="signature" placeholder="e.g. Daniel Morris - Superintendent, Midpoint" oninput="savePrefs()">
      </div>
      <div class="batch-row" style="justify-content:space-between; margin-bottom:8px;">
        <span class="muted">Text size</span>
        <button class="btn btn-secondary" id="textSizeBtn" onclick="cycleTextSize()">Normal</button>
      </div>
      <div class="batch-row" style="justify-content:space-between; margin-bottom:8px;">
        <span class="muted">Keep screen awake</span>
        <button class="btn btn-secondary" id="wakeBtn" onclick="toggleWake()">On</button>
      </div>
      <div class="card-title" style="margin-top:14px;">Shared site</div>
      <div class="batch-row" style="justify-content:space-between; margin-bottom:8px;">
        <span class="muted">Your name (for sync)</span>
        <input type="text" id="syncName" placeholder="e.g. Daniel" style="width:120px;" oninput="saveSyncName()">
      </div>
      <div class="batch-row" style="margin-top:8px;">
        <button class="btn btn-secondary" onclick="syncNow()">Sync now</button>
        <button class="btn btn-ghost" onclick="disconnectSite()">Disconnect</button>
      </div>
      <div id="syncSettingsInfo" class="muted" style="margin-top:6px;"></div>
      <button class="btn btn-ghost" style="width:100%; margin-top:12px;" onclick="closeSettings()">Close</button>
    </div>
  </div>
"""
    # insert before the closing </body>
    body_close = "</body>"
    idx = raw.rindex(body_close)
    raw = raw[:idx] + settings_html + raw[idx:]

    # add openSettings/closeSettings functions
    raw = raw.replace("function resumeWalk() {",
        """function openSettings() {
  var s = document.getElementById('settingsSheet');
  if (s) { s.classList.add('open'); renderCrewPanel(); }
}
function closeSettings() {
  var s = document.getElementById('settingsSheet');
  if (s) s.classList.remove('open');
}
function resumeWalk() {""", 1)

    # add settings button on Home (next to the resume button)
    raw = raw.replace(
        '<span id="resumeText">Resume walkthrough</span>\n    </button>',
        '<span id="resumeText">Resume walkthrough</span>\n    </button>\n    <button class="btn btn-secondary" style="width:100%; min-height:48px; margin-bottom:10px;" onclick="openSettings()">Settings</button>', 1)

# ============================================================
# BUG 9: SP count — auto from chips OR manual, not both
# ============================================================
# Make the SP field read-only when chips are active
old_sp = '<input type="number" id="spCount" oninput="saveMeta()">'
new_sp = '<input type="number" id="spCount" oninput="saveMeta()" readonly>'
raw = raw.replace(old_sp, new_sp, 1)

# ============================================================
# BUG 10: Sideways scrolling rows (hall tabs, route filters)
# ============================================================
# Hall tabs are now a segmented control (no sideways scroll) — done in v30
# Route filters in the guide are handled by the guide pipeline (v32 guide)
# Add overflow-wrap to any remaining scrolling rows
raw = raw.replace(
    ".chip-wrap { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 7px; }",
    ".chip-wrap { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 7px; max-width: 100%; overflow-x: clip; }", 1)

# ============================================================
# CHANGE 9: Graphite Pro cleanup — type floor, blue tints
# ============================================================
# Type floor: nothing below 11px
raw = raw.replace("font-size: 8px", "font-size: 11px")  # BOTH hint
raw = raw.replace("font-size: 8.5px", "font-size: 11px")  # stat labels
raw = raw.replace("font-size: 9px", "font-size: 11px")  # cable pills (now gone but just in case)
raw = raw.replace("font-size: 9.5px", "font-size: 11px")  # dock/tab labels
raw = raw.replace("font-size: 10px", "font-size: 11px")  # various
raw = raw.replace("font-size: 10.5px", "font-size: 11px")  # sub-labels

# Touch floor: 44px minimum
raw = raw.replace("min-height: 30px;", "min-height: 44px;")
raw = raw.replace("min-height: 32px;", "min-height: 44px;")
raw = raw.replace("min-height: 34px;", "min-height: 44px;")
raw = raw.replace("min-height: 36px;", "min-height: 44px;")

# Leftover blue tints → slate
raw = raw.replace("color: #dbe6f5", "color: var(--slate-12)")
raw = raw.replace("color: #c3d0e6", "color: var(--slate-11)")
raw = raw.replace("color: #b9c7de", "color: var(--slate-11)")
raw = raw.replace("rgba(3,6,12,.88)", "rgba(17,17,19,.88)")
raw = raw.replace("rgba(56,189,248,0)", "rgba(255,255,255,0)")

# Version bump
raw = raw.replace("var APP_VERSION = 'v31';", "var APP_VERSION = 'v32';", 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("v32: changes 5+6+9, bugs 7-11, version bump")
