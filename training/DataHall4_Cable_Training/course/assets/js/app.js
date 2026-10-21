/* Data Hall 4 cable course — application engine (no external dependencies; works from file://). */
(function () {
  'use strict';
  var C = window.COURSE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + t % 60).slice(-2); }
  var LESSONS = C.lessons.slice().sort(function (a, b) { return a.num - b.num; });
  function lnum(l) { return l.label || String(l.num); }
  var byId = {}; LESSONS.forEach(function (l) { byId[l.id] = l; });
  var GL = {}; C.glossary.forEach(function (g) { GL[g.k] = g; });
  var PARTS = [
    { t: 'Part 0 · Before you start', ids: ['l00'] },
    { t: 'Part 1 · Foundations', ids: ['l01', 'l02', 'l03', 'l04', 'l05', 'l05b'] },
    { t: 'Part 2 · The data network', ids: ['l06', 'l07', 'l08', 'l09'] },
    { t: 'Part 3 · The OCS fabric', ids: ['l10', 'l11'] },
    { t: 'Part 4 · Copper, management & BMS', ids: ['l12', 'l13', 'l14'] },
    { t: 'Part 5 · Putting it together', ids: ['l15'] }
  ];

  /* ================= progress store ================= */
  var KEY = 'dh4-cable-course-v1', mem = {}, storageOK = true;
  try { var test = '__t'; localStorage.setItem(test, '1'); localStorage.removeItem(test); } catch (e) { storageOK = false; }
  function load() { if (!storageOK) return mem; try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  var S = load();
  ['sections', 'acts', 'checks', 'videos'].forEach(function (k) { S[k] = S[k] || {}; });
  function save() { if (!storageOK) { mem = S; return; } try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { storageOK = false; } }
  function lessonDone(id) { var c = S.checks[id]; return !!(c && c.passed); }
  function progressPct() { var n = LESSONS.filter(function (l) { return lessonDone(l.id); }).length + (S.finalPassed ? 1 : 0); return Math.round(n / (LESSONS.length + 1) * 100); }
  function markAct(id, ok) { var a = S.acts[id] || {}; a.done = true; if (ok) a.ok = true; S.acts[id] = a; save(); }

  /* ================= text helpers ================= */
  function termify(html) {
    return String(html || '').replace(/\[\[([A-Za-z0-9]+)(?:\|([^\]]+))?\]\]/g, function (m, k, txt) {
      var g = GL[k]; var label = txt || (g ? g.t : k);
      return g ? '<button type="button" class="term" data-t="' + k + '" aria-label="' + esc(label) + ': show definition">' + label + '</button>' : label;
    });
  }
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button.term');
    if (b) { e.preventDefault(); showPop(b); return; }
    if (pop && !e.target.closest('.pop')) closePop();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(); closeModal(); document.body.classList.remove('nav-open'); } });
  function showPop(b) {
    closePop();
    var g = GL[b.getAttribute('data-t')]; if (!g) return;
    pop = el('div', { class: 'pop', role: 'dialog', 'aria-label': g.t }, '<b class="w">' + esc(g.t) + '</b>' + (g.full ? '<div class="f">' + esc(g.full) + '</div>' : '') + '<div>' + esc(g.d) + '</div><div class="s">Source: ' + esc(g.src) + ' · <a href="#/glossary">Glossary</a></div>');
    document.body.appendChild(pop);
    var r = b.getBoundingClientRect(), pw = Math.min(380, window.innerWidth - 20);
    pop.style.left = Math.max(10, Math.min(window.scrollX + r.left, window.scrollX + window.innerWidth - pw - 10)) + 'px';
    pop.style.top = (window.scrollY + r.bottom + 8) + 'px';
  }
  function toast(msg) { var t = el('div', { class: 'toast', role: 'status' }, esc(msg)); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }

  /* ================= diagrams ================= */
  function figure(f, opts) {
    opts = opts || {};
    var fig = el('figure', { class: 'fig' });
    fig.innerHTML = '<div class="svgbox">' + DG[f.dg](f.o || {}) + '</div>' + (f.cap ? '<figcaption>' + termify(f.cap) + '</figcaption>' : '') +
      '<div class="fig-tools"><button type="button" class="btn-ghost" aria-label="Enlarge diagram">⤢ Enlarge</button></div>';
    fig.querySelector('.fig-tools button').addEventListener('click', function () { openModal(f, fig.querySelector('svg.dg')); });
    if (f.hl) requestAnimationFrame(function () { DG.ring(fig.querySelector('svg.dg'), f.hl); });
    return fig;
  }
  var modal = null;
  function openModal(f, srcSvg) {
    closeModal();
    modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Enlarged diagram' });
    modal.innerHTML = '<div class="mbar"><b>' + esc(srcSvg.getAttribute('aria-label') || 'Diagram') + '</b><span class="zoomctl"><button type="button" data-z="-1" aria-label="Zoom out">−</button><button type="button" data-z="1" aria-label="Zoom in">+</button><button type="button" data-close aria-label="Close">Close ✕</button></span></div><div class="mbody"></div>';
    var body = modal.querySelector('.mbody');
    var clone = srcSvg.cloneNode(true); body.appendChild(clone);
    var vb = clone.viewBox.baseVal, w = Math.max(window.innerWidth - 40, vb.width * 1.1);
    function setW() { clone.style.width = w + 'px'; }
    setW();
    modal.addEventListener('click', function (e) {
      var z = e.target.getAttribute('data-z');
      if (z) { w = Math.max(400, w * (z === '1' ? 1.3 : 0.77)); setW(); }
      if (e.target.hasAttribute('data-close') || e.target === modal) closeModal();
    });
    document.body.appendChild(modal);
    modal.querySelector('[data-close]').focus();
  }
  function closeModal() { if (modal) { modal.remove(); modal = null; } }

  var NAMES = { tor: 'TOR switch', rmu1: 'TROSS / RMU1', rmu2: 'TROSS / RMU2', 'pp1-a': 'OCS panel side A', 'pp1-b': 'OCS panel side B', 'blank-b': 'Blank panel side B', 'trays-a': 'Machine trays side A', 'trays-b': 'Machine trays side B', 'batt-a': 'Batteries side A', 'batt-b': 'Batteries side B' };
  function keyLabel(k) {
    if (NAMES[k]) return NAMES[k];
    var m;
    if ((m = /^rect-([ab])(\d)$/.exec(k))) return 'Rectifier ' + m[2] + ' side ' + m[1].toUpperCase();
    if ((m = /^p(\d+)$/.exec(k))) return 'TOR port ' + m[1];
    if ((m = /^pp-(\d+)$/.exec(k))) return 'OCS panel pp1 port ' + m[1];
    if ((m = /^r-(\d+)$/.exec(k))) return 'Rack ' + m[1];
    if ((m = /^f-(\d+)-(\d+)$/.exec(k))) return 'Front panel, row ' + m[1] + ', port ' + m[2];
    if ((m = /^lc-([A-L])(\d+)-(\d)$/.exec(k))) return 'LC panel position ' + m[1] + m[2] + ', row ' + m[3];
    if ((m = /^sp-(\d+)$/.exec(k))) return 'OCS shelf port ' + m[1];
    return k;
  }
  function parseTyped(prefix, v) {
    v = String(v || '').trim().toUpperCase().replace(/\s+/g, ''); var m;
    if (prefix === 'p') { m = /^(?:PORT)?(\d{1,2})$/.exec(v); return m ? 'p' + (+m[1]) : null; }
    if (prefix === 'pp-') { m = /^(?:PP1?-?|PORT)?(\d{1,2})$/.exec(v); return m ? 'pp-' + (+m[1]) : null; }
    if (prefix === 'r-') { m = /^(?:SITE-DH4-)?R?0*(\d{3,4})$/.exec(v); return m ? 'r-' + (+m[1]) : null; }
    if (prefix === 'f-') { m = /^([A-L])(\d{1,2})-(\d{1,2})$/.exec(v); return m ? 'f-' + (+m[3]) + '-' + (+m[2]) : null; }
    if (prefix === 'lc-') { m = /^([A-L])(\d{1,2})-(\d)$/.exec(v); return m ? 'lc-' + m[1] + (+m[2]) + '-' + m[3] : null; }
    return null;
  }
  var TYPE_HINT = { 'p': 'port number, e.g. 7', 'pp-': 'port number, e.g. 13', 'r-': 'rack number, e.g. 1412', 'f-': 'panel label, e.g. D7-4', 'lc-': 'position, e.g. A1-3' };

  /* ================= MCQ ================= */
  function mcq(q, num, cfg) {
    cfg = cfg || {};
    var multi = !!q.multi, box = el('div', { class: 'q' });
    var opts = shuffle(q.opts.map(function (o, i) { return { o: o, i: i }; }));
    var qid = 'q' + Math.random().toString(36).slice(2, 8);
    box.innerHTML = (num ? '<div class="qn">Question ' + num + '</div>' : '') + '<div class="qt" id="' + qid + '">' + termify(q.q) + (multi ? ' <span class="muted small">(select all that apply)</span>' : '') + '</div>' +
      '<div class="opts' + (multi ? ' multi' : '') + '" role="' + (multi ? 'group' : 'radiogroup') + '" aria-labelledby="' + qid + '">' +
      opts.map(function (x, j) { return '<button type="button" class="opt" role="' + (multi ? 'checkbox' : 'radio') + '" aria-checked="false" data-j="' + j + '"><span class="box" aria-hidden="true"></span><span><span class="ot">' + termify(x.o.t) + '</span><span class="why" hidden></span></span></button>'; }).join('') + '</div>';
    var obtns = $$('.opt', box), sel = {}, attempts = 0, locked = false, firstOk = null;
    obtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (locked) return;
        var j = +b.getAttribute('data-j');
        if (multi) { sel[j] = !sel[j]; } else { sel = {}; sel[j] = true; }
        obtns.forEach(function (o) { var on = !!sel[+o.getAttribute('data-j')]; o.setAttribute('aria-checked', on); o.querySelector('.box').textContent = on ? (multi ? '✓' : '●') : ''; });
        if (cfg.exam && cfg.onSelect) cfg.onSelect(selection());
        if (chk) chk.disabled = !Object.keys(sel).some(function (k) { return sel[k]; });
      });
    });
    function selection() { return Object.keys(sel).filter(function (k) { return sel[k]; }).map(function (k) { return opts[+k].i; }); }
    box.restore = function (arr) { (arr || []).forEach(function (origIdx) { opts.forEach(function (x, j) { if (x.i === origIdx) { sel[j] = true; } }); }); obtns.forEach(function (o) { var on = !!sel[+o.getAttribute('data-j')]; o.setAttribute('aria-checked', on); o.querySelector('.box').textContent = on ? (multi ? '✓' : '●') : ''; }); };
    if (cfg.exam) return box;
    var row = el('div', { class: 'row' }), chk = el('button', { class: 'btn', type: 'button' }, 'Check answer'); chk.disabled = true;
    var hintB = q.hint ? el('button', { class: 'btn lite', type: 'button' }, 'Hint') : null;
    var retry = el('button', { class: 'btn sec', type: 'button', hidden: '' }, 'Try again');
    var reveal = el('button', { class: 'btn lite', type: 'button', hidden: '' }, 'Show the answer');
    row.appendChild(chk); if (hintB) row.appendChild(hintB); row.appendChild(retry); row.appendChild(reveal);
    var fb = el('div', { 'aria-live': 'polite' });
    box.appendChild(row); box.appendChild(fb);
    if (hintB) hintB.addEventListener('click', function () { fb.innerHTML = '<div class="fb hint"><b class="h">Hint</b>' + termify(q.hint) + '</div>'; });
    function isCorrect(s) { var want = q.opts.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; }); return s.length === want.length && want.every(function (w) { return s.indexOf(w) >= 0; }); }
    chk.addEventListener('click', function () {
      var s = selection(); if (!s.length) return;
      attempts++; locked = true; chk.hidden = true; if (hintB) hintB.hidden = true;
      var ok = isCorrect(s); if (firstOk === null) firstOk = ok;
      obtns.forEach(function (b) {
        var x = opts[+b.getAttribute('data-j')]; var chosen = s.indexOf(x.i) >= 0;
        if (chosen) { b.classList.add(x.o.ok ? 'ok' : 'bad'); var w = b.querySelector('.why'); w.innerHTML = termify(x.o.why || ''); w.hidden = false; }
        else if (ok && x.o.ok) b.classList.add('ok');
      });
      var refLink = q.ref && cfg.lesson ? ' <a href="#/lesson/' + cfg.lesson + '/' + q.ref + '">Review this part of the lesson</a>.' : (q.ref && q.ref.indexOf('#') > 0 ? ' <a href="#/lesson/' + q.ref.replace('#', '/') + '">Review this part of the lesson</a>.' : '');
      if (ok) fb.innerHTML = '<div class="fb ok"><b class="h">Correct.</b>' + (multi ? 'You found all of them.' : '') + '</div>';
      else { fb.innerHTML = '<div class="fb bad"><b class="h">Not quite.</b>Read the note under your answer, then try again.' + refLink + '</div>'; retry.hidden = false; if (attempts >= 2) reveal.hidden = false; }
      if (cfg.onAnswer) cfg.onAnswer(ok, firstOk);
    });
    retry.addEventListener('click', function () {
      locked = false; sel = {}; retry.hidden = true; reveal.hidden = true; chk.hidden = false; chk.disabled = true; if (hintB) hintB.hidden = false; fb.innerHTML = '';
      obtns.forEach(function (b) { b.classList.remove('ok', 'bad'); b.setAttribute('aria-checked', 'false'); b.querySelector('.box').textContent = ''; b.querySelector('.why').hidden = true; });
    });
    reveal.addEventListener('click', function () {
      retry.hidden = true; reveal.hidden = true; locked = true;
      obtns.forEach(function (b) { var x = opts[+b.getAttribute('data-j')]; b.classList.remove('bad'); if (x.o.ok) { b.classList.add('ok'); var w = b.querySelector('.why'); w.innerHTML = termify(x.o.why || ''); w.hidden = false; } });
      fb.innerHTML = '<div class="fb neutral"><b class="h">Answer shown.</b>The correct answer is marked in green, with the reason.</div>';
      if (cfg.onAnswer) cfg.onAnswer(true, false);
    });
    return box;
  }

  /* ================= activities ================= */
  function actShell(a, cls) {
    var w = el('div', { class: 'act ' + cls, id: 'act-' + a.id });
    w.innerHTML = '<h3>' + esc(a.title || '') + ' <span class="done-badge">✓ Done</span></h3>' + (a.intro ? '<p class="intro">' + termify(a.intro) + '</p>' : '');
    if (S.acts[a.id] && S.acts[a.id].done) w.classList.add('complete');
    return w;
  }
  function complete(w, a, ok) { w.classList.add('complete'); markAct(a.id, ok); }

  function actExplore(a) {
    var w = actShell(a, 'explore');
    var f = figure({ dg: a.dg, o: a.o }); w.appendChild(f);
    var svg = f.querySelector('svg.dg'), info = el('div', { class: 'spot-info', 'aria-live': 'polite' }, '<span class="muted">Select a part of the diagram, or a button below.</span>');
    var spots = el('div', { class: 'spots', role: 'group', 'aria-label': 'Parts to explore' });
    var seen = {};
    function show(k) {
      var s = a.spots.filter(function (x) { return x.k === k; })[0]; if (!s) return;
      DG.clearRings(svg); DG.ring(svg, [k]);
      info.innerHTML = '<b class="t">' + esc(s.t) + '</b>' + termify(s.d);
      seen[k] = 1;
      $$('button', spots).forEach(function (b) { var bk = b.getAttribute('data-k'); b.setAttribute('aria-pressed', bk === k); if (seen[bk]) b.classList.add('seen'); });
      var n = Object.keys(seen).length; count.textContent = n + ' of ' + a.spots.length + ' explored';
      if (n === a.spots.length) complete(w, a, true);
    }
    a.spots.forEach(function (s) {
      var b = el('button', { type: 'button', 'data-k': s.k, 'aria-pressed': 'false' }, esc(s.t.split(' — ')[0])); b.addEventListener('click', function () { show(s.k); }); spots.appendChild(b);
      var g = svg.querySelector('[data-k="' + s.k + '"]');
      if (g) { g.setAttribute('data-click', '1'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', s.t); }
    });
    svg.setAttribute('role', 'group');
    svg.addEventListener('click', function (e) { var g = e.target.closest('[data-click]'); if (g) show(g.getAttribute('data-k')); });
    svg.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('data-click')) { e.preventDefault(); show(e.target.getAttribute('data-k')); } });
    var count = el('p', { class: 'muted small' }, '0 of ' + a.spots.length + ' explored');
    w.appendChild(info); w.appendChild(spots); w.appendChild(count);
    return w;
  }

  function actPick(a) {
    var w = actShell(a, 'pick');
    var f = figure({ dg: a.dg, o: a.o }); var svg = f.querySelector('svg.dg');
    var task = el('div', { class: 'task', 'aria-live': 'polite' }), fb = el('div', { 'aria-live': 'polite' });
    w.appendChild(task); w.appendChild(f);
    var clickable = $$('[data-k]', svg).filter(function (g) {
      var k = g.getAttribute('data-k');
      if (a.clickKeys) return a.clickKeys.indexOf(k) >= 0;
      if (a.clickPrefix && k.indexOf(a.clickPrefix) === 0) return /^[A-Z]?[0-9-]+$/.test(k.slice(a.clickPrefix.length));
      return false;
    });
    clickable.forEach(function (g) { g.setAttribute('data-click', '1'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', keyLabel(g.getAttribute('data-k'))); });
    if (clickable.length) svg.setAttribute('role', 'group');
    var alt = el('div');
    if (a.clickKeys && clickable.length <= 20) {
      alt.className = 'spots'; alt.setAttribute('role', 'group'); alt.setAttribute('aria-label', 'Choose a part');
      clickable.forEach(function (g) { var k = g.getAttribute('data-k'); var b = el('button', { type: 'button' }, esc(keyLabel(k))); b.addEventListener('click', function () { answer(k); }); alt.appendChild(b); });
    } else if (a.clickPrefix && TYPE_HINT[a.clickPrefix]) {
      alt.className = 'typein';
      var inp = el('input', { type: 'text', 'aria-label': 'Type your answer: ' + TYPE_HINT[a.clickPrefix], placeholder: TYPE_HINT[a.clickPrefix], autocomplete: 'off' });
      var go = el('button', { type: 'button', class: 'btn lite' }, 'Check');
      alt.appendChild(el('span', null, 'Or type it:')); alt.appendChild(inp); alt.appendChild(go);
      function typed() { var k = parseTyped(a.clickPrefix, inp.value); if (!k || !svg.querySelector('[data-k="' + k + '"]')) { fb.innerHTML = '<div class="fb hint">That is not a position on this diagram. Format: ' + esc(TYPE_HINT[a.clickPrefix]) + '.</div>'; return; } answer(k); }
      go.addEventListener('click', typed); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') typed(); });
    }
    w.appendChild(alt); w.appendChild(fb);
    var row = el('div', { class: 'row' }), next = el('button', { type: 'button', class: 'btn', hidden: '' }, 'Next task →'), showB = el('button', { type: 'button', class: 'btn lite', hidden: '' }, 'Show me'), again = el('button', { type: 'button', class: 'btn sec', hidden: '' }, 'Start over');
    row.appendChild(next); row.appendChild(showB); row.appendChild(again); w.appendChild(row);
    var ti = 0, wrongs = 0, solved = false, firstTryAll = true;
    function render() {
      var t = a.tasks[ti]; solved = false; wrongs = 0; DG.clearRings(svg);
      task.innerHTML = '<span class="tn">Task ' + (ti + 1) + ' of ' + a.tasks.length + '</span>' + termify(t.q);
      fb.innerHTML = ''; next.hidden = true; showB.hidden = true; again.hidden = true;
    }
    function answer(k) {
      if (solved) return;
      var t = a.tasks[ti]; DG.clearRings(svg);
      if (t.ok.indexOf(k) >= 0) {
        solved = true; DG.ring(svg, [k], { color: '#2F7D3B', width: 6 });
        fb.innerHTML = '<div class="fb ok"><b class="h">Correct — ' + esc(keyLabel(k)) + '.</b>' + termify(t.why || '') + '</div>';
        if (ti < a.tasks.length - 1) next.hidden = false; else { again.hidden = false; fb.innerHTML += '<div class="fb neutral">All tasks done.</div>'; complete(w, a, firstTryAll); }
        showB.hidden = true;
      } else {
        wrongs++; firstTryAll = false; DG.ring(svg, [k], { color: '#B3261E', width: 5 });
        var msg = (t.wrong && t.wrong[k]) ? t.wrong[k] : 'You picked <b>' + esc(keyLabel(k)) + '</b>. That is not it.';
        fb.innerHTML = '<div class="fb bad"><b class="h">Not quite.</b>' + termify(msg) + '</div>' + (t.hint ? '<div class="fb hint"><b class="h">Hint</b>' + termify(t.hint) + '</div>' : '');
        if (wrongs >= 2) showB.hidden = false;
      }
    }
    svg.addEventListener('click', function (e) { var g = e.target.closest('[data-click]'); if (g) answer(g.getAttribute('data-k')); });
    svg.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('data-click')) { e.preventDefault(); answer(e.target.getAttribute('data-k')); } });
    next.addEventListener('click', function () { ti++; render(); task.focus && task.scrollIntoView({ block: 'nearest' }); });
    showB.addEventListener('click', function () { var t = a.tasks[ti]; solved = true; DG.clearRings(svg); DG.ring(svg, t.ok, { color: '#2F7D3B', width: 6 }); fb.innerHTML = '<div class="fb neutral"><b class="h">Here it is: ' + esc(keyLabel(t.ok[0])) + '.</b>' + termify(t.why || '') + '</div>'; showB.hidden = true; if (ti < a.tasks.length - 1) next.hidden = false; else { again.hidden = false; complete(w, a, false); } });
    again.addEventListener('click', function () { ti = 0; firstTryAll = true; render(); });
    render();
    return w;
  }

  function actMatch(a) {
    var w = actShell(a, 'match');
    var rights = shuffle(a.pairs.map(function (p) { return p[1]; }).concat(a.extra || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }));
    var rowsBox = el('div');
    var rows = a.pairs.map(function (p, i) {
      var r = el('div', { class: 'matchrow' }), id = a.id + '-m' + i;
      r.innerHTML = '<label for="' + id + '">' + termify(p[0]) + '</label><select id="' + id + '"><option value="">— choose —</option>' + rights.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select><span class="mk" aria-hidden="true"></span>';
      rowsBox.appendChild(r); return r;
    });
    w.appendChild(rowsBox);
    var fb = el('div', { 'aria-live': 'polite' }), row = el('div', { class: 'row' });
    var chk = el('button', { type: 'button', class: 'btn' }, 'Check answers'), rev = el('button', { type: 'button', class: 'btn lite', hidden: '' }, 'Show answers'), reset = el('button', { type: 'button', class: 'btn sec' }, 'Reset');
    row.appendChild(chk); row.appendChild(rev); row.appendChild(reset); w.appendChild(row); w.appendChild(fb);
    var tries = 0;
    chk.addEventListener('click', function () {
      tries++; var right = 0, blank = 0;
      rows.forEach(function (r, i) { var v = r.querySelector('select').value; r.classList.remove('ok', 'bad'); if (!v) { blank++; return; } var ok = v === a.pairs[i][1]; r.classList.add(ok ? 'ok' : 'bad'); r.querySelector('.mk').textContent = ok ? '✓' : '✗'; if (ok) right++; });
      if (blank) { fb.innerHTML = '<div class="fb hint">Choose an answer for every row first (' + blank + ' left).</div>'; return; }
      if (right === rows.length) { fb.innerHTML = '<div class="fb ok"><b class="h">All ' + right + ' correct.</b>' + termify(a.why || '') + '</div>'; complete(w, a, tries === 1); rev.hidden = true; }
      else { fb.innerHTML = '<div class="fb bad"><b class="h">' + right + ' of ' + rows.length + ' correct.</b>Change the rows marked ✗ and check again.</div>'; if (tries >= 2) rev.hidden = false; }
    });
    rev.addEventListener('click', function () { rows.forEach(function (r, i) { r.querySelector('select').value = a.pairs[i][1]; r.classList.remove('bad'); r.classList.add('ok'); r.querySelector('.mk').textContent = '✓'; }); fb.innerHTML = '<div class="fb neutral"><b class="h">Answers shown.</b>' + termify(a.why || '') + '</div>'; complete(w, a, false); rev.hidden = true; });
    reset.addEventListener('click', function () { rows.forEach(function (r) { r.querySelector('select').value = ''; r.classList.remove('ok', 'bad'); r.querySelector('.mk').textContent = ''; }); fb.innerHTML = ''; tries = 0; rev.hidden = true; });
    return w;
  }

  function actOrder(a) {
    var w = actShell(a, 'order');
    var order = shuffle(a.items.map(function (x, i) { return i; }));
    if (order.every(function (v, i) { return v === i; })) order.reverse();
    var list = el('ol', { class: 'olist', 'aria-label': 'Items to put in order' }), fb = el('div', { 'aria-live': 'polite' });
    function draw(focusIdx, dir) {
      list.innerHTML = '';
      order.forEach(function (it, pos) {
        var li = el('li');
        li.innerHTML = '<span class="pos">' + (pos + 1) + '</span><span class="txt">' + termify(a.items[it]) + '</span>' +
          '<button type="button" data-d="-1" aria-label="Move ' + esc(a.items[it]) + ' up"' + (pos === 0 ? ' disabled' : '') + '>▲</button>' +
          '<button type="button" data-d="1" aria-label="Move ' + esc(a.items[it]) + ' down"' + (pos === order.length - 1 ? ' disabled' : '') + '>▼</button>';
        $$('button', li).forEach(function (b) { b.addEventListener('click', function () { var d = +b.getAttribute('data-d'), np = pos + d; var t = order[pos]; order[pos] = order[np]; order[np] = t; draw(np, d); }); });
        list.appendChild(li);
      });
      if (focusIdx != null) { var b = list.children[focusIdx].querySelector('button[data-d="' + dir + '"]'); if (b && !b.disabled) b.focus(); else { var o = list.children[focusIdx].querySelector('button:not([disabled])'); if (o) o.focus(); } }
    }
    draw();
    w.appendChild(list);
    var row = el('div', { class: 'row' }), chk = el('button', { type: 'button', class: 'btn' }, 'Check order'), rev = el('button', { type: 'button', class: 'btn lite', hidden: '' }, 'Show correct order');
    row.appendChild(chk); row.appendChild(rev); w.appendChild(row); w.appendChild(fb);
    var tries = 0;
    chk.addEventListener('click', function () {
      tries++; var right = 0;
      $$('li', list).forEach(function (li, pos) { var ok = order[pos] === pos; li.classList.toggle('ok', ok); li.classList.toggle('bad', !ok); if (ok) right++; });
      if (right === order.length) { fb.innerHTML = '<div class="fb ok"><b class="h">Perfect order.</b>' + termify(a.why || '') + '</div>'; complete(w, a, tries === 1); rev.hidden = true; }
      else { fb.innerHTML = '<div class="fb bad"><b class="h">' + right + ' of ' + order.length + ' in the right place.</b>Green items are placed correctly. Move the red ones and check again.</div>'; if (tries >= 2) rev.hidden = false; }
    });
    rev.addEventListener('click', function () { order = a.items.map(function (x, i) { return i; }); draw(); $$('li', list).forEach(function (li) { li.classList.add('ok'); }); fb.innerHTML = '<div class="fb neutral"><b class="h">Correct order shown.</b>' + termify(a.why || '') + '</div>'; complete(w, a, false); rev.hidden = true; });
    return w;
  }

  function actScenario(a) {
    var w = actShell(a, 'scenario');
    if (a.dg) w.appendChild(figure({ dg: a.dg, o: a.o, hl: a.hl }));
    var n = a.qs.length, got = 0, allFirst = true;
    a.qs.forEach(function (q, i) {
      var done = false;
      w.appendChild(mcq(q, n > 1 ? i + 1 : 0, { onAnswer: function (ok, first) { if (ok && !done) { done = true; got++; if (!first) allFirst = false; if (got === n) complete(w, a, allFirst); } } }));
    });
    return w;
  }

  function actTrace(a) {
    var w = actShell(a, 'trace');
    var dots = el('div', { class: 'steps-dots', 'aria-hidden': 'true' }); a.steps.forEach(function () { dots.appendChild(el('i')); });
    var f = figure({ dg: a.dg, o: a.o }), svg = f.querySelector('svg.dg');
    var text = el('div', { class: 'task', 'aria-live': 'polite' }), qbox = el('div');
    var row = el('div', { class: 'row' }), back = el('button', { type: 'button', class: 'btn sec' }, '← Back'), next = el('button', { type: 'button', class: 'btn' }, 'Next step →');
    row.appendChild(back); row.appendChild(next);
    w.appendChild(dots); w.appendChild(f); w.appendChild(text); w.appendChild(qbox); w.appendChild(row);
    var si = 0, answered = {};
    function render() {
      var st = a.steps[si];
      $$('i', dots).forEach(function (d, i) { d.className = i < si ? 'done' : i === si ? 'on' : ''; });
      DG.clearRings(svg); if (st.hl) DG.ring(svg, st.hl);
      $$('[data-k]', svg).forEach(function (g) { g.classList.remove('dimmed'); });
      text.innerHTML = '<span class="tn">Step ' + (si + 1) + ' of ' + a.steps.length + '</span>' + termify(st.t);
      qbox.innerHTML = '';
      if (st.q && !answered[si]) {
        next.disabled = true;
        qbox.appendChild(mcq(st.q, 0, { onAnswer: function (ok) { if (ok) { answered[si] = true; next.disabled = false; } } }));
      } else next.disabled = false;
      back.disabled = si === 0;
      next.textContent = si === a.steps.length - 1 ? 'Finish ✓' : 'Next step →';
    }
    back.addEventListener('click', function () { if (si > 0) { si--; render(); } });
    next.addEventListener('click', function () { if (si < a.steps.length - 1) { si++; render(); } else { complete(w, a, true); text.innerHTML = '<b>Path complete.</b> You traced every step.'; qbox.innerHTML = ''; } });
    render();
    return w;
  }
  var ACT = { explore: actExplore, pick: actPick, match: actMatch, order: actOrder, scenario: actScenario, trace: actTrace };

  /* ================= video player ================= */
  function videoCard(vid, lessonId) {
    var V = (C.videos || {})[vid];
    var card = el('div', { class: 'vcard', id: 'video-' + vid });
    if (!V) { card.innerHTML = '<div class="vhead"><b>Video</b><span class="muted">not available in this build</span></div>'; return card; }
    card.innerHTML = '<div class="vhead"><b>▶ Video: ' + esc(V.title) + '</b><span class="muted">' + fmt(V.dur) + ' · ' + V.chapters.length + ' chapters · captions + transcript</span><span class="grow"></span><button type="button" class="btn">Watch video</button></div>';
    var btn = card.querySelector('.btn'), opened = false;
    btn.addEventListener('click', function () { if (opened) { var p = card.querySelector('.player'); var v = p.querySelector('video'); if (v) v.pause(); p.remove(); opened = false; btn.textContent = 'Watch video'; return; } opened = true; btn.textContent = 'Close video'; card.appendChild(player(vid)); });
    return card;
  }
  function playSafe(v) { try { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { }); } catch (e) { } }
  function player(vid) {
    var V = C.videos[vid];
    var p = el('div', { class: 'player' });
    p.innerHTML = '<video controls preload="metadata" playsinline aria-label="' + esc(V.title) + '"></video>' +
      '<div class="pctl" role="group" aria-label="Video controls">' +
      '<button type="button" data-a="play" aria-label="Play or pause">▶ Play</button>' +
      '<button type="button" data-a="back" aria-label="Back 10 seconds">↺ 10s</button>' +
      '<button type="button" data-a="fwd" aria-label="Forward 10 seconds">10s ↻</button>' +
      '<label class="small" style="color:#CFE3E1">Speed <select data-a="speed" aria-label="Playback speed"><option value="0.75">0.75×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label>' +
      '<button type="button" data-a="cc" aria-pressed="true" aria-label="Captions">CC</button>' +
      '<button type="button" data-a="follow" aria-pressed="true" aria-label="Transcript follows the video">Follow transcript</button>' +
      '<span class="time" aria-live="off">0:00 / ' + fmt(V.dur) + '</span></div>' +
      '<div class="pgrid"><div class="chapters"><h3>Chapters</h3></div><div class="transcript" tabindex="0" aria-label="Transcript"><h3>Transcript</h3></div></div>';
    var v = p.querySelector('video'), ch = p.querySelector('.chapters'), tr = p.querySelector('.transcript'), time = p.querySelector('.time');
    V.chapters.forEach(function (c) { var b = el('button', { type: 'button' }, '<span class="ts">' + fmt(c.t) + '</span><span>' + esc(c.title) + '</span>'); b.addEventListener('click', function () { v.currentTime = c.t + 0.05; playSafe(v); }); b.setAttribute('data-t', c.t); ch.appendChild(b); });
    var lines = [];
    V.transcript.forEach(function (x) {
      if (x.k === 'chapter') { tr.appendChild(el('div', { class: 'tch' }, esc(x.x))); return; }
      var b = el('button', { type: 'button' }, '<span class="ts">' + fmt(x.t) + '</span><span>' + esc(x.x) + '</span>'); b.addEventListener('click', function () { v.currentTime = x.t + 0.02; playSafe(v); }); tr.appendChild(b); lines.push({ t: x.t, b: b });
    });
    // Look for the MP4 in the package layout first (course/ next to videos/), then in a videos/ folder
    // next to this page, then right next to this page (e.g. everything downloaded into one folder).
    var VPATHS = ['../videos/', 'videos/', ''], vp = 0;
    v.addEventListener('error', function () {
      if (++vp < VPATHS.length) { v.src = VPATHS[vp] + V.file; return; }
      var m = el('div', { class: 'vmissing', role: 'alert' }, '<b>The video file could not be opened.</b><br>Looked for <code>' + esc(V.file) + '</code> in the package\'s <code>videos</code> folder and next to this page. Keep the folder layout from the package (see README), or put the MP4 files in the same folder as this page. You can still read the full transcript below.');
      v.replaceWith(m);
    }, true);
    v.src = VPATHS[0] + V.file;
    var track = null, ccOn = S.ccOff ? false : true;
    function setupTrack() {
      if (track) return;
      try {
        track = v.addTextTrack('captions', 'English', 'en');
        track.mode = 'hidden';
        V.cues.forEach(function (c) { try { track.addCue(new (window.VTTCue || window.TextTrackCue)(c.start, c.end, c.text)); } catch (e) { } });
        track.mode = ccOn ? 'showing' : 'hidden';
      } catch (e) { }
    }
    // Captions come from the shipped .en.vtt file next to the MP4 (Chromium often
    // never renders cues added through addTextTrack). Falls back to in-memory cues
    // when the file cannot be opened.
    v.addEventListener('loadedmetadata', function addFileTrack() {
      v.removeEventListener('loadedmetadata', addFileTrack);
      var t = el('track', { kind: 'captions', srclang: 'en', label: 'English', src: VPATHS[vp] + V.file.replace(/\.mp4$/, '.en.vtt') });
      t.addEventListener('load', function () { track = t.track; track.mode = ccOn ? 'showing' : 'hidden'; });
      t.addEventListener('error', function retry() {
        if (t.getAttribute('src').indexOf('captions/') < 0) { t.setAttribute('src', VPATHS[vp] + 'captions/' + V.file.replace(/\.mp4$/, '.en.vtt')); return; }
        t.remove(); setupTrack();
      });
      v.appendChild(t);
    });
    var ccB = p.querySelector('[data-a="cc"]'); ccB.setAttribute('aria-pressed', ccOn);
    var follow = true;
    p.querySelector('.pctl').addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'play') { if (v.paused) playSafe(v); else v.pause(); }
      if (a === 'back') v.currentTime = Math.max(0, v.currentTime - 10);
      if (a === 'fwd') v.currentTime = Math.min(v.duration || V.dur, v.currentTime + 10);
      if (a === 'cc') { ccOn = !ccOn; if (track) track.mode = ccOn ? 'showing' : 'hidden'; ccB.setAttribute('aria-pressed', ccOn); S.ccOff = !ccOn; save(); }
      if (a === 'follow') { follow = !follow; e.target.setAttribute('aria-pressed', follow); }
    });
    p.querySelector('[data-a="speed"]').addEventListener('change', function (e) { v.playbackRate = +e.target.value; S.speed = +e.target.value; save(); });
    if (S.speed) { p.querySelector('[data-a="speed"]').value = String(S.speed); v.playbackRate = S.speed; v.addEventListener('loadedmetadata', function () { v.playbackRate = S.speed; }); }
    var playB = p.querySelector('[data-a="play"]');
    v.addEventListener('play', function () { playB.textContent = '❚❚ Pause'; });
    v.addEventListener('pause', function () { playB.textContent = '▶ Play'; });
    var lastSave = 0, cur = -1;
    v.addEventListener('timeupdate', function () {
      var t = v.currentTime; time.textContent = fmt(t) + ' / ' + fmt(v.duration || V.dur);
      var i = lines.length - 1; while (i >= 0 && lines[i].t > t + 0.05) i--;
      if (i !== cur) { if (cur >= 0) lines[cur].b.classList.remove('cur'); cur = i; if (i >= 0) { lines[i].b.classList.add('cur'); if (follow) tr.scrollTop = lines[i].b.offsetTop - tr.offsetTop - 60; } }
      $$('button', ch).forEach(function (b, k) { var t0 = +b.getAttribute('data-t'), t1 = k + 1 < V.chapters.length ? V.chapters[k + 1].t : 1e9; b.classList.toggle('cur', t >= t0 && t < t1); });
      if (Math.abs(t - lastSave) > 5) { lastSave = t; S.videos[vid] = { pos: t, done: (S.videos[vid] && S.videos[vid].done) || (t > V.dur - 15) }; save(); }
    });
    v.addEventListener('ended', function () { S.videos[vid] = { pos: 0, done: true }; save(); });
    var sv = S.videos[vid];
    if (sv && sv.pos > 20 && sv.pos < V.dur - 20) {
      var rb = el('div', { class: 'row' }, '<button type="button" class="btn">Resume at ' + fmt(sv.pos) + '</button>');
      rb.querySelector('button').addEventListener('click', function () { v.currentTime = sv.pos; playSafe(v); rb.remove(); });
      p.insertBefore(rb, p.querySelector('.pgrid'));
    }
    return p;
  }

  function wrapTables(root) { $$('table.t', root).forEach(function (t) { if (!t.parentNode.classList.contains('tscroll')) { var d = el('div', { class: 'tscroll' }); t.parentNode.insertBefore(d, t); d.appendChild(t); } }); }
  /* ================= pages ================= */
  var main = $('#main');
  function page(html) { main.innerHTML = '<div class="wrap">' + html + '</div>'; return $('.wrap', main); }
  function setActive(hash) {
    $$('.side a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') !== '#/' && hash.indexOf(a.getAttribute('href')) === 0 && !/[a-z0-9]/i.test(hash.charAt(a.getAttribute('href').length))); if (a.getAttribute('href') === '#/' && (hash === '#/' || hash === '')) a.classList.add('on'); });
    document.body.classList.remove('nav-open');
  }
  function renderNav() {
    var side = $('#side'), h = '<a href="#/"><span class="n">⌂</span>Start here</a>';
    PARTS.forEach(function (p) {
      h += '<h3>' + esc(p.t) + '</h3>';
      p.ids.forEach(function (id) { var l = byId[id]; h += '<a href="#/lesson/' + id + '" class="' + (lessonDone(id) ? 'done' : '') + '"><span class="n">' + lnum(l) + '</span><span>' + esc(l.title) + '</span></a>'; });
    });
    h += '<a href="#/final" class="' + (S.finalPassed ? 'done' : '') + '"><span class="n">★</span><span>Final assessment</span></a>';
    h += '<h3>Videos & reference</h3><a href="#/videos"><span class="n">▶</span>All videos</a><a href="#/drs"><span class="n">D</span>DRS sheets</a><a href="#/glossary"><span class="n">A</span>Glossary</a><a href="#/tables"><span class="n">≡</span>Connection tables</a><a href="#/open"><span class="n">?</span>Ask your lead: open items</a><a href="#/sources"><span class="n">§</span>Sources & coverage</a><a href="#/help"><span class="n">i</span>How to use this course</a>';
    side.innerHTML = h;
    var pct = progressPct(); $('#pbar i').style.width = pct + '%'; $('#ptxt').textContent = pct + '% complete';
  }

  function home() {
    var w = page('');
    var last = S.last && S.last !== '#/' ? S.last : null;
    w.innerHTML = '<div class="hero"><div class="kicker" style="color:#F2B134">Beginner training · Data Hall 4 · pods 10-12</div><h1>Data Hall 4 Cable Installation</h1>' +
      '<p>For people who have never worked in a data center. You will learn what every piece of equipment is, how and why the cables connect, how to install, label and check them the way the project documents require, and how to spot mistakes.</p>' +
      '<p class="small" style="color:#9FB8B6">Built from the Large Site Cable Installation Guide (cover Rev D, footers Rev C, 10/8/2026) and the Fluidstack DRS sheets added so far (<a href="#/drs" style="color:#F2B134">see the DRS sheets list</a>). <b>The current DRS says how; your site\'s cutsheet says where and is the final word on any port.</b></p>' +
      '<a class="btn" href="#/lesson/l00">' + (last ? 'Start from lesson 0' : 'Start with lesson 0 →') + '</a></div>' +
      (last ? '<div class="resume"><b>Welcome back.</b><span>Pick up where you left off.</span><a class="btn" href="' + esc(last) + '">Resume →</a></div>' : '') +
      (storageOK ? '' : '<div class="callout warn">Your browser is blocking saved progress for files opened from disk. Everything works, but progress will reset when you close this tab.</div>') +
      '<div class="card"><h2>How this course works</h2><ol class="steps"><li><b>Read the lesson.</b> Short sections take you from <i>recognize it</i> → <i>understand it</i> → <i>connect it</i> → <i>work with it</i> → <i>apply it</i>. Underlined terms show their definition when you select them.</li><li><b>Watch the lesson video.</b> Slow narration, highlighted diagrams, captions, transcript and speed control. Each lesson has one.</li><li><b>Practice.</b> Explore diagrams, plug legs into ports, match, order, trace paths and find mistakes. Hints and retries are built in.</li><li><b>Take the lesson check.</b> Score 80% or better to complete the lesson.</li><li><b>Take the final assessment.</b> Results are shown by topic, with links back to what to review.</li></ol></div>';
    PARTS.forEach(function (p) {
      w.appendChild(el('h2', { style: 'margin-top:26px' }, esc(p.t)));
      var g = el('div', { class: 'grid-lessons' });
      p.ids.forEach(function (id) { var l = byId[id]; var a = el('a', { class: 'lcard' + (lessonDone(id) ? ' done' : ''), href: '#/lesson/' + id }, '<span class="n">Lesson ' + lnum(l) + '</span><b>' + esc(l.title) + '</b><span class="s">~' + l.mins + ' min + video</span>'); g.appendChild(a); });
      w.appendChild(g);
    });
    var f = el('div', { class: 'card', style: 'margin-top:26px' }, '<h2>Final assessment</h2><p>' + C.finalExam.length + ' questions across every system and task. Results by topic.' + (S.finalBest != null ? ' Your best score: <b>' + S.finalBest + '%</b>.' : '') + '</p><a class="btn" href="#/final">Go to the final assessment</a>');
    w.appendChild(f);
  }

  function lessonPage(id, secId) {
    var L = byId[id]; if (!L) return home();
    var idx = LESSONS.indexOf(L), prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    var w = page('<div class="kicker">Lesson ' + lnum(L) + ' · ' + (idx + 1) + ' of ' + LESSONS.length + ' lessons</div><h1>' + esc(L.title) + '</h1><div class="meta"><span>~' + L.mins + ' min reading + practice</span><span>Sources: ' + esc(L.pages) + '</span>' + (lessonDone(id) ? '<span style="color:var(--ok);font-weight:700">✓ Lesson complete</span>' : '') + '</div>');
    w.appendChild(el('div', { class: 'objectives' }, '<h2>By the end of this lesson you can</h2><ul>' + L.objectives.map(function (o) { return '<li>' + termify(o) + '</li>'; }).join('') + '</ul>'));
    w.appendChild(videoCard(L.video, L.id));
    L.sections.forEach(function (s) {
      var sec = el('section', { class: 'lsec', id: s.id, 'aria-labelledby': id + s.id + 'h' });
      var stageCls = s.stage === 'Work with it' ? 'Work' : s.stage;
      sec.innerHTML = '<span class="stage-tag st-' + esc(stageCls) + '">' + esc(s.stage) + '</span><h2 id="' + id + s.id + 'h">' + esc(s.title) + '</h2>';
      if (s.html) sec.appendChild(el('div', null, termify(s.html)));
      (s.figs || []).forEach(function (f) { sec.appendChild(figure(f)); });
      if (s.after) sec.appendChild(el('div', null, termify(s.after)));
      (s.figs2 || []).forEach(function (f) { sec.appendChild(figure(f)); });
      if (s.analogy) sec.appendChild(el('div', { class: 'analogy' }, termify(s.analogy)));
      if (s.act) sec.appendChild(ACT[s.act.type](s.act));
      wrapTables(sec);
      w.appendChild(sec);
    });
    // knowledge check
    var chk = el('section', { class: 'lsec', id: 'check' });
    var best = S.checks[id];
    chk.innerHTML = '<div class="check-head"><div><span class="stage-tag st-Apply">Lesson check</span><h2>Check your understanding</h2></div><span class="scorebox' + (best && best.passed ? ' pass' : '') + '">' + (best ? 'Best: ' + best.best + '%' + (best.passed ? ' ✓ passed' : '') : 'Not taken yet') + '</span></div><p class="muted">Answer each question, then select <b>Check answer</b>. Your score counts answers that were right on the first try. Score 80% or better to complete the lesson.</p>';
    var qwrap = el('div'); chk.appendChild(qwrap);
    var result = el('div', { 'aria-live': 'polite' }); chk.appendChild(result);
    function runCheck() {
      qwrap.innerHTML = ''; result.innerHTML = '';
      var n = L.check.length, answered = 0, firstRight = 0;
      L.check.forEach(function (q, i) {
        var done = false;
        qwrap.appendChild(mcq(q, i + 1, { lesson: id, onAnswer: function (ok, first) {
          if (done) return; if (!ok) return; done = true; answered++; if (first) firstRight++;
          if (answered === n) {
            var pct = Math.round(firstRight / n * 100), passed = pct >= 80;
            var b = S.checks[id] || { best: 0 }; b.best = Math.max(b.best || 0, pct); b.last = pct; b.passed = b.passed || passed; S.checks[id] = b; save(); renderNav();
            result.innerHTML = '<div class="fb ' + (passed ? 'ok' : 'bad') + '"><b class="h">Score: ' + pct + '% (' + firstRight + ' of ' + n + ' right on the first try).</b>' + (passed ? 'Lesson complete. ' + (next ? '<a href="#/lesson/' + next.id + '">Continue to lesson ' + lnum(next) + ' →</a>' : '<a href="#/final">Go to the final assessment →</a>') : 'You need 80% to complete the lesson. Review the sections linked in your answers, then try the check again.') + '</div>';
            var again = el('button', { type: 'button', class: 'btn sec', style: 'margin-top:10px' }, 'Take the check again'); again.addEventListener('click', function () { runCheck(); chk.scrollIntoView(); }); result.appendChild(again);
            chk.querySelector('.scorebox').outerHTML = '<span class="scorebox' + (b.passed ? ' pass' : '') + '">Best: ' + b.best + '%' + (b.passed ? ' ✓ passed' : '') + '</span>';
          }
        } }));
      });
    }
    runCheck();
    w.appendChild(chk);
    w.appendChild(el('nav', { class: 'pagenav', 'aria-label': 'Lesson navigation' }, (prev ? '<a href="#/lesson/' + prev.id + '"><small>← Previous</small>Lesson ' + lnum(prev) + ': ' + esc(prev.title) + '</a>' : '<a href="#/"><small>← Back</small>Course start</a>') + (next ? '<a class="next" href="#/lesson/' + next.id + '"><small>Next →</small>Lesson ' + lnum(next) + ': ' + esc(next.title) + '</a>' : '<a class="next" href="#/final"><small>Next →</small>Final assessment</a>')));
    if (secId) { var t = document.getElementById(secId); if (t) setTimeout(function () { t.scrollIntoView(); }, 30); } else window.scrollTo(0, 0);
  }

  function videosPage() {
    var w = page('<h1>All videos</h1><p class="muted">Each lesson has one video. Every video has chapters, captions, a transcript and speed control. The same MP4 files are in the <code>videos</code> folder, with matching <code>.vtt</code> caption and <code>.txt</code> transcript files.</p>');
    LESSONS.forEach(function (L) {
      var V = (C.videos || {})[L.video]; var c = el('div', { class: 'card' });
      c.innerHTML = '<div class="kicker">Lesson ' + lnum(L) + '</div><h2>' + esc(V ? V.title : L.title) + '</h2><p class="muted">' + (V ? fmt(V.dur) + ' · ' + V.chapters.map(function (x) { return esc(x.title); }).join(' · ') : 'Not available') + (S.videos[L.video] && S.videos[L.video].done ? ' · <b style="color:var(--ok)">✓ watched</b>' : '') + '</p>';
      c.appendChild(videoCard(L.video, L.id)); var a = el('p', null, '<a href="#/lesson/' + L.id + '">Open lesson ' + lnum(L) + ' →</a>'); c.appendChild(a);
      w.appendChild(c);
    });
  }

  function finalPage() {
    var w = page('<div class="kicker">Final assessment</div><h1>Final assessment</h1><p>' + C.finalExam.length + ' questions covering every system and task in the course. Choose one answer per question (or every answer, where it says so). You can move back and forth and change answers before you submit. <b>Pass mark: 80%.</b> Results are shown by topic, with links to what to review.</p>' + (S.finalBest != null ? '<p>Your best score so far: <b>' + S.finalBest + '%</b>' + (S.finalPassed ? ' ✓ passed' : '') + '.</p>' : ''));
    var start = el('button', { type: 'button', class: 'btn' }, S.finalBest != null ? 'Start a new attempt' : 'Start the assessment'); w.appendChild(start);
    var area = el('div'); w.appendChild(area);
    start.addEventListener('click', function () { start.remove(); runExam(area); });
  }
  function runExam(area) {
    var Q = shuffle(C.finalExam.map(function (q, i) { return i; }));
    var ans = {}, cur = 0;
    var box = el('div', { class: 'card' }); area.appendChild(box);
    function draw() {
      var q = C.finalExam[Q[cur]];
      box.innerHTML = '<div class="check-head"><b>Question ' + (cur + 1) + ' of ' + Q.length + '</b><span class="scorebox">' + Object.keys(ans).length + ' answered</span></div>';
      var nav = el('div', { class: 'qnav', role: 'group', 'aria-label': 'Jump to question' });
      Q.forEach(function (qi, k) { var b = el('button', { type: 'button', class: (ans[qi] && ans[qi].length ? 'ans' : '') + (k === cur ? ' cur' : ''), 'aria-label': 'Question ' + (k + 1) + (ans[qi] && ans[qi].length ? ', answered' : '') }, String(k + 1)); b.addEventListener('click', function () { cur = k; draw(); }); nav.appendChild(b); });
      box.appendChild(nav);
      var m = mcq(q, 0, { exam: true, onSelect: function (s) { ans[Q[cur]] = s; $$('.qnav button', box)[cur].classList.toggle('ans', s.length > 0); box.querySelector('.scorebox').textContent = Object.keys(ans).filter(function (k) { return ans[k].length; }).length + ' answered'; } });
      if (ans[Q[cur]]) m.restore(ans[Q[cur]]);
      box.appendChild(m);
      var row = el('div', { class: 'row' }), pv = el('button', { type: 'button', class: 'btn sec' }, '← Previous'), nx = el('button', { type: 'button', class: 'btn' }, 'Next →'), sub = el('button', { type: 'button', class: 'btn lite' }, 'Submit assessment');
      pv.disabled = cur === 0; if (cur === Q.length - 1) nx.disabled = true;
      pv.addEventListener('click', function () { cur--; draw(); }); nx.addEventListener('click', function () { cur++; draw(); });
      sub.addEventListener('click', function () {
        var left = Q.filter(function (qi) { return !ans[qi] || !ans[qi].length; }).length;
        if (left && !window.confirm(left + ' question(s) are not answered. Submit anyway?')) return;
        results(area, Q, ans);
      });
      row.appendChild(pv); row.appendChild(nx); row.appendChild(sub); box.appendChild(row);
      box.querySelector('.opt') && box.querySelector('.opt').focus({ preventScroll: true });
    }
    draw();
  }
  function results(area, Q, ans) {
    var byTopic = {}, right = 0, missed = [];
    Q.forEach(function (qi) {
      var q = C.finalExam[qi], a = ans[qi] || [], want = q.opts.map(function (o, i) { return o.ok ? i : -1; }).filter(function (i) { return i >= 0; });
      var ok = a.length === want.length && want.every(function (x) { return a.indexOf(x) >= 0; });
      var t = byTopic[q.topic] = byTopic[q.topic] || { n: 0, r: 0, ref: q.ref }; t.n++; if (ok) { t.r++; right++; } else missed.push({ q: q, a: a });
    });
    var pct = Math.round(right / Q.length * 100), passed = pct >= 80;
    S.finalBest = Math.max(S.finalBest || 0, pct); S.finalPassed = S.finalPassed || passed; (S.finalAttempts = S.finalAttempts || []).push({ d: new Date().toISOString().slice(0, 10), pct: pct }); save(); renderNav();
    area.innerHTML = '';
    var c = el('div', { class: 'card' });
    c.innerHTML = '<h2>Your result: ' + pct + '% (' + right + ' of ' + Q.length + ')</h2><div class="fb ' + (passed ? 'ok' : 'bad') + '">' + (passed ? '<b class="h">Passed.</b>Well done. Keep the reference guide handy on the job, and remember the cutsheet is the final word.' : '<b class="h">Not passed yet (80% needed).</b>Review the topics marked in red below, then try again.') + '</div><h3>Results by topic</h3>';
    Object.keys(C.finalTopics).forEach(function (k) {
      var t = byTopic[k]; if (!t) return; var p = Math.round(t.r / t.n * 100);
      var lessonId = t.ref.split('#')[0];
      c.appendChild(el('div', { class: 'topic-row' + (p < 80 ? ' weak' : '') }, '<span><b>' + esc(C.finalTopics[k]) + '</b></span><span class="bar" aria-hidden="true"><i style="width:' + p + '%"></i></span><span>' + t.r + '/' + t.n + '</span><span>' + (p < 80 ? '<a href="#/lesson/' + lessonId + '">Review lesson ' + lnum(byId[lessonId]) + '</a>' : '✓') + '</span>'));
    });
    area.appendChild(c);
    if (missed.length) {
      var m = el('div', { class: 'card' }, '<h2>Questions to review (' + missed.length + ')</h2>');
      missed.forEach(function (x) {
        var correct = x.q.opts.filter(function (o) { return o.ok; }).map(function (o) { return termify(o.t) + '<div class="muted small">' + termify(o.why) + '</div>'; }).join('');
        var yours = x.a.length ? x.a.map(function (i) { return termify(x.q.opts[i].t) + '<div class="muted small">' + termify(x.q.opts[i].why || '') + '</div>'; }).join('') : '<i>No answer</i>';
        m.appendChild(el('div', { class: 'q' }, '<div class="qt">' + termify(x.q.q) + '</div><div class="fb bad"><b class="h">Your answer</b>' + yours + '</div><div class="fb ok"><b class="h">Correct answer</b>' + correct + '</div><p><a href="#/lesson/' + x.q.ref.replace('#', '/') + '">Review this in lesson ' + lnum(byId[x.q.ref.split('#')[0]]) + ' →</a></p>'));
      });
      area.appendChild(m);
    }
    var again = el('button', { type: 'button', class: 'btn' }, 'Try a new attempt'); again.addEventListener('click', function () { area.innerHTML = ''; runExam(area); window.scrollTo(0, 0); }); area.appendChild(again);
    window.scrollTo(0, 0);
  }

  function glossaryPage() {
    var w = page('<h1>Glossary</h1><p class="muted">Every term and acronym used in the course. Each entry says where its definition comes from: the guide page, a public source, or general industry meaning.</p><input class="gl-search" type="search" placeholder="Search terms (e.g. TOR, duplex, waterfall)" aria-label="Search the glossary">');
    var dl = el('dl', { class: 'gl' }); w.appendChild(dl);
    var items = C.glossary.slice().sort(function (a, b) { return a.t.toLowerCase() < b.t.toLowerCase() ? -1 : 1; });
    function draw(f) {
      f = (f || '').toLowerCase();
      dl.innerHTML = items.filter(function (g) { return !f || (g.t + ' ' + g.full + ' ' + g.d).toLowerCase().indexOf(f) >= 0; }).map(function (g) { return '<dt id="g-' + g.k + '">' + esc(g.t) + (g.full ? ' <span>— ' + esc(g.full) + '</span>' : '') + '</dt><dd>' + esc(g.d) + '<div class="s">Source: ' + esc(g.src) + '</div></dd>'; }).join('') || '<p>No matching terms.</p>';
    }
    draw(); $('.gl-search', w).addEventListener('input', function (e) { draw(e.target.value); });
  }
  function refPage(key, title, intro) {
    var R = C.reference || {};
    var w = page('<h1>' + esc(title) + '</h1>' + (intro ? '<p class="muted">' + intro + '</p>' : ''));
    var holder = el('div', null, termify(R[key] || '<p>Not available.</p>')); w.appendChild(holder);
    $$('[data-fig]', holder).forEach(function (ph) { var f = JSON.parse(ph.getAttribute('data-fig')); ph.replaceWith(figure(f)); });
    wrapTables(holder);
  }
  function drsPage() {
    var w = page('<h1>DRS sheets in this course</h1><p class="muted">Every Fluidstack DRS sheet added to this course so far: its rules in plain words, the standards it names, and where it is taught. This page is a study aid. <b>The current DRS from the portal is the requirement</b>: check its revision date, and have it on hand when you work.</p><div class="callout info"><b>Broken down, with drawings:</b> <a href=\'drs-explained/DRS_Explained.html\'>DRS Explained</a> takes every sheet below apart rule by rule (what it says, plain words, do and don\'t, why, how to check it) and shows how the sheets fit together from the tray to the device. Also as a <a href=\'drs-explained/DRS_Explained.pdf\'>PDF to print</a>.</div><input class="gl-search" type="search" placeholder="Search DRS sheets (e.g. 01.00.02, waterfall, Velcro)" aria-label="Search DRS sheets">');
    var list = el('div'); w.appendChild(list);
    var D = C.drs || [];
    function card(d) {
      var taught = d.taught.map(function (t) { return '<a href="#/lesson/' + t[0] + '/' + t[1] + '">' + esc(t[2]) + '</a>'; }).join(' · ');
      var open = (d.open || []).length ? '<p class="small"><b>Ask your lead:</b> <a href="#/open">open items ' + d.open.join(', ') + '</a></p>' : '';
      return '<div class="card drs-card" id="drs-' + d.num.replace(/\./g, '-') + '"><div class="drs-head"><span class="drs-num">DRS ' + esc(d.num) + '</span><h2>' + esc(d.title) + '</h2></div>' +
        '<p class="muted small">' + esc(d.kind) + (d.alt ? ' · ' + esc(d.alt) : '') + ' · ' + esc(d.rev) + ' · approved by ' + esc(d.appr) + ' · Fluidstack Internal Use Only</p>' +
        '<ol class="drs-rules">' + d.rules.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ol>' +
        (d.stds.length ? '<p class="small"><b>Standards named:</b> ' + d.stds.map(esc).join(', ') + '</p>' : '') +
        (d.xref.length ? '<p class="small"><b>Points to:</b> ' + d.xref.map(function (x) { return 'DRS ' + esc(x); }).join(', ') + ' (not yet in this course)</p>' : '') +
        '<p class="small"><b>Taught in:</b> ' + taught + '</p><p class="small"><b>Video:</b> ' + esc(d.video) + '</p>' + open + '<p class="small"><b>Broken down:</b> <a href="drs-explained/DRS_Explained.html#drs-' + d.num.replace(/\./g, '-') + '">DRS ' + esc(d.num) + ' rule by rule, with drawings</a></p></div>';
    }
    function draw(f) {
      f = (f || '').toLowerCase();
      var hits = D.filter(function (d) { return !f || (d.num + ' ' + d.title + ' ' + (d.alt || '') + ' ' + d.rules.join(' ') + ' ' + d.stds.join(' ')).replace(/<[^>]+>/g, '').toLowerCase().indexOf(f) >= 0; });
      list.innerHTML = (hits.length ? hits.map(card).join('') : '<p>No DRS sheet in this course matches that search.</p>') +
        '<div class="card"><h2>Referenced, but not yet in this course</h2><ul>' + (C.drsPending || []).map(function (x) { return '<li><b>DRS ' + esc(x.num) + '</b>: ' + esc(x.why) + '</li>'; }).join('') + '</ul></div>';
    }
    draw(); $('.gl-search', w).addEventListener('input', function (e) { draw(e.target.value); });
  }
  function helpPage() {
    page('<h1>How to use this course</h1>' + ((C.reference || {}).help || ''));
  }

  /* ================= router ================= */
  function route() {
    var h = location.hash || '#/';
    closePop(); closeModal();
    var parts = h.replace(/^#\/?/, '').split('/');
    if (parts[0] === 'lesson') lessonPage(parts[1], parts[2]);
    else if (parts[0] === 'videos') videosPage();
    else if (parts[0] === 'final') finalPage();
    else if (parts[0] === 'glossary') glossaryPage();
    else if (parts[0] === 'tables') refPage('tables', 'Connection tables', 'Verified connection tables and rules from the guide, for review on the job. Your site\'s cutsheet is the final word on any port. Printable copy (with glossary and checklists): <a href="../reference/Reference_Guide.pdf">Reference Guide PDF</a> · <a href="../reference/Reference_Guide.html">web page</a>.');
    else if (parts[0] === 'open') refPage('open', 'Ask your lead: open items', 'Places where the guide disagrees with itself or with the DRS, or where a detail is not given. Do not guess: bring these to your lead.');
    else if (parts[0] === 'sources') refPage('sources', 'Sources & coverage', 'Where every lesson\'s content comes from, and how each part of the guide is covered by a lesson, a visual, an activity and a video.');
    else if (parts[0] === 'help') helpPage();
    else if (parts[0] === 'drs') drsPage();
    else home();
    if (h !== '#/' && h !== '') { S.last = h.split('/').slice(0, 3).join('/'); save(); }
    setActive(h); renderNav(); setActive(h);
    main.focus({ preventScroll: true });
  }
  $('#menuBtn').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  window.addEventListener('hashchange', route);
  window.COURSE_APP = { reset: function () { S = { sections: {}, acts: {}, checks: {}, videos: {} }; save(); route(); toast('Progress reset.'); }, state: function () { return S; } };
  route();
})();
