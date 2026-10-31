# ADR-0004: Shift Report MP hall progress is strictly derived from Row-Side Stamps

Date: 2026-10-31

## Context
Previously, `MP | <Hall>` sections in the Shift Report mixed auto-computed Row-Side progress bullets with a separate free-text `hall.notes` array (which lived on the Blockers tab, out of sight while walking other halls), and `defaultState()` shipped with pre-seeded demo stamps and a hardcoded `CB4 DH2` note (`"HAC 17, Rows 33–36 – Staged (8 hrs per person)."`). In addition, partially-stamped rows appended `; <cable> not started` for untouched cables.

## Decision
1. **Single source of truth for `MP | <Hall>`**: Every `MP | <Hall>` block in `ReportEngine` is derived 100% from the Hall's **Row-Side** Stamps (`hall.rows`). Free-text hall notes (`hall.notes`, `#noteInput`) are removed.
2. **If it isn't stamped, it isn't reported**:
   - Halls with zero stamped rows are omitted from `WORK PERFORMED` (if no hall has any stamped rows yet, `MP` outputs `• No rows stamped yet`).
   - Rows with all cables `none` are omitted.
   - Partially-stamped rows list only the stamped cables (e.g., `• 1711: OCS and CAT6 staged`), omitting `; <cable> not started`.
3. **Clean initial state**: `defaultState()` starts with all rows `none` (`Not Started`) and empty `spWorkNotes` / `tasksTomorrow`, with `STATE_VERSION = 4` migrating existing phones cleanly.
4. **Live Walk View feedback**: The Walkthrough screen renders a live `MP | <Hall>` report preview bar directly below the hall progress strip so the crew sees the exact report bullets update on every tap.

## Consequences
- A hall's report section can never drift from its Walkthrough grid or include hidden notes from an inactive hall.
- Site-wide issues belong in **Blockers** or **Areas of Concern**, and ServicePoint activities belong in **SP Work Notes**.
