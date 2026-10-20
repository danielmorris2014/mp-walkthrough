# Patch index.html with sync wiring (run from walkthrough-app root)
raw = open("index.html", encoding="utf-8").read()

# 1) include sync-engine
old = '<script src="report-engine.js"></script>'
new = '<script src="report-engine.js"></script>\n<script src="sync-engine.js"></script>'
assert old in raw, "anchor 1"
raw = raw.replace(old, new, 1)

# 2) hook saveState
old = "function saveState() {"
new = "function saveState() {\n  try { Sync.touch('halls'); } catch (e) {}"
assert old in raw, "anchor 2"
raw = raw.replace(old, new, 1)

# 3) boot: sync restore + auto-sync + online listener
old = "  routeFromHash(); // lands on Home unless a #/tool deep link was opened"
new = """  routeFromHash(); // lands on Home unless a #/tool deep link was opened
  try { window.__SYNC_NAME = localStorage.getItem('mp_sync_name') || ''; } catch (e) {}
  try {
    if (Sync.restore()) {
      Sync.sync(state).then(function (m) {
        if (m !== state) { state = m; renderAll(); }
        updateSyncStatus();
      });
    }
  } catch (e) {}
  window.addEventListener('online', function () {
    try {
      if (Sync.getStatus().connected) {
        Sync.sync(state).then(function (m) {
          if (m !== state) { state = m; renderAll(); }
          updateSyncStatus();
        });
      }
    } catch (e) {}
  });"""
assert old in raw, "anchor 3"
raw = raw.replace(old, new, 1)

# 4) sync status element on Home (before homeWalkStatus)
old = '<div id="homeWalkStatus" class="home-hero-line"'
new = '<div id="syncStatus" style="font-size:11px;font-weight:700;margin-top:6px;color:var(--muted);"></div>\n      <div id="homeWalkStatus" class="home-hero-line"'
assert old in raw, "anchor 4"
raw = raw.replace(old, new, 1)

# 5) updateSyncStatus function before renderHome
old = "function renderHome() {"
new = """function updateSyncStatus() {
  var el = document.getElementById('syncStatus');
  if (!el) return;
  try {
    var st = Sync.getStatus();
    if (!st.connected) { el.textContent = '\\u25CC Standalone'; el.style.color = 'var(--faint)'; }
    else if (st.status === 'synced') { el.textContent = '\\u27F3 Synced ' + Sync.timeAgo(st.lastSyncAt); el.style.color = 'var(--green-11)'; }
    else if (st.status === 'pending') { el.textContent = '\\u27F3 Pending \\u2014 ' + st.pendingChanges + ' change' + (st.pendingChanges === 1 ? '' : 's'); el.style.color = 'var(--amber-11)'; }
    else { el.textContent = '\\u27F3 Sync error'; el.style.color = 'var(--red-11)'; }
  } catch (e) { el.textContent = ''; }
}
function renderHome() {"""
assert old in raw, "anchor 5"
raw = raw.replace(old, new, 1)

# 6) call updateSyncStatus inside renderHome
old = "  if (metaEl) metaEl.textContent = days[d.getDay()]"
new = "  updateSyncStatus();\n  if (metaEl) metaEl.textContent = days[d.getDay()]"
assert old in raw, "anchor 6"
raw = raw.replace(old, new, 1)

# 7) first-open join overlay
old = "  if (!state.settings.onboarded) document.getElementById('onboarding').style.display = 'flex';"
new = """    if (!state.settings.onboarded) {
      document.getElementById('onboarding').style.display = 'flex';
      var joinHtml = '<div style="margin:14px 0;padding:12px;border:1px dashed var(--border);border-radius:12px;">' +
        '<div style="font-weight:800;font-size:13px;margin-bottom:6px;">Have a site code?</div>' +
        '<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">Paste the code to join the shared site.</div>' +
        '<input type="text" id="joinSiteCode" placeholder="MP-..." style="width:100%;font-size:16px;padding:9px 10px;border-radius:10px;border:1px solid var(--slate-6);background:var(--slate-2);color:var(--text);min-height:40px;box-sizing:border-box;">' +
        '<button class="btn" style="width:100%;margin-top:8px;" onclick="joinSite()">Join shared site</button>' +
        '<div id="joinMsg" style="font-size:11px;margin-top:6px;min-height:14px;color:var(--muted);"></div></div>';
      var ob = document.querySelector('#onboarding .overlay-card ol');
      if (ob) ob.insertAdjacentHTML('beforebegin', joinHtml);
    }"""
assert old in raw, "anchor 7"
raw = raw.replace(old, new, 1)

# 8) joinSite function
old = "function dismissOnboarding() {"
new = """function joinSite() {
  var code = (document.getElementById('joinSiteCode') || {}).value || '';
  var msg = document.getElementById('joinMsg');
  if (!code.trim()) { if (msg) msg.textContent = 'Paste a site code first.'; return; }
  if (msg) msg.textContent = 'Connecting...';
  Sync.connect(code).then(function (ok) {
    if (ok) {
      Sync.pull().then(function (remote) {
        if (remote && remote.halls) {
          ['halls','blockers','crewPool','meta','history'].forEach(function (k) {
            if (remote[k]) state[k] = remote[k];
          });
          saveState(); renderAll();
        }
        if (msg) msg.textContent = 'Connected!';
        setTimeout(dismissOnboarding, 800);
      });
    } else { if (msg) msg.textContent = 'Could not connect. Check the code.'; }
  });
}
function saveSyncName() {
  var el = document.getElementById('syncName');
  if (!el) return;
  try { localStorage.setItem('mp_sync_name', el.value.trim()); window.__SYNC_NAME = el.value.trim(); } catch (e) {}
}
function syncNow() {
  var st = Sync.getStatus();
  if (!st.connected) { showToast('Not connected to a shared site'); return; }
  showToast('Syncing...');
  Sync.sync(state).then(function (m) {
    if (m !== state) { state = m; renderAll(); }
    updateSyncStatus();
    showToast('Synced!');
  });
}
function disconnectSite() {
  Sync.disconnect();
  updateSyncStatus();
  renderCrewPanel();
  showToast('Disconnected. App is standalone.');
}
function dismissOnboarding() {"""
assert old in raw, "anchor 8"
raw = raw.replace(old, new, 1)

# 9) settings UI (insert before "Keep screen awake")
old = '''      <div class="batch-row" style="justify-content:space-between;">
        <span class="muted">Keep screen awake while open</span>'''
new = '''      <div class="card-title" style="margin-top:14px;">Shared site</div>
      <div class="batch-row" style="justify-content:space-between;">
        <span class="muted">Your name (for sync)</span>
        <input type="text" id="syncName" placeholder="e.g. Daniel" style="width:120px;" oninput="saveSyncName()">
      </div>
      <div class="batch-row" style="margin-top:8px;">
        <button class="btn btn-secondary" onclick="syncNow()">Sync now</button>
        <button class="btn btn-ghost" onclick="disconnectSite()">Disconnect</button>
      </div>
      <div id="syncSettingsInfo" class="muted" style="margin-top:6px;"></div>
      <div class="batch-row" style="justify-content:space-between;margin-top:14px;">
        <span class="muted">Keep screen awake while open</span>'''
assert old in raw, "anchor 9"
raw = raw.replace(old, new, 1)

# 10) renderCrewPanel hook
old = "function renderCrewPanel() {"
new = """function renderCrewPanel() {
  var sn = document.getElementById('syncName');
  if (sn) { try { sn.value = localStorage.getItem('mp_sync_name') || ''; } catch (e) {} }
  var si = document.getElementById('syncSettingsInfo');
  if (si) {
    var st = Sync.getStatus();
    si.textContent = st.connected ? ('Connected. Last sync ' + (Sync.timeAgo(st.lastSyncAt) || 'never')) : 'Not connected';
  }"""
assert old in raw, "anchor 10"
raw = raw.replace(old, new, 1)

# version bump
raw = raw.replace("var APP_VERSION = 'v28';", "var APP_VERSION = 'v29';", 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("sync wired: engine + boot + status + first-open + settings; v29")
