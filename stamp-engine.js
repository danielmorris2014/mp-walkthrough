/* stamp-engine.js — the stamp module.
   Interface: Stamp.apply(hall, target, brush, opts) -> {changed, brush}
   Pure over data, no DOM: given a hall, a target (rows x sides x cables),
   a brush status and options, it computes and applies the next statuses and
   returns the change record the shell uses for rendering and glow.

   The toggle rule lives HERE and only here (it was written four times before):
   if every in-scope cable of every in-scope side of the target already holds
   the brush status, the whole target clears to 'none'; otherwise the whole
   target is set to the brush status. One rule for row taps, per-cable taps,
   row-number taps and pod buttons.

   Attribution (ADR-0002): every set records {by, at} in seg._st per cable;
   a clear removes it. Segs predating the engine carry no _st — unknown
   provenance, still valid. */
var Stamp = (function () {
  var ALL_CABLES = ['F144', 'OCS', 'CAT6'];

  function cablesIn(scope) {
    return scope === 'ALL' ? ALL_CABLES.slice() : [scope];
  }

  function setSeg(seg, cs, status, by, at) {
    cs.forEach(function (c) {
      seg[c] = status;
      if (status === 'none') {
        if (seg._st) delete seg._st[c];
      } else {
        if (!seg._st) seg._st = {};
        seg._st[c] = { by: by, at: at };
      }
    });
  }

  // target: { rows: [n...], sides: ['11'|'13'...], cables: [...] or scope: 'ALL'|'F144'|...,
  //           by: optional name }
  // opts.toggle === false forces set-only (no clear-on-second-tap).
  function apply(hall, target, brush, opts) {
    opts = opts || {};
    var sides = (target.sides && target.sides.length) ? target.sides : ['11', '13'];
    var cs = (target.cables && target.cables.length) ? target.cables : cablesIn(target.scope || 'ALL');
    var by = target.by || (typeof Sync !== 'undefined' && Sync && Sync.getName && Sync.getName()) || (typeof window !== 'undefined' && window.__SYNC_NAME) || 'unknown';
    var at = Date.now();

    // resolve existing rows first — missing rows are skipped like stampRows always did
    var cells = [];
    (target.rows || []).forEach(function (r) {
      var row = hall.rows[r];
      if (!row) return;
      sides.forEach(function (s) {
        if (row[s]) cells.push({ r: r, side: s, seg: row[s] });
      });
    });

    var alreadyAll = opts.toggle !== false && cells.every(function (cell) {
      return cs.every(function (c) { return cell.seg[c] === brush; });
    });
    var next = alreadyAll ? 'none' : brush;

    var changed = cells.map(function (cell) {
      setSeg(cell.seg, cs, next, by, at);
      return { r: cell.r, side: cell.side, status: next };
    });
    return { changed: changed, brush: brush, cleared: alreadyAll };
  }

  return { apply: apply, cablesIn: cablesIn };
})();
