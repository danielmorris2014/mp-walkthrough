# Coding Standards — MP Kit

This document defines the coding standards for `walkthrough-app/` and serves as the baseline for `/code-review` (Standards axis).

## 1. JavaScript Dialect & Browser Compatibility

- **ES5 syntax in all gate-checked scripts**: `index.html`, `walk-state.js`, `kit-data.js`, `report-engine.js`, `stamp-engine.js`, `sync-engine.js`, `cutsheet-engine.js`, and `tools/cutsheet-parser.js` are parsed by `esprima.parseScript()` in `tools/verify.py`. Use `var` and `function (...) {}` (no `const`/`let`, arrow functions, template literals, or optional chaining in those files).
- **Offline-first, zero runtime CDN dependencies**: Every script, stylesheet, icon, font fallback, and WASM asset must work offline inside data halls with zero signal.

## 2. Deep Module Boundaries (`codebase-design`)

- **`WalkState` (`walk-state.js`)**: Single owner of Walkthrough state shape, `CORE_SHAPE`, `STATE_VERSION` migrations, legacy seed-data scrubbing, undo snapshots, `Baseline` snapshots, and backup/restore payloads. Never hand-enumerate `CORE_SHAPE` keys outside `WalkState`.
- **`ReportEngine` (`report-engine.js`)**: Pure, headless-testable report builder and formatter (`buildReport`, `formalHallLines`, `effectiveHalls`, `buildEmailParts`, `formatPreviewHtml`, `buildEmailHtml`, and `ReportEngine.Side`). Never read or mutate the DOM inside `report-engine.js`.
- **`ReportEngine.Side`**: Single owner of **Row-Side** status rollups (`overall`, `isAll`, `isHung`, `hasProgress`, `hallSummary`, `podSummary`). Do not write ad-hoc `rows × sides × cables` counting loops in HTML pages.
- **`KitData` (`kit-data.js`)**: Single owner of cross-page infrastructure:
  - `KitData.load` / `KitData.retry` for `.json.gz` datasets
  - `KitData.store` for IndexedDB (`localForage`) + `localStorage` persistence
  - `KitData.nav` (`toCutsheet`, `toGuideFind`, `toGuideSection`, `toLabels`, `toWalkRow`, `classifyQuery`, `routeQuery`, `consume`) for all cross-page `sessionStorage` handoffs
  - `KitData.mislabels` (`listAll`, `listOpen`, `forBarcode`, `describeMismatch`, `formatReportLines`) for **Wrong Label** (`spfg.mislabels`) records
  - `KitData.copy` and `KitData.copyRich` for plain-text and rich HTML (`ClipboardItem`) clipboard writes
- **`Stamp` (`stamp-engine.js`)**: Single owner of the tap-again-to-clear stamp rule and `_st[cable] = { by, at }` attribution.
- **`Sync` (`sync-engine.js`)**: Single owner of Yjs CRDT + per-cable UTC timestamp LWW (`ADR-0002`), transport adapter (`ADR-0001`), debounce (`Sync.schedule`), and polling (`Sync.startPolling`).

## 3. Domain Vocabulary & Naming

- Use exact terms from [`GLOSSARY.md`](./GLOSSARY.md) (`Row-Side`, `Cable Family`, `Stamp`, `Brush`, `Scope`, `POD`, `Baseline`, `Site Code`, `Cutsheet`, `Wrong Label`).
- **No numbered function names** (`formalHallLines`, `mixedDesc` — never `formalHallLines2` or `foo2`).
- **Derived MP | Hall sections (`ADR-0004`)**: Never reintroduce free-text per-hall notes (`hall.notes` or `#noteInput`). All `MP | <Hall>` report bullets derive strictly from `hall.rows` stamps.

## 4. Mobile & Chrome Invariants

- **Focusable inputs**: `font-size >= 16px` everywhere so iOS Safari never auto-zooms on focus.
- **Zero horizontal scroll**: `scrollWidth <= clientWidth` at `390×844` across all pages and tabs.
- **Unique static HTML IDs**: Every static `id="..."` in an HTML document must be unique (`tools/verify.py` enforces this).
- **Bottom chrome**: All bottom-fixed bars live inside `.bottom-stack`; derive page padding from `--chrome-h` via `applyChromeHeight()`.
- **Version lockstep**: Every change to app code bumps `APP_VERSION` in `index.html`, the version label in `#settingsSheet`, and `CACHE_VERSION` in `sw.js` in the same commit.
