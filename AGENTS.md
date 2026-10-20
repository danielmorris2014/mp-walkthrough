# MP Kit — agent notes

Offline-first iPhone PWA for Midpoint/ServicePoint night-shift data hauls.
Single-file vanilla JS/CSS, zero dependencies, no build step. Push to `main`
ships it live via GitHub Pages (CDN lag up to ~2 min).

## Map

- `index.html` — the whole Kit: Home launcher, Walkthrough & Report, Data Haul Directory (search + barcode scan).
- `guide.html` — Cable Field Guide (foreign app). Regenerate with `tools/integrate_guide.py` after editing that script — never hand-edit guide.html.
- `data/directory.json.gz` — 28k barcodes + 192k presets, decoded in-browser (DecompressionStream, iOS 16.4+). Rebuild with `tools/build_directory_full.py` from the Downloads exports.
- `sw.js` — precache list. `vendor/` — Leaflet + shared zxing-wasm engine (both apps use it).
- `retro/` — session retros. `tools/` — all pipelines and gates.

## Invariants — break one, break the field app

- Every edit to `index.html` or `guide.html` bumps `APP_VERSION` and `CACHE_VERSION` **together**; stale service-worker caches otherwise serve old code for days.
- Focusable inputs are `font-size >= 16px` everywhere, both apps. iOS zooms the whole page on focusing anything smaller (the "double scroll" bug).
- No network at runtime, no CDNs, no dependencies. Everything works in the data halls with zero signal.
- Report-engine changes must pass `tools/test_report.py` (Playwright diff vs Daniel's real report format).
- UI changes get a rendered screenshot (`tools/shoot.py`, headless Edge) before shipping — static checks miss rendering bugs (v17 shipped a theme that never rendered).
- The guide's cloud features (login/pairing/time clock) are dead by design — Claude's servers. Degrade silently, don't restore.

## Checks

- `python tools/gate.py` — one command, self-contained: static verify + report diff test (`--shots` adds every screenshot). Run it before shipping.
- `tools/verify.py` — esprima syntax + onclick-handler/id cross-checks. Runs in CI (`.github/workflows/ci.yml`, with a credential scan) and pre-commit.
- Hooks: `git config core.hooksPath scripts/hooks` (once per clone).
- Local Playwright gates need `pip install playwright` and Edge (`channel='msedge'`).

## Deploy

Push to `main`. Phone update: open once with signal, close fully, reopen, tap **Update now** on the yellow banner.
