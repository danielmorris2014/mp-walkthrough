MP WALKTHROUGH & SHIFT REPORT — INSTALL & USE GUIDE
====================================================

WHAT THIS IS
A one-file web app for the nightly basket walkthrough. Tap statuses onto
each row side (11 side / 13 side) per cable type (144F, OCS, Copper),
then it writes the shift report for you in your own shorthand
(111-113, 301-311, 711-1311 & 713-1313 ...).

It runs 100% OFFLINE. Your data never leaves the phone unless you tap
Backup. No account, no server, no internet needed after install.


----------------------------------------------------
INSTALL ON YOUR IPHONE (one time, needs service/Wi-Fi)
----------------------------------------------------
1. Get the app online. It is hosted at your GitHub Pages URL:
   https://<your-github-user>.github.io/<repo-name>/

2. Open that URL in SAFARI on the phone (must be Safari, not Chrome).

3. Tap the SHARE button (square with an arrow pointing up).

4. Scroll down and tap "Add to Home Screen", then Add.

5. Open it from the new home-screen icon. From now on it works with
   ZERO signal, forever. The icon IS the app - don't delete it
   (deleting it also deletes the saved data unless you have a backup).


----------------------------------------------------
EVERY NIGHT (30 seconds)
----------------------------------------------------
1. Walk the halls. Pick a status (Ran & Hung, Ran, In Progress,
   Staged, Remediation, Clear) and a cable scope (All / 144F / OCS /
   Copper) at the top, then tap:
   - a SIDE card  -> stamps that whole side
   - the AISLE number -> stamps both sides
   - a small pill (144F / OCS / CAT6) -> stamps just that cable
   Made a mistake? Tap UNDO (top right) - keeps the last 60 actions.
2. Crew tab: toggle who is on shift (SP count updates itself).
3. Blockers tab: add dated blockers + concerns + tasks for tomorrow.
4. Report tab: pick a style (My nightly report / Crew table / Boss
   roll-up), tap Copy or Share, send it.
5. Tap "Save to history" if you want it archived in the app.
6. Tap "Backup now" before you go home. Save the file to Files/iCloud.


----------------------------------------------------
BACKUP / RESTORE
----------------------------------------------------
Backup = Report tab -> "Backup now". On the iPhone this opens the
share sheet: choose "Save to Files" (pick a folder, ideally one that
syncs to iCloud). Keep a couple of backups; they are tiny.

Restore = "Restore from file" and pick the backup .json, or paste the
backup text with "Paste restore".

IMPORTANT: do the backup INSIDE the home-screen app (not in Safari) -
the home-screen app has its own separate storage.


----------------------------------------------------
DATA LOSS - WHAT TO AVOID
----------------------------------------------------
- Don't delete the home-screen icon without a fresh backup.
- Settings -> Safari -> "Clear History and Website Data" can also wipe
  it. Avoid that, or restore from your backup afterwards.
- A weekly backup covers you against everything else.


----------------------------------------------------
FALLBACK (no internet ever): DOCUMENTS BY READDLE
----------------------------------------------------
If the hosted app is ever unavailable, this same folder works as a
local file:
1. Install the free "Documents by Readdle" app from the App Store.
2. Copy index.html (and the icons folder) into Documents/Files.
3. Open index.html from inside Documents' browser.
JavaScript runs there and the app works offline. Its storage lives
inside the Documents app though - treat backups as mandatory on this
route. Do NOT use the iPhone Files-app preview (tap-to-preview):
Apple's preview strips JavaScript, so the app looks dead there. That
is normal - it is why the hosted home-screen app is the primary way.


----------------------------------------------------
EDITING HALLS / ROWS
----------------------------------------------------
Walkthrough tab -> "Edit hall":
- rename a hall, set its max row number (e.g. 36 for CB4 DH2)
- rename groups (pods / network rows / HAC areas) and their row ranges
- add/remove groups, clear statuses, delete a hall
Everything pre-loaded matches the Large Site Cable Installation Guide
(rows 1-2 network, pods of 8 rows each, EOR at spot 11 and 13, middle
SPOCS aisle not tracked).


----------------------------------------------------
HOSTING NOTES (GitHub Pages)
----------------------------------------------------
The repo needs exactly these files at its root (or keep the folder
structure and point Pages at it):
  index.html, sw.js, manifest.webmanifest, icons/ (3 PNGs)
Settings -> Pages -> Deploy from branch -> main -> / (root).
The URL is final: https://<user>.github.io/<repo>/
After updating the app files, bump CACHE_VERSION in sw.js so phones
refresh on next open with signal.
