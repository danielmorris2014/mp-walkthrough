/* kit-data.js — the kit's shared foundation for standalone pages.
   KitData.load: the bundled-dataset state machine (one owner — was 4 copies).
     idle → loading → ready | error, with the v48 lessons encoded once:
     loud error card with the real reason, Retry button, auto-recovery when
     signal returns, iOS-16.4 gate.
   KitData.copy: honest clipboard with the v35.4 iOS line-ending fix.
   KitData.fitFixedTop: fixed chrome publishes its measured height — no
     hand-written padding constants (the chrome invariant, top edge). */
var KitData = (function () {
  var states = {};   // url -> { state, err, data, waiters: [] }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---- load(url, label): Promise<data>; renders an error card into
  // `mount` (an element id) on failure, with Retry + online auto-recovery ----
  function load(url, label, mount) {
    var st = states[url];
    if (st) {
      if (st.state === 'ready') return Promise.resolve(st.data);
      if (st.state === 'error') return Promise.reject(new Error(st.err));
      return new Promise(function (res, rej) { st.waiters.push([res, rej]); });
    }
    st = states[url] = { state: 'loading', err: '', data: null, waiters: [] };
    function fail(msg) {
      st.state = 'error'; st.err = msg;
      if (mount) renderErr(url, label, mount);
      st.waiters.forEach(function (w) { w[1](new Error(msg)); });
      st.waiters = [];
    }
    if (typeof DecompressionStream === 'undefined') {
      fail('This phone\u2019s iOS is too old for the offline ' + label + ' (needs iOS 16.4+).');
      return Promise.reject(new Error(st.err));
    }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http');
      return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
    }).then(function (d) {
      st.state = 'ready'; st.data = d;
      if (mount) { var m = document.getElementById(mount); if (m) m.innerHTML = ''; }
      st.waiters.forEach(function (w) { w[0](d); });
      st.waiters = [];
    }).catch(function () {
      fail('Could not load the offline ' + label + (navigator.onLine
        ? ' (server problem \u2014 try Retry).'
        : ' (no signal \u2014 open the app once with signal, then it works offline).'));
    });
    return new Promise(function (res, rej) { st.waiters.push([res, rej]); });
  }

  function retry(url, label, mount) {
    var st = states[url];
    if (st) { st.state = 'idle'; }
    delete states[url];
    var m = mount && document.getElementById(mount);
    if (m) m.innerHTML = 'Loading\u2026';
    return load(url, label, mount);
  }

  // online -> recover anything that failed
  window.addEventListener('online', function () {
    Object.keys(states).forEach(function (u) {
      if (states[u].state === 'error') retry(u, '', null);
    });
  });

  function renderErr(url, label, mount) {
    var m = document.getElementById(mount);
    if (!m) return;
    var st = states[url];
    m.innerHTML = '';
    var c = document.createElement('div');
    c.className = 'card kit-err';
    c.innerHTML = '<div class="ct">' + esc(label.charAt(0).toUpperCase() + label.slice(1)) + ' unavailable</div>' +
      '<div style="font-size:12.5px;color:var(--muted,#b0b4ba)">' + esc(st.err) + '</div>';
    var b = document.createElement('button');
    b.className = 'kit-retry';
    b.textContent = 'Retry loading ' + label;
    b.onclick = function () { retry(url, label, mount); };
    c.appendChild(b);
    m.appendChild(c);
  }

  // ---- copy(text, onDone): normalize for iOS, best-effort fallback,
  //      honest feedback (onDone(true|false)) ----
  function copy(text, onDone) {
    text = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        var ok = document.execCommand('copy');
        ta.remove();
        onDone(!!ok);
      } catch (e) { onDone(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { onDone(true); }, fallback);
    } else fallback();
  }

  // ---- fitFixedTop(selector): the fixed top bar publishes its measured
  //      height; body padding derives from it (no constants) ----
  function fitFixedTop(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    document.documentElement.style.setProperty('--top-chrome', el.offsetHeight + 'px');
    document.body.style.paddingTop = 'calc(var(--top-chrome) + 10px)';
  }
  function watchFixedTop(selector) {
    fitFixedTop(selector);
    window.addEventListener('resize', function () { fitFixedTop(selector); });
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { fitFixedTop(selector); });
    }
  }

  function showError(url, label, mount) {
    var st = states[url];
    if (!st || st.state !== 'error') return;
    renderErr(url, label, mount);
  }

  return {
    load: load, retry: retry, esc: esc, copy: copy, showError: showError,
    fitFixedTop: fitFixedTop, watchFixedTop: watchFixedTop,
    state: function (url) { return states[url] ? states[url].state : 'unknown'; }
  };
})();
