<script id="mp-dir">
/* MP Kit: barcode-directory augmentation for the Cable Field Guide.
   Loads the same data/directory.json.gz the kit ships (29,335 barcodes +
   193K presets), and appends a "Barcode directory" results card to any
   Find page render - so typed searches AND scans hit the full label
   directory, not just the sitepack model. Self-contained: own overlay,
   own clipboard path; styled with the guide's theme variables. */
(function () {
  var DIR = null, DIR_STATE = 'idle';
  function dirLoad() {
    if (DIR_STATE !== 'idle') return;
    DIR_STATE = 'loading';
    if (typeof DecompressionStream === 'undefined') { DIR_STATE = 'error'; return; }
    fetch('./data/directory.json.gz').then(function (r) {
      if (!r.ok) throw new Error('http');
      return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
    }).then(function (d) {
      var bc = d.barcodes || [];
      var byNum = {}, hay = [];
      for (var i = 0; i < bc.length; i++) {
        var m = /^([A-Z0-9]+)#0*(\d+)$/.exec(bc[i][0]);
        if (m) byNum[+m[2]] = bc[i];
        hay.push([ (bc[i][0] + '  ' + bc[i][1] + '  ' + bc[i][2] + '  ' + (bc[i][3] || '')).toUpperCase(), bc[i] ]);
      }
      DIR = { byNum: byNum, hay: hay, n: bc.length };
      DIR_STATE = 'ready';
    }).catch(function () { DIR_STATE = 'error'; });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function parts(lbl) {
    var m = /^([A-Z0-9]{3,6})-([A-Z]{0,3}\d{1,2})-(R\d{4})-(.+)$/i.exec(lbl || '') ||
            /^([A-Z0-9]{3,6}) \/ ([A-Z]{0,3}\d{1,2}) \/ (R\d{4}) \/ (.+)$/i.exec(lbl || '');
    return m ? m[2] + ' / ' + m[3] + ' \u00b7 ' + m[4] : lbl;
  }
  function search(q) {
    q = String(q || '').trim().toUpperCase();
    if (!q) return [];
    var digs = /^#?(\d{1,7})$/.exec(q), out = [];
    if (digs) {
      var n = +digs[1];
      if (DIR.byNum[n]) out.push(DIR.byNum[n]);
      for (var k in DIR.byNum) {
        if (+k === n) continue;
        if (String(k).slice(-digs[1].length) === digs[1]) { out.push(DIR.byNum[k]); if (out.length >= 20) break; }
      }
    } else {
      if (q.length < 2) return [];
      for (var i = 0; i < DIR.hay.length; i++) {
        if (DIR.hay[i][0].indexOf(q) >= 0) { out.push(DIR.hay[i][1]); if (out.length >= 20) break; }
      }
    }
    return out;
  }
  function detail(rec) {
    var old = document.getElementById('mpDirOv'); if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'mpDirOv';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(3,6,12,.88);display:flex;align-items:center;justify-content:center;padding:18px;';
    ov.innerHTML = '<div style="background:var(--surface,#18191b);border:1px solid var(--line,#363a3f);border-radius:16px;padding:20px;max-width:420px;width:100%;max-height:80vh;overflow:auto;">' +
      '<div style="font:800 20px/1 ui-monospace,monospace;color:var(--text,#edeef0);margin-bottom:6px;">' + esc(rec[0]) + '</div>' +
      '<div style="font:700 10px/1.4 -apple-system,sans-serif;letter-spacing:.5px;text-transform:uppercase;color:var(--text-2,#b0b4ba);margin-bottom:12px;">' + esc(rec[3] || '') + '</div>' +
      '<div style="border:1px solid var(--line,#363a3f);border-radius:10px;padding:10px;margin-bottom:8px;"><div style="font:700 10px -apple-system,sans-serif;color:var(--text-3,#777b84);margin-bottom:4px;">A END</div><div style="font:12px/1.5 ui-monospace,monospace;color:var(--text,#edeef0);word-break:break-all;">' + esc(parts(rec[1])) + '</div></div>' +
      '<div style="border:1px solid var(--line,#363a3f);border-radius:10px;padding:10px;margin-bottom:12px;"><div style="font:700 10px -apple-system,sans-serif;color:var(--text-3,#777b84);margin-bottom:4px;">Z END</div><div style="font:12px/1.5 ui-monospace,monospace;color:var(--text,#edeef0);word-break:break-all;">' + esc(parts(rec[2])) + '</div></div>' +
      '<div style="display:flex;gap:8px;"><button data-c="' + esc(rec[0]) + '" style="flex:1;min-height:44px;border:0;border-radius:10px;background:#fff;color:#111;font:700 14px -apple-system,sans-serif;">Copy barcode</button>' +
      '<button data-c="' + esc(rec[1]) + '" style="flex:1;min-height:44px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid var(--line,#363a3f);color:var(--text,#edeef0);font:700 14px -apple-system,sans-serif;">Copy A</button>' +
      '<button data-c="' + esc(rec[2]) + '" style="flex:1;min-height:44px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid var(--line,#363a3f);color:var(--text,#edeef0);font:700 14px -apple-system,sans-serif;">Copy Z</button></div>' +
      '<button id="mpDirX" style="width:100%;margin-top:8px;min-height:44px;border-radius:10px;background:transparent;border:1px dashed var(--line,#363a3f);color:var(--text-2,#b0b4ba);font:700 14px -apple-system,sans-serif;">Close</button></div>';
    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.id === 'mpDirX') ov.remove();
      var b = e.target.closest('button[data-c]');
      if (b) {
        var t = b.getAttribute('data-c');
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).catch(function () {});
        b.textContent = 'Copied \u2713';
        setTimeout(function () { ov.remove(); }, 650);
      }
    });
    document.body.appendChild(ov);
  }
  function augment() {
    var view = document.getElementById('view');
    if (!view || document.getElementById('mpDirCard')) return;
    var inp = view.querySelector('input[data-in]') || document.getElementById('rq') || document.getElementById('q');
    var q = '';
    if (inp && inp.offsetParent && (!inp.type || inp.type === 'text' || inp.type === 'search')) q = inp.value;
    if (!q || !q.trim()) {
      /* newer guide builds show the query in the "Results: <query>" heading instead of keeping the input */
      var rs = view.querySelector('.h2 > .id');
      if (rs && /^(Results|Resultados)/.test(rs.parentNode.textContent)) q = rs.textContent;
    }
    if (!q || !q.trim()) return;
    if (DIR_STATE === 'idle') dirLoad();
    var mount = function () {
      if (document.getElementById('mpDirCard')) return;
      var res = DIR ? search(q) : [];
      var card = document.createElement('div');
      card.id = 'mpDirCard';
      card.className = 'card';
      card.style.marginTop = '10px';
      var rows = res.slice(0, 12).map(function (r, i) {
        return '<div class="item" data-i="' + i + '" style="display:block;padding:9px 0;border-top:1px solid var(--line,#363a3f);cursor:pointer;">' +
          '<div style="font:700 13px ui-monospace,monospace;color:var(--text,#edeef0);">' + esc(r[0]) + ' <span style="font:700 9px -apple-system,sans-serif;color:var(--text-3);">' + esc(r[3] || '') + '</span></div>' +
          '<div style="font:11px/1.5 ui-monospace,monospace;color:var(--text-2,#b0b4ba);word-break:break-all;">A ' + esc(parts(r[1])) + '<br>Z ' + esc(parts(r[2])) + '</div></div>';
      }).join('');
      card.innerHTML = '<div class="eyebrow">\u{1F4CB} Barcode directory \u00b7 ' + (DIR ? DIR.n.toLocaleString() + ' labels' : 'loading\u2026') + '</div>' +
        (res.length ? rows : '<div class="muted" style="font-size:12px;">No barcode-directory matches.</div>');
      card.addEventListener('click', function (e) {
        var it = e.target.closest('[data-i]');
        if (it && res[+it.getAttribute('data-i')]) detail(res[+it.getAttribute('data-i')]);
      });
      var qn = String(q).trim().toUpperCase(), top = res[0];
      var exact = !!top && (String(top[0]).toUpperCase() === qn || (/^#?\d{1,7}$/.test(qn) && parseInt(String(top[0]).replace(/\D/g, '').slice(-7), 10) === parseInt(qn.replace(/\D/g, ''), 10)));
      if (exact) {
        /* scanned/typed full barcode: put its A and Z ends from the database FIRST, big enough to read next to a small printed flag */
        var endHtml = function (tag, lbl) {
          var m = /^([A-Z0-9]{3,6})-([A-Z]{0,3}\d{1,2})-(R\d{4})-(.+)$/i.exec(lbl || '') || /^([A-Z0-9]{3,6}) \/ ([A-Z]{0,3}\d{1,2}) \/ (R\d{4}) \/ (.+)$/i.exec(lbl || '');
          var rack = m ? m[3] : '', hall = m ? m[2] : '', dp = m ? m[4] : (lbl || ''), pm = /-([^-]+)$/.exec(dp), port = pm ? pm[1] : '', dev = pm ? dp.slice(0, dp.length - pm[0].length) : dp;
          return '<div style="border:1px solid var(--line,#363a3f);border-radius:12px;padding:12px;margin-top:8px;">' +
            '<div style="font:800 12px -apple-system,sans-serif;letter-spacing:.6px;color:var(--text-3,#777b84);">' + tag + ' END</div>' +
            '<div style="font:800 26px/1.15 ui-monospace,monospace;color:var(--text,#edeef0);margin-top:4px;">' + esc(rack) + (hall ? ' <span style="font-size:15px;color:var(--text-2,#b0b4ba);">' + esc(hall) + '</span>' : '') + '</div>' +
            '<div style="font:700 20px/1.25 ui-monospace,monospace;color:var(--text,#edeef0);word-break:break-all;margin-top:2px;">' + esc(dev) + '</div>' +
            '<div style="font:800 30px/1.1 ui-monospace,monospace;color:var(--fiber-t,#ffca16);margin-top:4px;">' + esc(port) + '</div></div>';
        };
        var big = document.createElement('div');
        big.id = 'mpDirCard'; big.className = 'card hl'; big.style.marginTop = '10px';
        big.innerHTML = '<div class="eyebrow">\u{1F4CB} From the database \u00b7 ' + esc(top[0]) + ' \u00b7 ' + esc(top[3] || '') + '</div>' + endHtml('A', top[1]) + endHtml('Z', top[2]) +
          '<div class="muted" style="font-size:12px;margin-top:8px;">Check these against the flag. If the flag is different, tap Wrong labels.</div>';
        var h2 = view.querySelector('.h2');
        if (h2) h2.insertAdjacentElement('afterend', big); else view.insertBefore(big, view.firstChild);
        if (res.length > 1) { card.id = 'mpDirCard2'; view.appendChild(card); }
        return;
      }
      view.appendChild(card);
    };
    if (DIR_STATE === 'ready') mount();
    else { dirLoad(); var iv = setInterval(function () { if (DIR_STATE === 'ready') { clearInterval(iv); mount(); } if (DIR_STATE === 'error') clearInterval(iv); }, 400); setTimeout(function () { clearInterval(iv); }, 20000); }
  }
  var t = null;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(augment, 250); }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('input', function (e) {
    var i = e.target;
    if (i && (i.id === 'q' || i.id === 'rq' || i.getAttribute && i.getAttribute('data-in') !== null)) {
      clearTimeout(t); t = setTimeout(augment, 300);
    }
  }, true);
  window.__MPDIR = { augment: augment, state: function () { return DIR_STATE; }, n: function () { return DIR ? DIR.n : 0; }, q: function () { var i = document.getElementById('q'); return i ? i.value : null; } };
})();
</script>
