# ADR-0003: BUF103 engineering data is bundled by default and field-updatable via one shared CutsheetParser module

Date: 2026-10-24 (supersedes 2026-10-21)

## Context
The BUF103 Cutsheet (20+ sheets, ~321K rows) arrives as revisioned Excel files (v0.34 today, more revisions coming). Phones need a fast, zero-setup default dataset offline in the halls, and superintendents also need a way to drop a newer `.xlsx` revision directly onto a phone without waiting for a laptop build.

## Decision
**Single-source the parser in `tools/cutsheet-parser.js` (`CutsheetParser`), driven by two adapters:**
1. **Build-time CLI adapter (`tools/build_buf103.py`)**: Runs `CutsheetParser` over the latest Excel workbook to produce the bundled `data/buf103.json.gz` and `data/halls-buf103.json` shipped with the app.
2. **On-device Web Worker adapter (`buf103.html` + SheetJS)**: Runs the exact same `CutsheetParser` module in-browser when a user selects an `.xlsx` via `Update .xlsx`, storing the override in IndexedDB (`mp_buf103_cutsheet`, `mp_buf103_halls`) with a 1-tap `Reset` back to the bundled dataset.

## Why
- One implementation of the 26 column aliases, multi-hop Physical Channel extraction, string dictionary interning, and 250K-row validation guards eliminates drift between Python and JavaScript.
- Phones work out of the box from the bundled `data/buf103.json.gz` precache, while field updates work offline on any phone without a laptop.

## Consequences
- `tools/cutsheet-parser.js` is the single owner of Cutsheet ingestion rules.
- Both build-time and on-device paths enforce the `>= 250,000` total row guard so a malformed workbook is rejected before overwriting data.
