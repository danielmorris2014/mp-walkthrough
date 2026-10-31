# Reconstruct Daniel's 10/19 night in the app and diff the formal report
# against his target format (status-first bullets, numeric regrouping,
# mixed-row grouping), plus direct unit assertions on ReportEngine's deepened
# seam (effectiveHalls, wrongLabelLines, buildEmailParts).
from playwright.sync_api import sync_playwright
import os, sys

SETUP = r"""(() => {
  const set = (hall, r, side, f, o, c) => { const s = state.halls[hall].rows[r][side]; s.F144=f; s.OCS=o; s.CAT6=c; };
  const all = (hall, r, side, st) => set(hall, r, side, st, st, st);
  // CB5 DH1
  [1,2].forEach(r => { all('CB5_DH1', r, '11', 'hung'); all('CB5_DH1', r, '13', 'hung'); });
  [3,4,5,6].forEach(r => { all('CB5_DH1', r, '11', 'hung'); all('CB5_DH1', r, '13', 'ran'); });
  [7,8,9,10,11,12].forEach(r => { all('CB5_DH1', r, '11', 'ran'); all('CB5_DH1', r, '13', 'ran'); });
  all('CB5_DH1', 13, '11', 'ran'); all('CB5_DH1', 13, '13', 'staged');   // 1301-1311 ran; 1313 staged
  set('CB5_DH1', 14, '11', 'ran', 'prog', 'ran');                        // 1411
  set('CB5_DH1', 14, '13', 'ran', 'staged', 'ran');                      // 1413
  set('CB5_DH1', 15, '11', 'staged', 'ran', 'staged');                   // 1511
  set('CB5_DH1', 15, '13', 'ran', 'staged', 'ran');                      // 1513
  all('CB5_DH1', 16, '11', 'ran'); set('CB5_DH1', 16, '13', 'ran', 'staged', 'ran'); // 1601-1611 / 1613
  [17,18].forEach(r => { set('CB5_DH1', r, '11', 'none', 'staged', 'staged'); set('CB5_DH1', r, '13', 'none', 'staged', 'staged'); });
  // CB4 DH2
  [13,14,15,16].forEach(r => { all('CB4_DH2', r, '13', 'hung'); all('CB4_DH2', r, '11', 'ran'); });
  [17,18,19,20,21,22,23,24].forEach(r => { all('CB4_DH2', r, '11', 'hung'); all('CB4_DH2', r, '13', 'hung'); });
  [9,10].forEach(r => all('CB4_DH2', r, '13', 'ran'));
  [11,12].forEach(r => { all('CB4_DH2', r, '11', 'ran'); all('CB4_DH2', r, '13', 'ran'); });
  all('CB4_DH2', 6, '13', 'staged');
  set('CB4_DH2', 7, '13', 'ran', 'staged', 'ran');
  set('CB4_DH2', 8, '13', 'ran', 'prog', 'ran');
  // CB4 DH4 - notes only
  state.halls['CB4_DH2'].notes = []; state.halls['CB4_DH4'].notes = ['Continued working through cut sheet'];
  state.meta.supers = 'Daniel Morris';
  state.meta.shiftTime = '2:00 PM \u2013 2:00 AM';
  state.meta.mpCount = 58; state.meta.spCount = 1;
  state.meta.spWorkNotes = 'Received and Staged 2,000 waterfalls in CB4 DH1\nReceived 192 fibers for CB4 DH2 and were passed over to midpoint.';
  state.meta.areasOfConcern = 'None';
  state.blockers = [
    { date: '10/19/2026', hall: 'CB4 DH2', text: 'Waiting on AIO racks, currently have 0' },
    { date: '10/19/2026', hall: 'CB5 DH1', text: 'Waiting on AIO racks, currently have 0' }
  ];
  state.settings.signature = '';
  saveState();
  document.getElementById('reportStyle').value = 'formal';
  renderReport();
  return document.getElementById('reportOutput').textContent;
})()"""

from datetime import datetime, timedelta
_now = datetime.now()
_sd = _now - timedelta(days=1) if _now.hour < 2 else _now
EXPECTED_DATE = f"{_sd.month}/{_sd.day}/{_sd.year}"

EXPECT_SUBSTRINGS = [
    "Subject: Shift Update \u2013 " + EXPECTED_DATE + " (2:00 PM \u2013 2:00 AM)",
    "SHIFT SUMMARY", "WORK PERFORMED", "BLOCKERS \u2013 10/19/2026", "AREAS OF CONCERN",
    "\u2022 Ran and hung: 111\u2013113, 211\u2013213, 311\u2013611",
    "\u2022 Ran: 313\u2013613, 711\u20131211, 713\u20131213, 1301\u20131311, 1601\u20131611",
    "\u2022 Staged: 1313",
    "\u2022 1411: 144F and CAT6 ran; OCS in progress",
    "\u2022 1413, 1513, 1613: 144F and CAT6 ran; OCS staged",
    "\u2022 1511: OCS ran; 144F and CAT6 staged",
    "\u2022 1711, 1713, 1811, 1813: OCS and CAT6 staged",
    "\u2022 Ran and hung: 1313\u20131613, 1711\u20132411, 1713\u20132413",
    "\u2022 Ran: 913, 1013, 1111\u20131113, 1211\u20131213, 1311\u20131611",
    "\u2022 Staged: 613",
    "\u2022 713: 144F and CAT6 ran; OCS staged",
    "\u2022 813: 144F and CAT6 ran; OCS in progress",
    "\u2022 Received and Staged 2,000 waterfalls in CB4 DH1",
    "\u2022 CB4 DH2: Waiting on AIO racks, currently have 0",
    "\u2022 None",
]

with sync_playwright() as p:
    b = p.chromium.launch(channel=os.environ.get("MP_BROWSER", "msedge"), headless=True)
    pg = b.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark").new_page()
    pg.goto("http://127.0.0.1:8123/index.html?rtest", wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    txt = pg.evaluate(SETUP)
    print(txt)
    print("=" * 60)
    missing = [e for e in EXPECT_SUBSTRINGS if e not in txt]
    if missing:
        print("MISSING", len(missing), "of", len(EXPECT_SUBSTRINGS))
        for m in missing: print("  X", m)
        sys.exit(1)
    if "not started" in txt.lower() or "CB4 DH4" in txt or "Continued working through cut sheet" in txt:
        print("FAIL: report included unstamped cable/hall or legacy free-text hall note")
        sys.exit(1)
    print("ALL", len(EXPECT_SUBSTRINGS), "EXPECTED LINES PRESENT")

    # numStyle regression guard: 'plain' must reach hallBlock/formalHallLines2
    plain = pg.evaluate(
        "() => { document.getElementById('numStyle').value = 'plain'; renderReport();"
        " return document.getElementById('reportOutput').textContent; }")
    plain_ok = ("(both sides)" in plain or "(11 side)" in plain or "(13 side)" in plain) \
               and "1711\u20132411" not in plain
    print("NUMSTYLE PLAIN:", "PASS" if plain_ok else "FAIL")
    if not plain_ok:
        print("  plain report still renders short-style tokens")
        sys.exit(1)
    seam_ok = pg.evaluate("""() => {
      const stylesOk = ['formal', 'mine', 'crew', 'boss'].every(st => {
        const out = ReportEngine.buildReport(st, { state, numStyle: 'short', halls: state.halls });
        return typeof out === 'string' && out.length > 80;
      });
      // Test ReportEngine.effectiveHalls (changes-only vs baseline)
      const snap = JSON.parse(JSON.stringify(state));
      snap.baseline = { date: '10/18/2026', halls: JSON.parse(JSON.stringify(state.halls)) };
      snap.halls.CB5_DH1.rows[20]['11'] = { F144: 'hung', OCS: 'hung', CAT6: 'hung' };
      const diffHalls = ReportEngine.effectiveHalls(snap, 'changes');
      const diffOk = diffHalls.CB5_DH1.rows[1]['11'].F144 === 'none' &&
                     diffHalls.CB5_DH1.rows[20]['11'].F144 === 'hung';
      // Test ReportEngine.wrongLabelLines & ReportEngine.buildEmailParts
      const wl = ReportEngine.wrongLabelLines([{ id: 'BUF102#001', sa: 'R0101', da: 'R0102', done: false }]);
      const parts = ReportEngine.buildEmailParts('formal', {
        state: snap, numStyle: 'short', scope: 'changes',
        mislabels: [{ id: 'BUF102#001', sa: 'R0101', da: 'R0102', done: false }]
      });
      const dedup = ReportEngine.cleanEmailList('Chris.dickman@servicepoint.com, chris.dickman@servicepoint.com, John.Hott@servicepoint.com');
      const recipientsOk = parts.toList.length === 1 &&
                           parts.toList[0] === 'Jack.Tracy@servicepoint.com' &&
                           parts.ccList.length === 7 &&
                           dedup.length === 2 &&
                           parts.outlookUrl.includes('to=Jack.Tracy%40servicepoint.com') &&
                           parts.outlookUrl.includes('cc=John.Hott%40servicepoint.com');
      const richPreviewOk = !!document.querySelector('#reportOutput .rp-sec') &&
                            !!document.querySelector('#reportEnvelope .to-pill') &&
                            typeof parts.html === 'string' && parts.html.includes('SHIFT SUMMARY');
      // End-to-end UI input -> Report propagation check (including live Walk View report preview & uncommitted blocker flush)
      document.getElementById('numStyle').value = 'short';
      state.settings.numStyle = 'short';
      switchTab('walk');
      setBrush('remed');
      tapBoth(25);
      const walkPreviewTxt = document.getElementById('walkReportPreview').textContent || '';
      switchTab('crew');
      document.getElementById('supers').value = 'Daniel Morris & Jack Tracy';
      document.getElementById('supers').dispatchEvent(new Event('input'));
      document.getElementById('mpCount').value = '64';
      document.getElementById('mpCount').dispatchEvent(new Event('input'));
      document.getElementById('spWorkNotes').value = '• Verified 144F trunks in Row 9';
      document.getElementById('spWorkNotes').dispatchEvent(new Event('input'));
      switchTab('blockers');
      document.getElementById('blockerText').value = 'Pending patch panels on Row 12';
      document.getElementById('areasOfConcern').value = '- Fiber reel shortage in DH2';
      document.getElementById('areasOfConcern').dispatchEvent(new Event('input'));
      document.getElementById('signature').value = 'Daniel Morris – ServicePoint';
      savePrefs();
      switchTab('report');
      const liveTxt = document.getElementById('reportOutput').textContent;
      const uiFlowOk = walkPreviewTxt.includes('2511\u20132513') &&
                       liveTxt.includes('2511\u20132513') &&
                       liveTxt.includes('Daniel Morris & Jack Tracy') &&
                       liveTxt.includes('MP \u2013 64') &&
                       liveTxt.includes('\u2022 Verified 144F trunks in Row 9') &&
                       !liveTxt.includes('\u2022 \u2022') &&
                       liveTxt.includes('Pending patch panels on Row 12') &&
                       liveTxt.includes('\u2022 Fiber reel shortage in DH2') &&
                       !liveTxt.includes('\u2022 -') &&
                       liveTxt.includes('Daniel Morris \u2013 ServicePoint');
      return stylesOk && diffOk && wl.includes('WRONG LABELS FOUND') &&
             parts.subject.includes('Shift Update') && parts.body.includes('2001\u20132011') &&
             parts.body.includes('WRONG LABELS FOUND') && recipientsOk && richPreviewOk && uiFlowOk;
    }""")
    print("REPORT ENGINE SEAM (styles/effectiveHalls/wrongLabels/emailParts):", "PASS" if seam_ok else "FAIL")
    if not seam_ok:
        sys.exit(1)
    b.close()
