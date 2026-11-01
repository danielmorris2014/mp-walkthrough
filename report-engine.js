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
  hasProgress: function (seg) { return seg.F144 !== 'none' || seg.OCS !== 'none' || seg.CAT6 !== 'none'; },
  hallSummary: function (hall) {
    var cables = {};
    CABLES.forEach(function (c) { cables[c] = { hung: 0, prog: 0, total: 0 }; });
    var total = 0, done = 0, ran = 0, prog = 0, started = 0;
    if (hall && hall.rows) {
      Object.keys(hall.rows).forEach(function (r) {
        var row = hall.rows[r];
        if (!row) return;
        Side.sides().forEach(function (s) {
          var seg = row[s];
          if (!seg) return;
          total++;
          if (Side.isHung(seg)) done++;
          else if (Side.isAll(seg, 'ran')) ran++;
          else if (Side.hasProgress(seg)) prog++;
          if (Side.hasProgress(seg)) started++;
          CABLES.forEach(function (c) {
            cables[c].total++;
            if (seg[c] === 'hung') cables[c].hung++;
            else if (seg[c] && seg[c] !== 'none') cables[c].prog++;
          });
        });
      });
    }
    return {
      total: total,
      done: done,
      hung: done,
      ran: ran,
      prog: prog,
      started: started,
      pct: total ? Math.round((done / total) * 100) : 0,
      cables: cables
    };
  },
  podSummary: function (hall, pod) {
    var total = 0, done = 0, started = 0;
    if (hall && hall.rows && pod) {
      for (var r = pod.from; r <= pod.to; r++) {
        var row = hall.rows[r];
        if (!row) continue;
        Side.sides().forEach(function (s) {
          var seg = row[s];
          if (!seg) return;
          total++;
          if (Side.isHung(seg)) done++;
          if (Side.hasProgress(seg)) started++;
        });
      }
    }
    return {
      total: total,
      done: done,
      hung: done,
      started: started,
      pct: total ? Math.round((done / total) * 100) : 0
    };
  }
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
  var hasNone = Boolean(counts.none);
  var others = CABLES.filter(function (c) { return seg[c] !== base && seg[c] !== 'none'; }).map(function (c) {
    return CABLE_LABEL[c] + ' ' + STATUS_META[seg[c]].report.toLowerCase();
  });
  var desc;
  if (hasNone && others.length) {
    desc = CABLES.filter(function (c) { return seg[c] !== 'none'; }).map(function (c) {
      return CABLE_LABEL[c] + ' ' + STATUS_META[seg[c]].report.toLowerCase();
    }).join(', ');
  } else if (others.length) {
    desc = others.join(', ');
  } else {
    desc = cableNamesAnd(CABLES.filter(function (c) { return seg[c] === base; }));
  }
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

function mixedDesc(seg) {
  var groups = [];
  REPORT_STATUS_ORDER.forEach(function (st) {
    var cs = CABLES.filter(function (c) { return seg[c] === st; });
    if (cs.length) groups.push(cableNamesAnd(cs) + ' ' + STATUS_META[st].report.toLowerCase());
  });
  return groups.join('; ');
}

function formalHallLines(hall, ns) {
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
      if (sideOverall(seg, null) === 'MIXED') mixed.push({ r: r, side: side, desc: mixedDesc(seg) });
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

function allHallBlocks(hallsNow, numStyleVal) {
  var lines = [];
  Object.values(hallsNow).forEach(function (h) {
    hallBlock(h, numStyleVal).forEach(function (l) { lines.push(l); });
  });
  return lines.length ? lines.join('\n') : 'No rows stamped yet';
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
      return Boolean(h && Side.hallSummary(h).started > 0);
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
    out[hid] = { id: h.id, name: h.name, maxRow: h.maxRow, groups: h.groups, rows: rows };
  });
  return out;
}

function wrongLabelLines(mislabels) {
  if (typeof KitData !== 'undefined' && KitData && KitData.mislabels && KitData.mislabels.formatReportLines) {
    if (!Array.isArray(mislabels)) return '';
    return KitData.mislabels.formatReportLines(mislabels);
  }
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
      var hl = formalHallLines(h, numStyleVal);
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
    out += allHallBlocks(hallsNow, numStyleVal) + '\n';
    out += '\nSP:\n' + ((m.spWorkNotes || '').trim() || 'None') + '\n\n';
    out += 'Blockers:\n';
    out += state.blockers.length ? state.blockers.map(function (b) { return '- ' + b.date + ' \u2013 ' + b.text; }).join('\n') + '\n' : '- None\n';
    var mineAoc = (m.areasOfConcern || '').split('\n').map(function (l) { return l.replace(/^[\s\u2022\-\*]+/, '').trim(); }).filter(Boolean);
    out += '\nAreas of concern:\n' + (mineAoc.length ? mineAoc.map(function (l) { return '- ' + l; }).join('\n') : '- None');
  }

  else if (style === 'crew') {
    var locs = activeHallNames(hallsNow).join(', ') || 'n/a';
    out += 'Company/Crew: Midpoint (MP)\n';
    out += 'Headcount: ' + mpCount + '\n';
    out += 'Location: ' + locs + '\n';
    out += 'Work Completed:\n';
    out += allHallBlocks(hallsNow, numStyleVal) + '\n';
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
        if (sents.length) { cableLines.push(CABLE_LABEL[c] + ' Pulling \u2013 ' + sents.join(' ')); hasAny = true; }
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
    out += state.blockers.length ? state.blockers.map(function (b) { return b.date + ' \u2013 ' + b.text + ' (i)'; }).join('\n') + '\n' : 'None\n';
    out += '\nTasks for tomorrow:\n' + ((m.tasksTomorrow || '').trim() || 'None');
  }
  if (ctx.mislabels) {
    var wl = wrongLabelLines(ctx.mislabels);
    if (wl) out = out.replace(/\s+$/, '') + '\n\n' + wl;
  }
  return out;
}

/* Single line-classifier shared by formatPreviewHtml and buildEmailHtml so
   section headers, MP | Hall subheaders, key-value metadata, and status/mixed
   bullets never drift between in-app preview and Outlook HTML copy. */
function classifyReportLine(line) {
  if (!line) return { kind: 'empty' };
  var subjM = /^(Subject:\s*)(.+)$/.exec(line);
  if (subjM) return { kind: 'subject', k: subjM[1], v: subjM[2] };
  if (/^(SHIFT SUMMARY|WORK PERFORMED|BLOCKERS(?:\s*\u2013\s*.+)?|AREAS OF CONCERN|WRONG LABELS FOUND|Work Completed:|Blockers:|Areas of concern:|Work areas completed:|Blockers \/ Issues:|Tasks for tomorrow:)$/.test(line)) {
    return { kind: 'section', text: line };
  }
  var mpHall = /^(MP)(\s*\|\s*)(.+)$/.exec(line);
  if (mpHall) return { kind: 'mpHall', badge: mpHall[1], sep: mpHall[2], hall: mpHall[3], text: line };
  if (line === 'SP' || line === 'MP' || line === 'MP:' || line === 'SP:') {
    return { kind: 'subhead', isMp: line.indexOf('MP') === 0, text: line };
  }
  var kvM = /^(Superintendent on [Ss]ite:\s*|Shift Time:\s*|Personnel Count:\s*|Company\/Crew:\s*|Headcount:\s*|Location:\s*|Crew Members:\s*)(.*)$/.exec(line);
  if (kvM) return { kind: 'kv', k: kvM[1], v: kvM[2] };
  var stBul = /^(\u2022\s*)(Ran and hung|Ran|In progress|Staged|Remediation)(:\s*)(.+)$/.exec(line);
  if (stBul) return { kind: 'statusBullet', dot: stBul[1], status: stBul[2], colon: stBul[3], racks: stBul[4] };
  var mixBul = /^(\u2022\s*|-\s*)([^:]+:\s*)(.+)$/.exec(line);
  if (mixBul) return { kind: 'colonBullet', dot: mixBul[1], label: mixBul[2], rest: mixBul[3] };
  var anyBul = /^(\u2022\s*|-\s*)(.+)$/.exec(line);
  if (anyBul) return { kind: 'simpleBullet', dot: anyBul[1], rest: anyBul[2] };
  if (line === 'Team,' || line === 'Please see the shift update below.') {
    return { kind: 'greet', text: line };
  }
  return { kind: 'plain', text: line };
}

/* Rich in-app document formatter: wraps each line in semantic spans while
   preserving exact line characters and '\n' separators so .textContent
   is 100% identical to the plain-text report. */
function formatPreviewHtml(reportText) {
  var raw = String(reportText || '').replace(/\r\n/g, '\n');
  return raw.split('\n').map(function (line) {
    var cl = classifyReportLine(line);
    if (cl.kind === 'empty') return '';
    if (cl.kind === 'subject') {
      return '<span class="rp-subj"><span class="rp-subj-k">' + escHtml(cl.k) + '</span><span class="rp-subj-v">' + escHtml(cl.v) + '</span></span>';
    }
    if (cl.kind === 'section') {
      return '<span class="rp-sec">' + escHtml(cl.text) + '</span>';
    }
    if (cl.kind === 'mpHall') {
      return '<span class="rp-hall"><span class="rp-badge-mp">' + escHtml(cl.badge) + '</span><span class="rp-hall-sep">' + escHtml(cl.sep) + '</span><span class="rp-hall-name">' + escHtml(cl.hall) + '</span></span>';
    }
    if (cl.kind === 'subhead') {
      return '<span class="rp-hall"><span class="' + (cl.isMp ? 'rp-badge-mp' : 'rp-badge-sp') + '">' + escHtml(cl.text) + '</span></span>';
    }
    if (cl.kind === 'kv') {
      return '<span class="rp-kv"><span class="rp-k">' + escHtml(cl.k) + '</span><strong class="rp-v">' + escHtml(cl.v) + '</strong></span>';
    }
    if (cl.kind === 'statusBullet') {
      var stKey = cl.status.toLowerCase();
      var cls = stKey === 'ran and hung' ? 'rp-st-hung'
        : stKey === 'ran' ? 'rp-st-ran'
        : stKey === 'in progress' ? 'rp-st-prog'
        : stKey === 'staged' ? 'rp-st-staged' : 'rp-st-remed';
      return '<span class="rp-bul ' + cls + '"><span class="rp-dot">' + escHtml(cl.dot) + '</span><strong class="rp-st-lbl">' + escHtml(cl.status + cl.colon) + '</strong><span class="rp-racks">' + escHtml(cl.racks) + '</span></span>';
    }
    if (cl.kind === 'colonBullet') {
      return '<span class="rp-bul rp-st-mix"><span class="rp-dot">' + escHtml(cl.dot) + '</span><strong class="rp-mix-lbl">' + escHtml(cl.label) + '</strong><span class="rp-racks">' + escHtml(cl.rest) + '</span></span>';
    }
    if (cl.kind === 'simpleBullet') {
      return '<span class="rp-bul"><span class="rp-dot">' + escHtml(cl.dot) + '</span><span class="rp-desc">' + escHtml(cl.rest) + '</span></span>';
    }
    if (cl.kind === 'greet') {
      return '<span class="rp-greet">' + escHtml(cl.text) + '</span>';
    }
    return '<span class="rp-line">' + escHtml(cl.text) + '</span>';
  }).join('\n');
}

/* Rich HTML Email builder for ClipboardItem ('text/html') and .eml drafts so
   pasting or opening in Outlook Desktop / Mobile / Web or Teams matches the
   in-app executive typography, section pills, MP/SP badges, and status colors. */
var EMAIL_FONT = "font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;";

function buildEmailHtml(reportText) {
  var raw = String(reportText || '').replace(/\r\n/g, '\n');
  var bodyTxt = raw.replace(/^Subject:\s*.+\n(?:\n)?/, '');
  var lines = bodyTxt.split('\n');
  var html = [
    '<div style="' + EMAIL_FONT + 'font-size:13.5px;line-height:1.6;color:#0f172a;font-variant-numeric:tabular-nums;max-width:680px;">'
  ];
  lines.forEach(function (line) {
    if (!line.trim()) {
      html.push('<div style="height:8px;line-height:8px;font-size:8px;">&nbsp;</div>');
      return;
    }
    var cl = classifyReportLine(line);
    if (cl.kind === 'section') {
      html.push(
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0 6px 0;border-collapse:collapse;">' +
          '<tr><td style="' + EMAIL_FONT + 'border-left:3px solid #0284c7;background-color:#e0f2fe;padding:3px 10px;border-radius:0 5px 5px 0;font-size:11.5px;font-weight:800;letter-spacing:0.85px;color:#0369a1;text-transform:uppercase;line-height:1.4;">' +
            escHtml(cl.text) +
          '</td></tr>' +
        '</table>'
      );
      return;
    }
    if (cl.kind === 'mpHall') {
      html.push(
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 4px 0;border-collapse:separate;">' +
          '<tr><td style="' + EMAIL_FONT + 'background-color:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:2px 9px;font-size:13px;font-weight:800;line-height:1.4;">' +
            '<span style="' + EMAIL_FONT + 'color:#15803d;font-weight:900;">' + escHtml(cl.badge) + '</span>' +
            '<span style="' + EMAIL_FONT + 'color:#64748b;font-weight:600;">' + escHtml(cl.sep) + '</span>' +
            '<span style="' + EMAIL_FONT + 'color:#0f172a;font-weight:800;">' + escHtml(cl.hall) + '</span>' +
          '</td></tr>' +
        '</table>'
      );
      return;
    }
    if (cl.kind === 'subhead') {
      var badgeColor = cl.isMp ? '#15803d' : '#0284c7';
      html.push(
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 4px 0;border-collapse:separate;">' +
          '<tr><td style="' + EMAIL_FONT + 'background-color:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:2px 9px;font-size:13px;font-weight:900;color:' + badgeColor + ';line-height:1.4;">' +
            escHtml(cl.text) +
          '</td></tr>' +
        '</table>'
      );
      return;
    }
    if (cl.kind === 'kv') {
      html.push(
        '<div style="' + EMAIL_FONT + 'margin:2px 0;font-size:13.5px;line-height:1.6;">' +
          '<span style="' + EMAIL_FONT + 'color:#475569;font-weight:600;">' + escHtml(cl.k) + '</span>' +
          '<strong style="' + EMAIL_FONT + 'color:#0f172a;font-weight:700;">' + escHtml(cl.v) + '</strong>' +
        '</div>'
      );
      return;
    }
    if (cl.kind === 'statusBullet') {
      var stKey = cl.status.toLowerCase();
      var stColor = stKey === 'ran and hung' ? '#15803d'
        : stKey === 'ran' ? '#6d28d9'
        : stKey === 'in progress' ? '#b45309'
        : stKey === 'staged' ? '#0369a1' : '#b91c1c';
      html.push(
        '<div style="' + EMAIL_FONT + 'margin:3px 0 3px 6px;font-size:13.5px;line-height:1.6;font-variant-numeric:tabular-nums;">' +
          '<span style="' + EMAIL_FONT + 'color:' + stColor + ';font-weight:900;">&bull; </span>' +
          '<strong style="' + EMAIL_FONT + 'color:' + stColor + ';font-weight:800;">' + escHtml(cl.status + cl.colon) + '</strong>' +
          '<span style="' + EMAIL_FONT + 'color:#0f172a;font-weight:500;font-variant-numeric:tabular-nums;">' + escHtml(cl.racks) + '</span>' +
        '</div>'
      );
      return;
    }
    if (cl.kind === 'colonBullet') {
      html.push(
        '<div style="' + EMAIL_FONT + 'margin:3px 0 3px 6px;font-size:13.5px;line-height:1.6;font-variant-numeric:tabular-nums;">' +
          '<span style="' + EMAIL_FONT + 'color:#64748b;font-weight:900;">&bull; </span>' +
          '<strong style="' + EMAIL_FONT + 'color:#0f172a;font-weight:750;">' + escHtml(cl.label) + '</strong>' +
          '<span style="' + EMAIL_FONT + 'color:#1e293b;font-weight:500;font-variant-numeric:tabular-nums;">' + escHtml(cl.rest) + '</span>' +
        '</div>'
      );
      return;
    }
    if (cl.kind === 'simpleBullet') {
      html.push(
        '<div style="' + EMAIL_FONT + 'margin:3px 0 3px 6px;font-size:13.5px;line-height:1.6;">' +
          '<span style="' + EMAIL_FONT + 'color:#64748b;font-weight:900;">&bull; </span>' +
          '<span style="' + EMAIL_FONT + 'color:#1e293b;font-weight:500;">' + escHtml(cl.rest) + '</span>' +
        '</div>'
      );
      return;
    }
    html.push(
      '<div style="' + EMAIL_FONT + 'margin:2px 0;font-size:13.5px;line-height:1.6;color:' + (cl.kind === 'greet' ? '#334155' : '#0f172a') + ';font-weight:500;">' +
        escHtml(line) +
      '</div>'
    );
  });
  html.push('</div>');
  return html.join('');
}

function buildEml(parts) {
  var p = parts || {};
  var headers = [
    'To: ' + (p.to || ''),
    p.cc ? ('Cc: ' + p.cc) : '',
    'Subject: ' + (p.subject || 'Shift Update'),
    'X-Unsent: 1',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:16px;background-color:#ffffff;">' +
      (p.html || '') +
    '</body></html>'
  ].filter(function (line, idx) { return idx >= 7 || line !== ''; });
  return headers.join('\r\n');
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
  var baseComposeUrl = 'ms-outlook://compose?to=' + encodeURIComponent(toList.join(',')) +
    (ccList.length ? '&cc=' + encodeURIComponent(ccList.join(',')) : '') +
    '&subject=' + encodeURIComponent(subject);
  var outlookPlainUrl = baseComposeUrl + '&body=' + encodeURIComponent(bodyCrlf);
  var htmlStr = buildEmailHtml(txt);
  var out = {
    to: toStr,
    cc: ccStr,
    toList: toList,
    ccList: ccList,
    subject: subject,
    body: body,
    html: htmlStr,
    fullText: txt,
    outlookUrl: baseComposeUrl,
    outlookComposeUrl: baseComposeUrl,
    outlookPlainUrl: outlookPlainUrl
  };
  out.eml = buildEml(out);
  return out;
}

  return {
    buildReport: buildReport,
    formalHallLines: formalHallLines,
    effectiveHalls: effectiveHalls,
    wrongLabelLines: wrongLabelLines,
    buildEmailParts: buildEmailParts,
    formatPreviewHtml: formatPreviewHtml,
    buildEmailHtml: buildEmailHtml,
    buildEml: buildEml,
    cleanEmailList: cleanEmailList,
    DEFAULT_EMAIL_TO: DEFAULT_EMAIL_TO,
    DEFAULT_EMAIL_CC: DEFAULT_EMAIL_CC,
    activeHallNames: activeHallNames,
    STATUS_META: STATUS_META, STATUS_ORDER: STATUS_ORDER,
    REPORT_STATUS_ORDER: REPORT_STATUS_ORDER, CABLES: CABLES, CABLE_LABEL: CABLE_LABEL,
    sideOverall: sideOverall, hallSentences: hallSentences, Side: Side
  };
})();
