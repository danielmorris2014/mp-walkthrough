/* report-engine.js - the report formatter as a deep module (architecture
   candidate #2 & v83-v84 deepening). The seam:
     ReportEngine.buildReport(style, ctx)
     ReportEngine.effectiveHalls(state, scope)
     ReportEngine.wrongLabelLines(mislabels)
     ReportEngine.buildEmailParts(styleOrText, ctx)
     ReportEngine.formatPreviewHtml(reportText)
     ReportEngine.buildEmailHtml(reportText)
     ReportEngine.cleanEmailList(raw)
     ReportEngine.DEFAULT_EMAIL_TO / DEFAULT_EMAIL_CC
   where ctx = { state, numStyle, halls, scope, mislabels }. No DOM reads inside this file.
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
var CABLE_SHORT = { F144: '144F', OCS: 'OCS', CAT6: 'CAT6' };
var ReportEngine = (function () {
var DEFAULT_EMAIL_TO = 'Jack.Tracy@servicepoint.com';
var DEFAULT_EMAIL_CC = [
  'John.Hott@servicepoint.com',
  'Chris.Dickman@servicepoint.com',
  'Daniel.Morris@servicepoint.com',
  'Mario.Johnson@servicepoint.com',
  'Javier.Marvin@servicepoint.com',
  'Steve.Maffeo@servicepoint.com',
  'Michael.Murphy@servicepoint.com'
].join(', ');

function cleanEmailList(raw) {
  if (!raw) return [];
  var arr = Array.isArray(raw) ? raw : String(raw).split(/[,;\s\n]+/);
  var seen = {};
  var out = [];
  arr.forEach(function (item) {
    var trimmed = String(item || '').trim().replace(/^[<("']+|[>)"',;]+$/g, '');
    if (!trimmed || trimmed.indexOf('@') === -1) return;
    var key = trimmed.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    out.push(trimmed);
  });
  return out;
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

/* Side — the one vocabulary for the Row-Side shape (GLOSSARY). Everything
   that walks rows x sides x cables speaks these terms; the report, the
   renderers and the walk-view stats can never drift apart again. */
var Side = {
  sides: function () { return ['11', '13']; },
  empty: function () { return { F144: 'none', OCS: 'none', CAT6: 'none' }; },
  overall: function (seg) { return sideOverall(seg, null); },  // status | 'MIXED'
  isAll: function (seg, status) { return seg.F144 === status && seg.OCS === status && seg.CAT6 === status; },
  isHung: function (seg) { return Side.isAll(seg, 'hung'); },
  hasProgress: function (seg) { return seg.F144 !== 'none' || seg.OCS !== 'none' || seg.CAT6 !== 'none'; }
};

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
  var others = CABLES.filter(function (c) { return seg[c] !== base && seg[c] !== 'none'; }).map(function (c) {
    return CABLE_LABEL[c] + ' ' + STATUS_META[seg[c]].report.toLowerCase();
  });
  var desc = others.length
    ? others.join(', ')
    : cableNamesAnd(CABLES.filter(function (c) { return seg[c] === base; }));
  return { base: base, desc: desc };
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

function hallBlock(hall, ns) {
  var lines = [];
  var sents = hallSentences(hall, null, ns || 'short');
  if (sents.length) lines.push(hall.name + ' ' + sents.join('   '));
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

function formalHallLines2(hall, ns) {
  var style = ns || 'short';
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
      if (g.d) out.push('\u2022 ' + g.rows.map(function (x) { return x.r + x.side; }).join(', ') + ': ' + g.d);
    });
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

function activeHallNames(halls) {
  return Object.values(halls || {})
    .filter(function (h) {
      if (!h || !h.rows) return false;
      var any = false;
      Object.keys(h.rows).forEach(function (r) {
        Side.sides().forEach(function (s) { if (h.rows[r][s] && Side.hasProgress(h.rows[r][s])) any = true; });
      });
      return any;
    })
    .map(function (h) { return h.name; });
}

function effectiveHalls(state, scope) {
  if (!state || !state.halls) return {};
  if (scope !== 'changes' || !state.baseline || !state.baseline.halls) return state.halls;
  var out = {};
  Object.keys(state.halls).forEach(function (hid) {
    var h = state.halls[hid];
    var bh = state.baseline.halls[hid] || {};
    var b = bh.rows || {};
    var rows = {};
    Object.keys(h.rows).forEach(function (r) {
      rows[r] = {};
      ['11', '13'].forEach(function (s) {
        var was = (b[r] && b[r][s]) ? b[r][s] : { F144: 'none', OCS: 'none', CAT6: 'none' };
        var moved = CABLES.some(function (c) { return h.rows[r][s][c] !== was[c]; });
        rows[r][s] = moved ? JSON.parse(JSON.stringify(h.rows[r][s])) : Side.empty();
      });
    });
    out[hid] = { id: h.id, name: h.name, maxRow: h.maxRow, groups: h.groups, notes: [], rows: rows };
  });
  return out;
}

function wrongLabelLines(mislabels) {
  if (!Array.isArray(mislabels)) return '';
  var list = mislabels.filter(function (r) { return r && !r.done; });
  if (!list.length) return '';
  var out = ['WRONG LABELS FOUND'];
  list.forEach(function (r) {
    var bits = [];
    if (r.sa) bits.push('A end reads ' + r.sa + ' (database: ' + r.da + ')');
    if (r.sz) bits.push('Z end reads ' + r.sz + ' (database: ' + r.dz + ')');
    out.push('\u2022 ' + (r.id || 'Cable') + (r.title ? ' \u2013 ' + r.title : '') + ': ' + (bits.join('; ') || 'printed label does not match the database') + (r.note ? ' \u2013 ' + r.note : ''));
  });
  return out.join('\n');
}

function buildReport(style, ctx) {
  ctx = ctx || {};
  var state = ctx.state;
  var hallsNow = ctx.halls || effectiveHalls(state, ctx.scope || 'all');
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
      var hl = formalHallLines2(h, numStyleVal);
      if (hl.length) blocks.push('MP | ' + h.name + '\n' + hl.join('\n'));
    });
    if (blocks.length) out += blocks.join('\n\n') + '\n\n';
    else out += 'MP\n\u2022 No rows stamped yet\n\n';
    var spLines = (m.spWorkNotes || '').split('\n').map(function (l) { return l.replace(/^[\s\u2022\-\*]+/, '').trim(); }).filter(Boolean);
    out += 'SP\n' + (spLines.length ? spLines.map(function (l) { return '\u2022 ' + l; }).join('\n') : '\u2022 None') + '\n\n';
    out += blockersFormal(state) + '\n\n';
    out += 'AREAS OF CONCERN\n';
    var aoc = (m.areasOfConcern || '').split('\n').map(function (l) { return l.replace(/^[\s\u2022\-\*]+/, '').trim(); }).filter(Boolean);
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
    var mineLines = [];
    Object.values(hallsNow).forEach(function (h) {
      hallBlock(h, numStyleVal).forEach(function (l) { mineLines.push(l); });
    });
    out += (mineLines.length ? mineLines.join('\n') : 'No rows stamped yet') + '\n';
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
    var crewLines = [];
    Object.values(hallsNow).forEach(function (h) {
      hallBlock(h, numStyleVal).forEach(function (l) { crewLines.push(l); });
    });
    out += (crewLines.length ? crewLines.join('\n') : 'No rows stamped yet') + '\n';
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
    var anyBossHall = false;
    Object.values(hallsNow).forEach(function (h) {
      var hasAny = false;
      var cableLines = [];
      CABLES.forEach(function (c) {
        var sents = hallSentences(h, c, numStyleVal);
        if (sents.length) { cableLines.push(CABLE_LABEL[c] + ' Pulling – ' + sents.join(' ')); hasAny = true; }
      });
      if (hasAny) {
        anyBossHall = true;
        out += h.name + '\n';
        cableLines.forEach(function (l) { out += ' ' + l + '\n'; });
        out += '\n';
      }
    });
    if (!anyBossHall) out += 'No rows stamped yet\n\n';
    out += 'Blockers / Issues:\n';
    out += state.blockers.length ? state.blockers.map(function (b) { return b.date + ' – ' + b.text + ' (i)'; }).join('\n') + '\n' : 'None\n';
    out += '\nTasks for tomorrow:\n' + ((m.tasksTomorrow || '').trim() || 'None');
  }
  if (ctx.mislabels) {
    var wl = wrongLabelLines(ctx.mislabels);
    if (wl) out = out.replace(/\s+$/, '') + '\n\n' + wl;
  }
  return out;
}

/* Rich in-app document formatter: wraps each line in semantic spans while
   preserving exact line characters and '\n' separators so .textContent
   is 100% identical to the plain-text report. */
function formatPreviewHtml(reportText) {
  var raw = String(reportText || '').replace(/\r\n/g, '\n');
  return raw.split('\n').map(function (line) {
    if (!line) return '';
    var subjM = /^(Subject:\s*)(.+)$/.exec(line);
    if (subjM) {
      return '<span class="rp-subj"><span class="rp-subj-k">' + escHtml(subjM[1]) + '</span><span class="rp-subj-v">' + escHtml(subjM[2]) + '</span></span>';
    }
    if (/^(SHIFT SUMMARY|WORK PERFORMED|BLOCKERS(?:\s*\u2013\s*.+)?|AREAS OF CONCERN|WRONG LABELS FOUND|Work Completed:|Blockers:|Areas of concern:|Work areas completed:|Blockers \/ Issues:|Tasks for tomorrow:)$/.test(line)) {
      return '<span class="rp-sec">' + escHtml(line) + '</span>';
    }
    var mpHall = /^(MP)(\s*\|\s*)(.+)$/.exec(line);
    if (mpHall) {
      return '<span class="rp-hall"><span class="rp-badge-mp">' + escHtml(mpHall[1]) + '</span><span class="rp-hall-sep">' + escHtml(mpHall[2]) + '</span><span class="rp-hall-name">' + escHtml(mpHall[3]) + '</span></span>';
    }
    if (line === 'SP' || line === 'MP' || line === 'MP:' || line === 'SP:') {
      return '<span class="rp-hall"><span class="' + (line.indexOf('MP') === 0 ? 'rp-badge-mp' : 'rp-badge-sp') + '">' + escHtml(line) + '</span></span>';
    }
    var kvM = /^(Superintendent on [Ss]ite:\s*|Shift Time:\s*|Personnel Count:\s*|Company\/Crew:\s*|Headcount:\s*|Location:\s*|Crew Members:\s*)(.*)$/.exec(line);
    if (kvM) {
      return '<span class="rp-kv"><span class="rp-k">' + escHtml(kvM[1]) + '</span><strong class="rp-v">' + escHtml(kvM[2]) + '</strong></span>';
    }
    var stBul = /^(\u2022\s*)(Ran and hung|Ran|In progress|Staged|Remediation)(:\s*)(.+)$/.exec(line);
    if (stBul) {
      var stKey = stBul[2].toLowerCase();
      var cls = stKey === 'ran and hung' ? 'rp-st-hung'
        : stKey === 'ran' ? 'rp-st-ran'
        : stKey === 'in progress' ? 'rp-st-prog'
        : stKey === 'staged' ? 'rp-st-staged' : 'rp-st-remed';
      return '<span class="rp-bul ' + cls + '"><span class="rp-dot">' + escHtml(stBul[1]) + '</span><strong class="rp-st-lbl">' + escHtml(stBul[2] + stBul[3]) + '</strong><span class="rp-racks">' + escHtml(stBul[4]) + '</span></span>';
    }
    var mixBul = /^(\u2022\s*|-\s*)([^:]+:\s*)(.+)$/.exec(line);
    if (mixBul) {
      return '<span class="rp-bul rp-st-mix"><span class="rp-dot">' + escHtml(mixBul[1]) + '</span><strong class="rp-mix-lbl">' + escHtml(mixBul[2]) + '</strong><span class="rp-racks">' + escHtml(mixBul[3]) + '</span></span>';
    }
    var anyBul = /^(\u2022\s*|-\s*)(.+)$/.exec(line);
    if (anyBul) {
      return '<span class="rp-bul"><span class="rp-dot">' + escHtml(anyBul[1]) + '</span><span class="rp-desc">' + escHtml(anyBul[2]) + '</span></span>';
    }
    if (line === 'Team,' || line === 'Please see the shift update below.') {
      return '<span class="rp-greet">' + escHtml(line) + '</span>';
    }
    return '<span class="rp-line">' + escHtml(line) + '</span>';
  }).join('\n');
}

/* Rich HTML Email builder for ClipboardItem ('text/html') so pasting into
   Outlook Desktop / Mobile / Web or Teams gives a clean executive layout. */
function buildEmailHtml(reportText) {
  var raw = String(reportText || '').replace(/\r\n/g, '\n');
  var bodyTxt = raw.replace(/^Subject:\s*.+\n(?:\n)?/, '');
  var lines = bodyTxt.split('\n');
  var html = [
    '<div style="font-family:\'Segoe UI\',Calibri,-apple-system,BlinkMacSystemFont,Arial,sans-serif;font-size:14.5px;line-height:1.55;color:#1f2937;max-width:680px;">'
  ];
  lines.forEach(function (line) {
    if (!line.trim()) {
      html.push('<div style="height:8px;"></div>');
      return;
    }
    if (/^(SHIFT SUMMARY|WORK PERFORMED|BLOCKERS(?:\s*\u2013\s*.+)?|AREAS OF CONCERN|WRONG LABELS FOUND)$/.test(line)) {
      html.push('<div style="margin-top:14px;margin-bottom:6px;padding-bottom:3px;border-bottom:2px solid #0284c7;font-size:12px;font-weight:800;letter-spacing:0.8px;color:#0369a1;text-transform:uppercase;">' + escHtml(line) + '</div>');
      return;
    }
    if (/^(MP \| .+|SP)$/.test(line)) {
      html.push('<div style="margin-top:10px;margin-bottom:3px;font-size:14px;font-weight:700;color:#0f172a;">' + escHtml(line) + '</div>');
      return;
    }
    var kv = /^(Superintendent on [Ss]ite:|Shift Time:|Personnel Count:|Company\/Crew:|Headcount:|Location:|Crew Members:)\s*(.*)$/.exec(line);
    if (kv) {
      html.push('<div style="margin:2px 0;"><span style="color:#475569;font-weight:600;">' + escHtml(kv[1]) + '</span> <strong style="color:#0f172a;">' + escHtml(kv[2]) + '</strong></div>');
      return;
    }
    var bul = /^(\u2022|-)\s*([^:]+:)\s*(.+)$/.exec(line);
    if (bul) {
      html.push('<div style="margin:3px 0 3px 10px;">&bull; <strong style="color:#0f172a;">' + escHtml(bul[2]) + '</strong> <span style="color:#1e293b;">' + escHtml(bul[3]) + '</span></div>');
      return;
    }
    var simpleBul = /^(\u2022|-)\s*(.+)$/.exec(line);
    if (simpleBul) {
      html.push('<div style="margin:3px 0 3px 10px;">&bull; <span style="color:#1e293b;">' + escHtml(simpleBul[2]) + '</span></div>');
      return;
    }
    html.push('<div style="margin:2px 0;">' + escHtml(line) + '</div>');
  });
  html.push('</div>');
  return html.join('');
}

function buildEmailParts(styleOrText, ctx) {
  var txt = (ctx && ctx.state && (!styleOrText || styleOrText === 'formal' || styleOrText === 'mine' || styleOrText === 'crew' || styleOrText === 'boss'))
    ? buildReport(styleOrText || 'formal', ctx)
    : String(styleOrText || '');
  txt = txt.replace(/\r\n/g, '\n');
  var st = (ctx && ctx.state) || {};
  var settings = st.settings || {};
  var rawTo = (settings.emailTo && String(settings.emailTo).trim()) ? settings.emailTo : DEFAULT_EMAIL_TO;
  var rawCc = (settings.emailCc && String(settings.emailCc).trim()) ? settings.emailCc : DEFAULT_EMAIL_CC;
  var toList = cleanEmailList(rawTo);
  if (!toList.length) toList = cleanEmailList(DEFAULT_EMAIL_TO);
  var toLower = {};
  toList.forEach(function (e) { toLower[e.toLowerCase()] = true; });
  var ccList = cleanEmailList(rawCc).filter(function (e) { return !toLower[e.toLowerCase()]; });

  var subject = '';
  var body = txt;
  var m = /^Subject:\s*(.+)\n(?:\n)?([\s\S]*)$/.exec(txt);
  if (m) {
    subject = m[1].trim();
    body = m[2];
  } else {
    subject = 'Shift Update \u2013 ' + reportDateStr(st) +
      (st.meta && st.meta.shiftTime ? ' (' + st.meta.shiftTime + ')' : '');
  }
  var toStr = toList.join(', ');
  var ccStr = ccList.join(', ');
  var bodyCrlf = body.replace(/\r?\n/g, '\r\n');
  var outlookUrl = 'ms-outlook://compose?to=' + encodeURIComponent(toList.join(',')) +
    (ccList.length ? '&cc=' + encodeURIComponent(ccList.join(',')) : '') +
    '&subject=' + encodeURIComponent(subject) +
    '&body=' + encodeURIComponent(bodyCrlf);

  return {
    to: toStr,
    cc: ccStr,
    toList: toList,
    ccList: ccList,
    subject: subject,
    body: body,
    html: buildEmailHtml(txt),
    fullText: txt,
    outlookUrl: outlookUrl
  };
}

  return {
    buildReport: buildReport,
    formalHallLines: formalHallLines2,
    effectiveHalls: effectiveHalls,
    wrongLabelLines: wrongLabelLines,
    buildEmailParts: buildEmailParts,
    formatPreviewHtml: formatPreviewHtml,
    buildEmailHtml: buildEmailHtml,
    cleanEmailList: cleanEmailList,
    DEFAULT_EMAIL_TO: DEFAULT_EMAIL_TO,
    DEFAULT_EMAIL_CC: DEFAULT_EMAIL_CC,
    activeHallNames: activeHallNames,
    STATUS_META: STATUS_META, STATUS_ORDER: STATUS_ORDER,
    REPORT_STATUS_ORDER: REPORT_STATUS_ORDER, CABLES: CABLES, CABLE_LABEL: CABLE_LABEL,
    sideOverall: sideOverall, hallSentences: hallSentences, Side: Side
  };
})();
