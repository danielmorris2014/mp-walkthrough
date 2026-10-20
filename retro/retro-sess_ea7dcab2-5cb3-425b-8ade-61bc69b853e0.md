# Retro — MP Kit buildout arc (sess_ea7dcab2)

## Context

- **Session**: single continuous conversation, Oct 18–20, 2026 (context compacted twice; earlier work reconstructed from a handoff summary).
- **People**: Daniel Morris (product owner — requirements, data drops, field feedback, go/no-go calls); ZCode agent (all code, research, verification). Research subagents contributed two sourced reports (multi-module PWA navigation; barcode-scanner upgrades).
- **Product**: "MP Kit" — an offline-first iPhone PWA for Midpoint/ServicePoint night-shift data-haul superintendents. Public at `danielmorris2014.github.io/mp-walkthrough`.
- **Contract for this retro** (agreed with Daniel): cover the whole v1→v21 arc; goals = process lessons, technical health, where things stand, plus an honest design/spacing check including a live field bug (accidental zoom → "double scroll").

## Timeline

| Date | Ship | What |
|---|---|---|
| 10/19 00:41 | v1–v5 | Walkthrough + report PWA, offline SW, GitHub Pages, PDF-extracted hall layout, report shorthand engine diffed against real 10/17 report |
| 10/19 02–09h | v6–v8 | Dock redesign, Radix/OpenProps design tokens, horizontal-overflow fix |
| 10/9 09:34–10:18 | v9–v13 | Self-applying updates, persistent update banner, "Graphite Pro" retheme, simplification pass |
| 10/19 17:10 | v14 | Rhythm & safety package (end-of-night flow, backup nag, wake lock, text size…) |
| 10/19 23:17–23:57 | v15–v18 | Home launcher + hash routing; Cable Field Guide merged as tool #2 (guide.html); Graphite Pro retheme of guide; screenshot-audit fixes (light-mode override bug, dead back button, white accent identity) |
| 10/20 00:12 | v19 | Data Haul Directory module from pasted Service Field Guide exports (424 rows — truncated paste) |
| 10/20 01:43 | v20 | Full dataset (28,353 barcodes + 192,423 presets, 1.5 MB gzip side file), real scan button, zxing-wasm 3.1.6 upgrade in both apps |
| 10/20 01:57 | v21 | Team update bullet format — diff-tested 21/21 lines verbatim against Daniel's target |
| 10/20 (after) | — | Matt Pocock skills (27) installed to user scope |

20 commits, 5 shipped products-in-one (walkthrough, launcher, guide, directory+scanner, report formats).

## What Went Well

1. **Diff-test against reality, not expectations.** The report engine was validated twice (v5 vs his real 10/17 report; v21 vs his typed target — 21/21 exact lines) by reconstructing his actual night inside Playwright and asserting the output. This is why the reports read like he writes. *Repeat forever.*
2. **Research-before-build with receipts.** Every major round ran a sourced GitHub/vendor deep-dive with adopt/skip verdicts (offline patterns, DCIM models, zxing 3.1.6 with its memory-leak fix, iOS API gaps verified before coding around them: no Background Sync, no vibration, no BarcodeDetector). Killed several plausible-but-wrong approaches before they cost code.
3. **The screenshot audit (v18) caught "done" work that wasn't.** The Graphite retheme had literally never rendered on a light-mode phone — CSS specificity meant the override lost silently. Two real bugs (plus the dead back button) surfaced only because we looked at pixels, not code. Playwright + headless Edge became the standard gate after that.
4. **Static harness when the browser died.** `tools/verify.py` (esprima syntax + handler/id cross-checks) kept every ship verifiable during the IAB-browser outage — and later caught a corrupted index.html (unbalanced paren from careless live-editing).
5. **Iterative scope with an installed base.** Daniel used each version in the field and reported back ("it actually worked really well, my only thing is…"), which steered priorities better than any spec.

## What Went Wrong

1. **Shipped UI that had never been rendered (v17).** The guide retheme went out on static checks alone; on light-mode phones it applied nothing. Root cause: confidence from CSS reasoning instead of a screenshot. Cost: one wasted field cycle + Daniel's "I don't really notice a color change."
2. **The back button shipped dead.** Its observer script ran before the target node existed and threw — silently. Same class of miss as above: no runtime verification of the exact feature added.
3. **Paste-truncation misread.** Treated pasted exports as the full dataset; the chat buffer had kept only ~50 KB of 5–17 MB files. Signed off "ingested" on 1.4% of the data. Caught only by Daniel later dropping the real files.
4. **Careless hot-patching.** While debugging the loader, a live string-replace corrupted index.html (unbalanced paren). verify.py caught it, but the process error was doing surgical edits via ad-hoc scripts without re-verifying between steps.
5. **Debugging by theory.** The directory loader failure took four instrumented rounds (stream `.json()`, negative-index loop guard) where the first response should have been "capture the actual error + stack," not re-reading the code. ~30 minutes of avoidable looping.
6. **Public-repo hygiene is luck, not policy.** Deployments used a stored credential from a temp path. Nothing leaked into the repo, but nothing enforced that (e.g., a pre-push scan) either.

## Lessons Learned

- **Never ship a visual change without a rendered screenshot of it** — on the actual page states and both color schemes. This is now cheap (Playwright harness exists).
- **Verify the feature you just added runs** (mount the button, load the data), not just that the file parses.
- **When something fails, instrument first**: log the real exception and stack before hypothesizing.
- **Trust file drops over pastes** for data > ~50 KB; always print record counts and compare against the source's own header count.
- **iOS realities to remember**: input `font-size < 16px` zooms the page on focus; `maximum-scale` is unreliable; fixed-position docks plus a zoomed visual viewport create the "double scroll" feeling; DecompressionStream needs iOS 16.4+; WebAudio beep, not vibration.
- **Operational cadence**: bump CACHE_VERSION every edit; Pages CDN lags up to ~2 min — recheck before declaring a push failed; SW self-reload breaks in-flight tests (settle ~4 s after load).

## Remaining Risks and Questions

1. **LIVE FIELD BUG (Daniel, this retro): accidental pinch zoom → "double scroll" on the page.** Working diagnosis (unverified): iOS Safari auto-zooms when focusing any input with font-size < 16px — the app styles inputs at 14px — and after that the fixed dock/nav and the zoomed viewport fight each other. Candidate fixes: 16px font on all focusable inputs (visual size compensated elsewhere), plus checking `touch-action`/double-tap behavior in the guide app too. Needs a reproduction pass on the phone, then a fix + screenshot verification.
2. **Design/spacing debt (from the audits, still open)**: guide help button floats over content; walk-mode rack drawing wastes space at some zooms; "More tools" dashed card crowds the bottom edge.
3. **Data gap**: parser kept 28,353 of the header's 29,335 barcodes (~982 rows dropped by label-format strictness in the source-A/Z section). Confirm whether those are real records worth recovering or junk rows.
4. **Undecided**: auto-merge identical blockers into one line? Uniform-ran wording toggle ("Ran 144F, OCS, and CAT6" vs "Ran")?
5. **Deferred**: phase-2 native rewrite of guide screens in Kit chrome; multi-user/share-codes direction (parked by Daniel).
6. **Single-device risk**: data lives on one phone; backup nag mitigates but the restore path has never been rehearsal-tested end-to-end on-device.
7. **Credential hygiene**: move deployment auth off the temp path or add a pre-push secret scan to the public repo.

## Terminal State

- LIVE: https://danielmorris2014.github.io/mp-walkthrough — v21 (commit 0e19323), 20 commits, working tree clean.
- Ship: Home launcher → 3 tools (Walkthrough & Report, Cable Field Guide, Data Haul Directory with scan), 4 report styles incl. the diff-tested bullet format, offline via service worker (precache ≈ 5 MB incl. 1.5 MB data + 0.95 MB scanner wasm).
- Tooling: `tools/verify.py` (static gate), `tools/shoot.py` + Playwright/Edge (screenshot gate), `tools/test_report.py` (report diff test), `tools/build_directory_full.py` + `tools/integrate_guide.py` (data/app pipelines).
- Side effects: 27 Matt Pocock skills installed at user scope; project memory updated each round.
- Next session entry point: the zoom bug (#1) — reproduce, fix, screenshot-verify, ship v22.
