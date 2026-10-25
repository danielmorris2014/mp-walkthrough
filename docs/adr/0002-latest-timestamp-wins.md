# ADR-0002: Conflict Resolution — Latest Timestamp Wins

## Status

Updated (2026-10-24 — refined to Field-Level Yjs CRDT + Per-Cable Timestamp & Tombstone LWW)

## Context

Two supers walk the same hall on the same night, both offline.
- Case A (different rows or different cables): Phone A stamps Row 17 Side 11 `144F`, while Phone B stamps Row 22 Side 13 `OCS`.
- Case B (same cable on the same Row-Side): Both stamp Row 3 Side 11 `144F` — one says "Ran and Hung" at 8 PM, the other says "Ran" at 10 PM, or clears a mistaken stamp.

## Decision

**Merge at the individual cable field level (`hall → row → side → cable`) using Yjs CRDT state containers combined with per-cable UTC timestamps (`seg._st[cable].at`) and clear tombstones (`_meta._cleared`).**

- Concurrent stamps on different halls, rows, sides, or cables both survive automatically with zero data loss.
- When two phones edit the exact same cable on the same Row-Side, the latest UTC timestamp (stamp `at` vs. clear tombstone timestamp) wins automatically. No prompts, no midnight decisions.
- Shared collections (`blockers`, `crewPool`, `meta`, `history`, `baseline`) resolve via section-level `_meta.<key>_at` timestamps, while `hall.notes` merges via order-preserving set union.

## Rationale

- The person who walked the row LATER saw its CURRENT state. A later stamp is almost always more accurate — it reflects reality closer to sync time.
- Manual resolution at midnight (when users are tired and leaving) is the worst possible UX.
- First-stamper-holds is wrong when the first stamp was a mistake that the second person corrected.
- This is the same rule every shared-document app (Google Docs, Apple Notes, Notion) uses for concurrent offline edits.

## Consequences

- If the later stamp was wrong, the earlier (correct) one is lost from the merged state. It remains in the stamp history and can be re-stamped.
- Stamps must carry timestamps comparable across phones (UTC milliseconds, set at stamp time, not at sync time).
- Name + timestamp on every stamp gives an audit trail without requiring user action.
