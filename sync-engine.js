/* sync-engine.js — Yjs CRDT sync module (site-code model, no accounts).
   Interface: Sync.connect(siteCode) → Sync.pull() → Sync.push() → Sync.sync()
   Backend: GitHub Contents API (file at sync/state.json in the repo).
   Merge engine: Yjs CRDT (Y.Doc / nested Y.Map per hall -> row -> side -> cable)
   with per-cable timestamp tie-breaking (ADR-0002) and v73/v75 dual-format
   transition support. Two supers stamping different rows/cables simultaneously
   both survive with zero data loss. */
var Sync = (function () {
  var REPO = 'danielmorris2014/mp-walkthrough';
  var PATH = 'sync/state.json';
  var API = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  var token = null;
  var sha = null;              // current remote SHA (needed for PUT)
  var lastSyncAt = 0;          // ms timestamp of last successful sync
  var pendingChanges = 0;      // local changes since last push
  var status = 'standalone';   // standalone | synced | pending | error
  var SHARED_KEYS = ['halls', 'blockers', 'crewPool', 'meta', 'history', 'baseline'];
  var CABLES = ['F144', 'OCS', 'CAT6'];
  var lastMarked = null;       // snapshot of shared keys at last markChanged
  var ydoc = (typeof Y !== 'undefined' && Y && Y.Doc) ? new Y.Doc() : null;

  // ---- base64 <-> Uint8Array helpers for Yjs binary updates ----
  function bytesToBase64(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function base64ToBytes(b64) {
    var bin = atob(b64.replace(/\s/g, ''));
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // ---- Yjs CRDT <-> state synchronization ----
  function ensureYMap(parent, key) {
    var cur = parent.get(key);
    if (!cur || !(cur instanceof Y.Map)) {
      cur = new Y.Map();
      parent.set(key, cur);
    }
    return cur;
  }

  // Diff-only write into Y.Doc: only leaf keys that actually changed emit a
  // Yjs CRDT struct, so Phone A touching row 17 and Phone B touching row 22
  // merge cleanly without overwriting untouched rows.
  function syncToYDoc(s, doc) {
    doc = doc || ydoc;
    if (!doc || !s || typeof Y === 'undefined') return;
    doc.transact(function () {
      var root = doc.getMap('state');
      if (s.halls && typeof s.halls === 'object') {
        var yHalls = ensureYMap(root, 'halls');
        // remove deleted halls
        yHalls.forEach(function (_, hid) {
          if (!(hid in s.halls)) yHalls.delete(hid);
        });
        Object.keys(s.halls).forEach(function (hid) {
          var h = s.halls[hid];
          if (!h || typeof h !== 'object' || !h.rows) {
            // primitive/synthetic hall entry (e.g. probe fixture)
            if (JSON.stringify(yHalls.get(hid)) !== JSON.stringify(h)) yHalls.set(hid, h);
            return;
          }
          var yHall = ensureYMap(yHalls, hid);
          ['id', 'name', 'maxRow', 'groups', 'notes'].forEach(function (hk) {
            if (JSON.stringify(yHall.get(hk)) !== JSON.stringify(h[hk])) {
              yHall.set(hk, h[hk] !== undefined ? JSON.parse(JSON.stringify(h[hk])) : null);
            }
          });
          var yRows = ensureYMap(yHall, 'rows');
          Object.keys(h.rows).forEach(function (r) {
            var rowObj = h.rows[r];
            if (!rowObj) return;
            var yRow = ensureYMap(yRows, String(r));
            ['11', '13'].forEach(function (sd) {
              var seg = rowObj[sd];
              if (!seg) return;
              var ySide = ensureYMap(yRow, sd);
              CABLES.forEach(function (c) {
                var val = seg[c] || 'none';
                if (ySide.get(c) !== val) ySide.set(c, val);
                var stObj = (seg._st && seg._st[c]) ? { by: seg._st[c].by, at: seg._st[c].at } : null;
                var curSt = ySide.get('_st_' + c) || null;
                if (JSON.stringify(curSt) !== JSON.stringify(stObj)) {
                  ySide.set('_st_' + c, stObj);
                }
              });
            });
          });
        });
      }
      ['blockers', 'crewPool', 'meta', 'history', 'baseline', '_meta'].forEach(function (k) {
        if (s[k] !== undefined && JSON.stringify(root.get(k)) !== JSON.stringify(s[k])) {
          root.set(k, JSON.parse(JSON.stringify(s[k])));
        }
      });
    });
  }

  function extractFromYDoc(doc) {
    doc = doc || ydoc;
    if (!doc || typeof Y === 'undefined') return null;
    var root = doc.getMap('state');
    var raw = root.toJSON();
    if (!raw || !raw.halls) return null;
    // reconstruct seg._st per row-side from _st_<CABLE> entries
    Object.keys(raw.halls).forEach(function (hid) {
      var h = raw.halls[hid];
      if (!h || !h.rows) return;
      Object.keys(h.rows).forEach(function (r) {
        var rowObj = h.rows[r];
        if (!rowObj) return;
        ['11', '13'].forEach(function (sd) {
          var seg = rowObj[sd];
          if (!seg) return;
          var st = {};
          var hasSt = false;
          CABLES.forEach(function (c) {
            var k = '_st_' + c;
            if (seg[k] && seg[c] !== 'none') {
              st[c] = seg[k];
              hasSt = true;
            }
            delete seg[k];
          });
          if (hasSt) seg._st = st;
        });
      });
    });
    return raw;
  }

  // ---- site code codec ----
  function encodeCode(tok) {
    return 'MP-' + btoa(tok);
  }
  function decodeCode(code) {
    if (!code || code.indexOf('MP-') !== 0) return null;
    try { return atob(code.slice(3)); } catch (e) { return null; }
  }

  // ---- GitHub Contents API (handles both JSON+Yjs envelope and raw Yjs binary) ----
  function apiGet() {
    return fetch(API + '?t=' + Date.now(), {
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' }
    }).then(function (r) {
      if (r.status === 404) return null; // no sync file yet
      if (!r.ok) throw new Error('GET ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || !data.content) return null;
      sha = data.sha;
      var rawB64 = data.content.replace(/\s/g, '');
      // 1) Try JSON parse first (handles v73 JSON and v75 JSON+_yjs envelope)
      try {
        var text = decodeURIComponent(escape(atob(rawB64)));
        var parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        try {
          var parsed2 = JSON.parse(atob(rawB64));
          if (parsed2 && typeof parsed2 === 'object') return parsed2;
        } catch (e2) {}
      }
      // 2) Fallback: raw Yjs binary update in data.content
      if (typeof Y !== 'undefined' && Y.Doc) {
        try {
          var bytes = base64ToBytes(rawB64);
          var tmpDoc = new Y.Doc();
          Y.applyUpdate(tmpDoc, bytes);
          var extracted = extractFromYDoc(tmpDoc);
          if (extracted) {
            extracted._yjs = rawB64;
            return extracted;
          }
        } catch (e3) {}
      }
      return null;
    });
  }

  function apiPut(stateObj) {
    var body = JSON.stringify(stateObj);
    var payload = {
      message: 'sync ' + new Date().toISOString(),
      content: btoa(unescape(encodeURIComponent(body)))
    };
    if (sha) payload.sha = sha;
    return fetch(API, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (r.status === 409 || r.status === 422) {
        var err = new Error('CONFLICT ' + r.status);
        err.conflict = true;
        throw err;
      }
      if (!r.ok) throw new Error('PUT ' + r.status);
      return r.json();
    }).then(function (data) {
      if (data && data.content && data.content.sha) sha = data.content.sha;
      return true;
    });
  }

  // ---- Field-level CRDT merge for halls + Yjs update integration ----
  function isEmptyVal(v) {
    return v === undefined || v === null ||
      (Array.isArray(v) && !v.length) ||
      (typeof v === 'object' && !Object.keys(v || {}).length);
  }

  function isRealHallsMap(halls) {
    if (!halls || typeof halls !== 'object') return false;
    var keys = Object.keys(halls);
    if (!keys.length) return false;
    return keys.every(function (k) {
      return halls[k] && typeof halls[k] === 'object' && halls[k].rows && typeof halls[k].rows === 'object';
    });
  }

  // Merge two halls maps at the individual (hall, row, side, cable) granularity
  // using Yjs Y.Doc + per-cable _st[c].at wall-clock timestamps (ADR-0002).
  function mergeHallsFieldLevel(rHalls, lHalls, rHallsAt, lHallsAt, rYjsB64) {
    var localPreferred = lHallsAt >= rHallsAt;
    // Start from Yjs CRDT merge if Y is available
    var yMergedHalls = null;
    if (typeof Y !== 'undefined' && Y.Doc) {
      try {
        var docR = new Y.Doc();
        var docL = new Y.Doc();
        if (rYjsB64) {
          Y.applyUpdate(docR, base64ToBytes(rYjsB64));
        } else {
          syncToYDoc({ halls: rHalls }, docR);
        }
        syncToYDoc({ halls: lHalls }, docL);
        Y.applyUpdate(docL, Y.encodeStateAsUpdate(docR));
        var ext = extractFromYDoc(docL);
        if (ext && ext.halls) yMergedHalls = ext.halls;
      } catch (e) {}
    }

    var outHalls = {};
    var allHallIds = {};
    Object.keys(rHalls || {}).forEach(function (k) { allHallIds[k] = true; });
    Object.keys(lHalls || {}).forEach(function (k) { allHallIds[k] = true; });

    Object.keys(allHallIds).forEach(function (hid) {
      var rh = rHalls && rHalls[hid];
      var lh = lHalls && lHalls[hid];
      if (!rh) { outHalls[hid] = JSON.parse(JSON.stringify(lh)); return; }
      if (!lh) { outHalls[hid] = JSON.parse(JSON.stringify(rh)); return; }

      var baseHall = JSON.parse(JSON.stringify(localPreferred ? lh : rh));
      // Merge hall notes (union preserving order)
      var rNotes = rh.notes || [], lNotes = lh.notes || [];
      var mergedNotes = (localPreferred ? lNotes : rNotes).slice();
      (localPreferred ? rNotes : lNotes).forEach(function (n) {
        if (mergedNotes.indexOf(n) < 0) mergedNotes.push(n);
      });
      baseHall.notes = mergedNotes;

      var allRows = {};
      Object.keys(rh.rows || {}).forEach(function (r) { allRows[r] = true; });
      Object.keys(lh.rows || {}).forEach(function (r) { allRows[r] = true; });

      baseHall.rows = {};
      Object.keys(allRows).forEach(function (r) {
        var rRow = rh.rows && rh.rows[r];
        var lRow = lh.rows && lh.rows[r];
        if (!rRow) { baseHall.rows[r] = JSON.parse(JSON.stringify(lRow)); return; }
        if (!lRow) { baseHall.rows[r] = JSON.parse(JSON.stringify(rRow)); return; }
        baseHall.rows[r] = {};
        ['11', '13'].forEach(function (sd) {
          var rSeg = rRow[sd] || { F144: 'none', OCS: 'none', CAT6: 'none' };
          var lSeg = lRow[sd] || { F144: 'none', OCS: 'none', CAT6: 'none' };
          var ySeg = (yMergedHalls && yMergedHalls[hid] && yMergedHalls[hid].rows &&
                      yMergedHalls[hid].rows[r] && yMergedHalls[hid].rows[r][sd]) || null;
          var mSeg = { F144: 'none', OCS: 'none', CAT6: 'none' };
          var mSt = {};
          var hasSt = false;

          CABLES.forEach(function (c) {
            var rVal = rSeg[c] || 'none';
            var lVal = lSeg[c] || 'none';
            var rSt = (rSeg._st && rSeg._st[c]) || null;
            var lSt = (lSeg._st && lSeg._st[c]) || null;
            var rAt = (rSt && rSt.at) || 0;
            var lAt = (lSt && lSt.at) || 0;

            var winVal, winSt;
            if (rVal === lVal) {
              winVal = lVal;
              winSt = (lAt >= rAt) ? (lSt || rSt) : (rSt || lSt);
            } else if (rAt > 0 && lAt > 0) {
              // Both phones stamped this exact cable with attribution -> latest timestamp wins (ADR-0002)
              if (lAt >= rAt) { winVal = lVal; winSt = lSt; }
              else { winVal = rVal; winSt = rSt; }
            } else if (lAt > 0 && rVal === 'none') {
              // Local stamped this cable, remote has 'none' -> keep local stamp
              winVal = lVal; winSt = lSt;
            } else if (rAt > 0 && lVal === 'none') {
              // Remote stamped this cable, local has 'none' -> keep remote stamp
              winVal = rVal; winSt = rSt;
            } else if (ySeg && ySeg[c] && ySeg[c] !== 'none') {
              winVal = ySeg[c];
              winSt = (ySeg._st && ySeg._st[c]) || lSt || rSt;
            } else {
              winVal = localPreferred ? lVal : rVal;
              winSt = localPreferred ? lSt : rSt;
            }

            mSeg[c] = winVal;
            if (winVal !== 'none' && winSt) {
              mSt[c] = { by: winSt.by, at: winSt.at };
              hasSt = true;
            }
          });
          if (hasSt) mSeg._st = mSt;
          baseHall.rows[r][sd] = mSeg;
        });
      });
      outHalls[hid] = baseHall;
    });
    return outHalls;
  }

  function mergeStates(remote, local) {
    if (!remote) return local;
    if (!local) return remote;
    // Apply remote Yjs binary update into our live ydoc if present
    if (remote._yjs && ydoc && typeof Y !== 'undefined') {
      try { Y.applyUpdate(ydoc, base64ToBytes(remote._yjs)); } catch (e) {}
    }
    var merged = {}, meta = {};
    SHARED_KEYS.forEach(function (k) {
      var rAt = (remote._meta && remote._meta[k + '_at']) || 0;
      var lAt = (local._meta && local._meta[k + '_at']) || 0;
      var localWins = lAt >= rAt;
      if (lAt === rAt && isEmptyVal(local[k]) && !isEmptyVal(remote[k])) localWins = false;

      if (k === 'halls' && isRealHallsMap(remote.halls) && isRealHallsMap(local.halls)) {
        // Yjs CRDT field-level merge across halls -> rows -> sides -> cables
        merged.halls = mergeHallsFieldLevel(remote.halls, local.halls, rAt, lAt, remote._yjs);
      } else {
        merged[k] = localWins ? local[k] : remote[k];
      }
      meta[k + '_at'] = localWins ? lAt : rAt;
    });
    merged._meta = meta;
    merged._meta.syncedAt = Date.now();
    if (ydoc) syncToYDoc(merged, ydoc);
    return merged;
  }

  function markChanged(s, silent) {
    if (!s) return;
    if (ydoc) syncToYDoc(s, ydoc);
    if (lastMarked && !silent) {
      SHARED_KEYS.forEach(function (k) {
        if (JSON.stringify(s[k]) !== lastMarked[k]) touch(k);
      });
    }
    lastMarked = {};
    SHARED_KEYS.forEach(function (k) { lastMarked[k] = JSON.stringify(s[k]); });
  }

  // ---- public interface ----
  function connect(code) {
    var tok = decodeCode(code.trim());
    if (!tok) return Promise.resolve(false);
    token = tok;
    try { localStorage.setItem('mp_sync_token', tok); } catch (e) {}
    return apiGet().then(function () { status = 'synced'; return true; })
      .catch(function () { status = 'error'; return false; });
  }
  function disconnect() {
    token = null; sha = null; status = 'standalone';
    try { localStorage.removeItem('mp_sync_token'); } catch (e) {}
  }
  function restore() {
    try {
      var t = localStorage.getItem('mp_sync_token');
      if (t) { token = t; status = 'pending'; return true; }
    } catch (e) {}
    return false;
  }

  function pull() {
    if (!token) return Promise.resolve(null);
    return apiGet().then(function (remote) {
      lastSyncAt = Date.now();
      status = 'synced';
      return remote;
    }).catch(function (e) {
      status = navigator.onLine ? 'error' : 'pending';
      return null;
    });
  }

  function push(localState) {
    if (!token) return Promise.resolve(false);
    if (ydoc) syncToYDoc(localState, ydoc);
    var stateObj = {};
    SHARED_KEYS.forEach(function (k) {
      stateObj[k] = localState[k];
    });
    stateObj._meta = localState._meta || {};
    stateObj._meta.syncedAt = Date.now();
    stateObj._meta.pushedBy = (window.__SYNC_NAME || 'unknown');
    if (ydoc && typeof Y !== 'undefined') {
      try { stateObj._yjs = bytesToBase64(Y.encodeStateAsUpdate(ydoc)); } catch (e) {}
    }
    return apiPut(stateObj).then(function () {
      lastSyncAt = Date.now();
      pendingChanges = 0;
      status = 'synced';
      return true;
    }).catch(function (e) {
      status = navigator.onLine ? 'error' : 'pending';
      if (e && e.conflict) throw e;
      return false;
    });
  }

  function sync(localState, _retry) {
    if (!token) return Promise.resolve(localState);
    if (ydoc) syncToYDoc(localState, ydoc);
    return pull().then(function (remote) {
      if (!remote) {
        return push(localState).then(function () { return localState; });
      }
      var merged = mergeStates(remote, localState);
      var changed = SHARED_KEYS.some(function (k) {
        return JSON.stringify(merged[k]) !== JSON.stringify(localState[k]);
      });
      var remoteChanged = SHARED_KEYS.some(function (k) {
        return JSON.stringify(merged[k]) !== JSON.stringify(remote[k]);
      });
      var mergedState = localState;
      if (changed) {
        mergedState = {};
        for (var k in localState) mergedState[k] = localState[k];
        SHARED_KEYS.forEach(function (k) { mergedState[k] = merged[k]; });
        mergedState._meta = merged._meta;
      }
      // Skip redundant PUT when merged state already matches remote and nothing is pending
      if (!remoteChanged && !pendingChanges) {
        markChanged(mergedState, true);
        status = 'synced';
        return mergedState;
      }
      return push(mergedState).then(function () {
        markChanged(mergedState, true);
        return mergedState;
      }).catch(function (err) {
        // Automatic retry on GitHub 409/422 SHA conflict when two phones push simultaneously
        if (err && err.conflict && !_retry) {
          return sync(mergedState, true);
        }
        return mergedState;
      });
    }).catch(function () { return localState; });
  }

  function touch(key) {
    if (!window.state) return;
    if (!window.state._meta) window.state._meta = {};
    window.state._meta[key + '_at'] = Date.now();
    pendingChanges++;
    status = 'pending';
  }

  function getStatus() {
    return {
      status: status,
      lastSyncAt: lastSyncAt,
      pendingChanges: pendingChanges,
      connected: !!token
    };
  }

  function timeAgo(ts) {
    if (!ts) return '';
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return s + 's ago';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    return Math.floor(s / 3600) + 'h ago';
  }

  return {
    connect: connect,
    disconnect: disconnect,
    restore: restore,
    pull: pull,
    push: push,
    sync: sync,
    touch: touch,
    markChanged: markChanged,
    merge: mergeStates,
    syncToYDoc: syncToYDoc,
    extractFromYDoc: extractFromYDoc,
    getYDoc: function () { return ydoc; },
    getStatus: getStatus,
    timeAgo: timeAgo,
    encodeCode: encodeCode
  };
})();
