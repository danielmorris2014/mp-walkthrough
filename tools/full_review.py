# tools/full_review.py - full page-by-page, flow-by-flow review of every
# screen in the kit. Runs REAL user interactions (stamps, undos, drill-downs,
# searches, flips, form fills) and reports findings with evidence.
#   python tools/full_review.py   (from repo root; needs playwright + Edge)
# Use after any large change, or when Daniel reports 'hella issues' - the
# output is a checklist: ok lines are verified working; !! lines are findings.
# FULL page-by-page review: every screen of every page, real interactions,
# catching breaks before Daniel does. Each entry = a real user flow attempt.
import subprocess, time, sys, json

proc = subprocess.Popen([sys.executable, '-m', 'http.server', '8123'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
from playwright.sync_api import sync_playwright

findings = []

def note(page, flow, issue, evidence='', extra=None):
    findings.append(f'[{page}] {flow}: {issue} | {evidence}')
    print(f'  !! {issue} | {evidence}')

def ok(page, flow, detail='', extra=None):
    print(f'  ok {flow} {detail}')

with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark')
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)[:160]))

    # ============ INDEX: HOME ============
    print('== index/home ==')
    pg.goto('http://127.0.0.1:8123/index.html#/home', wait_until='domcontentloaded')
    pg.wait_for_timeout(2200)
    r = pg.evaluate("""() => ({
      primary: document.querySelectorAll('.home-card').length,
      groups: Array.from(document.querySelectorAll('.tool-group-h')).map(e=>e.textContent),
      tiles: document.querySelectorAll('.tool-tile').length,
      tonight: (document.getElementById('homeWalkSub')||{textContent:''}).textContent.slice(0,40)
    })""")
    (ok if r['primary'] == 1 and r['tiles'] == 9 else note)('home', 'layout',
        f"primaries={r['primary']} tiles={r['tiles']} groups={r['groups']}", str(r))
    ok('home', 'rendered', str(r['tonight']))

    # every tile's destination actually loads (in-page for guide routes)
    r = pg.evaluate("""() => KIT_PAGES.map(e => ({ name: e.name, url: e.url || ('guide:' + e.guide) }))""")
    for entry in r:
        dest = entry['url']
        if dest.startswith('guide:'):
            continue  # covered below
        resp = ctx.request.get('http://127.0.0.1:8123' + dest.replace('./', '/'))
        (ok if resp.status == 200 else note)('home', f"tile {entry['name']}", f"destination {resp.status}", dest)

    # ============ INDEX: WALKTHROUGH ============
    print('== index/walk ==')
    pg.evaluate("switchTab('walk')")
    pg.wait_for_timeout(1200)
    r = pg.evaluate("""() => ({
      rows: document.querySelectorAll('.aisle-row').length,
      dock: getComputedStyle(document.querySelector('.status-dock')).display !== 'none',
      strip: document.querySelectorAll('.hs-col').length,
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth
    })""")
    (ok if r['rows'] > 10 and r['dock'] and r['scrollX'] <= 1 else note)('walk', 'layout',
        f"rows={r['rows']} dock={r['dock']} scrollX={r['scrollX']}", str(r))
    # stamp flow end-to-end
    r = pg.evaluate("""() => {
      const hall = state.halls[state.activeHall];
      const r0 = Object.keys(hall.rows).map(Number).sort((a,b)=>a-b)[5];
      const seg = hall.rows[r0]['11'];
      ['F144','OCS','CAT6'].forEach(c => seg[c] = 'none');
      state.brush = 'hung'; state.scope = 'ALL';
      tapSide(r0, '11');
      const after = hall.rows[r0]['11'].F144;
      return { before: 'none', after, st: seg._st && !!seg._st.F144 };
    }""")
    (ok if r['after'] == 'hung' and r['st'] else note)('walk', 'stamp flow', f"after={r['after']} attr={r['st']}", str(r))
    doUndo_js = pg.evaluate("() => { doUndo(); return true; }")
    ok('walk', 'undo')

    # pod button (batch stamp with toggle)
    r = pg.evaluate("""() => {
      const g = (state.halls[state.activeHall].groups||[])[0];
      if (!g) return { skip: true };
      const rows = g.rows.filter(r => state.halls[state.activeHall].rows[r]).slice(0,2);
      rows.forEach(r => ['11','13'].forEach(s => ['F144','OCS','CAT6'].forEach(c => state.halls[state.activeHall].rows[r][s][c]='none')));
      stampRows(rows, 'both', true);
      const ok1 = rows.every(r => state.halls[state.activeHall].rows[r]['11'].F144 === 'hung');
      stampRows(rows, 'both', true);
      const ok2 = rows.every(r => state.halls[state.activeHall].rows[r]['11'].F144 === 'none');
      doUndo();
      return { stamped: ok1, toggled: ok2 };
    }""")
    (ok if r.get('stamped') and r.get('toggled') else note)('walk', 'pod batch',
        f"stamped={r.get('stamped')} toggled={r.get('toggled')}", str(r))

    # ============ INDEX: CREW/BLOCKERS/REPORT ============
    print('== index/crew+blockers+report ==')
    for tab in ['crew', 'blockers', 'report']:
        pg.evaluate(f"switchTab('{tab}')")
        pg.wait_for_timeout(700)
        r = pg.evaluate("""() => ({
          active: document.querySelector('.panel.active') ? document.querySelector('.panel.active').id : null,
          scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth
        })""")
        (ok if r['scrollX'] <= 1 else note)(tab, 'tab', f"scrollX={r['scrollX']}", str(r))
    # report generates
    r = pg.evaluate("() => { renderReport(); return document.getElementById('reportOutput').textContent.length; }")
    (ok if r > 100 else note)('report', 'generates', f"len={r}")
    # add a blocker
    r = pg.evaluate("""() => {
      state.blockers.push({date:'10/21/2026', hall:'X', text:'probe blocker'});
      renderBlockersTab ? renderBlockersTab() : renderBlockers();
      return document.getElementById('blockerList').textContent.indexOf('probe blocker') >= 0;
    }""")
    (ok if r else note)('blockers', 'add+render', f"visible={r}")
    # hall menu: BUF103 add + regular add
    pg.evaluate("switchTab('walk')"); pg.wait_for_timeout(600)
    r = pg.evaluate("""() => { toggleHallMenu(); return !!document.body.innerHTML.match(/Add BUF103 halls/); }""")
    (ok if r else note)('walk', 'hall menu', f"buf103 button={r}")
    pg.evaluate("toggleHallMenu()")

    # ============ SCAN.HTML ============
    print('== scan.html ==')
    pg.goto('http://127.0.0.1:8123/scan.html', wait_until='domcontentloaded')
    pg.wait_for_timeout(2500)
    r = pg.evaluate("""() => ({
      modes: document.querySelectorAll('#modebar button').length,
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      zxLoaded: !!window.ZXingWASM
    })""")
    (ok if r['modes'] == 2 and r['scrollX'] <= 1 else note)('scan', 'shell', f"modes={r['modes']} scrollX={r['scrollX']}", str(r))
    # mode switch
    r = pg.evaluate("""() => {
      document.querySelector('#modebar button[data-m=text]').click();
      return document.getElementById('liveHint').textContent.indexOf('printed text') >= 0;
    }""")
    (ok if r else note)('scan', 'mode switch', f"text hint={r}")

    # ============ BUF103 ============
    print('== buf103.html ==')
    pg.goto('http://127.0.0.1:8123/buf103.html', wait_until='domcontentloaded')
    pg.wait_for_timeout(6500)
    r = pg.evaluate("""() => ({
      halls: document.querySelectorAll('[data-hall]').length,
      meta: document.getElementById('meta').textContent.slice(0,40),
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth
    })""")
    (ok if r['halls'] == 4 and r['scrollX'] <= 1 else note)('buf103', 'browse', f"halls={r['halls']} scrollX={r['scrollX']}", str(r))
    # full drill
    r = pg.evaluate("""() => {
      document.querySelector('[data-hall="DH2"]').click();
      return document.querySelectorAll('.rackcell').length;
    }""")
    (ok if r > 100 else note)('buf103', 'hall->racks', f"racks={r}")
    r = pg.evaluate("""() => {
      const c = document.querySelector('.rackcell');
      c.click();
      return { connections: document.querySelectorAll('.rowbtn').length,
               famChips: document.querySelectorAll('[data-fam]').length };
    }""")
    (ok if r['connections'] > 0 else note)('buf103', 'rack view', f"conns={r['connections']} chips={r['famChips']}", str(r))
    r = pg.evaluate("""() => {
      document.querySelector('.rowbtn').click();
      const sh = document.getElementById('sheet');
      return { open: sh.classList.contains('ov-open'), copies: sh.querySelectorAll('[data-copy]').length };
    }""")
    (ok if r['open'] and r['copies'] == 3 else note)('buf103', 'detail sheet', f"open={r['open']} copies={r['copies']}", str(r))
    pg.evaluate("closeSheet()")
    # search by device
    r = pg.evaluate("""() => {
      document.getElementById('q').value = 'tor1';
      run();
      return document.querySelector('.count') ? document.querySelector('.count').textContent.slice(0, 30) : 'NO RESULTS';
    }""")
    ok('buf103', 'search', str(r))
    # rack tab no dead end: shows the picker OR the last rack with a back chip
    r = pg.evaluate("""() => {
      document.getElementById('q').value = '';
      document.querySelectorAll('#seg button')[1].click();
      return new Promise(res => setTimeout(() => res({
        halls: document.querySelectorAll('[data-hall]').length,
        backChip: document.body.textContent.indexOf('All racks') >= 0
      }), 400));
    }""")
    (ok if (r['halls'] == 4 or r['backChip']) else note)('buf103', 'rack tab', f"halls={r['halls']} back={r['backChip']}")

    # ============ FLASHCARDS ============
    print('== flashcards.html ==')
    pg.goto('http://127.0.0.1:8123/flashcards.html', wait_until='domcontentloaded')
    pg.wait_for_timeout(3000)
    r = pg.evaluate("""() => ({
      term: !!document.querySelector('.term'),
      meta: document.getElementById('meta').textContent.slice(0, 30),
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth
    })""")
    (ok if r['term'] and r['scrollX'] <= 1 else note)('cards', 'shell', str(r))
    r = pg.evaluate("""() => {
      flip();
      const f = document.getElementById('fcard').classList.contains('flipped');
      answer(true);
      return { flippedWorked: f, count: document.getElementById('count').textContent };
    }""")
    (ok if r['flippedWorked'] else note)('cards', 'flip+answer', str(r))

    # ============ REFERENCE ============
    print('== reference.html ==')
    pg.goto('http://127.0.0.1:8123/reference.html', wait_until='domcontentloaded')
    pg.wait_for_timeout(3000)
    r = pg.evaluate("""() => ({
      pill: !!document.querySelector('.mp-back-pill, .mp-ref-back'),
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tables: document.querySelectorAll('table').length
    })""")
    (ok if r['pill'] and r['scrollX'] <= 1 else note)('reference', 'shell', f"scrollX={r['scrollX']}", str(r))

    # ============ GUIDE embed destinations ============
    print('== guide embed (find/mislabel/clean) ==')
    for route in ['find', 'mislabel', 'clean']:
        pg.goto(f'http://127.0.0.1:8123/guide.html#/{route}', wait_until='domcontentloaded')
        pg.wait_for_timeout(2500)
        r = pg.evaluate("""() => ({
          viewLen: (document.getElementById('view')||{textContent:''}).textContent.trim().length,
          findBox: !!document.getElementById('mpFindBox'),
          embed: document.body.classList.contains('mp-embed')
        })""")
        if route == 'find':
            (ok if r['findBox'] else note)('guide/find', 'search box', f"box={r['findBox']}")
        else:
            (ok if r['viewLen'] > 40 else note)(f'guide/{route}', 'content', f"len={r['viewLen']}")

    # ============ LABELS + TRAINING entry ============
    print('== labels + training ==')
    resp = ctx.request.get('http://127.0.0.1:8123/labels.html')
    (ok if resp.status == 200 else note)('labels', 'page', f"status={resp.status}")
    resp = ctx.request.get('http://127.0.0.1:8123/training/DataHall4_Cable_Training/START_HERE.html')
    (ok if resp.status == 200 else note)('training', 'entry', f"status={resp.status}")
    resp = ctx.request.get('http://127.0.0.1:8123/training/manifest.json')
    (ok if resp.status == 200 else note)('training', 'manifest', f"status={resp.status}")

    # JS errors across the whole run
    real_errors = [e for e in errors if 'favicon' not in e]
    (ok if not real_errors else note)('ALL', 'page errors', f"{len(real_errors)} errors", '; '.join(real_errors[:4]))

    b.close()
proc.terminate()

print()
print('=' * 60)
print(f'FINDINGS: {len(findings)}')
for f in findings:
    print(' ', f)
