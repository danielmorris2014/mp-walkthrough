# Reconstruct Daniel's 10/19 night in the app and diff the formal report
# against his target format (status-first bullets, numeric regrouping,
# mixed-row grouping).
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
    "\u2022 1711, 1713, 1811, 1813: OCS and CAT6 staged; 144F not started",
    "\u2022 Ran and hung: 1313\u20131613, 1711\u20132411, 1713\u20132413",
    "\u2022 Ran: 913, 1013, 1111\u20131113, 1211\u20131213, 1311\u20131611",
    "\u2022 Staged: 613",
    "\u2022 713: 144F and CAT6 ran; OCS staged",
    "\u2022 813: 144F and CAT6 ran; OCS in progress",
    "\u2022 Continued working through cut sheet",
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
    print("ALL", len(EXPECT_SUBSTRINGS), "EXPECTED LINES PRESENT")
    b.close()
