/* walk-state.js — deep module owning Walkthrough state shape, versioned
   migrations (STATE_VERSION = 4), CORE_SHAPE (shared with Sync), undo
   snapshots, Baseline snapshots, and JSON backup/restore payloads. */
var WalkState = (function () {
  var STORAGE_KEY = 'mp_walkthrough_v1';
  var CORE_SHAPE = ['halls', 'crewPool', 'blockers', 'meta', 'history', 'baseline'];
  var STATE_VERSION = 4;

  var LEGACY_SP_DEMO = 'Started training with Chris Dickman. Shadowed MP on staging and remediation in CB5 DH1. Tested new hires on the system to gauge their training progress.\nTaking measurements with the cable pole to determine cable lengths.';
  var LEGACY_TOMORROW_DEMO = 'Allocating and pulling material in CB5 DH1.\nQC of pulled cables in CB4 DH2 and installing of cables as HAC\u2019s are approved.\nTroubleshooting of AI\u2019s sent to the team.';

  function emptySide() {
    if (typeof ReportEngine !== 'undefined' && ReportEngine.Side && ReportEngine.Side.empty) {
      return ReportEngine.Side.empty();
    }
    return { F144: 'none', OCS: 'none', CAT6: 'none' };
  }

  function emptyRow() {
    return { '11': emptySide(), '13': emptySide() };
  }

  function grp(name, from, to) {
    var rows = [];
    for (var r = from; r <= to; r++) rows.push(r);
    return { name: name, rows: rows };
  }

  function makeHall(id, name, maxRow, groups) {
    var rows = {};
    for (var r = 1; r <= maxRow; r++) rows[r] = emptyRow();
    return { id: id, name: name, maxRow: maxRow, groups: groups, rows: rows };
  }

  function defaultEmailTo() {
    return (typeof ReportEngine !== 'undefined' && ReportEngine.DEFAULT_EMAIL_TO) || 'Jack.Tracy@servicepoint.com';
  }

  function defaultEmailCc() {
    return (typeof ReportEngine !== 'undefined' && ReportEngine.DEFAULT_EMAIL_CC) || '';
  }

  function defaultState() {
    var s = {
      version: STATE_VERSION,
      activeHall: 'CB5_DH1',
      brush: 'hung',
      scope: 'ALL',
      settings: {
        onboarded: true,
        numStyle: 'short',
        orientation: 'h11',
        signature: '',
        textSize: 'normal',
        wakeLock: true,
        lastBackup: 0,
        emailTo: defaultEmailTo(),
        emailCc: defaultEmailCc()
      },
      meta: {
        supers: '',
        shiftTime: '2:00 PM \u2013 2:00 AM',
        mpCount: 0,
        spCount: 11,
        spWorkNotes: '',
        areasOfConcern: 'None',
        tasksTomorrow: ''
      },
      crewPool: [
        'Richard Montgomery', 'Dwayne Phillips', 'Daniel Morris', 'Ken Smith',
        'Jonathan Hall', 'Rafael Trevino', 'Kendrick Freeman', 'Darius Moore',
        'Chris Dickman', 'Jack Tracy', 'Steve Maffeo'
      ].map(function (n) { return { name: n, active: true }; }),
      blockers: [],
      history: [],
      baseline: null,
      halls: {}
    };
    s.halls['CB5_DH1'] = makeHall('CB5_DH1', 'CB5 DH1', 26, [
      grp('Network Rows 1\u20132', 1, 2),
      grp('POD 1 (Rows 3\u201310)', 3, 10),
      grp('POD 2 (Rows 11\u201318)', 11, 18),
      grp('POD 3 (Rows 19\u201326)', 19, 26)
    ]);
    s.halls['CB4_DH2'] = makeHall('CB4_DH2', 'CB4 DH2', 36, [
      grp('Network Rows 1\u20132', 1, 2),
      grp('POD 10 (Rows 3\u201310)', 3, 10),
      grp('POD 11 (Rows 11\u201318)', 11, 18),
      grp('POD 12 (Rows 19\u201326)', 19, 26),
      grp('Rows 27\u201336 (HAC area)', 27, 36)
    ]);
    s.halls['CB4_DH4'] = makeHall('CB4_DH4', 'CB4 DH4', 26, [
      grp('Network Rows 1\u20132', 1, 2),
      grp('POD 10 (Rows 3\u201310)', 3, 10),
      grp('POD 11 (Rows 11\u201318)', 11, 18),
      grp('POD 12 (Rows 19\u201326)', 19, 26)
    ]);
    return s;
  }

  function stripLegacySeedData(s) {
    if (!s) return s;
    var hadDemoMeta = false;
    if (s.meta) {
      if (s.meta.spWorkNotes === LEGACY_SP_DEMO) { s.meta.spWorkNotes = ''; hadDemoMeta = true; }
      if (s.meta.tasksTomorrow === LEGACY_TOMORROW_DEMO) { s.meta.tasksTomorrow = ''; hadDemoMeta = true; }
    }
    var scrubbedDemoRows = false;
    if (s.halls) {
      Object.keys(s.halls).forEach(function (hid) {
        var h = s.halls[hid];
        if (!h) return;
        delete h.notes;
      });
      var cb5 = s.halls['CB5_DH1'];
      var cables = (typeof ReportEngine !== 'undefined' && ReportEngine.CABLES) || ['F144', 'OCS', 'CAT6'];
      if (cb5 && cb5.rows) {
        for (var r = 1; r <= 13; r++) {
          if (!cb5.rows[r]) continue;
          ['11', '13'].forEach(function (side) {
            var seg = cb5.rows[r][side];
            if (!seg) return;
            var hasRealStamp = seg._st && cables.some(function (c) { return seg._st[c] && seg._st[c].at; });
            var hasProg = seg.F144 !== 'none' || seg.OCS !== 'none' || seg.CAT6 !== 'none';
            if (!hasRealStamp && hasProg) {
              cb5.rows[r][side] = emptySide();
              scrubbedDemoRows = true;
            }
          });
        }
      }
    }
    if (s.meta && Number(s.meta.mpCount) === 106 && (hadDemoMeta || scrubbedDemoRows || (s.version || 1) < 4)) {
      s.meta.mpCount = 0;
    }
    if (s.baseline && s.baseline.halls) {
      Object.keys(s.baseline.halls).forEach(function (hid) {
        if (s.baseline.halls[hid]) delete s.baseline.halls[hid].notes;
      });
    }
    return s;
  }

  var MIGRATIONS = {
    1: function (s) {
      s.settings = Object.assign({
        onboarded: false, numStyle: 'short', orientation: 'h11',
        signature: '', textSize: 'normal', wakeLock: true, lastBackup: 0
      }, s.settings || {});
      s.version = 2;
      return s;
    },
    2: function (s) {
      s.version = 3;
      return s;
    },
    3: function (s) {
      stripLegacySeedData(s);
      s.version = 4;
      return s;
    }
  };

  function migrateState(s) {
    if (!s || typeof s !== 'object') return defaultState();
    var v = s.version || 1;
    while (v < STATE_VERSION) {
      if (!MIGRATIONS[v]) break;
      s = MIGRATIONS[v](s);
      v = s.version;
    }
    stripLegacySeedData(s);
    s.settings = s.settings || {};
    if (!s.settings.emailTo) s.settings.emailTo = defaultEmailTo();
    if (!s.settings.emailCc) s.settings.emailCc = defaultEmailCc();
    s.version = STATE_VERSION;
    return s;
  }

  function snapshotCore(state) {
    var o = {};
    CORE_SHAPE.forEach(function (k) { o[k] = state[k]; });
    return JSON.stringify(o);
  }

  function applySnapshot(state, snapJson) {
    var snap = typeof snapJson === 'string' ? JSON.parse(snapJson) : snapJson;
    if (!snap || typeof snap !== 'object') return state;
    CORE_SHAPE.forEach(function (k) {
      if (snap[k] !== undefined) state[k] = snap[k];
    });
    if ('baseline' in snap) state.baseline = snap.baseline;
    return state;
  }

  function buildBaseline(state) {
    var halls = {};
    Object.keys((state && state.halls) || {}).forEach(function (hid) {
      var h = state.halls[hid];
      halls[hid] = { rows: JSON.parse(JSON.stringify(h.rows || {})) };
    });
    return { date: new Date().toLocaleDateString('en-US'), halls: halls };
  }

  function buildBackupPayload(state) {
    return {
      app: 'mp-walkthrough',
      version: 1,
      exported: new Date().toISOString(),
      state: state
    };
  }

  function parseBackupPayload(rawJson) {
    var payload;
    try { payload = JSON.parse(rawJson); } catch (e) {
      return { ok: false, error: 'Not valid backup data' };
    }
    if (!payload || payload.app !== 'mp-walkthrough' || !payload.state || !payload.state.halls) {
      return { ok: false, error: 'Not a walkthrough backup file' };
    }
    return {
      ok: true,
      exported: payload.exported || 'unknown date',
      state: migrateState(payload.state)
    };
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    CORE_SHAPE: CORE_SHAPE,
    STATE_VERSION: STATE_VERSION,
    LEGACY_SP_DEMO: LEGACY_SP_DEMO,
    LEGACY_TOMORROW_DEMO: LEGACY_TOMORROW_DEMO,
    emptyRow: emptyRow,
    makeHall: makeHall,
    grp: grp,
    defaultState: defaultState,
    migrateState: migrateState,
    stripLegacySeedData: stripLegacySeedData,
    snapshotCore: snapshotCore,
    applySnapshot: applySnapshot,
    buildBaseline: buildBaseline,
    buildBackupPayload: buildBackupPayload,
    parseBackupPayload: parseBackupPayload
  };
})();
