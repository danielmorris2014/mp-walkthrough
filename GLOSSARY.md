# Glossary

The domain language of the MP Kit. Implementation details live in AGENTS.md, not here.

## Terms

**Row-Side** — One side of one row in a hall. The atomic unit of walkthrough progress. Identified by row number + side (11 or 13). Example: "row 3, 11-side." Each Row-Side tracks three cables (144F, OCS, CAT6) independently.

**Stamp** — The act of setting a Row-Side's status (Staged, In Progress, Ran, Ran & Hung, Remediation). Every Stamp carries the stamper's Name and a timestamp. Stamps are the events that sync between phones. Tapping a target that already fully holds the active brush status clears it across row taps, per-cable taps, row-number taps, and pod buttons alike.

**Shift Report** — The nightly status dispatch sent to ServicePoint leadership via Outlook. Under `WORK PERFORMED`, every Midpoint (`MP | <Hall>`) section is derived strictly from the Hall's current Row-Side Stamps (or changes since Baseline), while ServicePoint (`SP`) work, **Blockers**, and **Areas of Concern** capture crew and site-level commentary.
_Avoid_: Hall Notes, manual MP summary

**Walk View** — The walk screen's live view of a Hall, combining the row-by-row stamping grid, progress strip, and live `MP | <Hall>` report preview so the crew sees the exact report bullets change as they tap rows.

**Status** — Where a cable is in its lifecycle: Not Started → Staged → In Progress → Ran → Ran & Hung. Remediation is a parallel status, not part of the forward progression.

**Site Code** — A short code (like `MP-7XK2Q`) that connects a phone to a shared site's data. Typed once. No account, no login, no session. The code IS the credential. Resetting the code revokes everyone and starts a new shared space.

**Name** — The one-word identity typed when joining a shared site (e.g., "Chris"). Tags every Stamp so sync can attribute changes. Not a login — just a label stored on the phone.

**Sync** — The automatic push/pull of shared data between phones via a cloud store. Fires on app open, on signal return, and on every Stamp. Invisible to the user except for the Sync Status indicator.

**Sync Status** — The one-line indicator on the Home card: "Synced [time]" (green), "Sync pending — N changes" (amber), or "Standalone" (gray, no Site Code entered).

**Conflict** — When two phones Stamp the same Row-Side differently while offline. Stamps on different rows or different cables merge concurrently without loss; when two phones edit the exact same cable on the same Row-Side, the latest timestamp wins. The overwritten Stamp stays in history.

**Baseline** — A snapshot of all Row-Side statuses saved at end of night. Used for the last-night comparison on the Home card and for changes-only reports. Not a projection — purely backward-looking.

**Last-Night Comparison** — The Home card line showing tonight's progress vs. last night's baseline. Factual, no forward projection. Example: "Tonight: 14 hung · Last: 11 · ↑3"

**Hall** — A physical data hall (e.g., CB5 DH1). Contains Rows, grouped into Pods. Halls are shared across all phones in a Site.

**Pod** — A group of 8 rows within a hall (e.g., POD 1 = rows 3–10). Used for bulk operations and pace discussion.

**Site** — The physical location (e.g., BUF102). The top-level shared unit. One Site Code connects all phones to the same Site's data.

**Walkthrough** — The act of walking the halls and stamping Row-Sides. The primary workflow.

**End of Night** — The wrap-up flow: archive the report, save the Baseline, offer Copy + Backup. Closes the shift.

**Barcode Directory** — The 29,335-barcode + 193K-preset dataset inside the Cable Field Guide. Searchable by barcode number, rack, device, or port. Not a separate app — it lives in the Field Guide's search.

**Cable Field Guide** — The second tool in the MP Kit. Contains the sitepack model (racks, routes, walk mode, clean-fiber steps), the Barcode Directory, and the scanner. Opens from the Home launcher.

**CB** — Conversational Building — the physical building number. CB1, CB2, CB3, CB4, CB5. Each CB contains four data halls (DH1–DH4). The crew says "CB3 DH2" in the field; the cutsheet prefix is BUF103. Same thing, two names: BUF103 = CB3, BUF102 = the CB4/CB5 area.

**BUF103** — The next data hall build after BUF102. Its engineering data (Cutsheet, Patch Panel Matrix) exists before barcodes are assigned; the kit's BUF103 tools work from that pre-build data.

**Cutsheet** — The master engineering source listing every cable in a build: A end, Z end, ports, and cable spec, organized into families (TPU<>OCS, TOR<>DCN-SPN, BMS, copper, management...). One row = one planned connection.

**Patch Panel Matrix** — The per-rack panel layout: which FPP/CPP panels sit at which RU, their rear trunks with far-end peers, and front device ports. The kit derives a rack view from Cutsheet data; the matrix is the authoritative source.

**Field Reference** — The offline in-kit copy of the Reference Guide: standards, cable paths, trunk landing sheets, part numbers. For looking things up on the job, not for tracking progress.

**Wrong Label** — A cable whose printed flag disagrees with the database. Logged from the Field Guide; open items ride the nightly report and now warn at scan time.

**Physical Channel** — The ordered end-to-end sequence of physical stages a Cutsheet connection traverses from A-end device to Z-end device, including intermediate patch panels, AIO/EOR racks, trunks, DCN-PP panels, and breakout harnesses.

**Rack Role** — The functional identity of a rack or patch point in a hall's topology: Compute / TPU Rack, Rack Patch Panel, All-In-One EOR Rack (Spot 11/13), AIO Patch Panel, SPOCS Optical Switch Rack (Spot 12), DCN Patch Panel, Network Row Patch Panel, or Spine / Core Switch.
