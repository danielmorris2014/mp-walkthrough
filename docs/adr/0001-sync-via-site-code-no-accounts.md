# ADR-0001: Sync via Site Code, No Accounts

## Status

Updated (2026-10-24 — documents Site Code over GitHub Contents transport)

## Context

The MP Kit needs to sync row statuses, blockers, crew, and report history between multiple superintendents' phones. Users work in data halls with zero signal and get signal only in parking lots or break rooms. Users are non-developers (night-shift superintendents). Scale: 2–5 trusted people on the same site.

Three approaches were considered:

1. **Account-based sync** — traditional login/logout with a user database
2. **External cloud database / custom server** — separate backend service to deploy and maintain
3. **Site-code sync (`MP-...`) backed by a single versioned file in the GitHub repository** — zero external infrastructure, where the Site Code IS the credential

## Decision

**Site-code sync (`MP-...`) backed by the GitHub Contents endpoint (`sync/state.json`), behind a pluggable transport seam. No accounts, no logins, no sessions.**

- The Site Code (`MP-<base64>`) encapsulates the repository credential so superintendents never see or manage raw tokens or accounts
- Others type the Site Code once on first open and enter their one-word Name (identity, not auth)
- Sync fires automatically: on app open, on signal return, every 8 seconds while visible, and debounced on every Stamp
- If someone leaves or a code needs rotation: rotate the underlying credential and issue a new `MP-...` Site Code

Accounts were rejected because: sessions expire (the "kicked out while working" problem), password resets require email/internet, iOS PWAs handle auth redirects poorly, and the field context demands zero-friction offline access. Separate cloud servers were rejected to keep the deployment 100% static on GitHub Pages with zero external hosting dependencies.

## Consequences

- No individual revocation — one code for everyone. Acceptable at 2–5 trusted people. Upgrade path: per-person codes if the site scales past 10.
- No audit trail of WHO changed WHAT unless names are attached to stamps (they are — every stamp carries the stamper's name + timestamp).
- The sync service is a single point of failure. If it goes down, the app works standalone (offline-first is unaffected); sync resumes when it's back.
- The site code is a shared secret — anyone who has it can read/write. Security through unguessability, like a group chat invite link.
