# Crew checkpoints integration

The new MP Kit launcher opens an English/Spanish crew tool with six checkpoints: plan, length, pull, dress, label, handoff. Crews review short instructions, put the phone away for the work, then record one checkpoint. A printable task card supports work without keeping the screen open.

## Included

- CB4 and CB5, DH1–DH4 selectable workspaces. CB4 spine destination DH4; CB5 DH1. This does not create new assigned cable IDs or ports.
- One cable, rack group, or row per task; 144F, 192F, OCS, CAT6 and management-specific checks.
- Measured route plus approved slack and both-end allowances compared with stock; approved precut schedule alternative.
- Cable-specific pulling specification and force limit required before completing the pull checkpoint. Radius helper compares the project 10× / 20× diameter references with entered manufacturer minimums, choosing the larger value.
- Required OCS spare-storage decision; source examples disagree, so no automatic storage assumption.
- Stop/blocker, resolution, sequential completion, undo, named lead review, printable card and CSV export.
- Task records live in `state.crewTasks` under the existing `mp_walkthrough_v1` key, so the existing full backup/restore includes them. Existing report styles append a crew-checkpoint section.
- Service-worker cache bumped; all new assets precached. No remote runtime dependency.

## Data boundaries

The walkthrough, guide and cable directory remain intact. Checklist completion does not stamp rows as hung, claim patching/test acceptance, or change assigned A/Z data. Training answers are not installation approval. Named review is a local record, not authenticated supervisor authorization. Devices exchange data by backup; this adds no cloud synchronization.

Checklists are new short instructions derived from the supplied project installation material. They do not redistribute the DRS PDF. Reference buttons identify source page numbers and link to the existing guide. Actual part numbers, lengths, approved tray routes and pulling limits remain task inputs.

## Research and next integration priorities

Manufacturer guidance supports checking each cable specification, planning changes in elevation and direction, and protecting against excessive pull, bend and crush forces. Corning SRP 005-011, Issue 17, pp. 1–3:
https://www.corning.com/content/dam/corning/catalog/coc/documents/standard-recommended-procedures/005-011.pdf
This is a duct-installation procedure; its example force ratings are not used as universal data-center assembly limits.

Fluke Networks explains inspecting connector endfaces, cleaning when needed and reinspecting before connection, and matching fiber/copper testing to the actual link and approved test procedure:
https://www.flukenetworks.com/edocs/white-paper-data-center-where-and-what-am-i-testing
Preparation remains separate from connector mating and certification.

Next merge work: reconcile the directory's 28,353 assigned records against the guide's 29,335 records by exact source IDs; compare preset coverage and export provenance before replacing either dataset; then port newer rack/port visualization and adaptive training modules. Counts alone cannot establish which records are absent or duplicates.

## Validation

Node syntax checks and a DOM-based workflow test cover six sequential checkpoints, rejected short stock, required manufacturer fields, bend-radius arithmetic, blocker/resolution, required OCS spare decision, named lead review, persisted task data, hall filtering, Spanish rendering, printable text and import sanitization. Browser visual QA was unavailable in this session.

Run the DOM test with Node and `linkedom` available: `node tools/test-crew.cjs`.
