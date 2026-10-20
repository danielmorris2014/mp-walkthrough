# Bug fixes 1-6 from the design audit + structural prep for changes 1-5
import re

raw = open("index.html", encoding="utf-8").read()

# ============ BUG 1: Two different "% ran & hung" ============
# hallPctHung counts hung cables / all cables; the ring counts sides-fully-hung / all sides
# Fix: use the ring's definition (sides fully hung) everywhere
old = """function hallPctHung(hall) {
  var tot = 0, hung = 0;
  if (!hall) return 0;
  Object.keys(hall.rows).forEach(function (r) {
    ['11', '13'].forEach(function (sd) {
      CABLES.forEach(function (c) {
        tot++;
        if (hall.rows[r][sd] && hall.rows[r][sd][c] === 'hung') hung++;
      });
    });
  });
  return tot ? Math.round(100 * hung / tot) : 0;
}"""
new = """function hallPctHung(hall) {
  var tot = 0, hung = 0;
  if (!hall) return 0;
  Object.keys(hall.rows).forEach(function (r) {
    ['11', '13'].forEach(function (sd) {
      tot++;
      if (sideOverall(hall.rows[r][sd], null) === 'hung') hung++;
    });
  });
  return tot ? Math.round(100 * hung / tot) : 0;
}"""
assert old in raw, "bug1"
raw = raw.replace(old, new, 1)

# ============ BUG 2: Report dated by oldest blocker ============
# Fix: use shift start date (today unless between midnight and 2AM, then yesterday)
old = """function reportDateStr() {
  if (state.blockers.length && state.blockers[0].date) return state.blockers[0].date;
  var d = new Date();
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}"""
new = """function reportDateStr() {
  var d = new Date();
  // 2PM-2AM shift: before 2AM, the shift started yesterday
  if (d.getHours() < 2) d = new Date(d.getTime() - 86400000);
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}"""
assert old in raw, "bug2"
raw = raw.replace(old, new, 1)

# ============ BUG 3: Backup recorded before it happens ============
# Fix: only set lastBackup on success (in the share promise resolution)
# Find doBackup and move lastBackup setting into the success path
# First find the function
m = re.search(r"function doBackup\(\) \{[\s\S]*?\n\}", raw)
if m:
    body = m.group(0)
    # Remove any lastBackup assignment from the synchronous path
    body2 = body.replace("state.settings.lastBackup = Date.now();", "", 1)
    # Add it in the share success path
    if "navigator.share" in body2:
        body2 = body2.replace(
            "navigator.share(shareData).then(function () {",
            "navigator.share(shareData).then(function () {\n        state.settings.lastBackup = Date.now(); saveState(); renderBackupStatus();", 1)
        # Also in the clipboard fallback success
        body2 = body2.replace(
            "showToast('Backup copied to clipboard')",
            "showToast('Backup copied to clipboard'); state.settings.lastBackup = Date.now(); saveState(); renderBackupStatus();", 1)
    raw = raw.replace(body, body2, 1)

# ============ BUG 4: Status counts don't add up ============
# Fix: add mixed and empty to the stat bar, use 6-column grid
old_stat = ".stat-bar { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom: 7px; }"
new_stat = ".stat-bar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 7px; }"
if old_stat in raw:
    raw = raw.replace(old_stat, new_stat, 1)

# ============ BUG 5: Tab bar empty fifth column ============
# Already 4 tabs but CSS might still be 5 columns
raw = raw.replace("display: grid; grid-template-columns: repeat(5, 1fr);", "display: grid; grid-template-columns: repeat(4, 1fr);")

# ============ BUG 6: Header text wraps to two lines ============
# Fix: truncate with nowrap + ellipsis on the title, reduce undo button text
old_title = ".app-title { font-weight: 800; font-size: 15px; color: var(--slate-12); letter-spacing: -0.2px; }"
new_title = ".app-title { font-weight: 800; font-size: 15px; color: var(--slate-12); letter-spacing: -0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }"
if old_title in raw:
    raw = raw.replace(old_title, new_title, 1)

open("index.html", "w", encoding="utf-8", newline="").write(raw)
print("bugs 1-6 fixed")
