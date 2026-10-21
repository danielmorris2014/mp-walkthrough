# ADR-0003: BUF103 engineering data is bundled via the build pipeline, not imported in-app

Date: 2026-10-21

## Context
The BUF103 Cutsheet (25 sheets, ~300K rows) and Patch Panel Matrix arrive as
revisioned Excel files (v0.34 today, more revisions coming). The Field Guide
already has a CSV import UI for its own site data. We needed to choose how
BUF103 data reaches phones.

## Decision
Bundle it. The build pipeline (tools/build_buf103.py) converts Daniel's
latest Excel drop into data/buf103.json.gz, precached by the service worker
and shipped with app updates. No in-app import UI for BUF103 data.

## Why
- Daniel receives the revisions himself and already drops files to the
  build laptop; a pipeline hop is zero new friction for him.
- Import UIs are a classic source of field friction (wrong file, wrong
  sheet, silent partial loads) — the exact thing this kit avoids.
- Phones get one guaranteed-consistent dataset per app version; a bad
  revision is fixed by re-running the pipeline, not by debugging a phone.

## Consequences
- Data freshness is bounded by app-release cadence (acceptable: cutsheet
  revisions are engineering events, not nightly).
- The pipeline must assert ingest counts per sheet so a malformed revision
  fails the build instead of shipping partial data.
