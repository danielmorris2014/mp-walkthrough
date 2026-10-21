/* sync-engine.js — the sync module (site-code model, no accounts).
   Interface: Sync.connect(siteCode) → Sync.pull() → Sync.push() → Sync.status
   Backend: GitHub Contents API (file at sync/state.json in the repo).
   The site code carries the auth token — nobody manages accounts. */
var Sync = (function () {
  var REPO = 'danielmorris2014/mp-walkthrough';
  var PATH = 'sync/state.json';
  var API = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
  var token = null;
  var sha = null;              // current remote SHA (needed for PUT)
  var lastSyncAt = 0;          // ms timestamp of last successful sync
  var pendingChanges = 0;      // local changes since last push
  var status = 'standalone';   // standalone | synced | pending | error
  // The one list of keys shared across phones. mergeStates, sync and push all
  // derive from it; baselines ride along (ADR-0002: what syncs = everything).
  var SHARED_KEYS = ['halls', 'blockers', 'crewPool', 'meta', 'history', 'baseline'];
  var lastMarked = null;       // snapshot of shared keys at last markChanged

  // ---- site code codec ----
  function encodeCode(tok) {
    return 'MP-' + btoa(tok);
  }
  function decodeCode(code) {
    if (!code || code.indexOf('MP-') !== 0) return null;
    try { return atob(code.slice(3)); } catch (e) { return null; }
  }

  // ---- GitHub Contents API ----
  function apiGet() {
    return fetch(API + '?t=' + Date.now(), {
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' }
    }).then(function (r) {
      if (r.status === 404) return null; // no sync file yet
      if (!r.ok) throw new Error('GET ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!data) return null;
      sha = data.sha;
      try { return JSON.parse(atob(data.content.replace(/\n/g, ''))); }
      catch (e) { return null; }
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
      if (!r.ok) throw new Error('PUT ' + r.status);
      return r.json();
    }).then(function (data) {
      sha = data.content.sha;
      return true;
    });
  }

  // ---- merge: latest-per-key across top-level state keys (ADR-0002) ----
  function isEmptyVal(v) {
    return v === undefined || v === null ||
      (Array.isArray(v) && !v.length) ||
      (typeof v === 'object' && !Object.keys(v || {}).length);
  }
  function mergeStates(remote, local) {
    if (!remote) return local;
    if (!local) return remote;
    var merged = {}, meta = {};
    SHARED_KEYS.forEach(function (k) {
      var rAt = (remote._meta && remote._meta[k + '_at']) || 0;
      var lAt = (local._meta && local._meta[k + '_at']) || 0;
      var localWins = lAt >= rAt;
      // tie-break: an unstamped EMPTY local value never beats remote data —
      // otherwise a fresh joiner would never receive keys it hasn't touched
      // (e.g. the site's baselines and history).
      if (lAt === rAt && isEmptyVal(local[k]) && !isEmptyVal(remote[k])) localWins = false;
      merged[k] = localWins ? local[k] : remote[k];
      meta[k + '_at'] = localWins ? lAt : rAt; // carry the winner's stamp forward
    });
    merged._meta = meta;
    merged._meta.syncedAt = Date.now();
    return merged;
  }

  // markChanged(s, silent): diff the shared keys against the last snapshot and
  // stamp (_at) only what actually moved — honest inputs for the next merge.
  // Called from saveState; the first call just seeds the snapshot. silent=true
  // (post-sync) only re-seeds, so a merge doesn't mark itself pending.
  function markChanged(s, silent) {
    if (!s) return;
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
    // save to localStorage for auto-reconnect
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
    var stateObj = {};
    SHARED_KEYS.forEach(function (k) {
      stateObj[k] = localState[k];
    });
    stateObj._meta = localState._meta || {};
    stateObj._meta.syncedAt = Date.now();
    stateObj._meta.pushedBy = (window.__SYNC_NAME || 'unknown');
    return apiPut(stateObj).then(function () {
      lastSyncAt = Date.now();
      pendingChanges = 0;
      status = 'synced';
      return true;
    }).catch(function (e) {
      status = navigator.onLine ? 'error' : 'pending';
      return false;
    });
  }

  function sync(localState) {
    if (!token) return Promise.resolve(localState);
    return pull().then(function (remote) {
      if (!remote) {
        // no remote state yet — push ours
        return push(localState).then(function () { return localState; });
      }
      var merged = mergeStates(remote, localState);
      var changed = SHARED_KEYS.some(function (k) {
        return JSON.stringify(merged[k]) !== JSON.stringify(localState[k]);
      });
      // Return a NEW object only when the merge moved something: callers use
      // `if (m !== state)` to decide whether to re-render, so smuggling the
      // same reference back would leave the screen stale.
      var mergedState = localState;
      if (changed) {
        mergedState = {};
        for (var k in localState) mergedState[k] = localState[k]; // personal keys ride along
        SHARED_KEYS.forEach(function (k) { mergedState[k] = merged[k]; });
        mergedState._meta = merged._meta;
      }
      // always push the merged result so both phones converge
      return push(mergedState).then(function () {
        markChanged(mergedState, true); // re-seed: post-merge state is the new baseline
        return mergedState;
      });
    }).catch(function () { return localState; });
  }

  function touch(key) {
    // called when a top-level state key changes locally
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
    merge: mergeStates,   // pure latest-per-key merge (ADR-0002) — the one policy
    getStatus: getStatus,
    timeAgo: timeAgo,
    encodeCode: encodeCode
  };
})();
