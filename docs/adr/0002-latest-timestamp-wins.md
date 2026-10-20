# ADR-0002: Conflict Resolution — Latest Timestamp Wins

## Status

Accepted (2026-10-20)

## Context

Two supers walk the same hall on the same night, both offline. Both stamp row 311 — one says "Ran and Hung" at 8 PM, the other says "Ran" at 10 PM (walked later, saw it wasn't hung yet). They sync at midnight. What should happen?

Three approaches:
1. Latest timestamp wins, automatically
2. First stamper holds — later conflicting stamps ignored
3. Show conflicts, ask the user to resolve manually

## Decision

**Latest timestamp wins, automatically. No prompts, no midnight decisions.**

## Rationale

- The person who walked the row LATER saw its CURRENT state. A later stamp is almost always more accurate — it reflects reality closer to sync time.
- Manual resolution at midnight (when users are tired and leaving) is the worst possible UX.
- First-stamper-holds is wrong when the first stamp was a mistake that the second person corrected.
- This is the same rule every shared-document app (Google Docs, Apple Notes, Notion) uses for concurrent offline edits.

## Consequences

- If the later stamp was wrong, the earlier (correct) one is lost from the merged state. It remains in the stamp history and can be re-stamped.
- Stamps must carry timestamps comparable across phones (UTC milliseconds, set at stamp time, not at sync time).
- Name + timestamp on every stamp gives an audit trail without requiring user action.
