# Glossary

The domain language of the MP Kit. Implementation details live in AGENTS.md, not here.

## Terms

**Row-Side** — One side of one row in a hall. The atomic unit of walkthrough progress. Identified by row number + side (11 or 13). Example: "row 3, 11-side." Each Row-Side tracks three cables (144F, OCS, CAT6) independently.

**Stamp** — The act of setting a Row-Side's status (Staged, In Progress, Ran, Ran & Hung, Remediation). Every Stamp carries the stamper's Name and a timestamp. Stamps are the events that sync between phones. One rule everywhere (v41): tapping a target that already fully holds the brush status clears it — row taps, per-cable taps, row-number taps and pod buttons all behave the same. Implemented in `stamp-engine.js` (`Stamp.apply`); attribution is stored per cable in `seg._st` as `{by, at}`.

**Walk View** — The walk screen's rendering seam (`WalkView` in index.html). A Stamp patches only the side-cards it touched (`WalkView.update`); hall switches, undo and sync pulls rebuild the whole screen (`renderWalk`). The two paths share the derived-stats code so they can never disagree.

**Status** — Where a cable is in its lifecycle: Not Started → Staged → In Progress → Ran → Ran & Hung. Remediation is a parallel status, not part of the forward progression.

**Site Code** — A short code (like `MP-7XK2Q`) that connects a phone to a shared site's data. Typed once. No account, no login, no session. The code IS the credential. Resetting the code revokes everyone and starts a new shared space.

**Name** — The one-word identity typed when joining a shared site (e.g., "Chris"). Tags every Stamp so sync can attribute changes. Not a login — just a label stored on the phone.

**Sync** — The automatic push/pull of shared data between phones via a cloud store. Fires on app open, on signal return, and on every Stamp. Invisible to the user except for the Sync Status indicator.

**Sync Status** — The one-line indicator on the Home card: "Synced [time]" (green), "Sync pending — N changes" (amber), or "Standalone" (gray, no Site Code entered).

**Conflict** — When two phones Stamp the same Row-Side differently while offline. Resolved automatically: the latest timestamp wins. The overwritten Stamp stays in history.

**Baseline** — A snapshot of all Row-Side statuses saved at end of night. Used for the last-night comparison on the Home card and for changes-only reports. Not a projection — purely backward-looking.

**Last-Night Comparison** — The Home card line showing tonight's progress vs. last night's baseline. Factual, no forward projection. Example: "Tonight: 14 hung · Last: 11 · ↑3"

**Hall** — A physical data hall (e.g., CB5 DH1). Contains Rows, grouped into Pods. Halls are shared across all phones in a Site.

**Pod** — A group of 8 rows within a hall (e.g., POD 1 = rows 3–10). Used for bulk operations and pace discussion.

**Site** — The physical location (e.g., BUF102). The top-level shared unit. One Site Code connects all phones to the same Site's data.

**Walkthrough** — The act of walking the halls and stamping Row-Sides. The primary workflow.

**End of Night** — The wrap-up flow: archive the report, save the Baseline, offer Copy + Backup. Closes the shift.

**Barcode Directory** — The 29,335-barcode + 193K-preset dataset inside the Cable Field Guide. Searchable by barcode number, rack, device, or port. Not a separate app — it lives in the Field Guide's search.

**Cable Field Guide** — The second tool in the MP Kit. Contains the sitepack model (racks, routes, walk mode, clean-fiber steps), the Barcode Directory, and the scanner. Opens from the Home launcher.
