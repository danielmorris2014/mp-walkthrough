/* report-engine.js - the report formatter as a deep module (architecture
   candidate #2). The seam: ReportEngine.buildReport(style, ctx) where
   ctx = { state, numStyle, halls }. No DOM reads inside this file.
   index.html supplies a thin adapter; tools/test_report.py runs this file
   headless with a plain ctx for the 21-line format diff. */
var CABLES = ['F144', 'OCS', 'CAT6'];
var CABLE_LABEL = { F144: '144F', OCS: 'OCS', CAT6: 'Copper' };
var STATUS_ORDER = ['none', 'staged', 'prog', 'ran', 'hung', 'remed'];
var REPORT_STATUS_ORDER = ['hung', 'ran', 'prog', 'staged', 'remed'];
var STATUS_META = {
  none:   { short: '—',    badge: 'Empty',       report: 'Not started',  cardCls: 'sc-none',   pillCls: 'mp-none' },
  staged: { short: 'Staged', badge: 'Staged',      report: 'Staged',       cardCls: 'sc-staged', pillCls: 'mp-staged' },
  prog:   { short: 'Prog',   badge: 'In Progress', report: 'In progress',  cardCls: 'sc-prog',   pillCls: 'mp-prog' },
  ran:    { short: 'Ran',    badge: 'Ran',         report: 'Ran',          cardCls: 'sc-ran',    pillCls: 'mp-ran' },
  hung:   { short: 'Hung',   badge: 'Ran & Hung',  report: 'Ran and hung', cardCls: 'sc-hung',   pillCls: 'mp-hung' },
  remed:  { short: 'Remed',  badge: 'Remediation', report: 'Remediation',  cardCls: 'sc-remed',  pillCls: 'mp-remed' }
};
var ReportEngine = (function () {
function runsOf(arr) {
  var runs = [];
  var i = 0;
  while (i < arr.length) {
    var j = i;
    while (j + 1 < arr.length && arr[j + 1] === arr[j] + 1) j++;
    runs.push({ a: arr[i], b: arr[j] });
    i = j + 1;
  }
  return runs;
}

function fmt11(run, style) {
  var out = [];
  if (style === 'plain') {
    out.push(run.a === run.b ? ('Row ' + run.a + ' (11 side)') : ('Rows ' + run.a + '–' + run.b + ' (11 side)'));
    return out;
  }
  if (run.b - run.a >= 3) { out.push(run.a + '11–' + run.b + '11'); return out; }
  for (var r = run.a; r <= run.b; r++) out.push(r + '01–' + r + '11');
  return out;
}

function fmt13(run, style) {
  var out = [];
  if (style === 'plain') {
    out.push(run.a === run.b ? ('Row ' + run.a + ' (13 side)') : ('Rows ' + run.a + '–' + run.b + ' (13 side)'));
    return out;
  }
  if (run.b - run.a >= 3) { out.push(run.a + '13–' + run.b + (style === 'full' ? '22' : '13')); return out; }
  for (var r = run.a; r <= run.b; r++) out.push(style === 'full' ? (r + '13–' + r + '22') : (r + '13'));
  return out;
}

function fmtBoth(run, style, splitAnd) {
  var out = [];
  if (style === 'plain') {
    out.push(run.a === run.b ? ('Row ' + run.a + ' (both sides)') : ('Rows ' + run.a + '–' + run.b + ' (both sides)'));
    return out;
  }
  if (run.b - run.a >= 3) {
    if (splitAnd) { out.push(run.a + '11–' + run.b + '11'); out.push(run.a + '13–' + run.b + '13'); }
    else out.push(run.a + '11–' + run.b + '11 & ' + run.a + '13–' + run.b + '13');
    return out;
  }
  for (var r = run.a; r <= run.b; r++) out.push(r + '11–' + r + '13');
  return out;
}

function joinList(tokens) {
  if (!tokens.length) return '';
  if (tokens.length === 1) return tokens[0];
  return tokens.slice(0, -1).join(', ') + ' & ' + tokens[tokens.length - 1];
}

function sideOverall(seg, cableFilter) {
  if (cableFilter) return seg[cableFilter];
  return (seg.F144 === seg.OCS && seg.OCS === seg.CAT6) ? seg.F144 : 'MIXED';
}

function mixedBase(seg) {
  var counts = {};
  CABLES.forEach(function (c) { counts[seg[c]] = (counts[seg[c]] || 0) + 1; });
  var keys = Object.keys(counts);
  var base = keys[0];
  keys.forEach(function (k) {
    var ko = STATUS_ORDER.indexOf(k), bo = STATUS_ORDER.indexOf(base);
    if (counts[k] > counts[base] || (counts[k] === counts[base] && ko > bo)) base = k;
  });
  if (base === 'none') {
    var maxK = null;
    keys.forEach(function (k) {
      if (k !== 'none' && (maxK === null || STATUS_ORDER.indexOf(k) > STATUS_ORDER.indexOf(maxK))) maxK = k;
    });
    if (maxK) base = maxK;
  }
  var others = CABLES.filter(function (c) { return seg[c] !== base; }).map(function (c) {
    return CABLE_LABEL[c] + (seg[c] === 'none' ? ' not started' : ' ' + STATUS_META[seg[c]].report.toLowerCase());
  });
  return { base: base, desc: others.join(', ') };
}

function hallStatusLines(hall, cableFilter, style, splitAnd) {
  var out = [];
  REPORT_STATUS_ORDER.forEach(function (target) {
    if (target === 'none') return;
    var q11 = [], q13 = [];
    Object.keys(hall.rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
      if (sideOverall(hall.rows[r]['11'], cableFilter) === target) q11.push(r);
      if (sideOverall(hall.rows[r]['13'], cableFilter) === target) q13.push(r);
    });
    if (!q11.length && !q13.length && cableFilter) return;
    var tokens = [];
    var bothSet = {};
    q11.forEach(function (r) { if (q13.indexOf(r) !== -1) bothSet[r] = true; });
    var bothRows = Object.keys(bothSet).map(Number).sort(function (a, b) { return a - b; });
    runsOf(bothRows).forEach(function (run) { tokens.push.apply(tokens, fmtBoth(run, style, splitAnd)); });
    var rem11 = q11.filter(function (r) { return !bothSet[r]; });
    var rem13 = q13.filter(function (r) { return !bothSet[r]; });
    runsOf(rem11).forEach(function (run) { tokens.push.apply(tokens, fmt11(run, style)); });
    runsOf(rem13).forEach(function (run) { tokens.push.apply(tokens, fmt13(run, style)); });

    // Mixed sides: one token at the side's majority status, e.g. "1311 (Copper ran)".
    if (!cableFilter) {
      Object.keys(hall.rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
        ['11', '13'].forEach(function (side) {
          var seg = hall.rows[r][side];
          if (sideOverall(seg, null) === 'MIXED') {
            var mb = mixedBase(seg);
            if (mb.base === target) tokens.push(r + side + ' (' + mb.desc + ')');
          }
        });
      });
    }
    if (tokens.length) out.push({ status: target, tokens: tokens });
  });
  return out;
}

function hallSentences(hall, cableFilter, style) {
  return hallStatusLines(hall, cableFilter, style).map(function (l) {
    return joinList(l.tokens) + ' \u2013 ' + STATUS_META[l.status].report + '.';
  });
}

function hallBlock(hall) {
  var lines = [];
  var sents = hallSentences(hall, null, (typeof numStyleVal !== 'undefined') ? numStyleVal : 'short');
  if (sents.length) lines.push(hall.name + ' ' + sents.join('   '));
  (hall.notes || []).forEach(function (n) { lines.push(hall.name + ' ' + n); });
  return lines;
}

function formalJoin(tokens) {
  if (!tokens.length) return '';
  if (tokens.length === 1) return tokens[0];
  if (tokens.length === 2) return tokens[0] + ' and ' + tokens[1];
  return tokens.slice(0, -1).join(', ') + ', and ' + tokens[tokens.length - 1];
}

function polishSentence(t) {
  t = (t || '').trim();
  if (!t) return t;
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

function cableNamesAnd(cables) {
  return formalJoin(cables.map(function (c) { return CABLE_SHORT[c]; }));
}

function mixedDesc2(seg) {
  var groups = [];
  REPORT_STATUS_ORDER.forEach(function (st) {
    var cs = CABLES.filter(function (c) { return seg[c] === st; });
    if (cs.length) groups.push(cableNamesAnd(cs) + ' ' + STATUS_META[st].report.toLowerCase());
  });
  var noneC = CABLES.filter(function (c) { return seg[c] === 'none'; });
  if (noneC.length) groups.push(cableNamesAnd(noneC) + ' not started');
  return groups.join('; ');
}

function formalizeNote2(n) {
  var t = (n || '').trim();
  if (!t) return '';
  var lead = t.match(/^(Ran and hung|Ran|In progress|Staged|Remediation)\s*[\u2013-]\s*(.+)$/i);
  if (lead) return polishSentence(lead[2]);
  var trail = t.match(/^(.+?)\s*[\u2013-]\s*(Ran and hung|Ran|In progress|Staged|Remediation)\b\s*(\([^)]*\))?\s*\.?\s*$/i);
  if (trail) {
    var word = null;
    Object.keys(STATUS_META).forEach(function (k) {
      if (STATUS_META[k].report.toLowerCase() === trail[2].toLowerCase()) word = STATUS_META[k].report;
    });
    if (word) {
      var paren = trail[3] ? ' ' + trail[3].replace(/\.$/, '') : '';
      return trail[1].replace(/[.;,]+$/, '') + ': ' + word + paren + '.';
    }
  }
  return polishSentence(t);
}

function formalHallLines2(hall) {
  var style = (typeof numStyleVal !== 'undefined') ? numStyleVal : 'short';
  var out = [];
  REPORT_STATUS_ORDER.forEach(function (target) {
    var sides = []; // cls 0 = both sides, 1 = 11-side, 2 = 13-side
    Object.keys(hall.rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
      var s11 = sideOverall(hall.rows[r]['11'], null) === target;
      var s13 = sideOverall(hall.rows[r]['13'], null) === target;
      if (s11 && s13) sides.push({ r: r, cls: 0 });
      else if (s11) sides.push({ r: r, cls: 1 });
      else if (s13) sides.push({ r: r, cls: 2 });
    });
    if (!sides.length) return;
    var tokens = [];
    var i = 0;
    while (i < sides.length) {
      var j = i;
      while (j + 1 < sides.length && sides[j + 1].cls === sides[i].cls && sides[j + 1].r === sides[j].r + 1) j++;
      var run = { a: sides[i].r, b: sides[j].r };
      var fmt = sides[i].cls === 0 ? fmtBoth(run, style, true) : (sides[i].cls === 1 ? fmt11(run, style) : fmt13(run, style));
      tokens.push.apply(tokens, fmt);
      i = j + 1;
    }
    if (tokens.length) out.push('\u2022 ' + STATUS_META[target].report + ': ' + tokens.join(', '));
  });
  var mixed = [];
  Object.keys(hall.rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
    ['11', '13'].forEach(function (side) {
      var seg = hall.rows[r][side];
      if (sideOverall(seg, null) === 'MIXED') mixed.push({ r: r, side: side, desc: mixedDesc2(seg) });
    });
  });
  // Group every row sharing the same description (not just adjacent ones),
  // groups ordered by their first rack - "1413, 1513, 1613" style bullets.
  var byDesc = {};
  mixed.forEach(function (mx) { (byDesc[mx.desc] = byDesc[mx.desc] || []).push(mx); });
  Object.keys(byDesc).map(function (d) { return { d: d, rows: byDesc[d] }; })
    .sort(function (a, b) { var x = a.rows[0], y = b.rows[0]; return x.r - y.r || (x.side < y.side ? -1 : 1); })
    .forEach(function (g) {
      out.push('\u2022 ' + g.rows.map(function (x) { return x.r + x.side; }).join(', ') + ': ' + g.d);
    });
  (hall.notes || []).forEach(function (n) { var ln = formalizeNote2(n); if (ln) out.push('\u2022 ' + ln.replace(/\.$/, '')); });
  return out;
}

function reportDateStr(state) {
  var d = new Date();
  // 2PM-2AM shift: before 2AM, the shift started yesterday
  if (d.getHours() < 2) d = new Date(d.getTime() - 86400000);
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

function blockersFormal(state) {
  if (!state.blockers.length) return 'BLOCKERS\n\u2022 None';
  var dates = state.blockers.map(function (b) { return b.date; });
  var allSame = dates.every(function (d) { return d === dates[0]; });
  var lines = [allSame ? 'BLOCKERS \u2013 ' + dates[0] : 'BLOCKERS'];
  state.blockers.forEach(function (b) {
    lines.push('\u2022 ' + (b.hall ? b.hall + ': ' : '') + polishSentence(b.text).replace(/\.$/, ''));
  });
  return lines.join('\n');
}

function buildReport(style, ctx) {
  ctx = ctx || {};
  var state = ctx.state;
  var hallsNow = ctx.halls || state.halls;
  var numStyleVal = ctx.numStyle || 'short';
  var m = state.meta;
  var activeCrew = state.crewPool.filter(function (c) { return c.active; }).map(function (c) { return c.name; });
  var spCount = parseInt(m.spCount, 10) || activeCrew.length;
  var mpCount = parseInt(m.mpCount, 10) || 0;
  var out = '';

  if (style === 'formal') {
    out += 'Subject: Shift Update \u2013 ' + reportDateStr(state) + (m.shiftTime ? ' (' + m.shiftTime + ')' : '') + '\n\n';
    out += 'Team,\n\nPlease see the shift update below.\n\n';
    out += 'SHIFT SUMMARY\n';
    out += 'Superintendent on Site: ' + (m.supers || '') + '\n';
    out += 'Shift Time: ' + (m.shiftTime || '') + '\n';
    out += 'Personnel Count: MP \u2013 ' + mpCount + ' | SP \u2013 ' + spCount + '\n\n';
    out += 'WORK PERFORMED\n\n';
    var blocks = [];
    Object.values(hallsNow).forEach(function (h) {
      var hl = formalHallLines2(h);
      if (hl.length) blocks.push('MP | ' + h.name + '\n' + hl.join('\n'));
    });
    if (blocks.length) out += blocks.join('\n\n') + '\n\n';
    var spLines = (m.spWorkNotes || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    out += 'SP\n' + (spLines.length ? spLines.map(function (l) { return '\u2022 ' + l; }).join('\n') : '\u2022 None') + '\n\n';
    out += blockersFormal(state) + '\n\n';
    out += 'AREAS OF CONCERN\n';
    var aoc = (m.areasOfConcern || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    out += (aoc.length ? aoc.map(function (l) { return '\u2022 ' + l; }).join('\n') : '\u2022 None') + '\n';
    if (state.settings.signature && state.settings.signature.trim()) {
      out += '\n' + state.settings.signature.trim() + '\n';
    }
  }

  else if (style === 'mine') {
    out += 'Superintendent on site: ' + (m.supers || '') + '\n';
    out += 'Shift Time: ' + (m.shiftTime || '') + '\n';
    out += 'Personnel Count: MP ' + mpCount + ', SP ' + spCount + (activeCrew.length ? ' (' + activeCrew.join(', ') + ')' : '') + '\n\n';
    out += 'Work Completed:\nMP:\n';
    Object.values(hallsNow).forEach(function (h) {
      hallBlock(h).forEach(function (l) { out += l + '\n'; });
    });
    out += '\nSP:\n' + ((m.spWorkNotes || '').trim() || 'None') + '\n\n';
    out += 'Blockers:\n';
    out += state.blockers.length ? state.blockers.map(function (b) { return '- ' + b.date + ' – ' + b.text; }).join('\n') + '\n' : '- None\n';
    out += '\nAreas of concern:\n- ' + ((m.areasOfConcern || '').trim() || 'None');
  }

  else if (style === 'crew') {
    var locs = activeHallNames(hallsNow).join(', ') || 'n/a';
    out += 'Company/Crew: Midpoint (MP)\n';
    out += 'Headcount: ' + mpCount + '\n';
    out += 'Location: ' + locs + '\n';
    out += 'Work Completed:\n';
    Object.values(hallsNow).forEach(function (h) {
      hallBlock(h).forEach(function (l) { out += l + '\n'; });
    });
    out += '\nCompany/Crew: ServicePoint (SP)\n';
    out += 'Headcount: ' + spCount + '\n';
    out += 'Location: ' + locs + '\n';
    out += 'Work Completed:\n' + ((m.spWorkNotes || '').trim() || 'None') + '\n';
    out += 'Crew Members: ' + (activeCrew.join(', ') || 'None');
  }

  else { // boss
    out += '2 overlapping 12 hour shifts ' + (m.shiftTime || '') + '\n';
    out += 'Personnel Count: ' + (mpCount + spCount) + '\n\n';
    out += 'Work areas completed:\n';
    Object.values(hallsNow).forEach(function (h) {
      var hasAny = false;
      var cableLines = [];
      CABLES.forEach(function (c) {
        var sents = hallSentences(h, c, numStyleVal);
        if (sents.length) { cableLines.push(CABLE_LABEL[c] + ' Pulling – ' + sents.join(' ')); hasAny = true; }
      });
      var hasNotes = (h.notes || []).length > 0;
      if (hasAny || hasNotes) {
        out += h.name + '\n';
        (h.notes || []).forEach(function (n) { out += ' ' + n + '\n'; });
        cableLines.forEach(function (l) { out += ' ' + l + '\n'; });
        out += '\n';
      }
    });
    out += 'Blockers / Issues:\n';
    out += state.blockers.length ? state.blockers.map(function (b) { return b.date + ' – ' + b.text + ' (i)'; }).join('\n') + '\n' : 'None\n';
    out += '\nTasks for tomorrow:\n' + ((m.tasksTomorrow || '').trim() || 'None');
  }
  return out;
}
  return {
    buildReport: buildReport,
    STATUS_META: STATUS_META, STATUS_ORDER: STATUS_ORDER,
    REPORT_STATUS_ORDER: REPORT_STATUS_ORDER, CABLES: CABLES, CABLE_LABEL: CABLE_LABEL,
    sideOverall: sideOverall, hallSentences: hallSentences
  };
})();
