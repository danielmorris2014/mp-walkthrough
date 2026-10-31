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

    # --- 1b. HOME COCKPIT & BENTO GRID (v79): no Tonight card clutter, header
    #     Sync/Settings pills, Quick-Jump bar, radial progress ring, 1-tap hall
    #     pills, 4 sub-workflow buttons, and Bento tiles with subtitles. ---
    res_home = pg.evaluate("""() => {
      switchTab('home');
      return {
        noTonightBox: !document.getElementById('lastNightLine') && !document.getElementById('resumeBtn'),
        headerUtilities: !!document.querySelector('header #syncStatus') && !!document.getElementById('headerSettingsBtn'),
        quickJumpBar: !!document.getElementById('homeJumpInput'),
        cockpitRing: !!document.getElementById('homeProgRing') && !!document.getElementById('homeProgPct'),
        hallPills: document.querySelectorAll('#homeHallPills .hc-hall-pill').length >= 2,
        subNavBtns: document.querySelectorAll('.hc-subnav .hc-subbtn').length === 4,
        bentoFeatured: document.querySelectorAll('.tool-tile.featured').length === 1,
        bentoSubs: document.querySelectorAll('.tool-tile .tile-sub').length === 9
      };
    }""")
    for k, ok in res_home.items():
        check(f"home.{k}", ok)

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
      // Yjs CRDT field-level merge: two phones stamp different rows/cables simultaneously -> both survive
      const phoneA = JSON.parse(JSON.stringify(state));
      const phoneB = JSON.parse(JSON.stringify(state));
      phoneA.halls.CB5_DH1.rows[17]['11'].F144 = 'hung';
      phoneA.halls.CB5_DH1.rows[17]['11']._st = { F144: { by: 'PhoneA', at: 1000 } };
      phoneA._meta = { halls_at: 1000 };
      phoneB.halls.CB5_DH1.rows[22]['13'].OCS = 'ran';
      phoneB.halls.CB5_DH1.rows[22]['13']._st = { OCS: { by: 'PhoneB', at: 2000 } };
      phoneB._meta = { halls_at: 2000 };
      const crdtMerged = Sync.merge(phoneA, phoneB);
      out.crdtConcurrentStampsSurvive =
        crdtMerged.halls.CB5_DH1.rows[17]['11'].F144 === 'hung' &&
        crdtMerged.halls.CB5_DH1.rows[22]['13'].OCS === 'ran' &&
        !!Sync.getYDoc();
      // Tombstone clear vs older remote stamp: intentional clear on Phone B at t=3000 beats Phone A's 'hung' at t=1000
      const phoneClear = JSON.parse(JSON.stringify(state));
      phoneClear.halls.CB5_DH1.rows[17]['11'].F144 = 'none';
      phoneClear._meta = { halls_at: 3000, _cleared: { 'CB5_DH1:17:11:F144': 3000 } };
      const clearMerged = Sync.merge(phoneA, phoneClear);
      out.clearTombstoneWins = clearMerged.halls.CB5_DH1.rows[17]['11'].F144 === 'none';
      const prevName = Sync.getName();
      Sync.setName('DAN');
      out.syncNameAndTransport = Sync.getName() === 'DAN'
        && typeof Sync.setTransport === 'function'
        && typeof Sync.schedule === 'function'
        && typeof Sync.startPolling === 'function';
      Sync.setName(prevName);
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
      const shiftEl = document.getElementById('shiftTime');
      const shiftOpts = shiftEl ? Array.from(shiftEl.options || []).map(o => o.value) : [];
      out.crewInputs = !!(document.getElementById('supers') && shiftEl && shiftEl.tagName === 'SELECT'
        && shiftOpts.includes('2:00 PM \u2013 2:00 AM') && shiftOpts.includes('6:00 AM \u2013 6:00 PM')
        && document.getElementById('addShiftTimeBtn'));
      switchTab('blockers');
      out.blockersList = !!document.getElementById('blockerList');
      out.hallNotesHome = !!document.getElementById('notesWrap') && !!document.getElementById('noteHall');   // lives on this panel
      switchTab('report');
      const parts = typeof parseReportEmailParts === 'function' ? parseReportEmailParts() : null;
      const rptTxt = buildReport('formal');
      const v2Mock = { version: 2, halls: { CB4_DH2: { notes: ['HAC 17, Rows 33\u201336 \u2013 Staged (8 hrs per person).', 'Real note'] } } };
      migrateState(v2Mock);
      out.noHardcodedSeedNotes = !rptTxt.includes('8 hrs per person')
        && v2Mock.halls.CB4_DH2.notes.length === 1
        && v2Mock.halls.CB4_DH2.notes[0] === 'Real note';
      out.reportOutput = !!(document.getElementById('reportOutput') && document.getElementById('reportStyle')
        && document.getElementById('emailReportBtn')
        && parts && parts.subject && parts.body);
      out.uniqueSettingsIds = ['signature','textSizeBtn','wakeBtn','syncName','syncSettingsInfo']
        .every(id => document.querySelectorAll('#' + id).length === 1);
      out.kitDataStoreAndNav = typeof KitData === 'object'
        && typeof KitData.store === 'object'
        && typeof KitData.nav === 'object';
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

    # --- 11. PAGE GATE: every standalone page loads clean. index.html has
    #    probes 1-10; buf103/reference/labels/guide had NOTHING - and three
    #    field bugs shipped through that hole (reference horizontal scroll,
    #    buf103 topbar overlap, dead guide training route). Now every page
    #    must: load with zero JS errors, have zero sideways scroll, keep
    #    focusable inputs >= 16px, and guide's launcher routes must render
    #    real content instead of the cloud dead-end message. ---
    standalone = [
        ("/buf103.html", 6000, "buf103"),
        ("/reference.html", 3500, "reference"),
        ("/labels.html", 2500, "labels"),
        ("/flashcards.html", 3000, "flashcards"),
        ("/scan.html", 2500, "scan"),
    ]
    for path, wait, name in standalone:
        sp = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark").new_page()
        perrs = []
        sp.on("pageerror", lambda e: perrs.append(str(e)[:100]))
        sp.goto(BASE + path, wait_until="domcontentloaded")
        sp.wait_for_timeout(wait)
        r = sp.evaluate("""() => ({
          scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallInputs: Array.from(document.querySelectorAll('input, select, textarea'))
            .filter(el => el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16).length,
          bodyText: document.body.innerText.slice(0, 400)
        })""")
        check(f"page[{name}].noJsErrors", not perrs, "; ".join(perrs[:2]))
        check(f"page[{name}].noHorizontalScroll", r["scrollX"] <= 1, f"scrollX={r['scrollX']}")
        check(f"page[{name}].inputs16px", r["smallInputs"] == 0, f"{r['smallInputs']} small")
        if name == "buf103":
            check("page[buf103].dataLoaded", "cables" in r["bodyText"], r["bodyText"][:60])
            ce = sp.evaluate("""() => ({
              hasEngine: typeof CutsheetEngine === 'object',
              hasIdx: !!(typeof IDX === 'object' && IDX && IDX.byRack),
              conns: (typeof CutsheetEngine === 'object' && IDX) ? CutsheetEngine.connectionsFor(IDX, 'BUF103-DH1-R0102').length : 0,
              role: typeof CutsheetEngine === 'object' ? CutsheetEngine.classifyRackRole('BUF103-DH1-R0102') : ''
            })""")
            check("page[buf103].cutsheetEngineIndex", ce["hasEngine"] and ce["hasIdx"] and ce["conns"] > 0 and isinstance(ce["role"], dict) and ce["role"].get("code") == "NET RACK", str(ce))
            tr = sp.evaluate("""() => {
              const q = document.getElementById('q');
              q.value = 'dh1-r0102';
              const traceBtn = document.querySelector('#seg button[data-v="trace"]');
              traceBtn.click();
              const stages = document.querySelectorAll('.jtk-stage').length;
              const multihop = document.querySelectorAll('.jtk-stage.multihop').length;
              const nodes = document.querySelectorAll('.jtk-node').length;
              const conns = document.querySelectorAll('svg.jtk-connector').length;
              const topoCard = !!document.querySelector('.topo-card');
              const activeStrip = !!document.querySelector('.trace-active-strip');
              const firstCable = document.querySelector('.trace-cable-btn');
              if (firstCable) firstCable.click();
              const hlNodes = document.querySelectorAll('.jtk-node.hl-active').length;
              const hlConns = document.querySelectorAll('svg.jtk-connector.hl-active').length;
              const inspectPill = document.querySelector('.inspect-pill[data-open-sheet]');
              if (inspectPill) inspectPill.click();
              const channelSvg = !!document.querySelector('#sheet .channel-svg');
              closeSheet();
              const scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
              return { stages, multihop, nodes, conns, topoCard, activeStrip, hlNodes, hlConns, channelSvg, scrollX };
            }""")
            check("page[buf103].traceJsPlumbRenders", tr["stages"] > 0 and tr["nodes"] > 0 and tr["conns"] > 0, str(tr))
            check("page[buf103].traceMultiHop", tr["multihop"] >= 2 and tr["topoCard"] and tr["activeStrip"] and tr["channelSvg"], str(tr))
            check("page[buf103].traceHighlight", tr["hlNodes"] >= 2 and tr["hlConns"] >= 1, str(tr))
            check("page[buf103].traceNoScrollX", tr["scrollX"] <= 1, f"scrollX={tr['scrollX']}")
            trPicker = sp.evaluate("""() => {
              document.getElementById('q').value = '';
              RACK = null; HALL = null; ROWFILTER = null;
              document.querySelector('#seg button[data-v="trace"]').click();
              const hallsInTrace = document.querySelectorAll('[data-hall]').length;
              const cbBar = !!document.querySelector('.hierbar');
              document.querySelector('[data-hall="DH1"]').click();
              const rowGroups = document.querySelectorAll('.rowgrp-hdr').length;
              const firstRack = document.querySelector('.rackcell');
              if (firstRack) firstRack.click();
              const tracedStages = document.querySelectorAll('.jtk-stage').length;
              return { hallsInTrace, cbBar, rowGroups, tracedStages };
            }""")
            check("page[buf103].traceHierarchyPicker", trPicker["hallsInTrace"] == 4 and trPicker["cbBar"] and trPicker["rowGroups"] > 0 and trPicker["tracedStages"] > 0, str(trPicker))
            sjs = sp.evaluate("""async () => {
              const hasBtn = !!document.getElementById('updateXlsxBtn') && !!document.getElementById('xlsxInput');
              await lazyLoadScript('./vendor/xlsx/xlsx.full.min.js');
              await lazyLoadScript('./tools/cutsheet-parser.js');
              const wb = XLSX.utils.book_new();
              const aoa = [
                [null, 'A_loc', 'A_name', 'A_port', 'tor_eor_cable', 'eor_loc', 'eor_panel', 'eor_ru', 'eor_front_port', 'eor_dcn_cable', 'dcn_loc', 'dcn_panel', 'dcn_ru', 'dcn_front_port', 'dcn_spn_cable', 'Z_loc', 'Z_name', 'Z_port'],
                [null, 'BUF103-DH1-R0102', 'tor1', 'Et1', 'SMF-10M', 'BUF103-DH1-R0111', 'PP1', '42', 'A1', 'TRUNK-50M', 'BUF103-DH1-R2508', 'DCNPP', '40', 'B1', 'PATCH-3M', 'BUF103-DH1-R2501', 'spn1', 'Et1'],
                [null, 'BUF103-DH1-R0102', 'tor1', 'Et2', 'SMF-10M', 'BUF103-DH1-R0111', 'PP1', '42', 'A2', 'TRUNK-50M', 'BUF103-DH1-R2508', 'DCNPP', '40', 'B2', 'PATCH-3M', 'BUF103-DH1-R2501', 'spn1', 'Et2'],
                [null, 'BUF103-DH1-R0402', 'tor2', 'Et1', 'SMF-10M', 'BUF103-DH1-R0411', 'PP1', '42', 'A1', 'TRUNK-50M', 'BUF103-DH1-R2508', 'DCNPP', '40', 'B3', 'PATCH-3M', 'BUF103-DH1-R2502', 'spn2', 'Et1'],
                [null, 'BUF103-DH2-R0302', 'tor3', 'Et1', 'SMF-10M', 'BUF103-DH2-R0311', 'PP1', '42', 'A1', 'TRUNK-50M', 'BUF103-DH2-R2408', 'DCNPP', '40', 'B1', 'PATCH-3M', 'BUF103-DH2-R2401', 'spn1', 'Et1'],
              ];
              const ws = XLSX.utils.aoa_to_sheet(aoa);
              XLSX.utils.book_append_sheet(wb, ws, 'TOR <> DCN-SPN');
              const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
              const parsed = CutsheetParser.parseArrayBuffer(buf, { fileName: 'Field_BUF103.xlsx', minRows: 4 });
              const rows = parsed.data.rows['TOR <> DCN-SPN'] || [];
              return {
                hasBtn,
                rowCount: rows.length,
                hopsLen: rows[0] && rows[0][6] ? rows[0][6].length : 0,
                halls: parsed.data.halls,
                dh1MaxRow: parsed.hallsCfg.DH1 ? parsed.hallsCfg.DH1.maxRow : 0
              };
            }""")
            check("page[buf103].sheetJsSelfServe", sjs["hasBtn"] and sjs["rowCount"] == 4 and sjs["hopsLen"] == 6 and sjs["dh1MaxRow"] == 25, str(sjs))
        sp.close()

    # --- 12. PAGES REGISTRY: home destinations are one declarative list;
    #    every precache-flagged page must be in sw.js PRECACHE (was four
    #    hand-maintained lists - the sw.js-forgetting bug family). ---
    res12 = pg.evaluate("() => KIT_PAGES")
    import re as _re
    sw = open("sw.js", encoding="utf-8").read()
    precache = set(_re.findall(r"'([^']+)'", sw.split("var CORE")[1].split("]")[0])) | set(_re.findall(r"'([^']+)'", sw.split("var HEAVY")[1].split("]")[0]))
    for entry in res12:
        if entry.get("precache") and entry.get("url"):
            path = entry["url"].lstrip("./")
            check(f"registry[{entry['name']}].precached", path in precache or entry["url"] in precache,
                  f"{entry['url']} missing from sw PRECACHE")

    # measured top chrome on pages with fixed topbars (no hand constants)
    sp2 = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark").new_page()
    sp2.goto(BASE + "/buf103.html", wait_until="domcontentloaded")
    sp2.wait_for_timeout(4500)
    r12 = sp2.evaluate("""() => {
      const tb = document.querySelector('.topbar');
      const pad = parseFloat(getComputedStyle(document.body).paddingTop);
      return { topbar: tb ? tb.offsetHeight : 0, pad: pad };
    }""")
    check("chrome[buf103].topMeasured", r12["pad"] >= r12["topbar"], f"pad={r12['pad']} topbar={r12['topbar']}")
    sp2.close()

    # guide EMBED MODE: arriving from a kit tile must NOT show the guide's
    # own app chrome (tab bar / brand / help FAB) - kit sections, not a
    # second app. Direct guide loads keep their chrome.
    sp3 = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark").new_page()
    sp3.goto(BASE + "/guide.html", wait_until="domcontentloaded")
    sp3.wait_for_timeout(2500)
    sp3.evaluate("() => { sessionStorage.setItem('mp_embed','1'); location.reload(); }")
    sp3.wait_for_timeout(3000)
    r14 = sp3.evaluate("""() => ({
      embed: document.body.classList.contains('mp-embed'),
      tabsHidden: getComputedStyle(document.querySelector('.tabs')).display === 'none',
      backPill: !!document.querySelector('.mp-back')
    })""")
    check("guide.embedMode.hidesChrome", r14["embed"] and r14["tabsHidden"] and r14["backPill"], str(r14))
    sp3.close()

    # guide launcher routes: content, not the cloud dead-end
    for route in ["train", "mislabel", "clean", "find"]:
        sp = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark").new_page()
        perrs = []
        sp.on("pageerror", lambda e: perrs.append(str(e)[:100]))
        sp.goto(BASE + f"/guide.html#/{route}", wait_until="domcontentloaded")
        sp.wait_for_timeout(3000)
        if route == "find":
            # the search form lives on the guide's HOME card, not the results
            # view - submit from there like a user, which lands on #/find
            sp.goto(BASE + "/guide.html", wait_until="domcontentloaded")
            sp.wait_for_timeout(3000)
            sp.evaluate("""() => {
              const inp = document.querySelector('#app input[type=search], #app input[type=text]');
              if (inp) { inp.value = 'BUF102#0028354';
                (inp.closest('form')||inp).dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); }
            }""")
            sp.wait_for_timeout(3000)
        r = sp.evaluate(
            "() => (document.getElementById('view')||{textContent:''}).textContent")
        check(f"guide[{route}].renders", len(r.strip()) > 40, r.strip()[:60])
        check(f"guide[{route}].noCloudDeadEnd",
              "needs the online site" not in r and "Enter the crew code" not in r, r.strip()[:60])
        sp.close()

    b.close()

print("\n" + ("PROBES: ALL PASS" if not fails else "PROBES FAILED: " + ", ".join(fails)))
sys.exit(1 if fails else 0)
