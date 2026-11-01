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

  function copyRich(text, html, onDone) {
    var plain = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var richStr = html ? String(html) : '';
    function domRichFallback() {
      if (!richStr) return false;
      try {
        var box = document.createElement('div');
        box.setAttribute('contenteditable', 'true');
        box.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;background:#ffffff;color:#0f172a;';
        box.innerHTML = richStr;
        document.body.appendChild(box);
        var onCopy = function (e) {
          if (e && e.clipboardData) {
            e.clipboardData.setData('text/html', richStr);
            e.clipboardData.setData('text/plain', plain);
            e.preventDefault();
          }
        };
        document.addEventListener('copy', onCopy);
        var range = document.createRange();
        range.selectNodeContents(box);
        var sel = window.getSelection ? window.getSelection() : null;
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
        var ok = document.execCommand('copy');
        document.removeEventListener('copy', onCopy);
        if (sel) sel.removeAllRanges();
        box.remove();
        return !!ok;
      } catch (e) { return false; }
    }
    var syncOk = domRichFallback();
    if (richStr && navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
      try {
        var item = new ClipboardItem({
          'text/plain': new Blob([plain], { type: 'text/plain' }),
          'text/html': new Blob([richStr], { type: 'text/html' })
        });
        navigator.clipboard.write([item]).then(function () {
          if (onDone) onDone(true, true);
        }).catch(function () {
          if (syncOk) { if (onDone) onDone(true, true); }
          else copy(plain, function (ok) { if (onDone) onDone(ok, false); });
        });
        return;
      } catch (e) {}
    }
    if (syncOk) { if (onDone) onDone(true, true); return; }
    copy(plain, function (ok) { if (onDone) onDone(ok, false); });
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

  // ---- store: unified IndexedDB (localForage) + localStorage fallback/migration ----
  function readLs(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      try { return JSON.parse(raw); } catch (e) { return raw; }
    } catch (e) { return fallback; }
  }
  var store = {
    get: function (key, fallback) {
      var fb = fallback === undefined ? null : fallback;
      if (typeof localforage !== 'undefined' && localforage && localforage.getItem) {
        return localforage.getItem(key).then(function (val) {
          if (val !== null && val !== undefined) return val;
          var lsVal = readLs(key, null);
          if (lsVal !== null && lsVal !== undefined) {
            try { localforage.setItem(key, lsVal); } catch (e) {}
            return lsVal;
          }
          return fb;
        }).catch(function () {
          return readLs(key, fb);
        });
      }
      return Promise.resolve(readLs(key, fb));
    },
    set: function (key, val) {
      try {
        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
      } catch (e) {}
      if (typeof localforage !== 'undefined' && localforage && localforage.setItem) {
        return localforage.setItem(key, val).catch(function () {});
      }
      return Promise.resolve();
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) {}
      if (typeof localforage !== 'undefined' && localforage && localforage.removeItem) {
        return localforage.removeItem(key).catch(function () {});
      }
      return Promise.resolve();
    }
  };

  // ---- nav: single cross-page handoff seam (buf103, guide, labels, walk) ----
  var nav = {
    toCutsheet: function (opts) {
      try {
        if (typeof opts === 'string') {
          sessionStorage.setItem('mp.ocrq', opts);
        } else if (opts && typeof opts === 'object') {
          if (opts.q) sessionStorage.setItem('mp.ocrq', String(opts.q));
          if (opts.hall || opts.row || opts.rack || opts.mode) {
            sessionStorage.setItem('mp.buf103_nav', JSON.stringify({
              hall: opts.hall || null,
              row: opts.row || null,
              rack: opts.rack || null,
              mode: opts.mode || null
            }));
          }
        }
      } catch (e) {}
      if (!opts || !opts.noNavigate) window.location.href = './buf103.html';
    },
    toGuideFind: function (query, opts) {
      try {
        var q = String(query || '').trim();
        if (q) {
          sessionStorage.setItem('mp.scan_query', q);
          sessionStorage.setItem('mp.ocrq', q);
        }
        sessionStorage.setItem('mp_embed', '1');
      } catch (e) {}
      if (!opts || !opts.noNavigate) window.location.href = './guide.html#/find';
    },
    toGuideSection: function (route, opts) {
      try {
        sessionStorage.setItem('mp_return_hash', (opts && opts.returnHash) || location.hash || '#/walk');
        sessionStorage.setItem('mp_embed', '1');
      } catch (e) {}
      if (!opts || !opts.noNavigate) {
        window.location.href = './guide.html' + (route ? '#/' + route : '');
      }
    },
    classifyQuery: function (rawQ) {
      var q = String(rawQ || '').trim();
      if (!q) return { target: 'empty', query: '', row: null };
      var mRow = /^(?:row\s*|r)?(\d{1,2})(?:11|13)?$/i.exec(q);
      if (mRow) {
        return { target: 'walk', query: q, row: parseInt(mRow[1], 10) };
      }
      if (/^(buf102|cb4|cb5|#)/i.test(q) || (/BUF102/i.test(q) && !/BUF103/i.test(q))) {
        return { target: 'guide', query: q.replace(/^#/, ''), row: null };
      }
      return { target: 'buf103', query: q, row: null };
    },
    routeQuery: function (rawQ, opts) {
      var cl = nav.classifyQuery(rawQ);
      if (cl.target === 'empty') {
        if (opts && typeof opts.onEmpty === 'function') opts.onEmpty();
        return cl;
      }
      if (cl.target === 'walk' && opts && typeof opts.onWalkRow === 'function') {
        if (opts.onWalkRow(cl.row) !== false) return cl;
      }
      if (cl.target === 'guide') {
        nav.toGuideFind(cl.query, opts);
        return cl;
      }
      nav.toCutsheet(cl.query, opts);
      return cl;
    },
    toLabels: function (draft, opts) {
      try {
        sessionStorage.setItem('mp.label_draft', JSON.stringify(draft || { site: 'BUF103', lines: [] }));
      } catch (e) {}
      if (!opts || !opts.noNavigate) window.location.href = './labels.html';
    },
    toWalkRow: function (hallCode, rowNum, opts) {
      try {
        var hc = String(hallCode || 'DH1').replace(/^BUF103_/, '');
        sessionStorage.setItem('mp_jump_hall_row', JSON.stringify({
          hall: 'BUF103_' + hc,
          hallCode: hc,
          row: parseInt(rowNum, 10) || 1
        }));
      } catch (e) {}
      if (!opts || !opts.noNavigate) window.location.href = './index.html#/walk';
    },
    consume: function (target) {
      try {
        if (target === 'buf103') {
          var rawNav = sessionStorage.getItem('mp.buf103_nav');
          var rawQ = sessionStorage.getItem('mp.ocrq');
          sessionStorage.removeItem('mp.buf103_nav');
          sessionStorage.removeItem('mp.ocrq');
          var navObj = rawNav ? JSON.parse(rawNav) : null;
          if (!navObj && !rawQ) return null;
          return { nav: navObj, q: rawQ || '' };
        }
        if (target === 'guide') {
          var gq = sessionStorage.getItem('mp.scan_query') || sessionStorage.getItem('mp.ocrq') || '';
          sessionStorage.removeItem('mp.scan_query');
          sessionStorage.removeItem('mp.ocrq');
          return String(gq).trim();
        }
        if (target === 'labels') {
          var ld = sessionStorage.getItem('mp.label_draft');
          sessionStorage.removeItem('mp.label_draft');
          return ld ? JSON.parse(ld) : null;
        }
        if (target === 'walk') {
          var wr = sessionStorage.getItem('mp_jump_hall_row');
          sessionStorage.removeItem('mp_jump_hall_row');
          return wr ? JSON.parse(wr) : null;
        }
      } catch (e) {}
      return null;
    }
  };

  // ---- mislabels: single Wrong Label ('spfg.mislabels') seam across Guide & Shift Report ----
  var MISLABELS_KEY = 'spfg.mislabels';
  var mislabels = {
    listAll: function () {
      var raw = readLs(MISLABELS_KEY, []);
      return Array.isArray(raw) ? raw : [];
    },
    listOpen: function (overrideList) {
      var src = Array.isArray(overrideList) ? overrideList : mislabels.listAll();
      return src.filter(function (r) { return r && !r.done; });
    },
    forBarcode: function (bc) {
      if (!bc) return null;
      var target = String(bc).toUpperCase();
      var open = mislabels.listOpen();
      for (var i = 0; i < open.length; i++) {
        var r = open[i];
        if (r && (r.id === bc || String(r.id || '').toUpperCase() === target)) return r;
      }
      return null;
    },
    describeMismatch: function (r) {
      if (!r) return '';
      var bits = [];
      if (r.sa) bits.push('A end reads ' + r.sa + ' (database: ' + r.da + ')');
      if (r.sz) bits.push('Z end reads ' + r.sz + ' (database: ' + r.dz + ')');
      return bits.join('; ') || 'printed label does not match the database';
    },
    formatReportLines: function (overrideList) {
      var list = mislabels.listOpen(overrideList);
      if (!list.length) return '';
      var out = ['WRONG LABELS FOUND'];
      list.forEach(function (r) {
        out.push('\u2022 ' + (r.id || 'Cable') + (r.title ? ' \u2013 ' + r.title : '') + ': ' +
          mislabels.describeMismatch(r) + (r.note ? ' \u2013 ' + r.note : ''));
      });
      return out.join('\n');
    }
  };

  return {
    load: load, retry: retry, esc: esc, copy: copy, copyRich: copyRich, showError: showError,
    fitFixedTop: fitFixedTop, watchFixedTop: watchFixedTop,
    store: store, nav: nav, mislabels: mislabels,
    state: function (url) { return states[url] ? states[url].state : 'unknown'; }
  };
})();
