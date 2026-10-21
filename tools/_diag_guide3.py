# Diagnostic 4: offline failure now VISIBLE + retryable (v48 fix proof)
import subprocess, time, sys
proc = subprocess.Popen([sys.executable, '-m', 'http.server', '8123'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True)
    pg = b.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark').new_page()
    # kill every directory fetch = "in the halls with a missing cache"
    pg.route('**/data/directory.json.gz', lambda route: route.abort())
    pg.goto('http://127.0.0.1:8123/guide.html', wait_until='domcontentloaded')
    pg.wait_for_timeout(3500)
    r = pg.evaluate("""async () => {
      const inp = document.querySelector('#app input[type=search], #app input[type=text]');
      inp.value = 'BUF102#0028354';
      const form = inp.closest('form');
      form.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}));
      await new Promise(r => setTimeout(r, 3000));
      const errCard = document.getElementById('mpDirCard');
      return {
        state: window.__MPDIR.state(),
        errCardShown: !!errCard,
        errText: errCard ? errCard.textContent.replace(/[\\s\\n]+/g,' ').slice(0,160) : 'NONE',
        retryBtn: !!(errCard && errCard.querySelector('button'))
      };
    }""")
    print('OFFLINE FAILURE:', r)
    pg.screenshot(path='tools/shots/diag-dir-error.png')
    # now "signal returns": unroute, hit Retry, database loads and card recovers
    pg.unroute('**/data/directory.json.gz')
    r2 = pg.evaluate("""async () => {
      const btn = document.querySelector('#mpDirCard button');
      if (!btn) return 'no retry button';
      btn.click();
      await new Promise(r => setTimeout(r, 6000));
      const view = (document.getElementById('view')||{textContent:''}).textContent;
      return { state: window.__MPDIR.state(), n: window.__MPDIR.n(),
               foundAgain: view.indexOf('From the database') >= 0 };
    }""")
    print('RETRY RECOVERY:', r2)
    b.close()
proc.terminate()
