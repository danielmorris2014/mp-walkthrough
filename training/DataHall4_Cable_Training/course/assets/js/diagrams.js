/* =====================================================================
   DG — shared diagram library for the Data Hall 4 cable course.
   Every drawing is an SVG string built from the verified facts in the
   Large Site Cable Installation Guide (Rev D / Rev C footers, 10/8/2026).
   Elements that lessons or videos point at carry data-k="key".
   Used by the HTML course and by the Hyperframes video compositions.
   ===================================================================== */
var DG = (function () {
  'use strict';

  /* ---------- palette ---------- */
  var C = {
    ink: '#1F2429', muted: '#5B6470', paper: '#F5F2EB', card: '#FFFDF8',
    rule: '#CFC8BA', steel: '#3A4048', unit: '#ECE8DF', pre: '#E2DED6',
    preTxt: '#7A818A', teal: '#0F5E63', hl: '#C2255C', fiber: '#E8C21A',
    copper: '#D9772B', mgmt: '#4A90C2', spine: '#B9A3E0', pp: '#F29AC6',
    oxide: '#A9D68C', sasl: '#A9C2DD', fu: '#6BA35A', compute: '#D9D6CF',
    spocs: '#F6A623', white: '#FFFFFF'
  };

  /* TIA-598 color code (guide p.8, p.13). Text color chosen for contrast. */
  var TIA = [
    null,
    { n: 1, name: 'Blue', hex: '#1E6FD9', txt: '#FFFFFF' },
    { n: 2, name: 'Orange', hex: '#F08C1B', txt: '#1F2429' },
    { n: 3, name: 'Green', hex: '#3E9E4F', txt: '#FFFFFF' },
    { n: 4, name: 'Brown', hex: '#7B4B26', txt: '#FFFFFF' },
    { n: 5, name: 'Slate', hex: '#7D8996', txt: '#FFFFFF' },
    { n: 6, name: 'White', hex: '#FFFFFF', txt: '#1F2429' },
    { n: 7, name: 'Red', hex: '#D62839', txt: '#FFFFFF' },
    { n: 8, name: 'Black', hex: '#1B1B1B', txt: '#FFFFFF' },
    { n: 9, name: 'Yellow', hex: '#F5D21E', txt: '#1F2429' },
    { n: 10, name: 'Violet', hex: '#7A3FA6', txt: '#FFFFFF' },
    { n: 11, name: 'Rose', hex: '#F2A6C2', txt: '#1F2429' },
    { n: 12, name: 'Aqua', hex: '#59D0D8', txt: '#1F2429' }
  ];
  /* Color for leg/position n (1-based). Positions 13-24 repeat 1-12. */
  function tia(n) { return TIA[((n - 1) % 12) + 1]; }

  var OCS_JACKET = [null,
    { n: 1, name: 'Red', hex: '#D62839', txt: '#FFFFFF' },
    { n: 2, name: 'Orange', hex: '#F08C1B', txt: '#1F2429' },
    { n: 3, name: 'Yellow', hex: '#F5D21E', txt: '#1F2429' }];

  var FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";
  var MONO = "'DejaVu Sans Mono', Consolas, Menlo, monospace";

  /* ---------- tiny SVG helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function attrs(o) { var s = ''; for (var k in o) { if (o[k] !== undefined && o[k] !== null && o[k] !== false) s += ' ' + k + '="' + esc(o[k]) + '"'; } return s; }
  function R(x, y, w, h, o) { o = o || {}; o.x = x; o.y = y; o.width = w; o.height = h; return '<rect' + attrs(o) + '/>'; }
  function T(x, y, str, o) {
    o = o || {}; o.x = x; o.y = y;
    if (!o['font-family']) o['font-family'] = FONT;
    return '<text' + attrs(o) + '>' + esc(str) + '</text>';
  }
  function L(x1, y1, x2, y2, o) { o = o || {}; o.x1 = x1; o.y1 = y1; o.x2 = x2; o.y2 = y2; return '<line' + attrs(o) + '/>'; }
  function P(d, o) { o = o || {}; o.d = d; return '<path' + attrs(o) + '/>'; }
  function G(k, inner, o) { o = o || {}; if (k) o['data-k'] = k; return '<g' + attrs(o) + '>' + inner + '</g>'; }
  function svg(w, h, inner, title, extra) {
    extra = extra || '';
    return '<svg class="dg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(title || 'diagram') + '"' + extra + '>' +
      '<title>' + esc(title || 'diagram') + '</title>' + inner + '</svg>';
  }

  /* A colored chip with a number (and optional name below). */
  function chip(x, y, w, h, n, o) {
    o = o || {};
    var c = o.color || tia(n);
    var s = R(x, y, w, h, { rx: o.rx === undefined ? 4 : o.rx, fill: c.hex, stroke: o.stroke || C.ink, 'stroke-width': o.sw || 1.5 });
    if (o.stripe) s += R(x + 3, y + h - 7, w - 6, 4, { fill: c.txt === '#FFFFFF' ? '#FFFFFF' : C.ink, opacity: 0.85 });
    if (o.label !== false) s += T(x + w / 2, y + h / 2 + (o.fs || 14) * 0.36, o.text !== undefined ? o.text : n, { 'font-size': o.fs || 14, 'font-weight': 700, fill: c.txt, 'text-anchor': 'middle' });
    if (o.name) s += T(x + w / 2, y + h + (o.nfs || 12) + 4, c.name, { 'font-size': o.nfs || 12, fill: C.ink, 'text-anchor': 'middle', 'font-weight': 600 });
    return o.k ? G(o.k, s) : s;
  }

  function arrowDefs(id, color) {
    return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + (color || C.ink) + '"/></marker></defs>';
  }

  /* A labeled box node for flow diagrams. */
  function node(n) {
    var fill = n.fill || C.card, stroke = n.stroke || C.ink;
    var s = R(n.x, n.y, n.w, n.h, { rx: n.rx || 10, fill: fill, stroke: stroke, 'stroke-width': n.sw || 2.5, 'stroke-dasharray': n.dash || null });
    var cx = n.x + n.w / 2;
    var ty = n.y + (n.sub ? n.h / 2 - 4 : n.h / 2 + 7);
    if (n.title) s += T(cx, ty, n.title, { 'font-size': n.fs || 19, 'font-weight': 700, fill: n.tc || C.ink, 'text-anchor': 'middle' });
    if (n.sub) {
      var lines = [].concat(n.sub);
      for (var i = 0; i < lines.length; i++) s += T(cx, ty + 24 + i * 19, lines[i], { 'font-size': n.sfs || 15, fill: n.sc || C.muted, 'text-anchor': 'middle' });
    }
    return G(n.k, s);
  }

  /* Rack outline with a header label, used by overview-style drawings. */
  function rackIcon(x, y, w, h, title, sub, k, o) {
    o = o || {};
    var s = R(x, y, w, h, { rx: 10, fill: C.card, stroke: C.ink, 'stroke-width': 3 });
    var units = o.units || 10, uh = (h - 24) / units;
    for (var i = 0; i < units; i++) s += R(x + 12, y + 12 + i * uh, w - 24, uh - 5, { rx: 2, fill: o.unitFill || C.unit, stroke: '#B8B1A3' });
    if (o.bar) s += R(x + 12, y + 12, w - 24, uh - 5, { rx: 2, fill: o.bar, stroke: C.ink });
    if (o.titleBelow) s += T(x + w / 2, y + h + 26, title, { 'font-size': 19, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
    else s += T(x + w / 2, y - 14, title, { 'font-size': 19, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
    if (sub) s += T(x + w / 2, y + h + (o.titleBelow ? 48 : 24), sub, { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return G(k, s);
  }

  /* =====================================================================
     1. OVERVIEW — the five cable paths you install (guide p.4)
     ===================================================================== */
  function overview(o) {
    o = o || {};
    var s = arrowDefs('ovA');
    s += rackIcon(40, 150, 150, 300, 'TPU RACK', 'where you start', 'n-tpu', { units: 12 });
    s += rackIcon(400, 150, 150, 300, 'EOR / AIO RACK', null, 'n-aio', { units: 12 });
    s += rackIcon(740, 130, 150, 190, 'DCN PATCH PANEL', 'network rows 1-2', 'n-dcnpp', { units: 7 });
    s += rackIcon(1020, 130, 150, 190, 'DCN SPINE', 'trunks end here', 'n-spine', { units: 7 });
    s += rackIcon(400, 540, 150, 130, 'SPOCS RACKS', '3 per pod', 'n-spocs', { units: 5, bar: C.spocs, titleBelow: true });
    s += rackIcon(1020, 520, 150, 170, 'MGMT SPINE', 'network rows', 'n-mgmt', { units: 6 });
    // paths
    s += G('p-144', P('M190 200 L400 200', { stroke: C.fiber, 'stroke-width': 9, fill: 'none' }) +
      T(295, 186, '144F TRUNK', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
      T(295, 226, '1 per TPU rack', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted }));
    s += G('p-cu', P('M190 300 L400 300', { stroke: C.copper, 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '14 6' }) +
      T(295, 286, '6 CAT6 COPPER RUNS', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('p-192', P('M550 190 L740 190', { stroke: C.fiber, 'stroke-width': 11, fill: 'none' }) +
      T(645, 176, '8 × 192F TRUNKS', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
      T(645, 216, '1 per DCN-PP (A-H)', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted }));
    s += G('p-mpo', P('M890 210 L1020 210', { stroke: C.fiber, 'stroke-width': 6, fill: 'none' }) +
      T(955, 196, 'MPO CORDS', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    var oc = [OCS_JACKET[1].hex, OCS_JACKET[2].hex, OCS_JACKET[3].hex];
    var ocs = '';
    for (var i = 0; i < 3; i++) ocs += P('M190 ' + (395 + i * 14) + ' C 300 ' + (395 + i * 14) + ', 300 ' + (585 + i * 18) + ', 400 ' + (585 + i * 18), { stroke: oc[i], 'stroke-width': 7, fill: 'none' });
    s += G('p-ocs', ocs + T(196, 520, '3 OCS CABLES (18F)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
      T(196, 540, 'red · orange · yellow', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted }));
    s += G('p-mgmt', P('M550 400 C 760 400, 820 600, 1020 600', { stroke: C.mgmt, 'stroke-width': 6, fill: 'none' }) +
      T(800, 470, '12F / 24F MGMT TRUNKS', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('p-smgmt', P('M475 540 L475 452', { stroke: C.mgmt, 'stroke-width': 5, fill: 'none', 'stroke-dasharray': '8 6' }) +
      T(490, 478, 'SPOCS MGMT CORDS', { 'font-size': 14, 'font-weight': 700, fill: C.ink }) +
      T(490, 496, '(to EOR w/BMS)', { 'font-size': 12, fill: C.muted }));
    return svg(1200, 740, s, 'The five cable paths your crew installs');
  }

  /* =====================================================================
     2. TPU RACK — Ironwood TPU rack, sides A and B (guide p.12)
     ===================================================================== */
  function tpuRack(o) {
    o = o || {};
    var s = '';
    function face(x, side) {
      var g = '', y = 60, w = 300;
      g += R(x, y, w, 720, { rx: 8, fill: '#F0EDE6', stroke: C.steel, 'stroke-width': 4 });
      g += T(x + w / 2, y - 18, 'SIDE "' + side + '"', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
      var cy = y + 12;
      for (var r = 3; r >= 1; r--) {
        g += G('rect-' + side.toLowerCase() + r, R(x + 12, cy, w - 24, 26, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) +
          T(x + w / 2, cy + 18, 'RECTIFIER ' + r, { 'font-size': 12, fill: C.preTxt, 'text-anchor': 'middle' }));
        cy += 30;
      }
      if (side === 'A') {
        var tor = R(x + 10, cy, w - 20, 44, { rx: 3, fill: C.white, stroke: C.ink, 'stroke-width': 3 });
        for (var i = 1; i <= 16; i++) tor += R(x + 18 + (i - 1) * 14.5, cy + 8, 11, 14, { fill: tia(i).hex, stroke: C.ink, 'stroke-width': 0.8 });
        tor += R(x + w - 44, cy + 6, 12, 18, { rx: 2, fill: '#7CC36B', stroke: C.ink, 'stroke-width': 1.2 }) + R(x + w - 28, cy + 6, 12, 18, { rx: 2, fill: C.copper, stroke: C.ink, 'stroke-width': 1.2 }) +
          T(x + w - 30, cy + 38, 'ETH · CON', { 'font-size': 10, fill: C.muted, 'text-anchor': 'middle' });
        tor += T(x + 18, cy + 38, 'TOR SWITCH', { 'font-size': 12, 'font-weight': 700, fill: C.ink });
        g += G('tor', tor);
      } else {
        g += G('blank-b', R(x + 12, cy, w - 24, 44, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) +
          T(x + w / 2, cy + 27, 'BLANK', { 'font-size': 12, fill: C.preTxt, 'text-anchor': 'middle' }));
      }
      cy += 50;
      var rmuK = side === 'A' ? 'rmu1' : 'rmu2';
      g += G(rmuK, R(x + 10, cy, w - 20, 40, { rx: 3, fill: C.white, stroke: C.ink, 'stroke-width': 3 }) +
        R(x + 22, cy + 8, 16, 14, { fill: C.copper, stroke: C.ink }) + R(x + w - 40, cy + 8, 16, 14, { fill: '#7CC36B', stroke: C.ink }) +
        T(x + w / 2, cy + 30, 'TROSS / ' + (side === 'A' ? 'RMU1' : 'RMU2'), { 'font-size': 12, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }));
      cy += 46;
      var pp = R(x + 10, cy, w - 20, 44, { rx: 3, fill: C.white, stroke: C.ink, 'stroke-width': 3 });
      for (var p = 0; p < 12; p++) {
        var port = side === 'A' ? p + 1 : p + 13;
        var col = tia(((port - 1) % 8) + 1);
        pp += R(x + 20 + p * 22, cy + 7, 17, 16, { fill: col.hex, stroke: C.ink, 'stroke-width': 0.8 });
      }
      pp += T(x + w / 2, cy + 38, 'OCS PANEL (pp1) · ports ' + (side === 'A' ? '1-12' : '13-24'), { 'font-size': 12, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
      g += G('pp1-' + side.toLowerCase(), pp);
      cy += 52;
      var trays = '';
      for (var t = 0; t < 8; t++) {
        trays += R(x + 12, cy + t * 54, w - 24, 48, { rx: 3, fill: C.pre, stroke: '#B8B1A3' });
        for (var b = 0; b < 3; b++) trays += R(x + 22 + b * 88, cy + t * 54 + 7, 78, 34, { rx: 2, fill: '#ECEAE4', stroke: '#C9C3B6' });
      }
      trays += R(x + 40, cy + 4 * 54 - 22, w - 80, 30, { rx: 4, fill: '#F0EDE6', stroke: '#B8B1A3' }) + T(x + w / 2, cy + 4 * 54 - 2, 'MACHINE TRAYS (pre-installed)', { 'font-size': 13, 'font-weight': 700, fill: C.preTxt, 'text-anchor': 'middle' });
      g += G('trays-' + side.toLowerCase(), trays);
      cy += 8 * 54 + 4;
      g += G('batt-' + side.toLowerCase(), R(x + 12, cy, w - 24, 40, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) +
        T(x + w / 2, cy + 25, 'BATTERIES', { 'font-size': 12, fill: C.preTxt, 'text-anchor': 'middle' }));
      return g;
    }
    s += face(40, 'A') + face(420, 'B');
    s += T(380, 815, 'Black outline = yours to connect.  Grey = pre-installed: leave it alone.', { 'font-size': 15, fill: C.muted, 'text-anchor': 'middle' });
    return svg(760, 830, s, 'Ironwood TPU rack, side A and side B');
  }

  /* =====================================================================
     3. TOR SWITCH — Arista 7060, 16 odd ports used (guide p.13)
     opts: legs:[1..16] which legs are plugged, wrong:{leg:port}, hideEven
     ===================================================================== */
  function torSwitch(o) {
    o = o || {};
    var legs = o.legs || [];
    var legAt = {};           // port -> leg
    for (var i = 0; i < legs.length; i++) legAt[2 * legs[i] - 1] = legs[i];
    if (o.place) for (var pk in o.place) legAt[pk] = o.place[pk];
    var s = '';
    var X0 = 140, Y0 = 70, CW = 62, GAP = 7;
    s += R(X0 - 20, Y0 - 30, 16 * (CW + GAP) + 150, 220, { rx: 10, fill: '#E6E8EA', stroke: C.steel, 'stroke-width': 4 });
    s += T(X0 - 8, Y0 - 8, 'ARISTA 7060 · TOR SWITCH', { 'font-size': 14, 'font-weight': 700, fill: C.steel });
    for (var c = 0; c < 16; c++) {
      var x = X0 + c * (CW + GAP);
      var odd = 2 * c + 1, even = 2 * c + 2;
      var g = R(x, Y0 + 6, CW, 156, { rx: 6, fill: '#F7F7F5', stroke: '#9AA1A8', 'stroke-width': 1.5 });
      // odd (top)
      var top = R(x + 6, Y0 + 14, CW - 12, 58, { rx: 4, fill: '#FFFFFF', stroke: C.ink, 'stroke-width': 2 }) +
        T(x + CW / 2, Y0 + 34, odd, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO });
      if (legAt[odd]) {
        var lg = legAt[odd];
        top += chip(x + 10, Y0 + 40, CW - 20, 26, lg, { fs: 14, stripe: lg > 12 });
      } else {
        top += T(x + CW / 2, Y0 + 60, '▲', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted });
      }
      g += G('p' + odd, top);
      // even (bottom) — pre-installed to machines
      var bot = R(x + 6, Y0 + 96, CW - 12, 58, { rx: 4, fill: C.pre, stroke: '#A39C8E', 'stroke-width': 1.5 }) +
        T(x + CW / 2, Y0 + 118, even, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.preTxt, 'font-family': MONO });
      if (legAt[even]) bot += chip(x + 10, Y0 + 124, CW - 20, 26, legAt[even], { fs: 14, stripe: legAt[even] > 12 });
      else bot += T(x + CW / 2, Y0 + 142, '▼', { 'font-size': 14, 'text-anchor': 'middle', fill: C.preTxt });
      g += G('p' + even, bot);
      s += G('cage-' + (c + 1), g);
    }
    var ex = X0 + 16 * (CW + GAP) + 8;
    s += G('eth', R(ex, Y0 + 20, 44, 40, { rx: 4, fill: '#7CC36B', stroke: C.ink, 'stroke-width': 2 }) + T(ex + 22, Y0 + 45, 'ETH', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('con', R(ex, Y0 + 90, 44, 40, { rx: 4, fill: C.copper, stroke: C.ink, 'stroke-width': 2 }) + T(ex + 22, Y0 + 115, 'CON', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += T(ex + 22, Y0 + 150, 'copper', { 'font-size': 11, 'text-anchor': 'middle', fill: C.muted });
    // row labels
    s += G('row-top', T(X0 - 30, Y0 + 50, 'ODD', { 'font-size': 13, 'font-weight': 700, fill: C.ink, 'text-anchor': 'end' }) + T(X0 - 30, Y0 + 66, 'top row', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' }));
    s += G('row-bottom', T(X0 - 30, Y0 + 130, 'EVEN', { 'font-size': 13, 'font-weight': 700, fill: C.preTxt, 'text-anchor': 'end' }) + T(X0 - 30, Y0 + 146, 'to machines', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' }));
    if (o.spares !== false) {
      s += G('spares', chip(X0, Y0 + 230, 40, 28, 17, {}) + chip(X0 + 48, Y0 + 230, 40, 28, 18, {}) +
        T(X0 + 100, Y0 + 250, 'Legs 17 and 18: spares. Not plugged in at the TOR. Dressed off the floor.', { 'font-size': 15, fill: C.ink }));
    }
    return svg(1420, 350, s, 'TOR switch: odd ports on top are yours');
  }

  /* =====================================================================
     4. 144F TRUNK BREAKOUT — 18 MPO-8 legs (guide p.12-13, p.46)
     ===================================================================== */
  function trunk144(o) {
    o = o || {};
    var s = '', n = o.legs || 18, fs = 15;
    var top = 34, sp = 24, jy = top + (n - 1) * sp / 2;
    s += G('jacket', R(30, jy - 14, 420, 28, { rx: 14, fill: C.fiber, stroke: C.ink, 'stroke-width': 2 }) +
      T(240, jy + 6, o.jacketText || '144F TRUNK  ·  144 fibers', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('split', R(450, jy - 20, 44, 40, { rx: 6, fill: C.ink }) + T(472, jy + 46, 'split point', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted }));
    for (var i = 1; i <= n; i++) {
      var y = top + (i - 1) * sp;
      var c = tia(i);
      var g = P('M494 ' + jy + ' C 600 ' + jy + ', 620 ' + y + ', 720 ' + y, { stroke: C.fiber, 'stroke-width': 3, fill: 'none' });
      g += R(720, y - 9, 34, 18, { rx: 3, fill: '#2F3338' });
      g += chip(754, y - 10, 46, 20, i, { fs: 12, stripe: i > 12 });
      g += T(810, y + 5, 'Leg ' + i + ' · ' + c.name + (i > 12 ? ' (2nd round)' : '') + (i >= 17 && o.spareNote !== false ? '  — SPARE' : ''), { 'font-size': 13, fill: i >= 17 ? C.hl : C.ink, 'font-weight': i >= 17 ? 700 : 400 });
      s += G('leg-' + i, g);
    }
    s += T(30, jy + 58, '18 legs × 8 fibers each = 144 fibers', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    s += T(30, jy + 80, '16 legs used (128 fibers) + 2 spare legs', { 'font-size': 15, fill: C.muted });
    return svg(1100, top + n * sp + 10, s, '144-fiber trunk breaking out into 18 MPO legs');
  }

  /* =====================================================================
     5. TIA-598 COLOR STRIP
     ===================================================================== */
  function colorStrip(o) {
    o = o || {};
    var from = o.from || 1, to = o.to || 12, w = o.w || 84, h = 46, s = '';
    var count = to - from + 1;
    for (var i = 0; i < count; i++) {
      var n = from + i;
      s += G('col-' + n, chip(10 + i * (w + 8), 24, w, h, n, { fs: 20, name: true, nfs: 14, stripe: n > 12 }));
    }
    if (o.caption) s += T(10, 16, o.caption, { 'font-size': 14, 'font-weight': 700, fill: C.muted });
    return svg(20 + count * (w + 8), h + 64, s, 'TIA-598 fiber color code ' + from + ' to ' + to);
  }

  /* =====================================================================
     6. CONNECTOR GALLERY — MPO-8, LC duplex APC, RJ45, keystone jack
     ===================================================================== */
  function connectors(o) {
    var s = '';
    // MPO-8
    var m = R(40, 70, 190, 90, { rx: 10, fill: '#2F3338' }) + R(70, 92, 130, 46, { rx: 6, fill: '#C9CED3', stroke: C.ink });
    for (var i = 0; i < 8; i++) m += '<circle cx="' + (84 + i * 15) + '" cy="115" r="4.5" fill="' + tia(i + 1).hex + '" stroke="#1F2429" stroke-width="1"/>';
    m += R(230, 100, 70, 30, { rx: 4, fill: '#2F3338' }) + R(300, 108, 60, 14, { fill: C.fiber });
    m += T(195, 200, 'MPO-8 plug', { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    m += T(195, 222, '8 fibers in one plug', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    m += T(195, 242, '144F / 192F trunk legs', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    s += G('mpo', m);
    // LC duplex APC
    var lc = R(430, 82, 46, 66, { rx: 5, fill: '#3E9E4F', stroke: C.ink, 'stroke-width': 2 }) + R(484, 82, 46, 66, { rx: 5, fill: '#3E9E4F', stroke: C.ink, 'stroke-width': 2 }) +
      R(424, 76, 112, 12, { rx: 4, fill: '#2C7A3B' }) + R(536, 102, 60, 26, { rx: 5, fill: '#2F3338' }) + R(596, 108, 50, 14, { fill: C.fiber }) +
      '<circle cx="453" cy="130" r="5" fill="#fff" stroke="#1F2429"/><circle cx="507" cy="130" r="5" fill="#fff" stroke="#1F2429"/>';
    lc += T(510, 200, 'LC duplex (APC)', { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    lc += T(510, 222, '2 fibers · angled end face', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    lc += T(510, 242, 'OCS legs, mgmt cords', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    s += G('lc', lc);
    // RJ45 plug
    var rj = R(730, 80, 90, 70, { rx: 6, fill: '#E9F1F5', stroke: C.ink, 'stroke-width': 2, opacity: 0.95 });
    for (var p = 0; p < 8; p++) rj += R(742 + p * 9.5, 86, 6, 18, { fill: '#D4A82A' });
    rj += R(752, 128, 46, 10, { rx: 3, fill: '#C5D6DE', stroke: C.ink }) + R(820, 100, 70, 30, { rx: 6, fill: C.copper }) + R(890, 106, 50, 18, { fill: C.copper });
    rj += T(800, 200, 'RJ45 plug (CAT6)', { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    rj += T(800, 222, 'square copper plug, 8 pins', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    rj += T(800, 242, 'TPU end of copper runs', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    s += G('rj45', rj);
    // jack
    var jk = R(1010, 70, 110, 90, { rx: 6, fill: '#2F3338' }) + R(1030, 92, 70, 50, { rx: 4, fill: '#111' }) + R(1050, 92, 30, 8, { fill: '#2F3338' });
    for (var q = 0; q < 8; q++) jk += R(1036 + q * 7.5, 128, 4, 12, { fill: '#D4A82A' });
    jk += T(1065, 200, 'Jack (panel socket)', { 'font-size': 19, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    jk += T(1065, 222, 'home run ends here', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    jk += T(1065, 242, 'EOR copper panel', { 'font-size': 15, 'text-anchor': 'middle', fill: C.muted });
    s += G('jack', jk);
    return svg(1180, 270, s, 'Connector types: MPO-8, LC duplex APC, RJ45 plug, jack');
  }

  /* =====================================================================
     7. HALL MAP — Data Hall 4, Large (guide p.5, p.33)
     opts.show: 'all' | highlights done via keys
     ===================================================================== */
  var NET1 = ['Oxide', 'Oxide', 'Oxide', 'SASL', 'Spine', 'Spine', 'PP A-N', 'PP A-S', 'Spine', 'Spine', 'Oxide', 'Spine', 'Spine', 'PP B-N', 'PP B-S', 'Spine', 'Spine', 'Spine', 'Spine', 'PP C-N', 'PP C-S', 'Spine', 'Spine', 'Oxide', 'Spine', 'Spine', 'PP D-N', 'PP D-S', 'Spine', 'Spine', 'MGMT', 'Oxide', 'Oxide', 'Oxide'];
  var NET2 = ['Oxide', 'Oxide', 'Oxide', 'MGMT', 'Spine', 'Spine', 'PP E-N', 'PP E-S', 'Spine', 'Spine', 'FU', 'Spine', 'Spine', 'PP F-N', 'PP F-S', 'Spine', 'Spine', 'Spine', 'Spine', 'PP G-N', 'PP G-S', 'Spine', 'Spine', 'Oxide', 'Spine', 'Spine', 'PP H-N', 'PP H-S', 'Spine', 'Spine', 'SASL', 'Oxide', 'Oxide', 'Oxide'];
  function netColor(t) {
    if (t === 'Spine') return C.spine; if (t.indexOf('PP') === 0) return C.pp; if (t === 'Oxide') return C.oxide;
    if (t === 'SASL') return C.sasl; if (t === 'FU') return C.fu; return C.white;
  }
  var SPOCS = { 5: 'P10 OCS1', 6: 'P10 OCS2', 7: 'P10 OCS3', 13: 'P11 OCS1', 14: 'P11 OCS2', 15: 'P11 OCS3', 21: 'P12 OCS1', 22: 'P12 OCS2', 23: 'P12 OCS3' };
  var BMS_ROWS = { 6: 1, 14: 1, 22: 1 };
  function hallMap(o) {
    o = o || {};
    var s = '';
    var top = 70, uh = 25.5;
    // network rows
    s += T(50, 30, 'NETWORK', { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(50, 46, 'ROWS 1-2', { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    var net = '';
    for (var r = 0; r < 2; r++) {
      var list = r === 0 ? NET1 : NET2, nx = 14 + r * 40;
      net += T(nx + 17, top - 6, 'R' + (r + 1), { 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', fill: C.muted });
      for (var i = 0; i < 34; i++) {
        var id = (r + 1) * 100 + i + 1, t = list[i];
        net += G('r-' + id, R(nx, top + i * 22.4, 34, 20, { rx: 2, fill: netColor(t), stroke: '#6E6A62', 'stroke-width': 0.8 }) +
          T(nx + 17, top + i * 22.4 + 14, id, { 'font-size': 9, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
      }
    }
    s += G('net', net);
    // compute rows 3..26
    var x0 = 120, cw = 40, gapHot = 4, gapCold = 12;
    var colX = {};
    var x = x0;
    for (var row = 3; row <= 26; row++) { colX[row] = x; x += cw + (row % 2 === 1 ? gapHot : gapCold); }
    // middle aisle band (drawn first so racks sit on top)
    var ay0 = top + 20 + 9 * uh + 26;
    s += G('aisle', R(colX[3] - 4, ay0 + 1, colX[26] + cw - colX[3] + 8, 54, { fill: '#E3EBF1' }) +
      T(colX[8] + 18, ay0 + 26, 'MIDDLE AISLE', { 'font-size': 13, 'font-weight': 700, fill: '#3F5E73' }) +
      T(colX[8] + 18, ay0 + 42, 'SPOCS racks at spot 12', { 'font-size': 11, fill: '#3F5E73' }));
    // pods
    var pods = [[10, 3, 10, '#1E6FD9'], [11, 11, 18, '#3E9E4F'], [12, 19, 26, '#F08C1B']];
    for (var pi = 0; pi < 3; pi++) {
      var pd = pods[pi], px1 = colX[pd[1]] - 5, px2 = colX[pd[2]] + cw + 5;
      s += G('pod-' + pd[0], R(px1, top - 26, px2 - px1, 790, { rx: 8, fill: 'none', stroke: pd[3], 'stroke-width': 3, 'stroke-dasharray': '10 5' }) +
        T(px1 + 8, top - 10, 'POD ' + pd[0], { 'font-size': 15, 'font-weight': 700, fill: pd[3] }));
    }
    for (var rw = 3; rw <= 26; rw++) {
      var cx = colX[rw], col = '';
      col += T(cx + cw / 2, top + 776, 'Row ' + rw, { 'font-size': 10, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
      var y = top;
      col += R(cx, y, cw, 16, { fill: '#F3F1EC', stroke: '#B8B1A3', 'stroke-width': 0.6 }) + T(cx + cw / 2, y + 12, 'CDU', { 'font-size': 8, 'text-anchor': 'middle', fill: C.muted });
      y += 20;
      for (var sp = 2; sp <= 10; sp++) {
        var id2 = rw * 100 + sp;
        col += G('r-' + id2, R(cx, y, cw, uh - 3, { rx: 2, fill: C.compute, stroke: '#8E897F', 'stroke-width': 0.7 }) + stripes(cx, y, cw) +
          T(cx + cw / 2, y + 15, id2, { 'font-size': 9, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
        y += uh;
      }
      var eid = rw * 100 + 11;
      col += G('r-' + eid, R(cx, y, cw, 22, { rx: 2, fill: BMS_ROWS[rw] ? '#FFF3C4' : C.white, stroke: C.ink, 'stroke-width': 1.4 }) +
        T(cx + cw / 2, y + 10, BMS_ROWS[rw] ? 'EOR bms' : 'EOR', { 'font-size': 7.5, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
        T(cx + cw / 2, y + 19, eid, { 'font-size': 8, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
      y += 26;
      // middle aisle with SPOCS
      if (SPOCS[rw]) {
        var sid = rw * 100 + 12;
        col += G('r-' + sid, R(cx, y + 6, cw, 44, { rx: 3, fill: C.spocs, stroke: C.ink, 'stroke-width': 1.4 }) +
          T(cx + cw / 2, y + 22, SPOCS[rw].split(' ')[0], { 'font-size': 8, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
          T(cx + cw / 2, y + 32, SPOCS[rw].split(' ')[1], { 'font-size': 8, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
          T(cx + cw / 2, y + 44, sid, { 'font-size': 8, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
      }
      y += 56;
      var eid2 = rw * 100 + 13;
      col += G('r-' + eid2, R(cx, y, cw, 22, { rx: 2, fill: BMS_ROWS[rw] ? '#FFF3C4' : C.white, stroke: C.ink, 'stroke-width': 1.4 }) +
        T(cx + cw / 2, y + 10, BMS_ROWS[rw] ? 'EOR bms' : 'EOR', { 'font-size': 7.5, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
        T(cx + cw / 2, y + 19, eid2, { 'font-size': 8, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
      y += 26;
      for (var sp2 = 14; sp2 <= 22; sp2++) {
        var id3 = rw * 100 + sp2;
        col += G('r-' + id3, R(cx, y, cw, uh - 3, { rx: 2, fill: C.compute, stroke: '#8E897F', 'stroke-width': 0.7 }) + stripes(cx, y, cw) +
          T(cx + cw / 2, y + 15, id3, { 'font-size': 9, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO }));
        y += uh;
      }
      col += R(cx, y + 2, cw, 16, { fill: '#F3F1EC', stroke: '#B8B1A3', 'stroke-width': 0.6 }) + T(cx + cw / 2, y + 14, 'CDU', { 'font-size': 8, 'text-anchor': 'middle', fill: C.muted });
      s += G('row-' + rw, col);
    }
    // compass note
    s += T(x0, top + 800, 'West end (left) = network rows.  Rows run left to right; spots count down each row.  Striped grey = TPU rack.', { 'font-size': 13, fill: C.muted });
    return svg(1300, top + 815, s, 'Data Hall 4 floor plan (Large): pods 10, 11, 12');
  }
  function stripes(x, y, w) {
    // the six cable groups a TPU rack has (map legend): 144F, OCS R/O/Y, GigE, Con
    var cols = ['#33C759', '#D62839', '#F08C1B', '#F5D21E', '#4FB7F0', '#1D6FB8'];
    var s = '';
    for (var i = 0; i < 6; i++) s += R(x + 2 + i * 3, y + 2, 2.4, 6, { fill: cols[i] });
    return s;
  }

  /* =====================================================================
     8. NETWORK ROWS 1 AND 2 (guide p.44)
     ===================================================================== */
  function networkRows(o) {
    o = o || {};
    var s = '', w = 37, h = 118;
    for (var r = 0; r < 2; r++) {
      var list = r === 0 ? NET1 : NET2, y = 40 + r * 170;
      s += T(8, y + h / 2 + 6, 'Row ' + (r + 1), { 'font-size': 15, 'font-weight': 700, fill: C.ink });
      for (var i = 0; i < 34; i++) {
        var id = (r + 1) * 100 + i + 1, t = list[i], x = 70 + i * w;
        var g = R(x, y, w - 3, h, { rx: 3, fill: netColor(t), stroke: '#6E6A62', 'stroke-width': 1 });
        g += T(x + (w - 3) / 2, y + 16, String(id), { 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink, 'font-family': MONO });
        g += '<text x="' + (x + (w - 3) / 2 + 4) + '" y="' + (y + 30) + '" font-size="12" font-family="' + FONT + '" font-weight="600" fill="' + C.ink + '" transform="rotate(90 ' + (x + (w - 3) / 2 + 4) + ' ' + (y + 30) + ')">' + esc(t) + '</text>';
        s += G('R' + id, g);
      }
    }
    var lg = [['Spine (DCN)', C.spine], ['DCN-PP (passive)', C.pp], ['MGMT spine', C.white], ['Oxide', C.oxide], ['SASL', C.sasl], ['FU', C.fu]];
    for (var k = 0; k < lg.length; k++) s += R(70 + k * 205, 360, 22, 22, { fill: lg[k][1], stroke: C.ink }) + T(100 + k * 205, 377, lg[k][0], { 'font-size': 14, fill: C.ink });
    return svg(1340, 395, s, 'Network rows 1 and 2');
  }

  /* =====================================================================
     9. LOCATION CODE — SITE-DH4-R05 12 (guide p.5)
     ===================================================================== */
  function locationCode(o) {
    o = o || {};
    var parts = o.parts || [['SITE', 'site', '#1E6FD9'], ['DH4', 'hall 4', '#1F2429'], ['R05', 'row 5', '#0F7C80'], ['12', 'spot 12', '#3E9E4F']];
    var s = '', x = 20;
    for (var i = 0; i < parts.length; i++) {
      var w = 170;
      s += G('lc-' + i, R(x, 30, w, 80, { rx: 6, fill: parts[i][2] }) + T(x + w / 2, 84, parts[i][0], { 'font-size': 38, 'font-weight': 700, 'text-anchor': 'middle', fill: '#FFFFFF', 'font-family': MONO }) +
        T(x + w / 2, 140, parts[i][1], { 'font-size': 20, 'text-anchor': 'middle', fill: C.ink, 'font-weight': 600 }));
      x += w + 18;
    }
    return svg(x + 10, 160, s, 'Reading a rack location code');
  }

  /* =====================================================================
     10. OCS PANEL pp1 — ports 1-24 across sides A and B (guide p.15)
     opts.plugged: true -> draw cable tags; opts.wrong: {port: legLabel}
     ===================================================================== */
  function ocsPanel(o) {
    o = o || {};
    var s = '', pw = 38, ph = 46, y = 150;
    var panels = [[40, 1, 'SIDE "A"'], [640, 13, 'SIDE "B"']];
    for (var p = 0; p < 2; p++) {
      var px = panels[p][0], start = panels[p][1];
      s += G('side-' + (p === 0 ? 'a' : 'b'), R(px, y - 14, 540, ph + 28, { rx: 6, fill: '#F7F7F5', stroke: C.steel, 'stroke-width': 3 }) +
        T(px, y + ph + 40, panels[p][2] + '  ·  ports ' + start + '-' + (start + 11), { 'font-size': 14, 'font-weight': 700, fill: C.muted }));
      for (var i = 0; i < 12; i++) {
        var port = start + i;
        var gx = px + 14 + i * 43 + (i >= 8 && p === 0 ? 8 : 0) + (i >= 4 && p === 1 ? 8 : 0);
        var pos = ((port - 1) % 8) + 1;
        var lbl = o.wrong && o.wrong[port] !== undefined ? o.wrong[port] : port;
        var color = o.wrongColor && o.wrongColor[port] ? tia(o.wrongColor[port]) : tia(pos);
        s += G('pp-' + port, chip(gx, y, pw, ph, port, { color: o.empty ? { hex: '#FFFFFF', txt: C.ink } : color, fs: 15, text: o.empty ? port : lbl }));
      }
    }
    if (o.groups !== false) {
      var tags = [[1, 8, 1], [9, 16, 2], [17, 24, 3]];
      for (var t = 0; t < 3; t++) {
        var a = portX(tags[t][0]), b = portX(tags[t][1]) + pw;
        var jc = OCS_JACKET[tags[t][2]];
        var g = P('M' + a + ' ' + (y - 24) + ' L' + a + ' ' + (y - 34) + ' L' + b + ' ' + (y - 34) + ' L' + b + ' ' + (y - 24), { stroke: C.ink, 'stroke-width': 2, fill: 'none' });
        var mid = (a + b) / 2;
        g += R(mid - 92, y - 96, 184, 50, { rx: 6, fill: jc.hex, stroke: C.ink, 'stroke-width': 2 });
        g += T(mid, y - 76, 'OCS ' + tags[t][2] + ' · ' + jc.name.toUpperCase(), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: jc.txt });
        g += T(mid, y - 56, 'ports ' + tags[t][0] + '-' + tags[t][1] + ' · spare = leg 9', { 'font-size': 13, 'text-anchor': 'middle', fill: jc.txt });
        s += G('g' + tags[t][2], g);
      }
    }
    return svg(1220, 270, s, 'OCS panel pp1, ports 1 to 24');
    function portX(port) {
      var p0 = port <= 12 ? 0 : 1, i0 = port <= 12 ? port - 1 : port - 13;
      return panels[p0][0] + 14 + i0 * 43 + (i0 >= 8 && p0 === 0 ? 8 : 0) + (i0 >= 4 && p0 === 1 ? 8 : 0);
    }
  }

  /* =====================================================================
     11. OCS CABLE — 18F Type B, 9 LC/APC legs each end (guide p.20)
     ===================================================================== */
  function ocsCable(o) {
    o = o || {};
    var cable = o.cable || 2, jc = OCS_JACKET[cable], base = (cable - 1) * 8;
    var s = '', top = 50, sp = 34, jy = top + 4 * sp;
    s += T(110, 28, 'TPU RACK END', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    s += T(1090, 28, 'SPOCS RACK END', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    s += G('jacket', R(380, jy - 14, 440, 28, { rx: 6, fill: jc.hex, stroke: C.ink, 'stroke-width': 2 }) + R(330, jy - 16, 50, 32, { rx: 4, fill: C.ink }) + R(820, jy - 16, 50, 32, { rx: 4, fill: C.ink }) +
      T(600, jy + 6, 'OCS ' + cable + ' · ' + jc.name.toUpperCase() + ' JACKET · 18 fibers', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: jc.txt }));
    for (var i = 1; i <= 9; i++) {
      var y = top + (i - 1) * sp, spare = i === 9;
      var c = tia(i), lbl = spare ? 'SPARE' : String(base + i);
      var gl = P('M330 ' + jy + ' C 260 ' + jy + ', 250 ' + y + ', 190 ' + y, { stroke: C.fiber, 'stroke-width': 3, fill: 'none' }) +
        '<g data-ringbox="1">' + R(50, y - 13, 26, 26, { rx: 4, fill: '#3E9E4F', stroke: C.ink }) + chip(76, y - 14, 92, 28, i, { color: c, text: lbl, fs: 14 }) + R(168, y - 6, 22, 12, { fill: '#2F3338' }) + '</g>';
      s += G('legL-' + i, gl);
      var gr = P('M870 ' + jy + ' C 940 ' + jy + ', 950 ' + y + ', 1010 ' + y, { stroke: C.fiber, 'stroke-width': 3, fill: 'none' }) +
        '<g data-ringbox="1">' + R(1010, y - 6, 22, 12, { fill: '#2F3338' }) + chip(1032, y - 14, 92, 28, i, { color: c, text: lbl, fs: 14 }) + R(1124, y - 13, 26, 26, { rx: 4, fill: '#3E9E4F', stroke: C.ink }) + '</g>';
      s += G('legR-' + i, gr);
    }
    s += T(600, jy + 80, 'Leg label = the OCS panel (pp1) port it plugs into.  Position 9 (yellow) = spare.', { 'font-size': 15, 'text-anchor': 'middle', fill: C.ink });
    s += T(600, jy + 102, 'Green ends = LC/APC connectors (2 fibers each).', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted });
    return svg(1200, top + 9 * sp + 30, s, 'OCS cable ' + cable + ' assembly');
  }

  /* =====================================================================
     12. SPOCS RACK — 4 OCS shelves, slot 1 on top (guide p.19, p.21)
     opts.legs: true -> show one OCS bundle patched with leg lengths
     ===================================================================== */
  function spocsRack(o) {
    o = o || {};
    var s = '', x = o.legs ? 360 : 140, y = 90, w = 300;
    s += R(x, y, w, 690, { rx: 12, fill: '#F0EDE6', stroke: C.steel, 'stroke-width': 4 });
    var cy = y + 12;
    s += G('power', R(x + 12, cy, w - 24, 30, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 20, 'POWER', { 'font-size': 12, fill: C.preTxt, 'text-anchor': 'middle' }));
    cy += 34;
    s += R(x + 12, cy, w - 24, 34, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 22, 'BLANK', { 'font-size': 12, fill: C.preTxt, 'text-anchor': 'middle' });
    cy += 40;
    var slotY = {};
    for (var sl = 1; sl <= 4; sl++) {
      var g = R(x + 10, cy, w - 20, 116, { rx: 4, fill: C.white, stroke: C.ink, 'stroke-width': 3 });
      for (var cc = 0; cc < 16; cc++) for (var rr = 0; rr < 6; rr++) g += R(x + 22 + cc * 16.5 + (cc >= 8 ? 4 : 0), cy + 10 + rr * 15, 13, 11, { fill: '#9ED69E', stroke: '#5E9E5E', 'stroke-width': 0.5 });
      g += T(x - 14, cy + 64, 'SLOT ' + sl, { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'end', fill: C.ink });
      s += G('slot-' + sl, g);
      slotY[sl] = cy;
      cy += 124;
    }
    s += G('tross', R(x + 12, cy, w - 24, 22, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 16, 'TROSS', { 'font-size': 11, fill: C.preTxt, 'text-anchor': 'middle' }));
    cy += 26;
    s += R(x + 12, cy, w - 24, 22, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 16, 'RECTIFIER SHELF', { 'font-size': 11, fill: C.preTxt, 'text-anchor': 'middle' });
    cy += 26;
    s += R(x + 12, cy, w - 24, 36, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 23, 'BATTERY SHELF', { 'font-size': 11, fill: C.preTxt, 'text-anchor': 'middle' });
    cy += 40;
    s += R(x + 12, cy, w - 24, 20, { rx: 3, fill: C.pre, stroke: '#B8B1A3' }) + T(x + w / 2, cy + 14, 'BLANK', { 'font-size': 11, fill: C.preTxt, 'text-anchor': 'middle' });
    if (o.legs) {
      var jc = OCS_JACKET[o.cable || 1];
      var bx = x + w + 70;
      s += G('bundle', P('M' + bx + ' 0 L' + bx + ' 40', { stroke: jc.hex, 'stroke-width': 10, fill: 'none' }));
      s += G('split', R(bx - 12, 40, 24, 22, { rx: 4, fill: C.ink }) + T(bx + 20, 54, 'split point: 12-18 in above the rack', { 'font-size': 14, fill: C.ink, 'font-weight': 700 }));
      var lens = [[1, '1480 mm', 'legs 1-2'], [2, '1840 mm', 'legs 3-4'], [3, '2200 mm', 'legs 5-6'], [4, '2560 mm', 'legs 7-8']];
      for (var k = 0; k < 4; k++) {
        var ty = slotY[lens[k][0]] + 18;
        var g2 = P('M' + bx + ' 62 L' + bx + ' ' + ty + ' L' + (x + 30) + ' ' + ty, { stroke: C.fiber, 'stroke-width': 4, fill: 'none' }) +
          R(x + 22, ty - 9, 30, 18, { rx: 3, fill: '#3E9E4F', stroke: C.ink }) +
          T(bx + 18, ty - 2, lens[k][1], { 'font-size': 17, 'font-weight': 700, fill: C.ink }) + T(bx + 18, ty + 18, lens[k][2] + ' → slot ' + lens[k][0], { 'font-size': 14, fill: C.muted });
        s += G('leg-' + lens[k][0], g2);
      }
      s += G('spares', R(x + 20, y - 30, 26, 14, { rx: 3, fill: '#F5D21E', stroke: C.ink }) + T(x + 10, y - 19, 'spare leg (fibers 17-18)*', { 'font-size': 13, fill: C.ink, 'text-anchor': 'end', 'font-weight': 700 }) + T(x + 10, y - 2, 'label it, coil it, top of rack', { 'font-size': 12, fill: C.muted, 'text-anchor': 'end' }));
    }
    return svg(o.legs ? 1100 : 600, 800, s, 'SPOCS rack with four OCS shelves');
  }

  /* =====================================================================
     13. OCS SHELF — 320 LC ports (guide p.19, p.22)
     opts.hl: [X, X+1] ports to mark
     ===================================================================== */
  function ocsShelf(o) {
    o = o || {};
    var s = '', cw = 74, rh = 44, x0 = 40, y0 = 70;
    var hl = {}; (o.hl || []).forEach(function (p) { hl[p] = 1; });
    s += R(x0 - 18, y0 - 18, 16 * cw + 36 + 10, 10 * rh + 36, { rx: 8, fill: '#E9E8E3', stroke: C.steel, 'stroke-width': 3 });
    for (var c = 0; c < 16; c++) {
      for (var r = 0; r < 10; r++) {
        var odd = c * 20 + r * 2 + 1, even = odd + 1;
        var x = x0 + c * cw + (c >= 8 ? 10 : 0), y = y0 + r * rh;
        var unused = odd >= 145 && odd <= 160;
        var cell = R(x, y, cw - 6, rh - 4, { rx: 3, fill: unused ? '#D6D3CC' : '#FFFFFF', stroke: '#8E897F', 'stroke-width': 0.8 });
        cell += R(x + 3, y + 3, 9, rh - 10, { fill: unused ? '#BDB9B0' : '#8FCF8F' });
        var g1 = T(x + 18, y + 16, pad3(odd), { 'font-size': 13, fill: unused ? '#8E897F' : C.ink, 'font-family': MONO, 'font-weight': hl[odd] ? 700 : 400 });
        var g2 = T(x + 18, y + 34, pad3(even), { 'font-size': 13, fill: unused ? '#8E897F' : C.ink, 'font-family': MONO, 'font-weight': hl[even] ? 700 : 400 });
        if (hl[odd]) g1 = R(x + 14, y + 3, cw - 24, 17, { rx: 3, fill: '#3E9E4F' }) + T(x + 18, y + 16, pad3(odd), { 'font-size': 13, fill: '#fff', 'font-family': MONO, 'font-weight': 700 });
        if (hl[even]) g2 = R(x + 14, y + 21, cw - 24, 17, { rx: 3, fill: '#3E9E4F' }) + T(x + 18, y + 34, pad3(even), { 'font-size': 13, fill: '#fff', 'font-family': MONO, 'font-weight': 700 });
        s += G('pair-' + odd, cell + G('sp-' + odd, g1) + G('sp-' + even, g2));
      }
    }
    var mx = x0 + 8 * cw + 2;
    s += L(mx, y0 - 40, mx, y0 + 10 * rh + 10, { stroke: C.ink, 'stroke-width': 3, 'stroke-dasharray': '8 6' });
    s += G('half-L', T(x0 + 4 * cw, y0 - 30, 'LEFT HALF: ports 001-160 · TPU 1-72 · dress LEFT', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('half-R', T(x0 + 12 * cw + 10, y0 - 30, 'RIGHT HALF: ports 161-320 · TPU 73-144 · dress RIGHT', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('unused', T(x0, y0 + 10 * rh + 58, 'Grey ports 145-160 are not used.', { 'font-size': 14, fill: C.muted, 'font-weight': 700 }));
    s += T(x0, y0 + 10 * rh + 36, 'Each box = a pair: odd port on top, even below. Count down a column of 20, then move right.', { 'font-size': 14, fill: C.muted });
    return svg(16 * cw + 90, y0 + 10 * rh + 70, s, 'OCS shelf with 320 LC ports');
  }
  function pad3(n) { return (n < 10 ? '00' : n < 100 ? '0' : '') + n; }

  /* =====================================================================
     14. AIO / EOR RACK ELEVATION (guide p.26, p.35) — order as drawn
     ===================================================================== */
  function aioRack(o) {
    o = o || {};
    var items = [
      ['…', 'blank units above', 'blank', 26],
      ['lc39', 'LC 1RU MGMT PANEL', 'RU 39 · mgmt trunks (12F / 24F)', 34, 'yours'],
      ['b', 'BLANK', '', 20, 'blank'], ['b', 'BLANK', '', 20, 'blank'],
      ['mpo', 'MPO 4RU PANEL → DCN-PP', 'RU 32 · front: 144F · rear: 192F', 96, 'yours'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['cu30', 'COPPER PANEL', 'RU 30 · console runs → console switch', 30, 'yours'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['mleaf2', 'MGMT LEAF 2', 'switch · pre-installed', 26, 'pre'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['mleaf1', 'MGMT LEAF 1', 'switch · pre-installed', 26, 'pre'],
      ['cu24', 'COPPER PANEL', 'RU 24 · TOR mgmt runs → MGMT leaf', 30, 'yours'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['cu22', 'COPPER PANEL', 'RU 22 · TROSS GIG E 1 runs → TROSS leaf', 30, 'yours'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['tleaf2', 'TROSS LEAF 2', 'switch · pre-installed', 26, 'pre'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['tleaf1', 'TROSS LEAF 1', 'switch · pre-installed', 26, 'pre'],
      ['b', 'BLANK', '', 20, 'blank'],
      ['cu4', 'COPPER PANEL', 'purpose not stated in guide', 30, 'unk'],
      ['…', 'blank units below', 'blank', 26]
    ];
    var s = '', x = 60, w = 470, y = 30;
    var total = 0; items.forEach(function (it) { total += it[3] + 4; });
    s += R(x - 14, y - 14, w + 28, total + 24, { rx: 12, fill: '#F0EDE6', stroke: C.steel, 'stroke-width': 4 });
    var cy = y;
    items.forEach(function (it) {
      var kind = it[4] || 'blank', h = it[3];
      var fill = kind === 'yours' ? C.white : kind === 'pre' ? '#DCE6EE' : kind === 'unk' ? '#FFFFFF' : C.pre;
      var stroke = kind === 'yours' ? C.ink : kind === 'unk' ? C.muted : '#B8B1A3';
      var g = R(x, cy, w, h, { rx: 3, fill: fill, stroke: stroke, 'stroke-width': kind === 'yours' ? 3 : 1.2, 'stroke-dasharray': kind === 'unk' ? '6 4' : null });
      if (it[0] === 'mpo') { for (var r = 0; r < 4; r++) for (var c = 0; c < 24; c++) g += R(x + 14 + c * 18.5, cy + 30 + r * 14, 14, 10, { fill: c >= 18 ? '#EEE' : '#F5E7A8', stroke: '#B8A663', 'stroke-width': 0.5 }); }
      if (kind === 'blank') g += T(x + w / 2, cy + h / 2 + 4, it[1], { 'font-size': 11, fill: C.preTxt, 'text-anchor': 'middle' });
      else {
        g += T(x + 12, cy + (it[0] === 'mpo' ? 20 : h / 2 + 5), it[1], { 'font-size': 14, 'font-weight': 700, fill: C.ink });
        if (it[2]) g += T(x + w - 10, cy + (it[0] === 'mpo' ? 20 : h / 2 + 5), it[2], { 'font-size': 12, fill: C.muted, 'text-anchor': 'end' });
      }
      s += it[0] === 'b' || it[0] === '…' ? g : G(it[0], g);
      cy += h + 4;
    });
    s += T(x - 10, cy + 34, 'Order follows the guide\'s elevation (p.26, p.35). Not to RU scale.', { 'font-size': 13, fill: C.muted });
    s += T(x - 10, cy + 52, 'RU numbers shown are the checked values. Switch RUs: rack integration spec.', { 'font-size': 13, fill: C.muted });
    return svg(600, cy + 64, s, 'AIO / EOR rack elevation');
  }

  /* =====================================================================
     15. AIO MPO PANEL — FRONT (guide p.36) and REAR (guide p.37)
     ===================================================================== */
  var COLS = 'ABCDEFGHIJKL';
  var PGY = 84;
  function panelGrid(o, view) {
    // view: 'front' (A on left) or 'rear' (A on right)
    var s = '', cw = 92, pw = 40, ph = 30, x0 = 120, y0 = PGY, rh = 38;
    var rows = 12;
    s += R(x0 - 26, y0 - 26, 12 * cw + 44, rows * rh + 64, { rx: 8, fill: '#F2F1ED', stroke: C.steel, 'stroke-width': 3 });
    for (var ci = 0; ci < 12; ci++) {
      var colIdx = view === 'rear' ? 11 - ci : ci;       // physical left->right
      var letter = COLS[colIdx];
      var cx = x0 + ci * cw;
      s += G('col-' + letter, T(cx + pw, y0 + rows * rh + 30, letter, { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
      for (var r = 1; r <= rows; r++) {
        var y = y0 + (rows - r) * rh;
        for (var side = 0; side < 2; side++) {
          // front: left port = first (odd); rear: left port = second (even)
          var portInCol = view === 'rear' ? (side === 0 ? 2 : 1) : (side === 0 ? 1 : 2);
          var portNo = colIdx * 2 + portInCol;
          var px = cx + side * (pw + 4);
          var key = (view === 'rear' ? 'r-' : 'f-') + r + '-' + portNo;
          var cell = o.cell ? o.cell(r, letter, portNo, portInCol) : null;
          var g;
          if (cell && cell.leg) {
            g = chip(px, y, pw, ph, cell.leg, { fs: 13, stripe: cell.leg > 12, text: cell.text });
          } else {
            var fill = (cell && cell.fill) || '#FFFFFF';
            g = R(px, y, pw, ph, { rx: 3, fill: fill, stroke: (cell && cell.stroke) || '#9A958B', 'stroke-width': 1, 'stroke-dasharray': cell && cell.dash ? '4 3' : null });
            if (cell && cell.text) g += T(px + pw / 2, y + 20, cell.text, { 'font-size': 11, 'text-anchor': 'middle', fill: C.muted, 'font-family': MONO });
          }
          s += G(key, g);
        }
      }
    }
    for (var rr = 1; rr <= rows; rr++) s += G('rowlbl-' + rr, T(x0 + 12 * cw + 14, y0 + (rows - rr) * rh + 21, rr, { 'font-size': 15, 'font-weight': 700, fill: C.ink, 'font-family': MONO }));
    return s;
  }
  function aioFront(o) {
    o = o || {};
    var rowsLeg = o.rows || [];                 // TPU rows to fill with legs
    var focus = {}; rowsLeg.forEach(function (r) { focus[r] = 1; });
    var s = panelGrid({
      cell: function (r, letter, portNo) {
        var ci = COLS.indexOf(letter);
        if (r >= 10) return { fill: '#ECEAE4', dash: true };
        if (ci >= 9) return { fill: '#F4F3EF', dash: true };
        if (focus[r] && portNo <= 18) return { leg: portNo };
        if (o.allRows && portNo <= 18) return { fill: portNo >= 17 ? '#E8E3D6' : '#FFF4BF' };
        return null;
      }
    }, 'front');
    var x0 = 120, y0 = PGY, rh = 38;
    for (var r = 1; r <= 9; r++) s += G('tpu-' + r, T(x0 - 32, y0 + (12 - r) * rh + 21, 'TPU ' + r, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: C.ink }));
    s += G('spare-rows', T(x0 - 32, y0 + 1 * rh + 21, 'spare', { 'font-size': 12, 'text-anchor': 'end', fill: C.muted }) + T(x0 - 32, y0 + 1 * rh + 37, 'rows', { 'font-size': 12, 'text-anchor': 'end', fill: C.muted }));
    s += T(x0 + 9 * 92 + 140, y0 - 34, 'J-L: future', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    s += T(x0 + 8 * 92 + 40, y0 - 34, 'I: legs 17-18 spares', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    s += T(x0 - 90, y0 - 34, 'FRONT VIEW (facing the front of the AIO rack)', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    return svg(1300, 600, s, 'AIO MPO panel, front view: 144F trunks, one TPU rack per row');
  }
  function aioRear(o) {
    o = o || {};
    var cols = o.cols || [];                    // trunk columns to fill (letters)
    var f = {}; cols.forEach(function (c) { f[c] = 1; });
    var s = panelGrid({
      cell: function (r, letter, portNo, pin) {
        var ci = COLS.indexOf(letter);
        if (ci >= 8) return { fill: '#F4F3EF', dash: true };
        if (f[letter]) { var leg = 2 * r - (pin === 1 ? 1 : 0); return { leg: leg }; }
        if (o.allCols) return { fill: r >= 10 ? '#E8E3D6' : '#FFF4BF' };
        return null;
      }
    }, 'rear');
    var x0 = 120, cw = 92, y0 = PGY;
    for (var ci = 0; ci < 8; ci++) {
      var px = x0 + (11 - ci) * cw;
      s += G('dcn-' + COLS[ci], T(px + 42, y0 - 32, 'DCN-PP ' + (ci + 1), { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    }
    s += T(x0 + 1.5 * cw + 42, y0 - 32, 'I: TPU spares · J-L: unused', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    s += T(x0 - 90, y0 - 58, 'REAR VIEW (facing the back of the AIO rack) — column A is on the RIGHT', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    return svg(1300, 600, s, 'AIO MPO panel, rear view: 192F trunks, one per column');
  }

  /* =====================================================================
     16. DCN-PP PANEL — REAR (guide p.39) and FRONT (guide p.41)
     ===================================================================== */
  function dcnppRear(o) {
    o = o || {};
    var lanes = o.lanes || [];   // e.g. [{pair:'AB', lane:1}]
    var fill = {}; lanes.forEach(function (l) { fill[l.pair + l.lane] = 1; });
    var s = panelGrid({
      cell: function (r, letter, portNo, pin) {
        var ci = COLS.indexOf(letter), pair = COLS[ci - (ci % 2)] + COLS[ci - (ci % 2) + 1];
        var lane = pin;                       // first port in column = lane 1
        if (fill[pair + lane]) { var oddCol = ci % 2 === 0; var leg = oddCol ? 2 * r - 1 : 2 * r; return { leg: leg }; }
        return { fill: lane === 1 ? '#FFFFFF' : '#F6F4EE' };
      }
    }, 'rear');
    var x0 = 120, cw = 92, y0 = PGY;
    var pairs = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'];
    for (var p = 0; p < 6; p++) {
      var ciL = p * 2;  // letter index of first column
      var xr = x0 + (11 - ciL) * cw + 2 * 44, xl = x0 + (11 - ciL - 1) * cw;
      s += G('pair-' + pairs[p], P('M' + xl + ' ' + (y0 + 12 * 38 + 46) + ' l0 8 L' + xr + ' ' + (y0 + 12 * 38 + 54) + ' l0 -8', { stroke: C.ink, 'stroke-width': 2, fill: 'none' }) +
        T((xl + xr) / 2, y0 + 12 * 38 + 74, 'module · AIO-PP' + (p * 2 + 1) + ' + ' + (p * 2 + 2), { 'font-size': 12, 'text-anchor': 'middle', fill: C.ink }));
    }
    s += T(x0 - 90, y0 - 34, 'REAR VIEW of one DCN-PP panel — column A on the RIGHT', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    return svg(1300, 640, s, 'DCN patch panel rear view: 192F trunks land in lanes');
  }
  function dcnppFront(o) {
    o = o || {};
    var s = panelGrid({
      cell: function (r, letter, portNo, pin) {
        var ci = COLS.indexOf(letter), modIdx = Math.floor(ci / 2);
        var tint = ['#CFDDF5', '#FBE7A6', '#DCEBD3', '#E3D6BF', '#F5C7C7', '#E2CFEF'][modIdx];
        if (o.row && r === o.row) {
          var spine = ((ci % 2) * 2) + pin; // a1->1, a2->2, b3->3, b4->4
          return { fill: tint, text: 'S' + spine, stroke: C.ink };
        }
        return { fill: tint };
      }
    }, 'front');
    var x0 = 120, cw = 92, y0 = PGY;
    for (var m = 0; m < 6; m++) {
      var xl = x0 + m * 2 * cw, xr = xl + 2 * cw - 10;
      s += G('mod-' + (m + 1), P('M' + xl + ' ' + (y0 + 12 * 38 + 46) + ' l0 8 L' + xr + ' ' + (y0 + 12 * 38 + 54) + ' l0 -8', { stroke: C.ink, 'stroke-width': 2, fill: 'none' }) +
        T((xl + xr) / 2, y0 + 12 * 38 + 74, 'MODULE ' + (m + 1) + ': spines 1-4', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    }
    s += T(x0 - 90, y0 - 34, 'FRONT VIEW of one DCN-PP panel — cords go to the spines', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    return svg(1300, 640, s, 'DCN patch panel front view: modules to spines 1-4');
  }

  /* =====================================================================
     17. 2x2 SHUFFLE MODULE (guide p.40)
     ===================================================================== */
  function shuffle(o) {
    var s = '', A = '#F5D875', B = '#9DB9E8';
    s += R(320, 40, 480, 380, { rx: 12, fill: '#2F3338' });
    s += T(550, 26, '2x2 SHUFFLE MODULE · P/N 760262482', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    for (var k = 0; k < 2; k++) {
      var y = 80 + k * 180;
      var g = R(430, y + 20, 240, 80, { rx: 6, fill: '#5A5F66' }) + T(550, y + 66, 'SHUFFLE ' + (k + 1), { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff' });
      g += R(340, y + 10, 70, 34, { fill: A, stroke: C.ink }) + R(340, y + 76, 70, 34, { fill: B, stroke: C.ink });
      g += L(410, y + 27, 430, y + 40, { stroke: A, 'stroke-width': 3 }) + L(410, y + 93, 430, y + 80, { stroke: B, 'stroke-width': 3 });
      g += R(690, y + 10, 40, 34, { fill: B, stroke: C.ink }) + R(730, y + 10, 40, 34, { fill: A, stroke: C.ink }) + R(690, y + 76, 40, 34, { fill: B, stroke: C.ink }) + R(730, y + 76, 40, 34, { fill: A, stroke: C.ink });
      g += L(670, y + 40, 690, y + 27, { stroke: '#ccc', 'stroke-width': 3 }) + L(670, y + 80, 690, y + 93, { stroke: '#ccc', 'stroke-width': 3 });
      g += T(310, y + 32, 'from AIO trunk 1', { 'font-size': 14, 'text-anchor': 'end', fill: C.ink, 'font-weight': 600 }) + T(310, y + 98, 'from AIO trunk 2', { 'font-size': 14, 'text-anchor': 'end', fill: C.ink, 'font-weight': 600 });
      g += T(816, y + 32, 'out: mixed', { 'font-size': 14, fill: C.ink, 'font-weight': 600 }) + T(816, y + 98, 'out: mixed', { 'font-size': 14, fill: C.ink, 'font-weight': 600 });
      s += G('shuf-' + (k + 1), g);
    }
    s += T(60, 452, 'IN (rear): 2 MPO-8 inputs from 2 DIFFERENT AIO trunks.  OUT (front): 2 MPO-8 outputs, each carrying fibers from both inputs.', { 'font-size': 15, fill: C.ink });
    return svg(1100, 470, s, '2x2 shuffle module');
  }

  /* =====================================================================
     18. COPPER PANEL → SWITCH (guide p.27)
     ===================================================================== */
  function copperPanel(o) {
    o = o || {};
    var cords = o.cords || [1, 10];
    var s = '', x0 = 60, jw = 38;
    s += R(x0 - 20, 60, 24 * (jw + 8) + 30, 140, { rx: 6, fill: '#2C3036' });
    s += T(x0 - 20, 46, 'COPPER PATCH PANEL (48 jacks) — home runs from TPU racks land on the back', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    for (var j = 1; j <= 48; j++) {
      var col = (j - 1) % 24, row = j <= 24 ? 0 : 1;
      var x = x0 + col * (jw + 8), y = 76 + row * 54;
      var on = cords.indexOf(j) >= 0;
      s += G('j-' + j, R(x, y + 14, jw, 26, { rx: 3, fill: on ? '#7CC36B' : '#C9CDD2' }) + T(x + jw / 2, row === 0 ? y + 8 : y + 56, j, { 'font-size': 11, fill: '#EDEFF1', 'text-anchor': 'middle', 'font-family': MONO }));
    }
    var sy = 300;
    s += R(x0 - 20, sy, 24 * (jw + 8) + 30, 110, { rx: 6, fill: '#E3E6E9', stroke: C.steel, 'stroke-width': 2 });
    s += T(x0 - 20, sy + 132, 'SWITCH (MGMT leaf, TROSS leaf, or console switch) — pre-installed', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    for (var p = 1; p <= 48; p++) {
      var pc = (p - 1) % 24, pr = p <= 24 ? 0 : 1;
      var px = x0 + pc * (jw + 8), py = sy + 14 + pr * 48;
      var on2 = cords.indexOf(p) >= 0;
      s += G('s-' + p, R(px, py, jw, 30, { rx: 3, fill: on2 ? '#7CC36B' : '#C3C7CC', stroke: '#8D939A' }) + T(px + jw / 2, py + 20, p, { 'font-size': 11, fill: C.ink, 'text-anchor': 'middle', 'font-family': MONO }));
    }
    cords.forEach(function (n) {
      var cx = x0 + ((n - 1) % 24) * (jw + 8) + jw / 2, top = n <= 24 ? 116 : 170, bot = n <= 24 ? sy + 14 : sy + 62;
      s += G('cord-' + n, L(cx, top, cx, bot, { stroke: '#2C9BE0', 'stroke-width': 5 }) + T(cx + 10, (top + bot) / 2 + 20, 'jack ' + n + ' → port ' + n, { 'font-size': 15, 'font-weight': 700, fill: C.ink }));
    });
    return svg(1220, 450, s, 'Copper patch panel to switch: jack number equals port number');
  }

  /* =====================================================================
     19. TROSS / RMU faceplate (guide p.14) — positions simplified
     ===================================================================== */
  function rmuFace(o) {
    var s = '';
    for (var u = 0; u < 2; u++) {
      var y = 40 + u * 140;
      var g = R(60, y, 760, 80, { rx: 6, fill: '#F2F2F0', stroke: C.ink, 'stroke-width': 3 });
      g += G('con' + (u + 1), R(90, y + 20, 46, 36, { rx: 3, fill: C.copper, stroke: C.ink }) + T(113, y + 74, 'CONSOLE', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
      for (var i = 0; i < 10; i++) g += R(170 + i * 50, y + 22, 40, 32, { rx: 3, fill: '#DADCDF', stroke: '#9AA0A6' });
      g += G('gig' + (u + 1), R(700, y + 20, 46, 36, { rx: 3, fill: '#7CC36B', stroke: C.ink }) + T(723, y + 74, 'GIG E 1', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
      g += T(840, y + 34, u === 0 ? 'TROSS / RMU1' : 'TROSS / RMU2', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
      g += T(840, y + 56, u === 0 ? 'side A · RU 38' : 'side B · RU 38', { 'font-size': 14, fill: C.muted });
      s += G('rmu' + (u + 1), g);
    }
    s += T(60, 312, 'Port positions are simplified (guide p.14). Look for the ports labeled GIG E 1 and CONSOLE on the unit.', { 'font-size': 14, fill: C.muted });
    return svg(1040, 325, s, 'TROSS / RMU units with CONSOLE and GIG E 1 ports');
  }

  /* =====================================================================
     20. RU 39 LC PANEL — management trunks 12F / 24F (guide p.28-29)
     ===================================================================== */
  function lcPanel(o) {
    o = o || {};
    var t24 = o.type === '24F';
    var s = '', x0 = 90, cw = 96, pw = 40, rh = 46, y0 = 70;
    s += R(x0 - 20, y0 - 20, 12 * cw + 30, 3 * rh + 40, { rx: 6, fill: '#F2F1ED', stroke: C.steel, 'stroke-width': 3 });
    // duplex number at (colLetter, posInCol(1/2), row)
    function dup(letter, pin, row) {
      var ci = COLS.indexOf(letter);
      var base;
      if (ci === 0 || ci === 2) base = 0; else if (t24 && (ci === 1 || ci === 3)) base = 6; else return 0;
      return base + (pin - 1) * 3 + row;
    }
    for (var ci = 0; ci < 12; ci++) {
      var letter = COLS[ci];
      for (var pin = 1; pin <= 2; pin++) {
        var pos = ci * 2 + pin;
        var x = x0 + ci * cw + (pin - 1) * (pw + 4);
        s += T(x + pw / 2, y0 - 26, letter + pos, { 'font-size': 11, fill: C.muted, 'text-anchor': 'middle', 'font-family': MONO });
        for (var row = 1; row <= 3; row++) {
          var y = y0 + (3 - row) * rh;
          var d = dup(letter, pin, row);
          var key = 'lc-' + letter + pos + '-' + row;
          if (d) s += G(key, chip(x, y, pw, rh - 8, d, { fs: 14 }));
          else s += G(key, R(x, y, pw, rh - 8, { rx: 3, fill: '#FFFFFF', stroke: '#9A958B' }));
        }
      }
      s += T(x0 + ci * cw + pw + 2, y0 + 3 * rh + 14, letter, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    }
    for (var r = 1; r <= 3; r++) s += T(x0 + 12 * cw + 2, y0 + (3 - r) * rh + 24, r, { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    var w1 = t24 ? 2 * cw - 10 : cw - 10;
    s += G('sp1', P('M' + x0 + ' ' + (y0 - 40) + ' l0 -8 l' + w1 + ' 0 l0 8', { stroke: C.ink, 'stroke-width': 2, fill: 'none' }) + T(x0 + w1 / 2, y0 - 56, 'MGMT SPINE 1 (' + (t24 ? '24F' : '12F') + ')', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    var x2 = x0 + 2 * cw;
    s += G('sp2', P('M' + x2 + ' ' + (y0 - 40) + ' l0 -8 l' + w1 + ' 0 l0 8', { stroke: C.ink, 'stroke-width': 2, fill: 'none' }) + T(x2 + w1 / 2, y0 - 56, 'MGMT SPINE 2 (' + (t24 ? '24F' : '12F') + ')', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += T(x0 - 20, y0 + 3 * rh + 46, 'FRONT VIEW. Chips show the trunk\'s duplex number (1 = blue). Row 1 is the bottom row. The trunk lands on the rear.', { 'font-size': 14, fill: C.muted });
    return svg(1320, y0 + 3 * rh + 60, s, 'RU 39 LC panel, ' + (t24 ? '24F' : '12F') + ' management trunks');
  }

  /* =====================================================================
     21. LABELS — flag and wrap-around (guide p.8)
     ===================================================================== */
  function labels(o) {
    o = o || {};
    var l1 = o.line1 || 'RACK / DEVICE A - PORT', l2 = o.line2 || 'RACK / DEVICE Z - PORT';
    var s = '';
    var f = R(40, 30, 300, 190, { rx: 10, fill: '#FFFFFF', stroke: C.ink, 'stroke-width': 2 }) +
      T(190, 64, l1, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(190, 88, l2, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    for (var b = 0; b < 34; b++) f += R(80 + b * 6.6, 104, (b % 3 === 0 ? 4 : 2), 34, { fill: C.ink });
    f += L(50, 160, 330, 160, { stroke: C.ink, 'stroke-dasharray': '5 4' }) + T(190, 192, 'self-laminating tail', { 'font-size': 13, fill: C.hl, 'text-anchor': 'middle' });
    f += L(340, 120, 700, 120, { stroke: C.fiber, 'stroke-width': 6 }) + R(700, 110, 30, 20, { rx: 3, fill: '#1E6FD9' });
    f += P('M340 70 L690 70', { stroke: C.ink }) + L(690, 62, 690, 78, { stroke: C.ink }) + T(515, 60, '4 in from the boot', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    f += T(40, 246, 'FLAG LABEL — single connectors, breakout legs, copper runs', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    f += T(40, 268, 'Printed on both sides · barcode at the bottom · 2 in × 0.75 in print area', { 'font-size': 14, fill: C.muted });
    s += G('flag', f);
    var w = L(780, 120, 1090, 120, { stroke: C.fiber, 'stroke-width': 10 }) + R(1090, 106, 40, 28, { rx: 3, fill: '#2F3338' }) +
      R(990, 96, 72, 48, { rx: 4, fill: '#FFFFFF', stroke: C.ink, 'stroke-width': 2 }) + T(1026, 116, 'DEVICE A', { 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(1026, 132, 'DEVICE Z', { 'font-size': 11, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
      L(1062, 160, 1090, 160, { stroke: C.ink }) + T(1076, 182, '1-2 in', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
    w += T(780, 246, 'WRAP-AROUND LABEL — trunks', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    w += T(780, 268, '1 in wide minimum · wraps all the way around', { 'font-size': 14, fill: C.muted });
    s += G('wrap', w);
    return svg(1180, 285, s, 'Flag label and wrap-around label');
  }

  /* =====================================================================
     22. TRAY TIERS + WATERFALL (guide p.7)
     ===================================================================== */
  function tray(o) {
    var s = '';
    // cross-section
    function basket(y, label, k, inner) {
      var g = P('M60 ' + y + ' l0 90 l420 0 l0 -90', { stroke: C.steel, 'stroke-width': 4, fill: 'none' });
      for (var i = 0; i < 8; i++) g += L(60 + i * 60, y, 60 + i * 60, y + 90, { stroke: '#9AA0A6', 'stroke-width': 1 });
      g += inner + T(500, y + 50, label, { 'font-size': 18, 'font-weight': 700, fill: C.ink });
      return G(k, g);
    }
    var t2 = '';
    for (var a = 0; a < 5; a++) t2 += '<circle cx="' + (110 + a * 34) + '" cy="320" r="15" fill="' + C.fiber + '" stroke="#1F2429"/>';
    for (var b = 0; b < 8; b++) t2 += '<circle cx="' + (300 + (b % 4) * 22) + '" cy="' + (326 - Math.floor(b / 4) * 20) + '" r="9" fill="' + C.copper + '" stroke="#1F2429"/>';
    s += basket(250, 'TIER 2: 144F trunks + CAT6 (this site)', 't2', t2);
    var t1 = '';
    var oc = ['#D62839', '#F08C1B', '#F5D21E'];
    for (var c = 0; c < 12; c++) t1 += '<circle cx="' + (100 + (c % 6) * 52) + '" cy="' + (440 - Math.floor(c / 6) * 26) + '" r="12" fill="' + oc[c % 3] + '" stroke="#1F2429"/>';
    s += basket(370, 'TIER 1 (bottom): OCS cables', 't1', t1);
    s += T(60, 230, 'Tiers count from the bottom up.', { 'font-size': 16, fill: C.muted });
    s += T(60, 495, 'CAT6 tier changed recently — may differ at other sites. Guide p.14 still says Tier 1: ask your lead.', { 'font-size': 14, fill: C.hl, 'font-weight': 700 });
    // waterfall
    var w = P('M640 70 L960 70', { stroke: C.steel, 'stroke-width': 6 }) + P('M960 70 q 50 0 50 60 l0 70', { stroke: C.steel, 'stroke-width': 6, fill: 'none' }) +
      P('M640 60 L955 60 q 62 0 62 70 l0 90', { stroke: C.fiber, 'stroke-width': 9, fill: 'none' }) +
      R(985, 205, 70, 18, { fill: C.ink }) + T(1000, 30, 'WATERFALL', { 'font-size': 18, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }) +
      T(1000, 50, 'keeps the bend wide where cables leave the tray', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
    for (var v = 0; v < 4; v++) w += R(670 + v * 70, 52, 8, 18, { fill: '#2C9BE0' });
    w += T(780, 102, 'Velcro every 12-18 in · no zip ties', { 'font-size': 14, fill: C.ink, 'text-anchor': 'middle' });
    s += G('waterfall', w);
    return svg(1180, 510, s, 'Cable tray tiers and a waterfall');
  }

  /* =====================================================================
     23. BEND RADIUS (guide p.7)
     ===================================================================== */
  function bend(o) {
    var s = '';
    var items = [[20, 'LOADED · under tension · DRS minimum', 200], [15, 'LONG-TERM target · guide p.7 only', 150], [10, 'UNLOADED · no tension · DRS minimum', 100]];
    for (var i = 0; i < 3; i++) {
      var r = items[i][2], cx = 80 + i * 360, cy = 300;
      var g = P('M' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy, { stroke: C.fiber, 'stroke-width': 10, fill: 'none' });
      g += L(cx, cy, cx + r, cy, { stroke: C.muted, 'stroke-dasharray': '5 4' }) + T(cx + r / 2, cy + 22, 'radius', { 'font-size': 13, fill: C.muted, 'text-anchor': 'middle' });
      g += T(cx + 10, 60, items[i][0] + '× diameter', { 'font-size': 26, 'font-weight': 700, fill: C.ink });
      g += T(cx + 10, 84, items[i][1], { 'font-size': 14, fill: C.muted, 'font-weight': 700 });
      s += G('b' + items[i][0], g);
    }
    s += T(80, 360, 'Example, 0.25 in cable: at least 5 in radius loaded, 2.5 in unloaded (DRS 01.00.01); guide target 3.75 in long-term. Follow the manufacturer spec if it is larger.', { 'font-size': 14, fill: C.ink });
    return svg(1180, 380, s, 'Minimum bend radius rules');
  }

  /* =====================================================================
     24. FLOW DIAGRAM helper + specific flows
     nodes: [{k,x,y,w,h,title,sub,fill,stroke,dash}], edges: [{k,a:[x,y],b:[x,y],via,label,color,w,dash,lx,ly}]
     ===================================================================== */
  function flow(nodes, edges, w, h, title) {
    var s = arrowDefs('flA');
    edges.forEach(function (e) {
      var d = e.d || ('M' + e.a[0] + ' ' + e.a[1] + ' L' + e.b[0] + ' ' + e.b[1]);
      var g = P(d, { stroke: e.color || C.ink, 'stroke-width': e.w || 5, fill: 'none', 'stroke-dasharray': e.dash || null, 'marker-end': e.arrow === false ? null : 'url(#flA)' });
      if (e.label) g += T(e.lx, e.ly, e.label, { 'font-size': e.fs || 15, 'font-weight': 700, fill: C.ink, 'text-anchor': e.anchor || 'middle', 'paint-order': 'stroke', stroke: C.card, 'stroke-width': 6, 'stroke-linejoin': 'round' });
      if (e.sub) g += T(e.lx, e.ly + 19, e.sub, { 'font-size': 13, fill: C.muted, 'text-anchor': e.anchor || 'middle', 'paint-order': 'stroke', stroke: C.card, 'stroke-width': 6, 'stroke-linejoin': 'round' });
      s += G(e.k, g);
    });
    nodes.forEach(function (n) { s += node(n); });
    return svg(w, h, s, title);
  }

  function bmsFlow() {
    var n = [
      { k: 'dev', x: 20, y: 150, w: 220, h: 110, title: 'BMS devices', sub: ['not listed in the guide', '(ask your lead)'], dash: '8 5', stroke: C.muted },
      { k: 'fb0', x: 360, y: 140, w: 240, h: 130, title: 'FB0 BMS switch', sub: ['in AIO EOR w/BMS rack', '+ its own copper panel'], fill: '#FFF3C4' },
      { k: 'lc', x: 670, y: 140, w: 230, h: 130, title: 'RU 39 LC panel', sub: ['duplex 3 position', 'front: LC cord · rear: 24F'] },
      { k: 'sp1', x: 1000, y: 60, w: 200, h: 100, title: 'MGMT spine 1', sub: ['R131 or R204'] },
      { k: 'sp2', x: 1000, y: 250, w: 200, h: 100, title: 'MGMT spine 2', sub: ['R131 or R204'] }
    ];
    var e = [
      { k: 'e-cu', a: [240, 205], b: [358, 205], color: '#2C6FD1', w: 6, label: 'copper', sub: '(blue*)', lx: 299, ly: 170 },
      { k: 'e-cord', a: [600, 205], b: [668, 205], color: C.fiber, w: 6, label: 'LC cord', lx: 634, ly: 186 },
      { k: 'e-t1', d: 'M900 190 C 950 190, 950 110, 998 110', color: C.mgmt, w: 6, label: '24F trunk', lx: 940, ly: 128, anchor: 'end' },
      { k: 'e-t2', d: 'M900 220 C 950 220, 950 300, 998 300', color: C.mgmt, w: 6, label: '24F trunk', lx: 940, ly: 290, anchor: 'end' }
    ];
    return flow(n, e, 1220, 400, 'How BMS information travels');
  }

  function mgmtFlow() {
    var n = [
      { k: 'tor', x: 20, y: 30, w: 230, h: 80, title: 'TOR switch', sub: 'ETH + CONSOLE' },
      { k: 'rmu', x: 20, y: 150, w: 230, h: 80, title: 'TROSS / RMU1, RMU2', sub: 'GIG E 1 + CONSOLE' },
      { k: 'cu', x: 340, y: 60, w: 240, h: 150, title: 'EOR copper panels', sub: ['RU 30 console', 'RU 24 TOR mgmt', 'RU 22 TROSS GIG E 1'] },
      { k: 'sw', x: 660, y: 60, w: 240, h: 150, title: 'Pre-installed switches', sub: ['console switch', 'MGMT leaf 1 / 2', 'TROSS leaf 1 / 2'], fill: '#DCE6EE' },
      { k: 'lc', x: 660, y: 270, w: 240, h: 100, title: 'RU 39 LC panel', sub: 'duplex 1 MGMT · 2 TROSS' },
      { k: 'sp', x: 980, y: 270, w: 220, h: 100, title: 'MGMT spines 1, 2', sub: 'R131 / R204' }
    ];
    var e = [
      { k: 'e1', a: [250, 70], b: [338, 110], color: C.copper, label: 'CAT6', lx: 300, ly: 76 },
      { k: 'e2', a: [250, 190], b: [338, 160], color: C.copper },
      { k: 'e3', a: [580, 135], b: [658, 135], color: '#2C9BE0', label: 'patch cord', lx: 620, ly: 122 },
      { k: 'e4', a: [780, 210], b: [780, 268], color: C.fiber, label: 'LC cords (uplinks)', lx: 790, ly: 245, anchor: 'start' },
      { k: 'e5', a: [900, 320], b: [978, 320], color: C.mgmt, label: '12F / 24F', lx: 940, ly: 306 }
    ];
    return flow(n, e, 1220, 390, 'Management network path');
  }

  function spocsMgmt() {
    var n = [
      { k: 'spocs', x: 20, y: 120, w: 240, h: 140, title: 'SPOCS rack', sub: ['mgmt1 + mgmt2 switches', 'near the top · pre-installed'], fill: '#FDE3B8' },
      { k: 'b11', x: 400, y: 30, w: 260, h: 120, title: 'EOR w/BMS · spot 11', sub: ['RU 39 LC panel front', '611 · 1411 · 2211'], fill: '#FFF3C4' },
      { k: 'b13', x: 400, y: 230, w: 260, h: 120, title: 'EOR w/BMS · spot 13', sub: ['RU 39 LC panel front', '613 · 1413 · 2213'], fill: '#FFF3C4' },
      { k: 'sp', x: 820, y: 130, w: 240, h: 120, title: 'MGMT spines 1, 2', sub: ['R131 / R204', 'breakout harness to MPO-8'] }
    ];
    var e = [
      { k: 'm1', d: 'M260 160 C 330 160, 330 90, 398 90', color: C.fiber, label: 'mgmt1 → spot 11', sub: 'long 2F LC cords', lx: 250, ly: 60, anchor: 'start' },
      { k: 'm2', d: 'M260 220 C 330 220, 330 290, 398 290', color: C.fiber, label: 'mgmt2 → spot 13', sub: 'long 2F LC cords', lx: 250, ly: 316, anchor: 'start' },
      { k: 't1', d: 'M660 90 C 740 90, 740 170, 818 170', color: C.mgmt, label: '24F trunks', lx: 760, ly: 96 },
      { k: 't2', d: 'M660 290 C 740 290, 740 210, 818 210', color: C.mgmt, label: '24F trunks', lx: 760, ly: 300 }
    ];
    return flow(n, e, 1080, 370, 'SPOCS management uplinks');
  }

  function largePath() {
    var n = [
      { k: 'tpu', x: 20, y: 90, w: 210, h: 110, title: 'TPU rack', sub: ['TOR: 16 odd ports'] },
      { k: 'aio', x: 320, y: 90, w: 230, h: 110, title: 'AIO rack', sub: ['MPO 4RU panel', 'front 144F · rear 192F'] },
      { k: 'dcn', x: 650, y: 90, w: 230, h: 110, title: 'DCN-PP rack', sub: ['8 × 4RU panels', '2x2 shuffle modules'] },
      { k: 'sp', x: 980, y: 90, w: 200, h: 110, title: 'DCN spine', sub: ['per your cutsheet'] }
    ];
    var e = [
      { k: 'e144', a: [230, 145], b: [318, 145], color: C.fiber, w: 8, label: '144F', lx: 274, ly: 128 },
      { k: 'e192', a: [550, 145], b: [648, 145], color: C.fiber, w: 10, label: '8 × 192F', lx: 600, ly: 128 },
      { k: 'empo', a: [880, 145], b: [978, 145], color: C.fiber, w: 6, label: 'MPO cords', lx: 930, ly: 128 }
    ];
    return flow(n, e, 1200, 240, 'Large trunk path: TPU rack to spine');
  }

  /* =====================================================================
     25. CUTSHEET ROW (guide p.6)
     ===================================================================== */
  function cutsheet(o) {
    var steps = [['A SIDE', 'where the cable starts: A_loc, A_name, A_port'], ['A PANEL', 'the first panel and port it lands on'], ['TRUNK / LEG', 'the big cable in the middle, and which leg'], ['Z PANEL', 'the last panel and port it lands on'], ['Z SIDE', 'where the cable ends: Z_loc, Z_name, Z_port']];
    var s = arrowDefs('csA');
    for (var i = 0; i < 5; i++) {
      var x = 20 + i * 236;
      s += G('cs-' + i, R(x, 40, 210, 120, { rx: 8, fill: i === 0 || i === 4 ? '#FFF7DA' : C.card, stroke: C.ink, 'stroke-width': 2.5 }) +
        T(x + 105, 78, steps[i][0], { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
        wrapText(x + 105, 104, steps[i][1], 24, 14));
      if (i < 4) s += L(x + 212, 100, x + 234, 100, { stroke: C.ink, 'stroke-width': 3, 'marker-end': 'url(#csA)' });
    }
    s += T(20, 200, 'Read left to right. A = start, Z = finish. A row marked SPARE: land and label, do not plug into a device.', { 'font-size': 15, fill: C.ink });
    return svg(1210, 215, s, 'One cutsheet row, read left to right');
  }
  function wrapText(x, y, str, max, fs) {
    var words = str.split(' '), lines = [], cur = '';
    words.forEach(function (w) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
    if (cur.trim()) lines.push(cur.trim());
    var s = '';
    for (var i = 0; i < lines.length; i++) s += T(x, y + i * (fs + 4), lines[i], { 'font-size': fs, 'text-anchor': 'middle', fill: C.muted });
    return s;
  }

  /* ---------- highlight rings (used by the course and the videos) ---------- */
  /* Adds a ring <rect> around each element whose data-k is in keys. Returns the ring elements. */
  function ring(svgEl, keys, opts) {
    opts = opts || {};
    var pad = opts.pad === undefined ? 6 : opts.pad;
    var NS = 'http://www.w3.org/2000/svg';
    var layer = svgEl.querySelector('g.dg-rings');
    if (!layer) { layer = document.createElementNS(NS, 'g'); layer.setAttribute('class', 'dg-rings'); svgEl.appendChild(layer); }
    var out = [];
    [].concat(keys).forEach(function (k) {
      var el = svgEl.querySelector('[data-k="' + k + '"]');
      if (!el) return;
      var b = (el.querySelector('[data-ringbox]') || el).getBBox();
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', b.x - pad); r.setAttribute('y', b.y - pad);
      r.setAttribute('width', b.width + pad * 2); r.setAttribute('height', b.height + pad * 2);
      r.setAttribute('rx', 8); r.setAttribute('fill', 'none');
      r.setAttribute('stroke', opts.color || C.hl); r.setAttribute('stroke-width', opts.width || 5);
      r.setAttribute('class', 'dg-ring'); r.setAttribute('data-ring', k);
      layer.appendChild(r); out.push(r);
    });
    return out;
  }
  function clearRings(svgEl) { var l = svgEl.querySelector('g.dg-rings'); if (l) l.parentNode.removeChild(l); }

  /* =====================================================================
     30. DRS diagrams (DRS 01.00.00 intro, DRS 01.00.01 general cable dressing)
     ===================================================================== */
  var DRSBLUE = '#2563B8', DRSSOFT = '#DCEBF7', STOPRED = '#B42318', STOPSOFT = '#FDE7E4', OKG = '#2A7035', OKSOFT = '#E3F2E1';
  // How the DRS, the installation guide, the cutsheet and this course fit together
  function drsStack() {
    var n = [
      { k: 'stds', x: 20, y: 40, w: 300, h: 170, title: 'Industry standards', sub: ['ANSI/TIA-568 · 606 · 942', 'BICSI · NEC · NEMA', 'referenced by the DRS'], fill: '#F2F0EA' },
      { k: 'drs', x: 380, y: 40, w: 380, h: 170, title: 'DRS', fs: 26, sub: ['Deployment Requirement Sheets', 'HOW each task must be done', 'Requirements, not guidelines'], fill: DRSSOFT, stroke: DRSBLUE, sw: 3.5 },
      { k: 'cutsheet', x: 820, y: 40, w: 360, h: 170, title: 'Cutsheet', fs: 24, sub: ['WHERE each cable goes', 'the final word on any port'] },
      { k: 'guide', x: 380, y: 290, w: 800, h: 120, title: 'Large Site Cable Installation Guide', sub: ['Built from DRS 01.00, 01.01, 02.00, 05.00, 10.01, 10.04, 10.08, 10.10', 'and the BUF102 patch panel matrix v0.97 (ICT cutsheet v0.97)'] },
      { k: 'course', x: 380, y: 490, w: 800, h: 120, title: 'This course · Field Kit app', sub: ['Training aids: they explain the DRS, the guide and the cutsheet', 'Never a substitute: the current DRS must be on hand at the work'], dash: '9 6', stroke: C.muted, fill: '#FBFAF6' }
    ];
    var e = [
      { k: 'e-sd', a: [322, 125], b: [376, 125], w: 4, label: 'used in', lx: 349, ly: 110, fs: 13 },
      { k: 'e-dg', a: [570, 212], b: [570, 286], w: 5, color: DRSBLUE, label: 'built from', lx: 640, ly: 255 },
      { k: 'e-cg', a: [1000, 212], b: [1000, 286], w: 5, label: 'built from', lx: 1070, ly: 255 },
      { k: 'e-gc', a: [780, 412], b: [780, 486], w: 4, dash: '7 5', color: C.muted, label: 'explained by', lx: 860, ly: 455 }
    ];
    return flow(n, e, 1200, 630, 'How the DRS, the installation guide, the cutsheet and this course fit together');
  }
  // Where to get the DRS, and the stop-work rule (DRS 01.00.00 intro)
  function drsAccess() {
    var n = [
      { k: 'need', x: 20, y: 225, w: 210, h: 110, title: 'Before a task', sub: ['find the DRS', 'for that task'] },
      { k: 'portal', x: 300, y: 40, w: 330, h: 170, title: 'Fluidstack Confluence', sub: ['fluidstack.atlassian.net', 'LVC Deployment space →', 'DEPLOYMENT REQUIREMENTS', 'SHEETS'], fill: DRSSOFT, stroke: DRSBLUE, sw: 3 },
      { k: 'pm', x: 300, y: 350, w: 330, h: 150, title: 'PM or site supervisor', sub: ['Fluidstack project manager', 'or site supervisor: sends the', 'DRS or restores your access'], dash: '8 5' },
      { k: 'rev', x: 700, y: 40, w: 250, h: 170, title: 'Current version?', sub: ['check the revision', 'date on the cover', 'page'] },
      { k: 'onhand', x: 700, y: 350, w: 250, h: 150, title: 'On hand', sub: ['printed, or on a device', 'you can read at the', 'work location'] },
      { k: 'start', x: 1010, y: 360, w: 170, h: 130, title: 'Start work', fill: OKSOFT, stroke: OKG, sw: 3 },
      { k: 'stop', x: 1010, y: 40, w: 170, h: 170, title: 'No DRS?', sub: ['STOP work.', 'Get it before', 'you go on.'], fill: STOPSOFT, stroke: STOPRED, sw: 3, tc: STOPRED }
    ];
    var e = [
      { k: 'e-np', d: 'M230 260 C 265 260, 265 125, 296 125', w: 5, color: DRSBLUE, label: 'primary', lx: 262, ly: 180, fs: 13 },
      { k: 'e-nb', d: 'M230 300 C 265 300, 265 425, 296 425', w: 4, dash: '8 5', label: 'backup', lx: 262, ly: 395, fs: 13 },
      { k: 'e-pr', a: [630, 125], b: [696, 125], w: 5 },
      { k: 'e-br', d: 'M630 425 C 665 425, 665 210, 696 190', w: 4, dash: '8 5' },
      { k: 'e-ro', a: [825, 212], b: [825, 346], w: 5 },
      { k: 'e-os', a: [950, 425], b: [1006, 425], w: 5, color: OKG },
      { k: 'e-stop', d: 'M950 380 C 985 380, 985 200, 1006 160', w: 4, dash: '6 5', color: STOPRED, label: 'not on hand', lx: 1000, ly: 300, fs: 13, anchor: 'end' }
    ];
    return flow(n, e, 1200, 530, 'Where to get the DRS, and the stop-work rule');
  }
  // Redrawn layout of a DRS sheet (DRS 01.00.01 as the example). Not a copy of the document.
  function drsSheet() {
    var s = R(10, 10, 1180, 660, { rx: 6, fill: '#FFFFFF', stroke: C.ink, 'stroke-width': 3 });
    // title block
    s += G('tb-co', R(20, 20, 170, 70, { fill: '#F4F6FA', stroke: C.ink }) + T(105, 50, 'Fluidstack', { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(105, 74, 'company', { 'font-size': 12, 'text-anchor': 'middle', fill: C.muted }));
    s += G('tb-num', R(20, 95, 170, 90, { fill: DRSSOFT, stroke: DRSBLUE, 'stroke-width': 2.5 }) + T(105, 132, 'DRS', { 'font-size': 26, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(105, 165, '01.00.01', { 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', fill: DRSBLUE, 'font-family': MONO }));
    s += G('tb-title', R(20, 190, 170, 280, { fill: '#FFFFFF', stroke: C.ink }) + '<text transform="translate(118 455) rotate(-90)" font-family="' + FONT + '" font-size="20" font-weight="700" fill="' + C.ink + '">GENERAL FIBER CABLE</text><text transform="translate(146 455) rotate(-90)" font-family="' + FONT + '" font-size="20" font-weight="700" fill="' + C.ink + '">DRESSING</text>');
    s += G('tb-rev', R(20, 475, 170, 50, { fill: '#FFF4D6', stroke: C.ink }) + T(30, 497, 'REVISED', { 'font-size': 12, 'font-weight': 700, fill: C.ink }) + T(180, 497, '6/9/2026', { 'font-size': 14, 'font-weight': 700, fill: C.ink, 'text-anchor': 'end' }) + T(30, 516, 'check this date', { 'font-size': 11, fill: C.muted }));
    s += G('tb-appr', R(20, 530, 170, 40, { fill: '#FFFFFF', stroke: C.ink }) + T(30, 548, 'APPROVED BY', { 'font-size': 11, 'font-weight': 700, fill: C.ink }) + T(30, 564, '(name on the sheet)', { 'font-size': 11, fill: C.muted }));
    s += G('tb-int', R(20, 575, 170, 85, { fill: '#F6F6F4', stroke: C.ink }) + T(105, 597, 'Internal Use Only', { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: STOPRED }) + T(105, 616, 'confidential: do not', { 'font-size': 11, 'text-anchor': 'middle', fill: C.muted }) + T(105, 631, 'copy or share without', { 'font-size': 11, 'text-anchor': 'middle', fill: C.muted }) + T(105, 646, 'written permission', { 'font-size': 11, 'text-anchor': 'middle', fill: C.muted }));
    function head(x, y, n, t) { return '<circle cx="' + (x + 13) + '" cy="' + (y - 6) + '" r="13" fill="' + C.ink + '"/>' + T(x + 13, y - 1, n, { 'font-size': 14, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }) + T(x + 34, y, t, { 'font-size': 17, 'font-weight': 700, fill: C.ink, 'text-decoration': 'underline' }); }
    var lines = ['1. Dress per ANSI/TIA-568, ANSI/TIA-606, ANSI/TIA-942', '2. 1/2 in hook-and-loop (Velcro). No nylon zip ties', '3. Bend radius: manufacturer spec; loaded 20× min,', '    unloaded 10× min', '4. Supports must not damage cable (no metal staples)', '5. TIA-568: support every 4-5 ft on horizontal runs', '6. Rated cable: plenum OFNP/CMP · riser OFNR/CMR ·', '    LSZH where local code requires'];
    var g1 = head(215, 60, '1', 'GENERAL CABLE DRESSING');
    lines.forEach(function (l, i) { g1 += T(225, 92 + i * 24, l, { 'font-size': 14.5, fill: C.ink }); });
    s += G('sec-1', g1);
    // prohibited zip ties + staple icons under section 1
    function no(x, y, k, label) { var g = '<circle cx="' + x + '" cy="' + y + '" r="42" fill="#FCE3E3" stroke="' + STOPRED + '" stroke-width="6"/>'; g += L(x - 30, y + 30, x + 30, y - 30, { stroke: STOPRED, 'stroke-width': 7 }); g += T(x, y + 62, label, { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: STOPRED }); return G(k, g); }
    s += no(330, 360, 'no-zip', 'nylon zip ties');
    s += G('no-zip-i', P('M300 345 L 360 375 M300 352 L 360 382 M300 338 L 360 368', { stroke: C.ink, 'stroke-width': 3 }));
    s += no(520, 360, 'no-staple', 'metal staples');
    s += G('no-staple-i', P('M500 390 L500 345 Q 520 325 540 345 L540 390', { stroke: '#7A818A', 'stroke-width': 6, fill: 'none' }));
    s += G('bad-bend', P('M255 600 C 255 480, 330 480, 330 560 L 330 620', { stroke: C.fiber, 'stroke-width': 8, fill: 'none' }) + T(345, 560, 'too-tight bend', { 'font-size': 13, 'font-weight': 700, fill: STOPRED }) + T(345, 578, '(shown as wrong)', { 'font-size': 12, fill: C.muted }));
    s += L(640, 20, 640, 660, { stroke: C.ink, 'stroke-width': 2 });
    // section 2: velcro
    s += G('sec-2', head(690, 60, '2', 'HOOK-AND-LOOP (VELCRO)') + R(760, 85, 240, 120, { rx: 18, fill: '#E3F2E1', stroke: '#7CC38B', 'stroke-width': 5 }) + '<circle cx="880" cy="140" r="38" fill="#2B2F33"/><circle cx="880" cy="140" r="12" fill="#E3F2E1"/>' + R(780, 182, 90, 10, { rx: 3, fill: '#2B2F33' }) + R(890, 182, 90, 10, { rx: 3, fill: '#2B2F33' }));
    // section 3: bend radius
    s += G('sec-3', head(690, 260, '3', 'FIBER CABLE BEND RADIUS') + '<circle cx="790" cy="370" r="62" fill="#fff" stroke="' + C.ink + '" stroke-width="4"/>' + T(790, 366, '20 × diameter', { 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(790, 384, 'of cable', { 'font-size': 13, 'text-anchor': 'middle', fill: C.ink }) + P('M728 470 L728 370 A 62 62 0 0 1 790 308 L 960 308', { stroke: C.fiber, 'stroke-width': 9, fill: 'none' }) + R(960, 300, 46, 16, { rx: 3, fill: '#2C6FD1' }));
    s += G('xref', R(900, 350, 250, 40, { rx: 8, fill: '#FFF4D6', stroke: '#E0A82E', 'stroke-width': 2 }) + T(1025, 376, 'SEE DRS 01.00.07', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    // section 4: support
    var tray = ''; for (var i = 0; i < 26; i++) tray += L(660 + i * 20, 590, 660 + i * 20, 640, { stroke: '#9AA0A6', 'stroke-width': 2 });
    s += G('sec-4', head(690, 560, '4', 'CABLE SUPPORT') + R(660, 590, 510, 50, { fill: 'none', stroke: '#9AA0A6', 'stroke-width': 3 }) + tray + L(660, 625, 1170, 625, { stroke: C.fiber, 'stroke-width': 7 }));
    s += T(1180, 664, 'Redrawn layout for training. Not a copy of the DRS.', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' });
    return svg(1200, 680, s, 'How a DRS sheet is laid out: DRS 01.00.01 as the example');
  }


  // DRS 01.00.03 Cable dressing in basket trays — redrawn for training (not a copy of the DRS drawing)
  function trayPlan() {
    var s = '';
    function badge(x, y, n) { return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="' + C.ink + '"/>' + T(x, y + 5, String(n), { 'font-size': 14, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }); }
    function lab(x, y, lines, o) { o = o || {}; var g = ''; lines.forEach(function (l, i) { g += T(x, y + i * 19, l, { 'font-size': o.fs || 15, 'font-weight': i === 0 ? 700 : 400, fill: o.c || C.ink, 'text-anchor': o.a || 'start' }); }); return g; }
    function hit(x, y, w, h) { return R(x, y, w, h, { fill: '#FFFFFF', 'fill-opacity': 0 }); }
    function mesh(x, y, w, h) { var g = R(x, y, w, h, { fill: '#F1EEE7', stroke: C.steel, 'stroke-width': 2.5 }); for (var i = 14; i < w; i += 14) g += L(x + i, y, x + i, y + h, { stroke: '#B9BDC2', 'stroke-width': 1 }); for (var j = 14; j < h; j += 14) g += L(x, y + j, x + w, y + j, { stroke: '#B9BDC2', 'stroke-width': 1 }); return g; }
    function tick(x1, y1, x2, y2, c, w) { return L(x1, y1, x2, y2, { stroke: c || '#7A818A', 'stroke-width': w || 5, 'stroke-linecap': 'round' }); }
    // plan view of the tray: top run, right run, bottom run
    s += G('tray-plan', mesh(340, 150, 600, 70) + mesh(940, 150, 70, 470) + mesh(340, 550, 600, 70) + T(340, 140, 'BASKET TRAY · top view', { 'font-size': 15, 'font-weight': 700, fill: C.ink }));
    // the bundle
    s += G('bundle', P('M470 238 L470 214 Q470 186 498 186 L940 186 Q975 186 975 221 L975 549 Q975 585 940 585 L620 585 Q585 585 585 560 L585 546', { stroke: C.fiber, 'stroke-width': 9, fill: 'none', 'stroke-linejoin': 'round' }));
    // rule 1 + 3: Velcro every 12-18 in, 1/2 in, not strapped on straight runs
    var sp = ''; for (var x = 545; x <= 900; x += 55) sp += tick(x, 176, x, 196); for (var y = 280; y <= 500; y += 55) sp += tick(965, y, 985, y); for (var x2 = 680; x2 <= 900; x2 += 55) sp += tick(x2, 575, x2, 595);
    s += G('b-spacing', hit(520, 96, 400, 110) + sp + L(600, 176, 600, 128, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(610, 112, ['1/2-in Velcro every 12-18 in', 'bundled neatly, NOT strapped to the tray on straight runs'], { fs: 14 }));
    // rule 2: secured 3x at corners
    var cr = tick(922, 175, 922, 197, C.ink, 6) + tick(955, 206, 969, 192, C.ink, 6) + tick(964, 240, 986, 240, C.ink, 6) +
      tick(964, 530, 986, 530, C.ink, 6) + tick(955, 564, 969, 578, C.ink, 6) + tick(922, 574, 922, 596, C.ink, 6);
    s += G('c-corner', hit(912, 160, 280, 90) + cr + L(1000, 200, 1030, 200, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(1034, 196, ['secure to the tray', '3× at each corner'], { fs: 14 }));
    // rule 2: secured 3x at exits
    var ex = tick(460, 226, 480, 226, C.ink, 6) + tick(472, 202, 486, 188, C.ink, 6) + tick(512, 175, 512, 197, C.ink, 6) +
      tick(575, 556, 595, 556, C.ink, 6) + tick(590, 576, 604, 590, C.ink, 6) + tick(632, 574, 632, 596, C.ink, 6);
    s += G('c-exit', hit(450, 548, 230, 100) + ex + L(610, 600, 610, 628, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(540, 646, ['secure 3× at each exit'], { fs: 14 }));
    // rule 4: waterfalls at the exits, centered over the rack VCM
    function wfIcon(cx, y, up) { return R(cx - 26, y, 52, 14, { rx: 3, fill: '#B8BEC6', stroke: C.steel, 'stroke-width': 2 }) + P(up ? ('M' + (cx - 26) + ' ' + y + ' Q ' + cx + ' ' + (y - 22) + ' ' + (cx + 26) + ' ' + y) : ('M' + (cx - 26) + ' ' + (y + 14) + ' Q ' + cx + ' ' + (y + 36) + ' ' + (cx + 26) + ' ' + (y + 14)), { stroke: C.steel, 'stroke-width': 4, fill: 'none' }); }
    s += G('wf-c', hit(330, 214, 200, 110) + wfIcon(470, 222, false) + wfIcon(585, 536, true) + L(470, 252, 470, 290, { stroke: C.teal, 'stroke-width': 2, 'stroke-dasharray': '5 4' }) + lab(400, 306, ['waterfall centered', 'over the rack VCM'], { fs: 14 }) +
      L(585, 520, 585, 470, { stroke: C.teal, 'stroke-width': 2, 'stroke-dasharray': '5 4' }) + T(585, 460, 'rack VCM below', { 'font-size': 12, fill: C.muted, 'text-anchor': 'middle' }));
    // rule 5: bend radius at the corner
    s += G('bend20', '<circle cx="925" cy="535" r="44" fill="#FFFFFF" fill-opacity="0.85" stroke="' + C.ink + '" stroke-width="3"/>' + T(925, 531, '20× cable', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(925, 547, 'diameter', { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) +
      L(870, 520, 800, 480, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(660, 450, ['fiber bend radius at corners:', 'drawing shows 20× diameter;', 'follow the manufacturer spec'], { fs: 13 }));
    // side views
    s += T(30, 120, 'SIDE VIEW · tray exit', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    var good = P('M110 170 L110 200 L280 200 L280 170', { stroke: C.steel, 'stroke-width': 4, fill: 'none' }) +
      P('M270 192 L130 192 Q 92 192 92 230 L92 320', { stroke: C.fiber, 'stroke-width': 8, fill: 'none' }) +
      P('M134 205 Q 105 205 105 236', { stroke: '#8D949C', 'stroke-width': 11, fill: 'none' }) +
      tick(200, 184, 200, 200) + tick(240, 184, 240, 200) +
      lab(150, 248, ['waterfall keeps', 'the bend radius'], { fs: 13, c: OKG }) + '<circle cx="64" cy="168" r="12" fill="' + OKSOFT + '" stroke="' + OKG + '" stroke-width="2"/>' + T(64, 173, '✓', { 'font-size': 14, 'font-weight': 700, fill: OKG, 'text-anchor': 'middle' });
    s += G('side-wf', hit(30, 150, 270, 180) + good);
    var bad = P('M110 400 L110 430 L280 430 L280 400', { stroke: C.steel, 'stroke-width': 4, fill: 'none' }) +
      P('M270 422 L112 422 L104 430 L104 560', { stroke: C.fiber, 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'miter' }) +
      '<circle cx="106" cy="428" r="20" fill="none" stroke="' + STOPRED + '" stroke-width="4"/>' +
      '<circle cx="64" cy="398" r="12" fill="' + STOPSOFT + '" stroke="' + STOPRED + '" stroke-width="2"/>' + L(57, 391, 71, 405, { stroke: STOPRED, 'stroke-width': 3 }) + L(71, 391, 57, 405, { stroke: STOPRED, 'stroke-width': 3 }) +
      lab(130, 478, ['NEVER drop over a', 'tray edge unsupported'], { fs: 13, c: STOPRED });
    s += G('bad-drop', hit(30, 380, 270, 190) + bad);
    // rule badges
    s += badge(588, 107, 1) + badge(1014, 187, 2) + badge(518, 637, 2) + badge(378, 297, 4) + badge(638, 441, 5) + badge(130, 239, 5);
    s += T(1190, 654, 'Redrawn for training from DRS 01.00.03. Not a copy of the DRS.', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' });
    return svg(1200, 660, s, 'DRS 01.00.03: cable dressing in basket trays');
  }

  // DRS 01.00.03.01 Cable dressing in vertical pathways — elevation view, redrawn for training
  function vertPath() {
    var s = '';
    function badge(x, y, n) { return '<circle cx="' + x + '" cy="' + y + '" r="14" fill="' + C.ink + '"/>' + T(x, y + 5, String(n), { 'font-size': 14, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }); }
    function lab(x, y, lines, o) { o = o || {}; var g = ''; lines.forEach(function (l, i) { g += T(x, y + i * 19, l, { 'font-size': o.fs || 14, 'font-weight': i === 0 ? 700 : 400, fill: o.c || C.ink, 'text-anchor': o.a || 'start' }); }); return g; }
    function hit(x, y, w, h) { return R(x, y, w, h, { fill: '#FFFFFF', 'fill-opacity': 0 }); }
    function hTray(x, y, w) { var g = R(x, y, w, 22, { fill: '#F1EEE7', stroke: C.steel, 'stroke-width': 2.5 }); for (var i = 14; i < w; i += 14) g += L(x + i, y, x + i, y + 22, { stroke: '#B9BDC2', 'stroke-width': 1 }); return g; }
    function vTray(x, y, h) { var g = R(x, y, 26, h, { fill: '#F1EEE7', stroke: C.steel, 'stroke-width': 2.5 }); for (var j = 14; j < h; j += 14) g += L(x, y + j, x + 26, y + j, { stroke: '#B9BDC2', 'stroke-width': 1 }); return g; }
    function tick(x1, y1, x2, y2, c, w) { return L(x1, y1, x2, y2, { stroke: c || C.ink, 'stroke-width': w || 5, 'stroke-linecap': 'round' }); }
    function nope(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + STOPSOFT + '" fill-opacity="0.55" stroke="' + STOPRED + '" stroke-width="5"/>' + L(cx - r * 0.7, cy - r * 0.7, cx + r * 0.7, cy + r * 0.7, { stroke: STOPRED, 'stroke-width': 5 }); }
    // GOOD side (right): bottom tray -> waterfall -> vertical tray up -> waterfall -> top tray
    s += G('good-trays', hTray(640, 590, 380) + vTray(1060, 130, 482) + hTray(640, 110, 380) + T(1102, 380, 'vertical tray / ladder', { 'font-size': 13, fill: C.muted, transform: 'rotate(90 1102 380)', 'text-anchor': 'middle' }));
    function wf(path) { return P(path, { stroke: '#8D949C', 'stroke-width': 11, fill: 'none' }); }
    s += G('wf-top', hit(1000, 92, 100, 90) + wf('M1010 133 Q 1062 133 1062 178') + lab(912, 172, ['waterfall at the', 'vertical transition'], { fs: 13 }));
    s += G('wf-bot', hit(1000, 540, 100, 90) + wf('M1008 611 Q 1084 611 1084 545'));
    s += G('good-path', P('M650 121 L 1010 121 Q 1073 121 1073 175 L 1073 545 Q 1073 600 1010 600 L 650 600', { stroke: C.fiber, 'stroke-width': 8, fill: 'none' }));
    // horizontal: bundled every 12-18 in but floating (gray ticks)
    var fl = ''; for (var x = 690; x <= 960; x += 54) fl += tick(x, 112, x, 130, '#7A818A', 4); for (var x2 = 690; x2 <= 960; x2 += 54) fl += tick(x2, 591, x2, 609, '#7A818A', 4);
    s += G('h-float', hit(640, 50, 380, 85) + fl + lab(650, 70, ['horizontal runs: Velcro every 12-18 in,', 'bundles float (not secured to the tray)'], { fs: 13 }));
    // vertical: secured to tray (black, thicker)
    var sec = ''; for (var y = 200; y <= 520; y += 54) sec += tick(1061, y, 1085, y, C.ink, 6);
    s += G('v-secured', hit(940, 190, 150, 200) + sec + L(1040, 264, 1058, 264, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(946, 252, ['secured to', 'the tray, self-', 'supporting'], { fs: 13 }));
    s += G('v-velcro', hit(940, 440, 120, 80) + L(1040, 484, 1058, 484, { stroke: C.muted, 'stroke-width': 1.5 }) + lab(946, 462, ['3/4-in Velcro', 'may secure it', 'to the tray'], { fs: 13, c: C.teal }));
    // bend radius note
    s += G('bend20', '<circle cx="800" cy="360" r="78" fill="#FFFFFF" stroke="' + C.ink + '" stroke-width="3"/>' + lab(800, 340, ['ALL BENDS', 'greater than 20×', 'cable diameter'], { fs: 14, a: 'middle' }));
    // BAD side (left): missing waterfall at top, inadequate Velcro at bottom
    s += G('bad-trays', hTray(170, 110, 330) + vTray(130, 110, 502) + hTray(170, 590, 330));
    s += G('bad-wf', P('M490 121 L 160 121 L 143 140', { stroke: C.fiber, 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'miter' }) + nope(150, 130, 46) + lab(210, 175, ['NO WATERFALL at the', 'transition: cable and', 'tray get damaged'], { fs: 13, c: STOPRED }));
    s += G('bad-drop', P('M143 150 L 143 560 Q 143 600 175 588 Q 200 578 185 600 L 490 600', { stroke: C.fiber, 'stroke-width': 8, fill: 'none' }) + nope(155, 590, 48) +
      tick(131, 260, 155, 260, '#B9BDC2', 4) + lab(210, 520, ['too little Velcro: the cable', 'slides to the bottom under', 'its own weight'], { fs: 13, c: STOPRED }));
    s += T(140, 70, 'NOT LIKE THIS', { 'font-size': 16, 'font-weight': 700, fill: STOPRED }) + T(650, 30, 'LIKE THIS', { 'font-size': 16, 'font-weight': 700, fill: OKG });
    // UP arrow
    s += G('up', P('M560 470 L560 330 L540 330 L575 290 L610 330 L590 330 L590 470 Z', { fill: '#FFFFFF', stroke: C.ink, 'stroke-width': 2.5 }) + T(575, 420, 'UP', { 'font-size': 16, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle', transform: 'rotate(-90 575 420)' }) + T(575, 495, 'side view', { 'font-size': 12, fill: C.muted, 'text-anchor': 'middle' }));
    s += badge(636, 66, 1) + badge(930, 240, 2) + badge(930, 272, 3) + badge(898, 168, 4) + badge(930, 458, 5) + badge(196, 171, 4) + badge(196, 516, 3);
    s += T(1190, 690, 'Redrawn for training from DRS 01.00.03.01. Not a copy of the DRS.', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' });
    return svg(1200, 700, s, 'DRS 01.00.03.01: cable dressing in vertical pathways');
  }
  // DRS 01.00.02 Front of rack cable dressing — redrawn for training (not a copy of the DRS drawing)
  function frontRack() {
    var s = '';
    function badge(x, y, n) { return '<circle cx="' + x + '" cy="' + y + '" r="15" fill="' + C.ink + '"/>' + T(x, y + 5, String(n), { 'font-size': 15, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }); }
    function hit(x, y, w, h) { return R(x, y, w, h, { fill: '#FFFFFF', 'fill-opacity': 0 }); }
    function lab(x, y, lines, o) { o = o || {}; var g = ''; lines.forEach(function (l, i) { g += T(x, y + i * 19, l, { 'font-size': o.fs || 15, 'font-weight': i === 0 ? 700 : 400, fill: o.c || C.ink, 'text-anchor': o.a || 'start' }); }); return g; }
    // basket tray
    var mesh = ''; for (var i = 0; i < 57; i++) mesh += L(40 + i * 20, 62, 40 + i * 20, 86, { stroke: '#9AA0A6', 'stroke-width': 1.5 });
    s += G('tray', R(30, 60, 1140, 28, { fill: '#ECE9E2', stroke: C.steel, 'stroke-width': 2.5 }) + mesh + T(880, 48, 'BASKET TRAY (overhead, wire mesh)', { 'font-size': 15, 'font-weight': 700, fill: C.ink }));
    // compute-style rack (front)
    function rackBody(x, k, kind) {
      var g = R(x, 210, 220, 450, { fill: '#F2F0EA', stroke: C.ink, 'stroke-width': 3 });
      if (kind === 'net') {
        for (var r = 0; r < 4; r++) { g += R(x + 12, 226 + r * 30, 196, 22, { rx: 3, fill: '#2B2F33' }); for (var d = 0; d < 12; d++) g += R(x + 22 + d * 15, 233 + r * 30, 9, 8, { fill: '#8FA3B5' }); }
        for (var u = 0; u < 8; u++) g += R(x + 12, 360 + u * 34, 196, 26, { fill: C.unit, stroke: C.rule });
      } else {
        for (var r2 = 0; r2 < 3; r2++) { g += R(x + 12, 226 + r2 * 26, 196, 18, { rx: 3, fill: '#2B2F33' }); for (var d2 = 0; d2 < 12; d2++) g += R(x + 22 + d2 * 15, 231 + r2 * 26, 9, 7, { fill: '#8FA3B5' }); }
        for (var u2 = 0; u2 < 7; u2++) { g += R(x + 12, 318 + u2 * 46, 196, 38, { fill: C.compute, stroke: '#A9A49A' }); g += '<circle cx="' + (x + 26) + '" cy="' + (337 + u2 * 46) + '" r="5" fill="#59616B"/>'; }
      }
      g += T(x + 110, 202, kind === 'net' ? 'NETWORK RACK (front)' : 'RACK (front)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
      return G(k, g);
    }
    function vcm(x, k) { var g = R(x, 210, 28, 450, { fill: '#C9CDD2', stroke: C.steel, 'stroke-width': 2 }); for (var f = 0; f < 22; f++) g += L(x + 3, 222 + f * 20, x + 25, 222 + f * 20, { stroke: '#8D949C', 'stroke-width': 2 }); return G(k, g); }
    s += rackBody(200, 'rack-c', 'compute') + vcm(170, 'vcm-l') + vcm(422, 'vcm-r');
    s += rackBody(840, 'rack-n', 'net') + vcm(810, 'vcm-n');
    // side waterfalls under the tray, aligned with the rack VCMs
    function wf(cx, k) { return G(k, R(cx - 28, 88, 56, 14, { rx: 4, fill: '#B8BEC6', stroke: C.steel, 'stroke-width': 2 }) + P('M' + (cx - 28) + ' 102 Q ' + cx + ' 138 ' + (cx + 28) + ' 102', { stroke: C.steel, 'stroke-width': 5, fill: 'none' })); }
    s += wf(184, 'wf-l') + wf(436, 'wf-r');
    s += lab(76, 150, ['waterfall', 'aligned with', 'rack VCM'], { fs: 13, a: 'middle' });
    // correct path: tray -> left waterfall -> left VCM -> ports on the left side
    var ok = P('M110 74 L 172 74 Q 184 74 184 100 L 184 400 Q 184 410 196 410 L 222 410', { stroke: OKG, 'stroke-width': 7, fill: 'none' }) +
      P('M110 80 L 168 80 Q 180 80 180 104 L 180 450 Q 180 456 192 456 L 222 456', { stroke: OKG, 'stroke-width': 4, fill: 'none' });
    s += G('ok-path', hit(110, 66, 120, 400) + ok);
    s += G('velcro', hit(36, 146, 166, 216) + R(172, 150, 24, 7, { rx: 2, fill: '#2C9BE0' }) + R(172, 260, 24, 7, { rx: 2, fill: '#2C9BE0' }) + R(172, 350, 24, 7, { rx: 2, fill: '#2C9BE0' }) + lab(40, 268, ['1/2-in', 'Velcro'], { fs: 13 }));
    s += G('exit', hit(160, 8, 330, 56) + L(184, 60, 184, 30, { stroke: OKG, 'stroke-width': 2, 'stroke-dasharray': '4 3' }) + lab(196, 26, ['exits directly above the rack edge / VCM'], { fs: 13, c: OKG }));
    s += G('side', hit(228, 672, 360, 26) + lab(232, 690, ['patches on the LEFT side → uses the LEFT waterfall'], { fs: 13, c: OKG }));
    // wrong: crossing devices it does not patch into
    s += G('bad-cross', hit(230, 330, 220, 240) + P('M436 102 L 436 340 L 236 566', { stroke: STOPRED, 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '12 7' }) +
      '<circle cx="336" cy="453" r="24" fill="' + STOPSOFT + '" stroke="' + STOPRED + '" stroke-width="4"/>' + L(321, 438, 351, 468, { stroke: STOPRED, 'stroke-width': 5 }) + L(351, 438, 321, 468, { stroke: STOPRED, 'stroke-width': 5 }) +
      lab(470, 470, ['NOT ALLOWED', 'crosses devices it', 'does not patch into'], { fs: 14, c: STOPRED }));
    // over-the-top waterfall at the network rack
    s += G('wf-top', hit(650, 40, 190, 150) + P('M740 58 L 790 58 Q 824 58 824 96', { stroke: C.steel, 'stroke-width': 10, fill: 'none' }) + lab(730, 130, ['over-the-top', 'waterfall', 'aligned with rack VCM'], { fs: 13, a: 'middle' }));
    s += G('net-path', hit(842, 190, 40, 90) + P('M660 52 L 788 52 Q 824 52 824 98 L 824 262 Q 824 268 836 268 L 856 268', { stroke: OKG, 'stroke-width': 6, fill: 'none' }));
    // tray accessory note
    s += G('acc', R(470, 560, 330, 104, { rx: 10, fill: '#FFF4D6', stroke: '#E0A82E', 'stroke-width': 2 }) + lab(486, 586, ['Tray accessories must fit the tray', 'Basor, WBT, Legrand or equivalent', '2 × 4 in (50 × 100 mm) openings', '5 mm wire'], { fs: 14 }));
    // legend
    s += R(480, 240, 300, 92, { rx: 10, fill: '#fff', stroke: C.rule }) + L(496, 268, 546, 268, { stroke: OKG, 'stroke-width': 6 }) + T(556, 273, 'correct route', { 'font-size': 14, fill: C.ink }) +
      L(496, 304, 546, 304, { stroke: STOPRED, 'stroke-width': 6, 'stroke-dasharray': '12 7' }) + T(556, 309, 'not allowed', { 'font-size': 14, fill: C.ink });
    // rule badges
    s += badge(300, 520, 1) + badge(166, 32, 2) + badge(222, 122, 3) + badge(860, 110, 4) + badge(150, 262, 5) + badge(216, 690 - 5, 6);
    s += T(1190, 694, 'Redrawn for training from DRS 01.00.02. Not a copy of the DRS.', { 'font-size': 11, fill: C.muted, 'text-anchor': 'end' });
    return svg(1200, 700, s, 'DRS 01.00.02: front of rack cable dressing');
  }
  // The six rules of DRS 01.00.01, one tile each
  function dressRules() {
    var tiles = [
      ['r1', '01', 'Standards', ['Dress cables per', 'ANSI/TIA-568, -606, -942'], 'ANSI/TIA'],
      ['r2', '02', '1/2-inch Velcro only', ['Hook-and-loop straps.', 'Nylon zip ties prohibited.'], 'DRS'],
      ['r3', '03', 'Bend radius', ['Manufacturer spec, and at least', 'loaded 20× · unloaded 10×'], 'DRS · see 01.00.07'],
      ['r4', '04', 'Safe supports', ['Supports must not damage', 'the cable. No metal staples.'], 'DRS'],
      ['r5', '05', 'Support spacing', ['Every 4-5 feet', 'on horizontal runs'], 'TIA-568'],
      ['r6', '06', 'Rated cable', ['Plenum OFNP/CMP · Riser OFNR/CMR', 'LSZH where local code requires'], 'NEC ratings']
    ];
    var s = '';
    tiles.forEach(function (t, i) {
      var x = 20 + (i % 3) * 393, y = 20 + Math.floor(i / 3) * 290, w = 375, h = 270;
      var g = R(x, y, w, h, { rx: 14, fill: C.card, stroke: C.ink, 'stroke-width': 2.5 }) + R(x, y, 8, h, { fill: DRSBLUE });
      g += R(x + 22, y + 18, 54, 34, { rx: 8, fill: DRSSOFT }) + T(x + 49, y + 42, t[1], { 'font-size': 18, 'font-weight': 700, 'text-anchor': 'middle', fill: DRSBLUE, 'font-family': MONO });
      g += T(x + 90, y + 43, t[2], { 'font-size': 22, 'font-weight': 700, fill: C.ink });
      t[3].forEach(function (l, j) { g += T(x + 26, y + 180 + j * 24, l, { 'font-size': 16, fill: C.ink }); });
      g += R(x + 26, y + h - 42, 170, 28, { rx: 14, fill: '#F2F0EA' }) + T(x + 111, y + h - 23, t[4], { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.muted });
      // small pictograms
      var cx = x + w / 2, cy = y + 112;
      if (t[0] === 'r1') g += R(cx - 70, cy - 40, 60, 78, { rx: 4, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }) + R(cx + 10, cy - 40, 60, 78, { rx: 4, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }) + T(cx - 40, cy + 6, '568', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(cx + 40, cy + 6, '942', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
      if (t[0] === 'r2') g += R(cx - 110, cy - 14, 120, 26, { rx: 6, fill: '#2B2F33' }) + '<circle cx="' + (cx + 60) + '" cy="' + cy + '" r="34" fill="#FCE3E3" stroke="' + STOPRED + '" stroke-width="5"/>' + L(cx + 36, cy + 24, cx + 84, cy - 24, { stroke: STOPRED, 'stroke-width': 6 }) + P('M' + (cx + 40) + ' ' + (cy - 8) + ' L' + (cx + 80) + ' ' + (cy + 10), { stroke: C.ink, 'stroke-width': 3 });
      if (t[0] === 'r3') g += P('M' + (cx - 60) + ' ' + (cy + 40) + ' A 60 60 0 0 1 ' + cx + ' ' + (cy - 20) + ' L ' + (cx + 90) + ' ' + (cy - 20), { stroke: C.fiber, 'stroke-width': 9, fill: 'none' }) + L(cx, cy + 40, cx - 60, cy + 40, { stroke: C.muted, 'stroke-dasharray': '5 4' });
      if (t[0] === 'r4') g += P('M' + (cx - 30) + ' ' + (cy + 30) + ' L' + (cx - 30) + ' ' + (cy - 10) + ' Q ' + cx + ' ' + (cy - 40) + ' ' + (cx + 30) + ' ' + (cy - 10) + ' L' + (cx + 30) + ' ' + (cy + 30), { stroke: '#7A818A', 'stroke-width': 7, fill: 'none' }) + '<circle cx="' + cx + '" cy="' + cy + '" r="46" fill="none" stroke="' + STOPRED + '" stroke-width="5"/>' + L(cx - 32, cy + 32, cx + 32, cy - 32, { stroke: STOPRED, 'stroke-width': 6 });
      if (t[0] === 'r5') { g += L(cx - 140, cy + 10, cx + 140, cy + 10, { stroke: C.fiber, 'stroke-width': 7 }); for (var k = 0; k < 3; k++) g += R(cx - 145 + k * 135, cy + 10, 12, 30, { fill: C.steel }); g += T(cx - 72, cy - 6, '4-5 ft', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(cx + 63, cy - 6, '4-5 ft', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }); }
      if (t[0] === 'r6') g += R(cx - 130, cy - 26, 80, 46, { rx: 8, fill: '#E3EEF7', stroke: C.ink }) + T(cx - 90, cy + 4, 'OFNP', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + R(cx - 40, cy - 26, 80, 46, { rx: 8, fill: '#EFEAF7', stroke: C.ink }) + T(cx, cy + 4, 'OFNR', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + R(cx + 50, cy - 26, 80, 46, { rx: 8, fill: '#EAF5EA', stroke: C.ink }) + T(cx + 90, cy + 4, 'LSZH', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink });
      s += G(t[0], g);
    });
    return svg(1200, 600, s, 'DRS 01.00.01: the six general cable dressing rules');
  }
  // Where plenum and riser cables go (NEC background; the DRS sets the rule)
  function cableRatings() {
    var s = '';
    // two floors
    for (var f = 0; f < 2; f++) {
      var y = 40 + f * 270;
      s += R(40, y, 840, 250, { fill: '#FBFAF6', stroke: C.ink, 'stroke-width': 3 });
      s += R(40, y, 840, 70, { fill: '#E3EEF7', stroke: 'none' }) + L(40, y + 70, 880, y + 70, { stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '10 6' });
      s += T(60, y + 26, 'ceiling space used for air (plenum)', { 'font-size': 14, fill: C.muted, 'font-weight': 700 });
      for (var a = 0; a < 3; a++) s += P('M' + (420 + a * 140) + ' ' + (y + 30) + ' l 50 0 m -12 -8 l 12 8 l -12 8', { stroke: '#4A90C2', 'stroke-width': 3, fill: 'none' });
      s += T(60, y + 150, f === 0 ? 'Floor 2' : 'Floor 1', { 'font-size': 18, 'font-weight': 700, fill: C.ink });
    }
    s += G('plenum', L(60, 92, 860, 92, { stroke: C.fiber, 'stroke-width': 8 }) + R(300, 98, 330, 34, { rx: 8, fill: '#fff', stroke: C.ink }) + T(465, 121, 'plenum-rated: OFNP (fiber) · CMP (copper)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }));
    s += G('riser', R(900, 40, 120, 520, { fill: '#F2F0EA', stroke: C.ink, 'stroke-width': 3 }) + L(960, 50, 960, 550, { stroke: C.fiber, 'stroke-width': 8 }) + T(960, 300, 'riser', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink, transform: 'rotate(-90 960 300)', dy: '-14' }));
    s += G('riser-l', R(1030, 230, 160, 74, { rx: 8, fill: '#fff', stroke: C.ink }) + T(1110, 258, 'riser-rated:', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(1110, 280, 'OFNR · CMR', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(1110, 298, 'floor to floor', { 'font-size': 12, 'text-anchor': 'middle', fill: C.muted }));
    s += G('lszh', R(60, 470, 420, 70, { rx: 10, fill: '#EAF5EA', stroke: OKG, 'stroke-width': 2 }) + T(270, 498, 'LSZH: Low Smoke, Zero Halogen jacket', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(270, 522, 'used where local code requires it', { 'font-size': 14, 'text-anchor': 'middle', fill: C.muted }));
    s += G('rank', R(500, 470, 380, 70, { rx: 10, fill: '#FFF4D6', stroke: '#E0A82E', 'stroke-width': 2 }) + T(690, 498, 'plenum ≥ riser ≥ general purpose', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: C.ink }) + T(690, 522, 'higher may replace lower, never the reverse', { 'font-size': 13, 'text-anchor': 'middle', fill: C.muted }));
    s += T(40, 590, 'Ratings are fire ratings from the NEC. DRS 01.00.01 rule 6 says which rating each space needs.', { 'font-size': 13, fill: C.muted });
    return svg(1200, 600, s, 'Plenum, riser and LSZH cable: where each is used');
  }
  // What each standard named in the DRS covers
  function standardsMap() {
    var cards = [
      ['s568', 'ANSI/TIA-568', 'Telecom cabling for buildings', ['How cabling is designed, installed', 'and tested (e.g. support spacing)'], '01.00.01'],
      ['s606', 'ANSI/TIA-606', 'Administration', ['Labels, identifiers and records', 'for the cabling'], '01.00.01'],
      ['s942', 'ANSI/TIA-942', 'Data center infrastructure', ['Requirements for data center', 'and computer room infrastructure'], '01.00.01'],
      ['nec', 'NEC (NFPA 70)', 'U.S. electrical safety code', ['Cable fire ratings: OFNP/OFNR', '(fiber) and CMP/CMR (copper)'], 'ratings'],
      ['bicsi', 'BICSI', 'ICT professional association', ['Design and installation', 'standards, training, credentials'], '01.00.00'],
      ['nema', 'NEMA', 'Electrical manufacturers', ['Product standards, e.g.', 'enclosures, cable tray'], '01.00.00']
    ];
    var s = '';
    cards.forEach(function (c, i) {
      var x = 20 + (i % 3) * 393, y = 20 + Math.floor(i / 3) * 230, w = 375, h = 210;
      var g = R(x, y, w, h, { rx: 14, fill: C.card, stroke: C.ink, 'stroke-width': 2.5 });
      g += T(x + 22, y + 46, c[1], { 'font-size': 24, 'font-weight': 700, fill: C.ink, 'font-family': MONO });
      g += T(x + 22, y + 80, c[2], { 'font-size': 17, 'font-weight': 700, fill: DRSBLUE });
      c[3].forEach(function (l, j) { g += T(x + 22, y + 118 + j * 24, l, { 'font-size': 16, fill: C.ink }); });
      var tag = c[4] === 'ratings' ? 'cable ratings in 01.00.01' : 'named in DRS ' + c[4];
      g += R(x + 22, y + h - 42, 230, 26, { rx: 13, fill: '#F2F0EA' }) + T(x + 137, y + h - 24, tag, { 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: C.muted });
      s += G(c[0], g);
    });
    return svg(1200, 480, s, 'The industry standards named in the DRS and what they cover');
  }

  return {
    C: C, TIA: TIA, tia: tia, OCS_JACKET: OCS_JACKET, NET1: NET1, NET2: NET2,
    overview: overview, tpuRack: tpuRack, torSwitch: torSwitch, trunk144: trunk144, colorStrip: colorStrip,
    connectors: connectors, hallMap: hallMap, networkRows: networkRows, locationCode: locationCode,
    ocsPanel: ocsPanel, ocsCable: ocsCable, spocsRack: spocsRack, ocsShelf: ocsShelf, aioRack: aioRack,
    aioFront: aioFront, aioRear: aioRear, dcnppRear: dcnppRear, dcnppFront: dcnppFront, shuffle: shuffle,
    copperPanel: copperPanel, rmuFace: rmuFace, lcPanel: lcPanel, labels: labels, tray: tray, bend: bend,
    bmsFlow: bmsFlow, mgmtFlow: mgmtFlow, spocsMgmt: spocsMgmt, largePath: largePath, cutsheet: cutsheet,
    flow: flow, ring: ring, clearRings: clearRings, esc: esc,
    drsStack: drsStack, drsAccess: drsAccess, drsSheet: drsSheet, dressRules: dressRules, cableRatings: cableRatings, standardsMap: standardsMap, frontRack: frontRack, trayPlan: trayPlan, vertPath: vertPath
  };
})();
if (typeof module !== 'undefined') module.exports = DG;
