/* tools/cutsheet-parser.js — On-device BUF103 cutsheet parser (SheetJS port of build_buf103.py).
   Runs either inside a Web Worker (streaming per-sheet progress, <80MB peak RAM via dense sheet-by-sheet
   parsing) or directly via CutsheetParser.parseArrayBuffer(buffer, opts, onProgress).
   Produces both:
     1) data/buf103.json schema: { v: 2, src, d, fams, halls, rows, mats }
     2) data/halls-buf103.json schema: { DH1: { maxRow, groups }, ... } */
(function (root) {
  'use strict';

  function pick(hmap) {
    for (var i = 1; i < arguments.length; i++) {
      var n = arguments[i];
      if (n in hmap) return hmap[n];
    }
    return null;
  }

  function cleanStr(v) {
    return v == null ? '' : String(v).trim();
  }

  // Extract 2D array of rows from either a dense SheetJS worksheet (!data) or standard worksheet
  function sheetToRows(ws) {
    if (!ws) return [];
    if (ws['!data']) {
      return ws['!data'].map(function (row) {
        if (!row) return [];
        return row.map(function (cell) { return cell && cell.v !== undefined ? cell.v : null; });
      });
    }
    if (typeof XLSX !== 'undefined' && XLSX.utils && XLSX.utils.sheet_to_json) {
      return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    }
    return [];
  }

  function createContext(srcName) {
    var dctMap = new Map();
    var dctList = [];
    function intern(s) {
      s = cleanStr(s);
      if (!s) return -1;
      var idx = dctMap.get(s);
      if (idx === undefined) {
        idx = dctList.length;
        dctMap.set(s, idx);
        dctList.push(s);
      }
      return idx;
    }
    return {
      srcName: srcName || 'ICT_Cutsheet_BUF103_FieldUpdate',
      dctMap: dctMap,
      dctList: dctList,
      intern: intern,
      fams: [],
      rowsOut: {},
      total: 0,
      hallsSet: {}
    };
  }

  var HALL_RE = /BUF103-(DH\d+?)[-/]/i;
  var RACK_ROW_RE = /^BUF103-(DH\d+)-R(\d{2})\d{2}$/;

  function parseSheetRows(ctx, name, rows) {
    if (name === 'Intro') return 0;
    var hdrIdx = null, hmap = {};
    var colALoc = null, colAElev = null, colAName = null, colAPort = null;
    var colZLoc = null, colZElev = null, colZName = null, colZPort = null;
    var specCols = [];
    var colACord = null, colZCord = null, colTrunk = null, colTrunkAId = null, colTrunkZId = null;
    var colPanA = null, colPanARu = null, colPanAPortF = null, colAPpLoc = null;
    var colPanZ = null, colPanZRu = null, colPanZPortF = null, colZPpLoc = null;
    var colEorLoc = null, colEorPan = null, colEorRu = null, colEorPortF = null, colEorDcnCable = null;
    var colDcnLoc = null, colDcnPan = null, colDcnRu = null, colDcnPortF = null, colDcnSpnCable = null;
    var buf = [];

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || !row.length) continue;
      if (hdrIdx === null) {
        var foundALoc = false;
        for (var c0 = 0; c0 < Math.min(4, row.length); c0++) {
          if (cleanStr(row[c0]) === 'A_loc') { foundALoc = true; break; }
        }
        if (foundALoc) {
          hdrIdx = i + 1;
          for (var j = 0; j < row.length; j++) {
            var h = cleanStr(row[j]);
            if (h && !(h in hmap)) hmap[h] = j;
          }
          colALoc = pick(hmap, 'A_loc');
          colAElev = pick(hmap, 'A_elev');
          colAName = pick(hmap, 'A_name');
          colAPort = pick(hmap, 'A_port');
          colZLoc = pick(hmap, 'Z_loc', 'eor_loc');
          colZElev = pick(hmap, 'Z_elev');
          colZName = pick(hmap, 'Z_name', 'eor_name');
          colZPort = pick(hmap, 'Z_port', 'eor_front_port');
          var candSpecs = ['cable', 'A_Z_trunk_assembly', 'tor_eor_cable', 'A_patch_cord', 'Z_patch_cord', 'eor_dcn_cable', 'dcn_spn_cable'];
          specCols = [];
          for (var sc = 0; sc < candSpecs.length; sc++) {
            if (candSpecs[sc] in hmap) specCols.push(hmap[candSpecs[sc]]);
          }
          colACord = pick(hmap, 'A_patch_cord');
          colZCord = pick(hmap, 'Z_patch_cord');
          colTrunk = pick(hmap, 'A_Z_trunk_assembly');
          colTrunkAId = pick(hmap, 'A_trunk_connector_id');
          colTrunkZId = pick(hmap, 'Z_trunk_connector_id');
          colPanA = pick(hmap, 'A_patch_panel');
          colPanARu = pick(hmap, 'A_pp_ru');
          colPanAPortF = pick(hmap, 'A_pp_port_front');
          colAPpLoc = pick(hmap, 'A_pp_loc');
          colPanZ = pick(hmap, 'eor_panel', 'Z_patch_panel');
          colPanZRu = pick(hmap, 'eor_ru', 'Z_pp_ru');
          colPanZPortF = pick(hmap, 'Z_pp_port_front');
          colZPpLoc = pick(hmap, 'Z_pp_loc');
          colEorLoc = pick(hmap, 'eor_loc');
          colEorPan = pick(hmap, 'eor_panel');
          colEorRu = pick(hmap, 'eor_ru');
          colEorPortF = pick(hmap, 'eor_front_port');
          colEorDcnCable = pick(hmap, 'eor_dcn_cable');
          colDcnLoc = pick(hmap, 'dcn_loc');
          colDcnPan = pick(hmap, 'dcn_panel');
          colDcnRu = pick(hmap, 'dcn_ru');
          colDcnPortF = pick(hmap, 'dcn_front_port');
          colDcnSpnCable = pick(hmap, 'dcn_spn_cable');
        }
        continue;
      }

      var aLoc = (colALoc !== null && colALoc < row.length) ? cleanStr(row[colALoc]) : '';
      if (!aLoc) continue;
      function g(col) {
        return (col !== null && col < row.length && row[col] != null) ? cleanStr(row[col]) : '';
      }
      var zLoc = g(colZLoc);
      var panAS = g(colPanA);
      var panZS = g(colPanZ);
      function fmtPanRu(pS, rS) {
        if (!rS) return pS;
        if (pS.toLowerCase().slice(-('ru' + rS).length) === ('ru' + rS).toLowerCase()) return pS;
        return pS + ' ru' + rS;
      }
      var pan = '';
      if (panAS && panZS && panAS !== panZS) {
        pan = fmtPanRu(panAS, g(colPanARu)) + ' \u2192 ' + fmtPanRu(panZS, g(colPanZRu));
      } else if (panAS) {
        pan = fmtPanRu(panAS, g(colPanARu));
      } else if (panZS) {
        pan = fmtPanRu(panZS, g(colPanZRu));
      }

      var aFull = g(colAName);
      if (g(colAPort)) {
        aFull = (aFull + ' ' + g(colAPort)).trim();
      } else if (g(colPanAPortF) && panAS === g(colAName)) {
        aFull = (aFull + ' p' + g(colPanAPortF)).trim();
      }
      if (!aFull && panAS) {
        aFull = panAS + (g(colPanAPortF) ? (' p' + g(colPanAPortF)) : '');
      }

      var zFull = g(colZName);
      if (g(colZPort)) zFull = (zFull + ' ' + g(colZPort)).trim();
      if (!zFull && panZS) {
        zFull = panZS + (g(colPanZPortF) ? (' p' + g(colPanZPortF)) : '');
      }

      var specVal = '';
      for (var si = 0; si < specCols.length; si++) {
        var sv = g(specCols[si]);
        if (sv) { specVal = sv; break; }
      }

      var entry = [
        ctx.intern(aLoc),
        ctx.intern(aFull),
        ctx.intern(zLoc),
        ctx.intern(zFull),
        ctx.intern(specVal),
        ctx.intern(pan)
      ];

      // Multi-hop intermediate points (AIO/EOR panels, DCN-PP panels, in-rack & cross-rack patch panels)
      var hops = [];
      var eorLoc = g(colEorLoc);
      var dcnLoc = g(colDcnLoc);
      var aPpLoc = g(colAPpLoc);
      var zPpLoc = g(colZPpLoc);
      if (eorLoc || dcnLoc) {
        if (eorLoc && eorLoc !== aLoc && eorLoc !== zLoc) {
          var eorLbl = (fmtPanRu(g(colEorPan), g(colEorRu)) + (g(colEorPortF) ? ' ' + g(colEorPortF) : '')).trim();
          hops.push(ctx.intern(eorLoc), ctx.intern(eorLbl), ctx.intern(g(colEorDcnCable)));
        }
        if (dcnLoc && dcnLoc !== aLoc && dcnLoc !== zLoc) {
          var dcnLbl = (fmtPanRu(g(colDcnPan), g(colDcnRu)) + (g(colDcnPortF) ? ' ' + g(colDcnPortF) : '')).trim();
          hops.push(ctx.intern(dcnLoc), ctx.intern(dcnLbl), ctx.intern(g(colDcnSpnCable)));
        }
      } else {
        if (panAS && panAS !== g(colAName)) {
          var effAPpLoc = aPpLoc || aLoc;
          var aPpLbl = (
            fmtPanRu(panAS, g(colPanARu)) +
            (g(colPanAPortF) ? ' p' + g(colPanAPortF) : '') +
            (g(colTrunkAId) ? ' [' + g(colTrunkAId) + ']' : '')
          ).trim();
          var aPpCab = g(colTrunk) || g(colACord);
          hops.push(ctx.intern(effAPpLoc), ctx.intern(aPpLbl), ctx.intern(aPpCab));
        }
        if (panZS && panZS !== g(colZName)) {
          var effZPpLoc = zPpLoc || zLoc;
          var zPpLbl = (
            fmtPanRu(panZS, g(colPanZRu)) +
            (g(colPanZPortF) ? ' p' + g(colPanZPortF) : '') +
            (g(colTrunkZId) ? ' [' + g(colTrunkZId) + ']' : '')
          ).trim();
          var zPpCab = g(colZCord) || g(colTrunk);
          hops.push(ctx.intern(effZPpLoc), ctx.intern(zPpLbl), ctx.intern(zPpCab));
        }
      }
      if (hops.length) entry.push(hops);

      buf.push(entry);

      var locsToCheck = [aLoc, zLoc, eorLoc, dcnLoc, aPpLoc, zPpLoc];
      for (var li = 0; li < locsToCheck.length; li++) {
        var lc = locsToCheck[li];
        if (!lc) continue;
        var m = HALL_RE.exec(lc + '-') || HALL_RE.exec(lc);
        if (m && m[1]) ctx.hallsSet[m[1].toUpperCase()] = true;
      }
    }

    if (hdrIdx === null || buf.length < 4) return 0;
    ctx.fams.push(name);
    ctx.rowsOut[name] = buf;
    ctx.total += buf.length;
    return buf.length;
  }

  function finalizeContext(ctx, opts) {
    opts = opts || {};
    var minRows = opts.minRows !== undefined ? opts.minRows : 250000;
    if (ctx.total < minRows) {
      throw new Error('Expected at least ' + minRows.toLocaleString() + ' rows across sheets, got ' + ctx.total.toLocaleString());
    }
    var mats = {};
    ctx.fams.forEach(function (name) {
      var buf = ctx.rowsOut[name];
      var cnt = {};
      for (var i = 0; i < buf.length; i++) {
        var specIdx = buf[i][4];
        if (specIdx >= 0) cnt[specIdx] = (cnt[specIdx] || 0) + 1;
      }
      mats[name] = Object.keys(cnt).map(function (k) { return [Number(k), cnt[k]]; })
        .sort(function (a, b) { return b[1] - a[1]; });
    });

    var hallsSorted = Object.keys(ctx.hallsSet).sort();
    var out = {
      v: 2,
      src: ctx.srcName,
      d: ctx.dctList,
      fams: ctx.fams,
      halls: hallsSorted,
      rows: ctx.rowsOut,
      mats: mats
    };

    // Derive halls-buf103.json structure for Walkthrough integration
    var hallsCfg = {};
    hallsSorted.forEach(function (hall) {
      var rowSet = {};
      ctx.fams.forEach(function (fam) {
        var buf = ctx.rowsOut[fam];
        for (var i = 0; i < buf.length; i++) {
          var r = buf[i];
          var idxs = [r[0], r[2]];
          if (r[6]) {
            for (var hi = 0; hi < r[6].length; hi += 3) idxs.push(r[6][hi]);
          }
          for (var ii = 0; ii < idxs.length; ii++) {
            var loc = idxs[ii] >= 0 ? ctx.dctList[idxs[ii]] : '';
            var m2 = RACK_ROW_RE.exec(loc || '');
            if (m2 && m2[1] === hall) rowSet[parseInt(m2[2], 10)] = true;
          }
        }
      });
      var rowsNum = Object.keys(rowSet).map(Number).sort(function (a, b) { return a - b; });
      var groups = [];
      var net = rowsNum.filter(function (rn) { return rn <= 2; });
      var body = rowsNum.filter(function (rn) { return rn > 2; });
      if (net.length) {
        groups.push({ name: 'Network Rows ' + net[0] + '-' + net[net.length - 1], rows: net });
      }
      for (var bi = 0; bi < body.length; bi += 8) {
        var chunk = body.slice(bi, bi + 8);
        groups.push({ name: 'POD ' + Math.floor(bi / 8) + ' (' + chunk[0] + '-' + chunk[chunk.length - 1] + ')', rows: chunk });
      }
      hallsCfg[hall] = {
        maxRow: rowsNum.length ? rowsNum[rowsNum.length - 1] : 0,
        groups: groups
      };
    });

    return { data: out, hallsCfg: hallsCfg };
  }

  function parseArrayBuffer(buffer, opts, onProgress) {
    opts = opts || {};
    if (typeof XLSX === 'undefined') throw new Error('SheetJS (XLSX) not loaded');
    var srcName = (opts.fileName || 'ICT_Cutsheet_BUF103').replace(/\.xlsx$/i, '').replace(/^\[ext\]\s*/i, '');
    var ctx = createContext(srcName);

    // 1) Read sheet names only first (low memory)
    var metaWb = XLSX.read(buffer, { type: 'array', bookSheets: true });
    var sheetNames = (metaWb && metaWb.SheetNames) || [];
    var activeSheets = sheetNames.filter(function (n) { return n !== 'Intro'; });

    // 2) Parse one sheet at a time in dense mode so iPhone Safari stays under 80MB RAM
    for (var idx = 0; idx < activeSheets.length; idx++) {
      var sName = activeSheets[idx];
      if (onProgress) {
        onProgress({
          sheet: sName,
          current: idx + 1,
          total: activeSheets.length,
          pct: Math.round((idx / Math.max(1, activeSheets.length)) * 92),
          rows: ctx.total
        });
      }
      var subWb = XLSX.read(buffer, {
        type: 'array',
        dense: true,
        sheets: [sName],
        cellFormula: false,
        cellHTML: false,
        cellText: false,
        cellStyles: false
      });
      var ws = subWb.Sheets && subWb.Sheets[sName];
      var rows = sheetToRows(ws);
      parseSheetRows(ctx, sName, rows);
    }

    if (onProgress) {
      onProgress({ sheet: 'Finalizing dictionary & materials', current: activeSheets.length, total: activeSheets.length, pct: 96, rows: ctx.total });
    }
    var res = finalizeContext(ctx, opts);
    if (onProgress) {
      onProgress({ sheet: 'Complete', current: activeSheets.length, total: activeSheets.length, pct: 100, rows: ctx.total });
    }
    return res;
  }

  var api = {
    parseArrayBuffer: parseArrayBuffer,
    createContext: createContext,
    parseSheetRows: parseSheetRows,
    finalizeContext: finalizeContext
  };

  root.CutsheetParser = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  // Web Worker message handler
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    self.onmessage = function (ev) {
      var msg = ev.data || {};
      if (msg.type === 'parse') {
        try {
          if (typeof XLSX === 'undefined') {
            importScripts(msg.xlsxUrl || '../vendor/xlsx/xlsx.full.min.js');
          }
          var res = parseArrayBuffer(msg.buffer, { fileName: msg.fileName, minRows: msg.minRows }, function (prog) {
            self.postMessage({ type: 'progress', progress: prog });
          });
          self.postMessage({ type: 'done', data: res.data, hallsCfg: res.hallsCfg });
        } catch (err) {
          self.postMessage({ type: 'error', error: (err && err.message) ? err.message : String(err) });
        }
      }
    };
  }
})(typeof self !== 'undefined' ? self : this);
