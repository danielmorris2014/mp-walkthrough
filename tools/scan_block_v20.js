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
