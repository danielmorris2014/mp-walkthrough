# ADR-0001: Sync via Site Code, No Accounts

## Status

Accepted (2026-10-20)

## Context

The MP Kit needs to sync row statuses, blockers, crew, and report history between multiple superintendents' phones. Users work in data halls with zero signal and get signal only in parking lots or break rooms. Users are non-developers (night-shift superintendents). Scale: 2–5 trusted people on the same site.

Three approaches were considered:

1. **GitHub-based sync** — store shared state in the repo, auth via GitHub tokens hidden inside "site codes"
2. **Account-based sync** — traditional login/logout with a user database
3. **Site-code sync via a tiny cloud store** — a simple key-value service where the code IS the credential

## Decision

**Site-code sync via a tiny cloud store. No accounts, no logins, no sessions.**

- A 30-line cloud function (free tier) stores and serves one JSON blob per site code
- The site creator presses "Create shared site" → gets a code like `MP-7XK2Q` → texts it to others
- Others type the code once on first open. The app asks for their name (identity, not auth). Done.
- Sync fires automatically: on app open, on signal return, on every stamp
- If someone leaves: reset the code (old one dies, new one shared with who stays)

GitHub tokens were rejected because: they put the site owner's infrastructure into every user's hands, token management is friction for non-developers, and revocation requires GitHub knowledge.

Accounts were rejected because: sessions expire (the "kicked out while working" problem), password resets require email/internet, iOS PWAs handle auth redirects poorly, and the field context demands zero-friction offline access.

## Consequences

- No individual revocation — one code for everyone. Acceptable at 2–5 trusted people. Upgrade path: per-person codes if the site scales past 10.
- No audit trail of WHO changed WHAT unless names are attached to stamps (they are — every stamp carries the stamper's name + timestamp).
- The sync service is a single point of failure. If it goes down, the app works standalone (offline-first is unaffected); sync resumes when it's back.
- The site code is a shared secret — anyone who has it can read/write. Security through unguessability, like a group chat invite link.
