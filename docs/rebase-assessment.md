# Rebase assessment — should MP Kit move to a framework?

**Date:** 2026-10-20 · **Verdict: No rebase. Keep vanilla + deepen the gate system.**

## Why this came up

Recurring UI bugs (v33 shadowed variable, v35.2 stray `</div>`, v35.5 padding gap) —
each one shipped to a phone that gets used nightly. The question: would React/Preact/Svelte
or a PWA starter template have prevented these?

## What a rebase would actually cost

1. **A build step becomes mandatory.** Frameworks load from CDNs or npm bundles — CDNs are
   banned (zero signal in the halls), so every change needs `npm run build` → commit `dist/`.
   Today's loop (edit → `gate.py` → push) becomes edit → install → build → verify dist → push.
2. **guide.html doesn't port.** It's 2.6MB of generated output from `tools/integrate_guide.py`
   (5 patch layers). A framework rebase means rebuilding that pipeline against the new stack.
3. **The report engine is diff-tested verbatim** against Daniel's real reports. Any rebase
   risks the one thing that can't regress.
4. **Weeks of rework for zero field-visible improvement.** The kit is live and used nightly.
5. Service-worker precache moves from 7 named files to hashed assets — a new class of
   stale-cache bugs, on the platform (iOS) that already punishes SW mistakes.

## Would it have prevented the actual bugs?

| Bug | Framework would have caught it? | What actually catches it now |
|---|---|---|
| v33 shadowed `var m` | Probably (build-time lint) | `verify.py` + ES5 `var` discipline |
| v35.2 stray `</div>` | No — JSX wouldn't allow it, but the bug was in this codebase | probe 1 (nav chrome) fails when the stack breaks |
| v35.5 padding gap | No — CSS layout is CSS in any stack | **probe 5 (layout gate)** — fails on padding < chrome height |
| report format drift | No | `test_report.py` verbatim diff |
| merge conflicts | Partially (file separation) | AGENTS.md protocol; extract-modules pattern below |

The bug history is DOM/CSS **coordination** bugs. Those live in the rendered output, and
rendered-output probes catch them at the level that matters — regardless of what generates
the DOM. TypeScript would have caught one bug out of five.

## The standardization that IS happening (instead of a rebase)

- **Probes over types:** the gate drives a real browser through every screen and asserts
  on computed layout — nav chrome per registry (P1), 16px font floor (P2), clipboard
  round-trip (P3), hash routing (P4), padding-clears-chrome (P5, new in v36).
- **Measured chrome, not hand-bumped pixels:** `applyChromeHeight()` → `--chrome-h`.
  Layout constants can't drift because they aren't constants.
- **Deep modules where tests pay:** `report-engine.js`, `sync-engine.js` are already
  extracted pure modules. Continue this pattern when a section of `index.html` grows
  test surface (candidates: hall editor, blockers panel).

## If merge conflicts keep hurting (the one real rebase trigger)

Split `index.html`'s script into sibling ES modules (`walk.js`, `crew.js`, `report-ui.js`)
loaded in order — no bundler needed, just `<script src>` tags + SW precache entries.
Do this only if the two-agent conflict rate stays high after the AGENTS.md protocol;
it trades merge pain for cache-invalidation surface.

## References

- [Vanilla-JS PWA, fully offline, no backend](https://www.reddit.com/r/PWA/comments/1uo5p50/vanillajs_pwa_fully_offline_no_backend)
- [Resilient PWA with Vanilla JavaScript — no bundlers, no frameworks](https://medium.com/illumination/modern-pwa-magic-how-i-built-a-resilient-progressive-web-app-with-vanilla-javascript-d2684f1c38f2)
- [Build a SPA with Vanilla.js](https://blog.jeremylikness.com/blog/build-a-spa-site-with-vanillajs)
- [How to Build a PWA in Vanilla JS](https://www.loginradius.com/blog/engineering/build-pwa-using-vanilla-javascript)
