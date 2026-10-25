/* cutsheet-engine.js — Pure Cutsheet query, O(1) rack indexing, Physical Channel
   (cableChain), Rack Role (classifyRackRole), and Cable Spec summarization.
   Single source of truth for BUF103 cutsheet domain logic (v83 architecture).
   Zero DOM dependencies — testable directly in isolation. */
var CutsheetEngine = (function () {
  'use strict';

  function createIndex(D) {
    var byRack = {};
    var racks = {};
    var totalRows = 0;
    if (!D || !D.rows || !D.d) {
      return { byRack: byRack, racks: racks, totalRows: 0 };
    }
    var fams = D.fams || Object.keys(D.rows);
    for (var fi = 0; fi < fams.length; fi++) {
      var fam = fams[fi];
      var rows = D.rows[fam] || [];
      totalRows += rows.length;
      for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        var hit = [fam, row];
        var a = D.d[row[0]];
        var z = D.d[row[2]];
        var s0 = a || '';
        var s1 = (z && z !== s0) ? z : '';
        if (s0) {
          (byRack[s0] || (byRack[s0] = [])).push(hit);
        }
        if (s1) {
          (byRack[s1] || (byRack[s1] = [])).push(hit);
        }
        var hops = row[6];
        if (hops) {
          for (var hi = 0; hi < hops.length; hi += 3) {
            var hLoc = D.d[hops[hi]];
            if (hLoc && hLoc !== s0 && hLoc !== s1) {
              var dup = false;
              for (var pj = 0; pj < hi; pj += 3) {
                if (D.d[hops[pj]] === hLoc) { dup = true; break; }
              }
              if (!dup) {
                (byRack[hLoc] || (byRack[hLoc] = [])).push(hit);
              }
            }
          }
        }
      }
    }
    var locs = Object.keys(byRack);
    for (var li = 0; li < locs.length; li++) {
      var loc = locs[li];
      var m = /^BUF103-(DH\d+)-R(\d+)$/.exec(loc);
      if (!m) continue;
      (racks[m[1]] || (racks[m[1]] = [])).push({ rack: loc, n: byRack[loc].length });
    }
    Object.keys(racks).forEach(function (h) {
      racks[h].sort(function (x, y) { return x.rack < y.rack ? -1 : 1; });
    });
    return { byRack: byRack, racks: racks, totalRows: totalRows };
  }

  function connectionsFor(idxOrD, rack) {
    if (!idxOrD || !rack) return [];
    if (idxOrD.byRack) return idxOrD.byRack[rack] || [];
    var idx = createIndex(idxOrD);
    return idx.byRack[rack] || [];
  }

  function parseRackMeta(rack, fallbackHall) {
    var m = /^BUF103-(DH\d+)-R(\d{2})(\d{2})$/.exec(rack || '');
    if (!m) return { hall: fallbackHall || 'DH1', row: '01', spot: '01' };
    return { hall: m[1], row: m[2], spot: m[3] };
  }

  function rackNorm(q) {
    var m = /(buf103[-/])?(dh\d)\s*[-/ ]\s*r(\d{2,4})\b/i.exec(String(q || '').trim());
    if (!m) return null;
    return 'BUF103-' + m[2].toUpperCase() + '-R' + m[3];
  }

  function search(D, query, limit) {
    if (!D || !D.d || !D.rows) return [];
    var qu = String(query || '').trim().toUpperCase();
    if (!qu) return [];
    var maxHits = limit || 400;
    var hit = new Set();
    for (var i = 0; i < D.d.length; i++) {
      if (D.d[i].toUpperCase().indexOf(qu) >= 0) hit.add(i);
    }
    var fams = D.fams || Object.keys(D.rows);
    var matches = [];
    for (var f = 0; f < fams.length && matches.length < maxHits; f++) {
      var fam = fams[f], rows = D.rows[fam] || [];
      for (var r = 0; r < rows.length && matches.length < maxHits; r++) {
        var row = rows[r];
        var mRow = hit.has(row[0]) || hit.has(row[1]) || hit.has(row[2]) || hit.has(row[3]) || hit.has(row[4]) || hit.has(row[5]);
        if (!mRow && row[6]) {
          for (var hi = 0; hi < row[6].length; hi++) {
            if (hit.has(row[6][hi])) { mRow = true; break; }
          }
        }
        if (mRow) matches.push([fam, row]);
      }
    }
    return matches;
  }

  function shortRack(loc) {
    if (!loc) return '?';
    var p = loc.split('-R');
    return p.length > 1 ? 'R' + p[1] : loc.replace(/^BUF103-/i, '');
  }

  function shortDev(dev) {
    if (!dev) return '';
    var s = dev.trim()
      .replace(/^buf103-pod\d+-rack\d+-/i, '')
      .replace(/^buf103-pod\d+-/i, '')
      .replace(/^buf103-/i, '')
      .replace(/^(fpp|cpp)-[a-z0-9]+-r\d{4}-/i, '$1-')
      .replace(/\bEthernet/gi, 'Et')
      .replace(/\bconsole\b/gi, 'con')
      .replace(/\s*\[[^\]]*\]/g, '');
    var parts = s.trim().split(/\s+/);
    if (parts.length <= 2) return parts.join(' ').slice(0, 18);
    return (parts[0] + ' ' + parts.slice(1).join(' ')).slice(0, 20);
  }

  function shortCableSpec(spec) {
    if (!spec) return '';
    var lenM = /\b(\d+\s*M)\b/i.exec(spec) || /\((\d+M)\)/i.exec(spec);
    var len = lenM ? lenM[1].toUpperCase().replace(/\s+/g, '') : '';
    var trkM = /\b(Trunk\s*#\d+|H\d+(?:\s*\(Leg\s*\d+\))?)\b/i.exec(spec);
    var trk = trkM ? trkM[1] : '';
    var kind = '';
    if (/192F/i.test(spec)) kind = '192F MPO8 Trunk';
    else if (/144F/i.test(spec)) kind = '144F MPO8 Trunk';
    else if (/72F/i.test(spec)) kind = '72F MPO12 Trunk';
    else if (/48F/i.test(spec)) kind = '48F LC-MPO8';
    else if (/24F/i.test(spec)) kind = '24F LC-MPO8';
    else if (/18F/i.test(spec)) kind = '18F MPO12';
    else if (/12F/i.test(spec)) kind = '12F LC-MPO12';
    else if (/4xLC.*Harness|Harness/i.test(spec)) kind = 'MPO8\u21924xLC Harness';
    else if (/8F.*MPO8/i.test(spec)) kind = '8F MPO8 Cord';
    else if (/2F.*LC/i.test(spec)) kind = '2F LC Cord';
    else if (/VisiPatch/i.test(spec)) kind = 'VisiPatch Cat6';
    else if (/Standard Patch Cord/i.test(spec)) {
      var colM = /\((Blue|Yellow|Green|Gray|Red|White|Orange|Black)\)/i.exec(spec);
      kind = 'Patch Cord' + (colM ? ' (' + colM[1] + ')' : '');
    } else if (/Cat6|RJ45/i.test(spec)) kind = 'Cat6 Cord';
    else kind = spec.slice(0, 22);
    var bits = [];
    if (len) bits.push(len);
    if (kind) bits.push(kind);
    if (trk && kind.indexOf(trk) < 0) bits.push(trk);
    return bits.join(' \u00b7 ');
  }

  function classifyRackRole(loc, dev) {
    var devL = (dev || '').toLowerCase();
    var locU = (loc || '').toUpperCase();
    var m = /-R(\d{2})(\d{2})$/.exec(locU);
    var rowNum = m ? parseInt(m[1], 10) : 0;
    var spot = m ? m[2] : '';
    if (devL.indexOf('fpp-dcn') >= 0 || devL.indexOf('dcnpp') >= 0) {
      return { code: 'DCN-PP', label: 'DCN Patch Panel', color: '#55d0d6', bg: 'rgba(85,208,214,.16)' };
    }
    if ((spot === '11' || spot === '13' || devL.indexOf('eor') >= 0) && (devL.indexOf('fpp-') >= 0 || devL.indexOf('cpp-') >= 0 || devL.indexOf('pp') === 0)) {
      return { code: 'AIO PANEL', label: 'AIO / EOR Patch Panel (Spot ' + (spot || '11/13') + ')', color: '#ffca16', bg: 'rgba(255,202,22,.16)' };
    }
    if ((rowNum <= 2 || rowNum >= 24) && (devL.indexOf('fpp-') >= 0 || devL.indexOf('cpp-') >= 0)) {
      return { code: 'SPINE PP', label: 'Network Row Patch Panel', color: '#c084fc', bg: 'rgba(192,132,252,.16)' };
    }
    if (devL.indexOf('spn') >= 0 || devL.indexOf('ocslf') >= 0 || devL.indexOf('sal') >= 0 || devL.indexOf('ant-cr') >= 0 || devL.indexOf('fs-edg') >= 0 || devL.indexOf('mgmt-cr') >= 0 || devL.indexOf('oxide') >= 0) {
      return { code: 'SPINE / CORE', label: 'Spine / Core Switch', color: '#a855f7', bg: 'rgba(168,85,247,.16)' };
    }
    if (spot === '12' || devL.indexOf('spocs') >= 0) {
      return { code: 'SPOCS', label: 'SPOCS Optical Switch Rack (Spot 12)', color: '#30a46c', bg: 'rgba(48,164,108,.16)' };
    }
    if (spot === '11' || spot === '13' || devL.indexOf('mgmt-lf') >= 0 || devL.indexOf('tr-lf') >= 0 || devL.indexOf('mgmt-con') >= 0 || devL.indexOf('bms-fb') >= 0) {
      return { code: 'AIO / EOR', label: 'All-In-One EOR Rack (Spot ' + (spot || '11/13') + ')', color: '#f5a524', bg: 'rgba(245,165,36,.16)' };
    }
    if (devL.indexOf('pp1') === 0 || devL.indexOf('fpp-') >= 0 || devL.indexOf('cpp-') >= 0) {
      return { code: 'RACK PP', label: 'Rack Patch Panel', color: '#30a46c', bg: 'rgba(48,164,108,.16)' };
    }
    if (rowNum <= 2 || rowNum >= 24) {
      return { code: 'NET RACK', label: 'Network Row Rack (Row ' + rowNum + ')', color: '#a855f7', bg: 'rgba(168,85,247,.16)' };
    }
    return { code: 'TPU / RACK', label: 'Compute / TPU Rack' + (spot ? ' (Spot ' + spot + ')' : ''), color: '#6aa9e8', bg: 'rgba(106,169,232,.16)' };
  }

  function cableChain(D, row) {
    var dict = (D && D.d) ? D.d : [];
    var aLoc = dict[row[0]] || '?', aDev = dict[row[1]] || '';
    var zLoc = dict[row[2]] || '?', zDev = dict[row[3]] || '';
    var mainSpec = dict[row[4]] || '';
    var rA = classifyRackRole(aLoc, aDev);
    var steps = [{ loc: aLoc, dev: aDev, cable: mainSpec, role: rA.code, roleLabel: rA.label, roleColor: rA.color, roleBg: rA.bg }];
    if (row[6] && row[6].length >= 3) {
      for (var hi = 0; hi < row[6].length; hi += 3) {
        var hLoc = dict[row[6][hi]] || '';
        var hLbl = row[6][hi + 1] >= 0 ? (dict[row[6][hi + 1]] || '') : '';
        var hCab = row[6][hi + 2] >= 0 ? (dict[row[6][hi + 2]] || '') : '';
        if (hLoc) {
          var rH = classifyRackRole(hLoc, hLbl);
          steps.push({ loc: hLoc, dev: hLbl, cable: hCab || mainSpec, role: rH.code, roleLabel: rH.label, roleColor: rH.color, roleBg: rH.bg });
        }
      }
    }
    var rZ = classifyRackRole(zLoc, zDev);
    steps.push({ loc: zLoc, dev: zDev, cable: '', role: rZ.code, roleLabel: rZ.label, roleColor: rZ.color, roleBg: rZ.bg });
    return steps;
  }

  function formatLabelLines(D, hits, maxCount) {
    if (!D || !D.d || !hits || !hits.length) return '';
    return hits.slice(0, maxCount || 60).map(function (h) {
      var r = h[1];
      var a = (D.d[r[0]] || '') + (D.d[r[1]] ? '-' + D.d[r[1]].replace(/\s+/g, '-') : '');
      var z = (D.d[r[2]] || '') + (D.d[r[3]] ? '-' + D.d[r[3]].replace(/\s+/g, '-') : '');
      return a.toUpperCase() + ' | ' + z.toUpperCase();
    }).join('\n');
  }

  return {
    createIndex: createIndex,
    connectionsFor: connectionsFor,
    parseRackMeta: parseRackMeta,
    rackNorm: rackNorm,
    search: search,
    shortRack: shortRack,
    shortDev: shortDev,
    shortCableSpec: shortCableSpec,
    classifyRackRole: classifyRackRole,
    cableChain: cableChain,
    formatLabelLines: formatLabelLines
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CutsheetEngine;
}
