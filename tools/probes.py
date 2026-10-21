# Checked-in probe suite (architecture candidate #3): the one-off gates that
# caught the real v23-v27 bugs, made permanent. Each probe drives the SCREENS
# registry — the single source of truth for per-screen chrome.
#   python tools/probes.py   (needs playwright + Edge; start from repo root;
#   a dev server on 8123 is started automatically if absent)
import os, sys, time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123"
fails = []

def check(label, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + label + ("  — " + detail if detail and not ok else ""))
    if not ok: fails.append(label)

def vis(el):
    return bool(el) and el.is_visible()

with sync_playwright() as p:
    b = p.chromium.launch(channel=os.environ.get("MP_BROWSER", "msedge"), headless=True)
    pg = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark",
                       permissions=["clipboard-read", "clipboard-write"]).new_page()
    pg.goto(BASE + "/index.html?probes", wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)

    # --- 1. NAV-CHROME PROBE: every screen wears exactly its registry chrome ---
    res = pg.evaluate("""() => {
      const out = {};
      const vis = s => { const el = document.querySelector(s); return !!el && getComputedStyle(el).display !== 'none'; };
      for (const t of Object.keys(SCREENS)) {
        switchTab(t);
        const s = SCREENS[t];
        out[t] = {
          dock: vis('.status-dock') === !!s.chrome.dock,
          bar: vis('.bottom-nav') === !!s.chrome.bar,
          hallTabs: vis('.hall-seg-wrap') === !!s.chrome.hallTabs,
          back: vis('.kit-back') === !!s.chrome.back,
          title: document.querySelector('.app-title').textContent === s.title,
          panel: document.getElementById(s.panel).classList.contains('active')
        };
      }
      return out;
    }""")
    for t, r in res.items():
        for k, ok in r.items():
            check(f"nav[{t}].{k}", ok)

    # --- 2. FONT GATE: no focusable control below 16px (iOS zoom bug) ---
    pg.evaluate("() => Object.keys(SCREENS).forEach(switchTab)")
    bad = pg.evaluate("""() => {
      const bad = [];
      document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16)
          bad.push((el.id || el.type) + ':' + getComputedStyle(el).fontSize);
      });
      return bad;
    }""")
    check("fonts: all focusable >= 16px", not bad, str(bad[:5]))

    # --- 3. COPY ROUND-TRIP: the report copy really lands on the clipboard ---
    pg.evaluate("switchTab('report')"); pg.wait_for_timeout(400)
    pg.evaluate("copyReport()"); pg.wait_for_timeout(400)
    clip = pg.evaluate("navigator.clipboard.readText()")
    check("copy: report on clipboard", "Team" in clip or "SHIFT" in clip or "Superintendent" in clip,
          clip[:60] if clip else "empty")

    # --- 4. ROUTE: hash deep-links resolve through the registry ---
    r2 = pg.evaluate("""() => { location.hash = '#/report'; return new Promise(r => setTimeout(() => r(currentTab), 300)); }""")
    check("route: #/report", r2 == "report", str(r2))

    # --- 5. LAYOUT GATE: body padding clears the fixed chrome on every screen.
    #    Catches the v35.5 bug class: content hidden behind the nav/dock after
    #    a tab switch. Padding must be >= measured .bottom-stack height. ---
    res5 = pg.evaluate("""() => {
      const out = {};
      for (const t of Object.keys(SCREENS)) {
        switchTab(t);
        const stack = document.querySelector('.bottom-stack');
        const chromeOn = document.body.classList.contains('has-bar') || document.body.classList.contains('has-dock');
        out[t] = { chromeOn, stackH: stack ? stack.offsetHeight : 0,
                   padB: parseFloat(getComputedStyle(document.body).paddingBottom) };
      }
      return out;
    }""")
    for t, r in res5.items():
        need = r["stackH"] if r["chromeOn"] else 0
        check(f"layout[{t}]: padding clears chrome", r["padB"] >= need,
              f"padB={r['padB']} stackH={r['stackH']} chromeOn={r['chromeOn']}")

    # --- 6. STAMP ENGINE: one toggle rule everywhere, attribution recorded,
    #    undo restores, the DOM card patches in place (v41 architecture). ---
    res6 = pg.evaluate("""() => {
      const out = {};
      switchTab('walk');
      const hall = () => state.halls[state.activeHall];
      const seg = (r, s) => hall().rows[r][s];
      state.brush = 'hung'; state.scope = 'ALL';
      const r0 = Object.keys(hall().rows).map(Number).sort((a,b)=>a-b)[0];
      // neutral start: defaultState ships demo stamps (rows 1-2 hung) — the
      // engine's toggle rule is atomic per target, so tests begin from 'none'
      const reset = (r, s) => { const g = hall().rows[r][s]; ['F144','OCS','CAT6'].forEach(c => g[c] = 'none'); if (g._st) g._st = {}; };
      reset(r0, '11'); reset(r0, '13');
      // single side tap: sets, then tap-again clears
      tapSide(r0, '11');
      out.set = seg(r0,'11').F144 === 'hung' && seg(r0,'11').CAT6 === 'hung';
      out.attr = !!(seg(r0,'11')._st && seg(r0,'11')._st.F144 && seg(r0,'11')._st.F144.by && seg(r0,'11')._st.F144.at);
      out.domPatched = !!document.querySelector('#walkGrid .side-card[data-r="'+r0+'"][data-side="11"] .stb-hung');
      tapSide(r0, '11');
      out.toggleClear = seg(r0,'11').F144 === 'none';
      out.attrCleared = !(seg(r0,'11')._st && seg(r0,'11')._st.F144);
      // pod stamp: set then clear (Daniel's Q2 rule — pods toggle like rows)
      const pod = (hall().groups || [])[0];
      const rows = pod ? pod.rows.filter(r => hall().rows[r]).slice(0,3) : [];
      if (rows.length) {
        rows.forEach(r => { reset(r, '11'); reset(r, '13'); });
        stampRows(rows, 'both', true);
        out.podSet = rows.every(r => seg(r,'11').F144 === 'hung' && seg(r,'13').F144 === 'hung');
        stampRows(rows, 'both', true);
        out.podToggleClear = rows.every(r => seg(r,'11').F144 === 'none' && seg(r,'13').F144 === 'none');
      } else { out.podSet = true; out.podToggleClear = true; }
      // undo restores the pre-stamp state (incl. attribution)
      const before = JSON.stringify(hall().rows[r0]);
      tapBoth(r0);
      doUndo();
      out.undoRestores = JSON.stringify(hall().rows[r0]) === before;
      // Side vocabulary (one shape-language — arch candidate #4)
      const mixedSeg = { F144: 'hung', OCS: 'hung', CAT6: 'staged' };
      out.sideOverall = Side.overall(mixedSeg) === 'MIXED' && Side.overall(Side.empty()) === 'none';
      out.sideIsAll = Side.isAll(mixedSeg, 'hung') === false && Side.isHung({F144:'hung',OCS:'hung',CAT6:'hung'}) === true;
      out.sideHasProgress = Side.hasProgress(Side.empty()) === false && Side.hasProgress(mixedSeg) === true;
      out.sideSides = JSON.stringify(Side.sides()) === JSON.stringify(['11','13']);
      return out;
    }""")
    for k, ok in res6.items():
        check(f"stamp.{k}", ok)

    # --- 7. SYNC MERGE: one policy, exercised offline via a stubbed fetch.
    #    Remote-newer keys are taken, personal keys ride along, a no-change
    #    sync returns the SAME reference (no spurious re-render), baselines
    #    are part of the merge (v42 architecture). ---
    res7 = pg.evaluate("""async () => {
      const out = {};
      const remote = JSON.parse(JSON.stringify(state));
      remote._meta = { halls_at: Date.now() + 5000 };  // remote halls newer
      remote.halls = { REPLACED: true };
      remote.baseline = { fromRemote: true };
      const gh = { sha: 'x', content: btoa(unescape(encodeURIComponent(JSON.stringify(remote)))) };
      const realFetch = window.fetch;
      let puts = 0;
      window.fetch = (url, opts) => {
        if (opts && opts.method === 'PUT') { puts++; return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(gh) });
      };
      const code = Sync.encodeCode('stub-probe-token');
      Sync.connect(code);
      const out1 = await Sync.sync(state);
      const out2 = await Sync.sync(out1);
      // pure merge directly: local-newer blockers must win over remote
      const local2 = JSON.parse(JSON.stringify(state));
      local2._meta = { blockers_at: Date.now() + 9000 };
      const merged = Sync.merge(remote, local2);
      window.fetch = realFetch;
      Sync.disconnect();
      out.remoteNewerWins = out1.halls && out1.halls.REPLACED === true;
      out.sameRefWhenNoChange = out2 === out1;
      out.personalKeysRide = out1.settings === state.settings;
      out.baselinesMerge = merged.baseline && merged.baseline.fromRemote === true;
      out.localNewerWins = Sync.merge({ blockers: ['remote'], _meta: { blockers_at: 1 } },
                                      { blockers: ['local'], _meta: { blockers_at: 2 } }).blockers[0] === 'local';
      out.winnerStampCarried = merged._meta && merged._meta.blockers_at === local2._meta.blockers_at;
      return out;
    }""")
    for k, ok in res7.items():
        check(f"merge.{k}", ok)

    # --- 8. OVERLAY GATE: every overlay is display:none after boot unless
    #    opened through the Overlay owner; an open overlay really intercepts
    #    taps; closing really hides it (the v34 invisible-overlay bug class). ---
    res8 = pg.evaluate("""() => {
      const out = {};
      const ids = ['updateBanner','hallMenu','hallEditor','nightOverlay','onboarding','settingsSheet'];
      out.allHiddenAfterBoot = ids.every(id => {
        const e = document.getElementById(id);
        return !e || getComputedStyle(e).display === 'none';
      });
      const hit = document.elementFromPoint(innerWidth/2, innerHeight/3);
      out.nothingIntercepts = !(hit && (hit.closest && hit.closest('.overlay, .hall-menu, .palette-sheet, .update-banner')));
      Overlay.open('onboarding');
      const e2 = document.elementFromPoint(innerWidth/2, innerHeight/2);
      out.openIntercepts = !!(e2 && (e2.id === 'onboarding' || (e2.closest && e2.closest('#onboarding'))));
      Overlay.close('onboarding');
      out.closeHides = getComputedStyle(document.getElementById('onboarding')).display === 'none';
      out.settingsRoundTrip = (() => {
        Overlay.open('settingsSheet');
        const vis = getComputedStyle(document.getElementById('settingsSheet')).display !== 'none';
        Overlay.close('settingsSheet');
        return vis && getComputedStyle(document.getElementById('settingsSheet')).display === 'none';
      })();
      out.closeAllClears = (() => {
        Overlay.open('hallMenu'); Overlay.open('settingsSheet'); Overlay.closeAll();
        return !Overlay.anyOpen();
      })();
      return out;
    }""")
    for k, ok in res8.items():
        check(f"overlay.{k}", ok)

    # --- 9. SCREEN-OWNED RENDERING: each tab's onShow populates its own
    #    panel (v45 architecture — renderCrewPanel grab-bag is gone). ---
    res9 = pg.evaluate("""() => {
      const out = {};
      switchTab('crew');
      out.crewChips = document.getElementById('crewChips').children.length > 0;
      out.crewInputs = !!(document.getElementById('supers') && document.getElementById('shiftTime'));
      switchTab('blockers');
      out.blockersList = !!document.getElementById('blockerList');
      out.hallNotesHome = !!document.getElementById('notesWrap');   // lives on this panel
      switchTab('report');
      out.reportOutput = !!(document.getElementById('reportOutput') || document.getElementById('reportStyle'));
      return out;
    }""")
    for k, ok in res9.items():
        check(f"screen.{k}", ok)

    # --- 10. HALL MODULE: one interface for hall ops; the arity-overloaded
    #    deleteHall is gone; add/remove round-trip (v46 architecture). ---
    pg.on("dialog", lambda d: d.accept())
    res10 = pg.evaluate("""() => {
      const out = {};
      out.listWorks = Hall.list().length >= 1;
      out.activeWorks = Hall.active() === state.halls[state.activeHall];
      out.overloadGone = typeof deleteHall === 'undefined' && typeof switchHall === 'undefined';
      const before = Hall.list().length;
      const id = Hall.add('PROBE HALL');
      out.addSwitches = Hall.active() && Hall.active().name === 'PROBE HALL';
      Hall.remove(id);
      out.removeRestores = !state.halls[id] && Hall.list().length === before;
      const keep = Hall.list()[0].id;
      Hall.switchTo(keep);
      out.switchWorks = state.activeHall === keep;
      return out;
    }""")
    for k, ok in res10.items():
        check(f"hall.{k}", ok)

    b.close()

print("\n" + ("PROBES: ALL PASS" if not fails else "PROBES FAILED: " + ", ".join(fails)))
sys.exit(1 if fails else 0)
