/* ---------------- data haul directory ----------------
   Data lives in ./data/directory.json.gz (precached by the service worker),
   decoded with DecompressionStream (iOS 16.4+). Barcodes get an exact numeric
   map + suffix scan; everything else is a linear substring scan with the
   barcode hits ranked first. Indexing runs in time-sliced chunks so the UI
   never blocks. Scan button uses the same zxing-wasm engine as the guide
   (shared from vendor/zxing/), preferring the native BarcodeDetector. */
var DIR_DATA = null, DIR_IDX = null, DIR_RES = [], DIR_STATE = 'idle', DIR_OV = null;
function dirFamCls(f) {
  return { 'SASL<>MGMT': 'df-saslmgmt', 'MLF<>MSPN': 'df-mlfmspn', 'TRLF<>TRSPN': 'df-trlftrspn', 'SASL<>DCSPN': 'df-sasldcspn', 'MGMT<>FSEDG': 'df-mgmtfsedg', 'SPOCS<>MGMT (INTRA)': 'df-spocs', 'SPOCS<>MGMT (UPLINK)': 'df-spocs', 'SASL<>OXIDE': 'df-sasldcspn' }[f] || 'df-mgmtfsedg';
}
function dirLabelParts(lbl) {
  var m = /^([A-Z0-9]{3,6})-([A-Z]{0,3}\d{1,2})-(R\d{4})-(.+)$/i.exec(lbl || '') ||
          /^([A-Z0-9]{3,6}) \/ (DH\d{1,2}) \/ (R\d{4}) \/ (.+)$/i.exec(lbl || '');
  return m ? { site: m[1].toUpperCase(), hall: m[2], rack: m[3], dev: m[4] } : null;
}
function dirSetStatus(msg) { var c = document.getElementById('dirCount'); if (c) c.textContent = msg; }
function dirLoad() {
  if (DIR_STATE !== 'idle') return;
  DIR_STATE = 'loading';
  dirSetStatus('Loading directory\u2026');
  var p;
  if (typeof DecompressionStream !== 'undefined') {
    p = fetch('./data/directory.json.gz').then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();
    });
  } else {
    p = Promise.reject(new Error('no-gzip'));
  }
  p.catch(function () {
    return fetch('./data/directory.json').then(function (r) {
      if (!r.ok) throw new Error('offline');
      return r.json();
    });
  }).then(function (d) {
    DIR_DATA = d; DIR_STATE = 'indexing';
    dirBuildAsync();
  }).catch(function (e) {
    DIR_STATE = 'error';
    dirSetStatus('Could not load the directory. Open the app once with signal and try again.');
  });
}
function dirBuildAsync() {
  var entries = [], fams = {}, i = 0;
  var nb = DIR_DATA.barcodes.length, total = nb + DIR_DATA.presets.length;
  var bcMap = {};
  function chunk() {
    var t0 = Date.now();
    while (i < nb && Date.now() - t0 < 24) {
      var r = DIR_DATA.barcodes[i++];
      var f = r[3] || '';
      entries.push({ k: 'bc', s: r[0], a: r[1], z: r[2], f: f,
        hay: (r[0] + '  ' + r[1] + '  ' + r[2] + '  ' + f).toUpperCase().replace(/\s*\/\s*/g, '/') });
      fams[f || '\u2014'] = (fams[f || '\u2014'] || 0) + 1;
      var m = /^([A-Z0-9]+)#0*(\d+)$/.exec(r[0]);
      if (m) bcMap[+m[2]] = entries[entries.length - 1];
    }
    while (i >= nb && i < total && Date.now() - t0 < 28) {
      var p = DIR_DATA.presets[i++ - nb];
      entries.push({ k: 'pre', s: p[4] || 'PRESET', a: p[1], z: p[2], f: p[0], ref: p[3],
        hay: (p[0] + '  ' + p[1] + '  ' + p[2] + '  ' + (p[3] || '')).toUpperCase().replace(/\s*\/\s*/g, '/') });
      fams[p[0]] = (fams[p[0]] || 0) + 1;
    }
    if (i < total) { dirSetStatus('Indexing\u2026 ' + Math.round(100 * i / total) + '%'); setTimeout(chunk, 0); return; }
    DIR_IDX = { entries: entries, fam: null, fams: fams, bcMap: bcMap };
    DIR_STATE = 'ready';
    dirRenderFams(); dirRender();
    var sub = document.getElementById('homeDirSub');
    if (sub) sub.textContent = nb.toLocaleString() + ' barcodes \u00b7 ' + DIR_DATA.presets.length.toLocaleString() + ' presets';
  }
  chunk();
}
function dirRenderFams() {
  var fw = document.getElementById('dirFams');
  if (!fw || !DIR_IDX) return;
  var keys = Object.keys(DIR_IDX.fams).sort(function (a, b) { return DIR_IDX.fams[b] - DIR_IDX.fams[a]; }).slice(0, 10);
  fw.innerHTML = keys.map(function (f) {
    return '<button class="dir-chip' + (DIR_IDX.fam === f ? ' active' : '') + '" data-fam="' + escapeHtml(f) + '" onclick="dirSetFam(this.getAttribute(\'data-fam\'))">' + escapeHtml(f) + ' \u00b7 ' + DIR_IDX.fams[f].toLocaleString() + '</button>';
  }).join('');
}
function dirInit() {
  dirLoad();
  if (DIR_STATE === 'ready') dirRender();
}
function dirSetFam(f) {
  if (!DIR_IDX) return;
  DIR_IDX.fam = DIR_IDX.fam === f ? null : f;
  dirRenderFams(); dirRender();
}
var DIR_TIMER = null;
function dirSearchChanged() {
  clearTimeout(DIR_TIMER);
  DIR_TIMER = setTimeout(dirRender, 130);
}
function dirRender() {
  var out = document.getElementById('dirResults'), cnt = document.getElementById('dirCount');
  if (!out) return;
  if (DIR_STATE === 'loading') { dirSetStatus('Loading directory\u2026'); return; }
  if (DIR_STATE === 'indexing') return;
  if (DIR_STATE === 'error') return;
  if (!DIR_IDX) { dirLoad(); return; }
  var q = (document.getElementById('dirSearch') || { value: '' }).value.trim().toUpperCase().replace(/\s+/g, '');
  var es = DIR_IDX.entries;
  if (DIR_IDX.fam) es = es.filter(function (e) { return e.f === DIR_IDX.fam; });
  var res;
  if (!q) {
    res = es.slice(0, 40);
  } else {
    var digs = /^#?(\d{1,7})$/.exec(q);
    if (digs) {
      res = [];
      var n = +digs[1], ds = digs[1];
      var exact = DIR_IDX.bcMap[n];
      if (exact && (!DIR_IDX.fam || exact.f === DIR_IDX.fam)) res.push(exact);
      for (var k in DIR_IDX.bcMap) {
        if (+k === n) continue;
        if (String(k).slice(-ds.length) === ds) {
          var e2 = DIR_IDX.bcMap[k];
          if (!DIR_IDX.fam || e2.f === DIR_IDX.fam) { res.push(e2); if (res.length >= 60) break; }
        }
      }
    } else {
      var hits = [];
      for (var i2 = 0; i2 < es.length; i2++) {
        if (es[i2].hay.indexOf(q) >= 0) { hits.push(es[i2]); if (hits.length >= 400) break; }
      }
      hits.sort(function (x, y) { return (x.k === 'bc' ? 0 : 1) - (y.k === 'bc' ? 0 : 1); });
      res = hits.slice(0, 60);
    }
  }
  DIR_RES = res;
  if (cnt) cnt.textContent = q
    ? res.length + ' match' + (res.length === 1 ? '' : 'es') + ' \u00b7 ' + DIR_DATA.barcodes.length.toLocaleString() + ' barcodes + ' + DIR_DATA.presets.length.toLocaleString() + ' presets loaded'
    : DIR_DATA.barcodes.length.toLocaleString() + ' barcodes \u00b7 ' + DIR_DATA.presets.length.toLocaleString() + ' presets \u00b7 tap a card for both ends';
  out.innerHTML = res.length ? res.map(dirItemHtml).join('')
    : '<div class="card"><div class="muted">No matches. Try a barcode number (042 or #0000042), a rack (R0131), a device (mgmt-spn-1), or a port (Eth38/1).</div></div>';
}
function dirItemHtml(e, i) {
  var p = dirLabelParts(e.a), z = dirLabelParts(e.z);
  return '<div class="card dir-item" onclick="dirDetail(' + i + ')">' +
    '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px;">' +
    '<span class="dir-code">' + escapeHtml(e.s) + '</span>' +
    '<span class="dir-fam ' + dirFamCls(e.f) + '">' + escapeHtml(e.f || '\u2014') + '</span></div>' +
    '<div class="dir-end">A <b>' + (p ? p.hall + ' \u00b7 ' + p.rack + ' \u00b7 ' : '') + escapeHtml(p ? p.dev : e.a) + '</b></div>' +
    '<div class="dir-end">Z <b>' + (z ? z.hall + ' \u00b7 ' + z.rack + ' \u00b7 ' : '') + escapeHtml(z ? z.dev : e.z) + '</b></div>' +
    (e.k === 'pre' ? '<div class="dir-end" style="margin-top:4px; opacity:.7;">preset \u00b7 ' + escapeHtml(e.ref || 'design assembly') + '</div>' : '') +
    '</div>';
}
function dirDetail(i) {
  var e = DIR_RES[i]; if (!e) return;
  dirClose();
  var p = dirLabelParts(e.a), z = dirLabelParts(e.z);
  var end = function (tag, lbl, parts) {
    return '<div style="margin:10px 0; padding:10px; background:rgba(255,255,255,0.035); border:1px solid var(--border); border-radius:10px;">' +
      '<div class="muted" style="margin-bottom:4px;">' + tag + ' END</div>' +
      (parts ? '<div class="dir-end" style="font-size:12.5px;"><b>' + parts.hall + ' / ' + parts.rack + '</b><br>' + escapeHtml(parts.dev) + '</div>'
             : '<div class="dir-end" style="font-size:12.5px;"><b>' + escapeHtml(lbl) + '</b></div>') + '</div>';
  };
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.addEventListener('click', function (ev) { if (ev.target === ov) dirClose(); });
  ov.innerHTML = '<div class="overlay-card">' +
    '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
    '<h2 style="margin:0; font-size:17px;">Cable</h2>' +
    '<span class="dir-fam ' + dirFamCls(e.f) + '">' + escapeHtml(e.f || '\u2014') + '</span></div>' +
    '<div class="dir-big" style="margin:10px 0 2px 0;">' + escapeHtml(e.s) + '</div>' +
    (e.k === 'pre' && e.ref ? '<div class="muted">' + escapeHtml(e.ref) + '</div>' : '') +
    end('A', e.a, p) + end('Z', e.z, z) +
    '<div class="batch-row">' +
    '<button class="btn" onclick="dirCopy(\'' + e.s.replace(/'/g, "\\'") + '\')">Copy barcode</button>' +
    '<button class="btn btn-secondary" onclick="dirCopy(\'' + e.a.replace(/'/g, "\\'") + '\')">Copy A</button>' +
    '<button class="btn btn-secondary" onclick="dirCopy(\'' + e.z.replace(/'/g, "\\'") + '\')">Copy Z</button>' +
    '</div>' +
    '<button class="btn btn-ghost" style="width:100%; margin-top:8px;" onclick="dirClose()">Close</button></div>';
  document.body.appendChild(ov);
  DIR_OV = ov;
}
function dirClose() { if (DIR_OV) { DIR_OV.remove(); DIR_OV = null; } }
function dirCopy(txt) {
  function fallback() {
    var ta = document.getElementById('copyFallback');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '0'; ta.style.top = '0'; ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    ta.style.position = ''; ta.style.left = '-9999px';
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function () { showToast('Copied'); }, fallback);
  } else fallback();
  showToast('Copied ' + txt.slice(0, 24));
}

/* ---- scanner (shared zxing engine from vendor/zxing) ---- */
var ZX_READY = false, ZX_FAIL = false;
function zxLoadScript() {
  return new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = './vendor/zxing/reader.js';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
function zxWasm() {
  var p = window.ZXingWASM ? Promise.resolve() : zxLoadScript();
  return p.then(function () { return fetch('./vendor/zxing/zxing_reader.wasm'); })
    .then(function (r) { if (!r.ok) throw new Error('wasm http ' + r.status); return r.arrayBuffer(); })
    .then(function (buf) { return window.ZXingWASM.prepareZXingModule({ overrides: { wasmBinary: buf }, fireImmediately: true }); })
    .then(function () { ZX_READY = true; return true; })
    .catch(function () { ZX_FAIL = true; return false; });
}
function zxPrepare() {
  if (ZX_READY) return Promise.resolve(true);
  if (ZX_FAIL) return Promise.resolve(false);
  if ('BarcodeDetector' in window) {
    return BarcodeDetector.getSupportedFormats().then(function (f) {
      if (f.indexOf('code_128') >= 0) {
        window.__BD = new BarcodeDetector({ formats: ['code_128', 'qr_code', 'data_matrix', 'code_39'] });
        ZX_READY = true; return true;
      }
      return zxWasm();
    }).catch(zxWasm);
  }
  return zxWasm();
}
function zxDecode(canvas) {
  if (window.__BD) return window.__BD.detect(canvas).then(function (rs) { return rs.map(function (r) { return r.rawValue; }); });
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return window.ZXingWASM.readBarcodes(img, { formats: ['Code128', 'QRCode', 'DataMatrix', 'Code39'], tryHarder: true, tryInvert: true, maxNumberOfSymbols: 4 })
    .then(function (rs) { return (rs || []).filter(function (r) { return r && r.text; }).map(function (r) { return r.text.trim(); }); });
}
var SCAN = null, SCAN_SEEN = {};
function scanBeep(ok) {
  try {
    if (!window.__AC) window.__AC = new (window.AudioContext || window.webkitAudioContext)();
    var ac = window.__AC;
    if (ac.state === 'suspended') ac.resume();
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square'; o.frequency.value = ok ? 1046 : 320;
    var dur = ok ? 0.12 : 0.18;
    g.gain.setValueAtTime(0.001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + dur + 0.01);
  } catch (e) {}
}
function scanAccept(t) {
  SCAN_SEEN[t] = 1;
  try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) {}
  scanBeep(true);
  dirScanClose();
  var el = document.getElementById('dirSearch');
  if (el) el.value = t;
  if (currentTab !== 'directory') switchTab('directory');
  dirRender();
  showToast('Scanned ' + t.slice(0, 26));
}
function dirScan() {
  zxPrepare().then(function (ok) {
    if (!ok) { showToast('Scanner unavailable on this device'); return; }
    dirScanClose();
    var ov = document.createElement('div');
    ov.className = 'overlay'; ov.style.padding = '0';
    ov.innerHTML = '<div style="position:fixed; inset:0; background:#000;">' +
      '<video playsinline autoplay style="width:100%; height:100%; object-fit:cover;"></video>' +
      '<div style="position:absolute; top:calc(env(safe-area-inset-top,0px) + 14px); left:0; right:0; text-align:center; color:#fff; font:800 13px -apple-system,sans-serif; text-shadow:0 1px 4px #000;">Point at a cable flag barcode</div>' +
      '<div style="position:absolute; top:39%; left:8%; right:8%; height:22%; border:2px solid rgba(255,255,255,0.85); border-radius:12px; box-shadow:0 0 0 9999px rgba(0,0,0,0.35);"></div>' +
      '<button class="btn" style="position:absolute; bottom:calc(28px + env(safe-area-inset-bottom,0px)); left:50%; transform:translateX(-50%); z-index:2;" onclick="dirScanClose()">Close</button></div>';
    document.body.appendChild(ov);
    var video = ov.querySelector('video');
    SCAN = { ov: ov, video: video, running: true, busy: false, last: '', timer: 0 };
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (stream) {
      SCAN.stream = stream; video.srcObject = stream;
      var canvas = document.createElement('canvas');
      function frame() {
        if (!SCAN || !SCAN.running) return;
        if (SCAN.busy || video.readyState < 2 || !video.videoWidth) { schedule(); return; }
        SCAN.busy = true;
        // ROI strip: decode only the reticle band - ~10x fewer pixels, which
        // is what affords tryHarder every frame.
        var vw = video.videoWidth, vh = video.videoHeight;
        var w = Math.round(vw * 0.84), h = Math.round(vh * 0.24);
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d', { willReadFrequently: true }).drawImage(
          video, Math.round((vw - w) / 2), Math.round((vh - h) / 2), w, h, 0, 0, w, h);
        zxDecode(canvas).then(function (texts) {
          SCAN.busy = false;
          if (texts && texts.length && SCAN && SCAN.running) {
            var t = String(texts[0]).trim().toUpperCase();
            // gate: plausible label characters only; voting: same read twice
            // in a row - a misread never survives both plus Code128 checksums.
            if (/^[A-Z0-9#\-\/]{4,40}$/.test(t)) {
              if (t === SCAN.last) {
                if (!SCAN_SEEN[t]) { scanAccept(t); return; }
              } else SCAN.last = t;
            } else SCAN.last = '';
          }
          schedule();
        }).catch(function () { if (SCAN) SCAN.busy = false; schedule(); });
      }
      function schedule() {
        if (!SCAN || !SCAN.running) return;
        SCAN.timer = setTimeout(frame, 300);
      }
      frame();
    }).catch(function () { showToast('Camera unavailable'); dirScanClose(); });
  });
}
function dirScanClose() {
  if (!SCAN) return;
  SCAN.running = false; clearTimeout(SCAN.timer);
  if (SCAN.stream) SCAN.stream.getTracks().forEach(function (t) { t.stop(); });
  if (SCAN.ov) SCAN.ov.remove();
  SCAN = null;
}


