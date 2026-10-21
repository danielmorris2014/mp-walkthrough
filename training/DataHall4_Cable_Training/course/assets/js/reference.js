/* Reference content shared by the course (Connection tables, Open items, Sources & coverage, Help)
   and by the printable Reference Guide. All values verified against the Large Site Cable Installation Guide. */
window.COURSE = window.COURSE || {};
(function () {
  var R = {};
  function fig(dg, o, cap) { return '<div data-fig=\'' + JSON.stringify({ dg: dg, o: o || {}, cap: cap || '' }).replace(/'/g, '&#39;') + '\'></div>'; }
  var TIA = ['Blue', 'Orange', 'Green', 'Brown', 'Slate', 'White', 'Red', 'Black', 'Yellow', 'Violet', 'Rose', 'Aqua'];
  var HEX = ['#1E6FD9', '#F08C1B', '#3E9E4F', '#7B4B26', '#7D8996', '#FFFFFF', '#D62839', '#1B1B1B', '#F5D21E', '#7A3FA6', '#F2A6C2', '#59D0D8'];
  function sw(n) { return '<span class="sw" style="--c:' + HEX[(n - 1) % 12] + '"></span>' + TIA[(n - 1) % 12]; }

  // ---- TOR table
  var tor = '<table class="t center"><thead><tr><th>Leg</th><th>Color</th><th>TOR port</th><th>AIO front column</th></tr></thead><tbody>';
  for (var l = 1; l <= 18; l++) {
    var col = 'ABCDEFGHI'[Math.ceil(l / 2) - 1];
    tor += '<tr' + (l > 16 ? ' class="spare"' : '') + '><td>' + l + '</td><td>' + sw(l) + (l > 12 ? ' (2nd round)' : '') + '</td><td><b>' + (l <= 16 ? (2 * l - 1) : 'spare — not plugged') + '</b></td><td>' + col + ' (port ' + l + ')' + '</td></tr>';
  }
  tor += '</tbody></table>';

  // ---- Trunk landing sheet (all 48 AIO racks) — guide p.44-45
  var N = ['R107', 'R114', 'R120', 'R127', 'R207', 'R214', 'R220', 'R227'], Sx = ['R108', 'R115', 'R121', 'R128', 'R208', 'R215', 'R221', 'R228'];
  var pairs = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL'], bms = { 6: 1, 14: 1, 22: 1 };
  var land = '<div class="tscroll"><table class="t small center"><thead><tr><th>AIO rack</th><th>DCN-PP panel</th><th>Lane</th><th>Col A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th></tr></thead><tbody>';
  [11, 13].forEach(function (spot) {
    for (var row = 3; row <= 26; row++) {
      var pp = ((row - 3) % 12) + 1, lane = pairs[Math.floor((pp - 1) / 2)] + ' #' + (pp % 2 === 1 ? 1 : 2);
      var id = 'R' + ('0' + row).slice(-2) + spot;
      land += '<tr><td><b>' + id + '</b>' + (bms[row] ? ' bms' : '') + '</td><td>RU ' + (row <= 14 ? 35 : 39) + '</td><td>AIO-PP' + pp + ' · ' + lane + '</td>' + (spot === 11 ? N : Sx).map(function (r) { return '<td>' + r + '</td>'; }).join('') + '</tr>';
    }
  });
  land += '</tbody></table></div>';

  R.tables =
    '<div class="callout key"><b>The current DRS says how the work must be done; your site\'s cutsheet is the final word on any port.</b> These tables come from the guide (cover Rev D, footers Rev C, 10/8/2026) and the DRS sheets added so far (01.00.00 to 01.00.03.01). They are a study aid, not a substitute for the DRS. If anything here disagrees with the current DRS or your cutsheet, follow the DRS and the cutsheet and tell your lead.</div>' +
    '<section class="lsec"><h2>0. The DRS: Deployment Requirement Sheets (DRS 01.00.00)</h2><ul>' +
    '<li><b>What:</b> Fluidstack\'s technical standards for how installation work must be done. <b>Requirements, not guidelines.</b> Every on-site task has a matching DRS.</li>' +
    '<li><b>Contains:</b> step-by-step requirements, specifications, approved materials, diagrams, and references to ANSI/TIA, BICSI, NEC and NEMA standards.</li>' +
    '<li><b>Approved by</b> Fluidstack ICT leadership. <b>Revisions</b> are announced through the portal: always use the current version and check the revision date on the cover page.</li>' +
    '<li><b>Where:</b> Fluidstack Confluence, <code>fluidstack.atlassian.net</code> → LVC Deployment space → DEPLOYMENT REQUIREMENTS SHEETS. <b>Backup:</b> your Fluidstack PM or site supervisor (they can send the document or restore access).</li>' +
    '<li><b>On site:</b> the applicable DRS must be on hand where you work, printed or on a device. <b>Working from memory alone is not acceptable. No DRS: stop work and get it.</b></li>' +
    '<li><b>Internal Use Only:</b> DRS documents are confidential Fluidstack property. Do not copy, post or share them outside the job.</li>' +
    '<li><b>Sheets in this course so far:</b> 01.00.00 (introduction), 01.00.01 (general cable dressing), 01.00.02 (front of rack cable dressing), 01.00.03 (basket tray cable dressing), 01.00.03.01 (vertical pathways). See the DRS sheets list. <b>DRS Explained</b> (the <code>drs-explained</code> folder: <a href=\'drs-explained/DRS_Explained.html\'>web page</a> and PDF) breaks every sheet down rule by rule, with drawings.</li></ul>' +
    '<table class="t"><thead><tr><th>Document</th><th>Answers</th></tr></thead><tbody><tr><td>DRS (current revision)</td><td>How each task must be done</td></tr><tr><td>Cutsheet</td><td>Where each cable goes: the final word on any port</td></tr><tr><td>Installation guide</td><td>Built from the DRS and the BUF102 matrix v0.97; explains the system</td></tr><tr><td>This course, reference, Field Kit</td><td>Training and checking aids only</td></tr></tbody></table></section>' +
    '<section class="lsec"><h2>1. The five cable paths (guide p.4)</h2>' + fig('overview', {}, 'The five cable paths your crew installs.') +
    '<table class="t"><thead><tr><th>#</th><th>Cable</th><th>From → to</th><th>Lessons</th></tr></thead><tbody>' +
    '<tr><td>1</td><td>144F trunk (1 per TPU rack)</td><td>TPU rack TOR odd ports 1-31 → EOR/AIO MPO panel front (RU 32)</td><td>7, 8</td></tr>' +
    '<tr><td>2</td><td>8 × 192F trunks per AIO + MPO cords</td><td>AIO MPO panel rear → DCN-PP racks (rows 1-2) → DCN spines</td><td>8, 9</td></tr>' +
    '<tr><td>3</td><td>3 × 18F OCS cables per TPU rack</td><td>pp1 ports 1-8 / 9-16 / 17-24 → SPOCS racks 1 / 2 / 3 of the pod</td><td>10, 11</td></tr>' +
    '<tr><td>4</td><td>6 × CAT6 home runs per TPU rack</td><td>TOR ETH + CON, RMU1 and RMU2 GIG E 1 + CON → EOR copper panels RU 24 / 30 / 22</td><td>12</td></tr>' +
    '<tr><td>5</td><td>12F / 24F mgmt trunks + SPOCS mgmt cords</td><td>AIO RU 39 LC panel → management spines R131 / R204; SPOCS mgmt1/mgmt2 → w/BMS EOR</td><td>13, 14</td></tr></tbody></table>' +
    '<p><b>Do not touch:</b> anything inside the TPU rack (machines, trays, DAC and CDFP cables, batteries), or anything past the spines.</p></section>' +

    '<section class="lsec"><h2>2. Hall map facts (guide p.5, 18, 25, 33, 44)</h2>' +
    '<table class="t"><tbody><tr><th>Location code</th><td>SITE-DH4-R0512 = site · hall 4 · row 05 · spot 12. Map shows row+spot: 512. Last two digits = spot.</td></tr>' +
    '<tr><th>Rows</th><td>Network rows 1-2 (west end). Compute rows 3-26. Rows pair across hot aisles; even rows mirrored.</td></tr>' +
    '<tr><th>Spots in every compute row</th><td>02-10: 9 TPU racks (north) · 11: EOR for north · 12: middle aisle (SPOCS in some rows) · 13: EOR for south · 14-22: 9 TPU racks (south). CDU blocks at row ends (not yours).</td></tr>' +
    '<tr><th>Which EOR?</th><td>Spots 2-10 → spot 11 of the same row. Spots 14-22 → spot 13.</td></tr>' +
    '<tr><th>Pods</th><td>144 TPU racks sharing 3 SPOCS racks. Pod 10 rows 3-10 · pod 11 rows 11-18 · pod 12 rows 19-26. 432 TPU racks, 48 AIO racks in the hall.</td></tr>' +
    '<tr><th>SPOCS racks (spot 12)</th><td>Pod 10: 512 red · 612 orange · 712 yellow. Pod 11: 1312 · 1412 · 1512. Pod 12: 2112 · 2212 · 2312.</td></tr>' +
    '<tr><th>EOR w/BMS racks</th><td>611, 613, 1411, 1413, 2211, 2213 (24F management trunks, FB0 BMS switch).</td></tr>' +
    '<tr><th>DCN-PP pairs (N / S)</th><td>A 107/108 · B 114/115 · C 120/121 · D 127/128 · E 207/208 · F 214/215 · G 220/221 · H 227/228.</td></tr>' +
    '<tr><th>Management spines</th><td>R131 and R204.</td></tr></tbody></table>' + fig('networkRows', {}, 'Network rows 1 and 2.') + '</section>' +

    '<section class="lsec"><h2>3. 144F trunk at the TOR (guide p.13) and AIO front (p.36)</h2><p class="formula">TOR port = 2 × leg − 1 &nbsp;·&nbsp; legs 17-18 spare</p>' + tor +
    '<p>AIO front: <b>one TPU rack per row</b> (lowest-numbered rack on row 1 … row 9), legs left to right, legs 17-18 in column I, rows 10-12 and columns J-L open. Label format <code>(column)(port)-(row)</code>: TPU 3 leg 5 = <code>C5-3</code>.</p>' + fig('torSwitch', { legs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] }, 'TOR switch with all 16 legs in the odd ports.') + '</section>' +

    '<section class="lsec"><h2>4. 192F trunks: AIO rear (guide p.37)</h2><ul><li>Facing the rear, column A is on the right. One 192F per column: <b>A = DCN-PP 1 (A) … H = DCN-PP 8 (H)</b>. Column I = TPU spares; J-L open.</li><li>Legs go up: legs 1-2 row 1 … 23-24 row 12. Odd legs on the right port, even on the left (rear view). Legs 19-24 (rows 10-12) spares.</li><li>Front row N meets rear row N: TPU N\'s legs 1-2 → DCN-PP 1 (trunk legs 2N−1, 2N) … legs 15-16 → DCN-PP 8.</li></ul>' + fig('aioRear', { cols: ['A'], allCols: true }, 'AIO MPO panel, rear view.') + '</section>' +

    '<section class="lsec"><h2>5. Trunk Landing Sheet — every AIO rack (guide p.44-45)</h2><p>Spot 11 AIO → N rack; spot 13 → S rack. Rows 3-14 → RU 35 panel; rows 15-26 → RU 39 panel (halls 1-3 land in RU 11-31). Lane = AIO-PP number · column pair · lane 1 or 2.</p>' + land + '</section>' +

    '<section class="lsec"><h2>6. DCN-PP panels and spines (guide p.38-41)</h2><ul><li>DCN-PP rack: 52 RU, eight 4RU panels (12 rows, columns A-L, 2 ports each). 2x2 shuffle modules, <b>P/N 760262482</b> (stop if 760262479 = 4x4).</li><li>Rear: odd legs in the 1st column of the pair, even legs in the 2nd; legs go up; legs 19-24 spares; one lane per trunk; 12 AIO trunks per panel; two different AIO trunks per module.</li><li>Front: each module\'s 4 ports (a1 a2 b3 b4, c5 c6 d7 d8, e9 e10 f11 f12 …) → spines 1, 2, 3, 4 of the group; each row → next line-card port (cutsheet gives it).</li></ul>' +
    '<table class="t center small"><thead><tr><th>DCN-PP</th><th>Racks</th><th>Spines</th></tr></thead><tbody><tr><td>A</td><td>R107 / R108</td><td>1-4</td></tr><tr><td>B</td><td>R114 / R115</td><td>5-8</td></tr><tr><td>C</td><td>R120 / R121</td><td>9-12</td></tr><tr><td>D</td><td>R127 / R128</td><td>13-16</td></tr><tr><td>E</td><td>R207 / R208</td><td>17-20</td></tr><tr><td>F</td><td>R214 / R215</td><td>21-24</td></tr><tr><td>G</td><td>R220 / R221</td><td>25-28</td></tr><tr><td>H</td><td>R227 / R228</td><td>29-32</td></tr></tbody></table></section>' +

    '<section class="lsec"><h2>7. OCS cables (guide p.15, 18-23)</h2>' + fig('ocsPanel', {}, 'OCS panel pp1.') +
    '<table class="t"><thead><tr><th>Jacket</th><th>Cable</th><th>pp1 ports (TPU end)</th><th>Leg labels</th><th>Goes to</th></tr></thead><tbody>' +
    '<tr><td><span class="sw" style="--c:#D62839"></span>Red</td><td>OCS 1</td><td>1-8 (side A)</td><td>1-8</td><td>SPOCS rack 1</td></tr>' +
    '<tr><td><span class="sw" style="--c:#F08C1B"></span>Orange</td><td>OCS 2</td><td>9-12 (side A) + 13-16 (side B)</td><td>9-16</td><td>SPOCS rack 2</td></tr>' +
    '<tr><td><span class="sw" style="--c:#F5D21E"></span>Yellow</td><td>OCS 3</td><td>17-24 (side B)</td><td>17-24</td><td>SPOCS rack 3</td></tr></tbody></table>' +
    '<p>18F Type B, 9 LC/APC duplex legs each end. Leg position colors 1-8: blue, orange, green, brown, slate, white, red, black; position 9 yellow = spare (fibers 17-18). In each group blue = lowest port, black = highest. Check reel part number and length before pulling.</p>' +
    '<table class="t center"><thead><tr><th>Legs (position)</th><th>Length</th><th>SPOCS slot</th><th>Ports</th></tr></thead><tbody><tr><td>1-2</td><td>1480 mm (~4 ft 10 in)</td><td>1 (top)</td><td rowspan="4">odd leg on <b>X</b>, even leg on <b>X+1</b> — same X on all 4 slots and all 3 SPOCS racks</td></tr><tr><td>3-4</td><td>1840 mm (~6 ft 0 in)</td><td>2</td></tr><tr><td>5-6</td><td>2200 mm (~7 ft 3 in)</td><td>3</td></tr><tr><td>7-8</td><td>2560 mm (~8 ft 5 in)</td><td>4 (bottom)</td></tr></tbody></table>' +
    '<ul><li>OCS shelf: 320 LC ports 001-320, pairs odd-over-even, count down a column of 20 then right; 145-160 not used. Left half 001-160 = TPU 1-72 (exit/dress left); right half 161-320 = TPU 73-144 (exit/dress right).</li><li>Pull from the OCS rack to the TPU rack. Split point 12-18 in above the OCS rack. Tier 1 tray. OCS slack on top of the TPU rack. Spares: coil on top of the rack (drawings) or "left hanging" (reference cutsheet) — ask your lead.</li><li>Labels: wrap-around on the bundle 1-2 in from the boot; flag on each leg 4 in from the boot.</li></ul></section>' +

    '<section class="lsec"><h2>8. Copper home runs (guide p.14, 26-27)</h2><table class="t"><thead><tr><th>From</th><th>Port</th><th>EOR copper panel</th><th>Switch</th></tr></thead><tbody>' +
    '<tr><td>TOR (side A)</td><td>ETH (Management1)</td><td>RU 24</td><td>MGMT leaf</td></tr><tr><td>TOR</td><td>CONSOLE</td><td>RU 30</td><td>console switch</td></tr>' +
    '<tr><td>TROSS / RMU1 (side A, RU 38)</td><td>GIG E 1</td><td>RU 22</td><td>TROSS leaf</td></tr><tr><td>RMU1</td><td>CONSOLE</td><td>RU 30</td><td>console switch</td></tr>' +
    '<tr><td>TROSS / RMU2 (side B, RU 38)</td><td>GIG E 1</td><td>RU 22</td><td>TROSS leaf</td></tr><tr><td>RMU2</td><td>CONSOLE</td><td>RU 30</td><td>console switch</td></tr></tbody></table>' +
    '<p>Home run: RJ45 plug at the TPU rack, straight to the jack the cutsheet gives (no panel at the TPU end). Patch cord jack N → switch port N. Flag label 4 in from the plug at both ends. Velcro, VCM fingers closest to the switch, nothing on the floor. Tier 2 at this site (p.14 says Tier 1 — ask).</p></section>' +

    '<section class="lsec"><h2>9. Management trunks and SPOCS management (guide p.28-30)</h2><table class="t"><thead><tr><th>Rack type</th><th>Trunk</th><th>Spine 1 (RU 39 rear)</th><th>Spine 2</th><th>Duplex assignments (same on both trunks)</th></tr></thead><tbody>' +
    '<tr><td>AIO EOR</td><td>12F (6 duplex)</td><td>A1:A2, rows 1-3</td><td>C5:C6, rows 1-3</td><td>1 MGMT leaf · 2 TROSS leaf · 3-6 spares</td></tr>' +
    '<tr><td>AIO EOR w/BMS</td><td>24F (12 duplex)</td><td>A1:B4, rows 1-3</td><td>C5:D8, rows 1-3</td><td>1 MGMT leaf · 2 TROSS leaf · 3 FB0 BMS · 4-9 SPOCS mgmt · 10-12 spares</td></tr></tbody></table>' +
    fig('lcPanel', { type: '24F' }, 'RU 39 LC panel, 24F layout (front view, duplex numbers).') +
    '<table class="t center small"><thead><tr><th>Pod</th><th>SPOCS racks</th><th>mgmt1 → (spot 11)</th><th>mgmt2 → (spot 13)</th></tr></thead><tbody><tr><td>10</td><td>512, 612, 712</td><td>611</td><td>613</td></tr><tr><td>11</td><td>1312, 1412, 1512</td><td>1411</td><td>1413</td></tr><tr><td>12</td><td>2112, 2212, 2312</td><td>2211</td><td>2213</td></tr></tbody></table>' +
    '<p>SPOCS uplinks: long 2F LC cords to the front of the w/BMS RU 39 panel, position from the cutsheet; each switch has 2 uplinks (one toward each spine). At R131/R204: trunk lands on a panel; breakout harness joins 4 LC legs into one MPO-8 at the spine port. Final patching before rack turn-up.</p></section>' +

    '<section class="lsec"><h2>10. Labels and color codes (guide p.8)</h2><ul><li>Machine printed only. Calibri Bold, 8 pt min on 2-in labels, 10 pt on larger labels.</li><li>Line 1 = A device and port. Line 2 = Z device and port. Same text both ends, matching the cutsheet.</li><li>Flag label (single connector, breakout leg, copper): 4 in from the boot, both sides printed, barcode at bottom. Wrap-around (trunks): 1-2 in from the boot at each end, 1 in wide minimum.</li><li>Port lists: [1:4] = 1 through 4 · [1,3,5,7] = list · / separates line card / port / channel.</li><li>Copper colors: orange OOB management · blue BMS · green FIS · black intra-rack (check site stock).</li></ul>' + fig('colorStrip', {}, 'TIA-598 colors 1-12. Positions 13+ repeat — always read the number.') + '</section>' +

    '<section class="lsec"><h2>11. Dressing rules (DRS 01.00.01, 01.00.03, 01.00.03.01, 01.00.02 and guide p.7)</h2>' +
    '<h3>DRS 01.00.01 General Fiber Cable Dressing (revised 6/9/2026)</h3><ol><li>Dress cables per <b>ANSI/TIA-568, ANSI/TIA-606 and ANSI/TIA-942</b>.</li><li><b>1/2-inch hook-and-loop (Velcro) only.</b> Nylon zip ties are not allowed.</li><li><b>Bend radius:</b> follow the manufacturer\'s spec; minimum <b>20× diameter loaded</b> (under tension), <b>10× unloaded</b> (no tension). See DRS 01.00.07 for fiber bend radius.</li><li>Supports must not damage the cable. <b>No metal staples.</b></li><li><b>Support every 4-5 ft</b> on horizontal runs (TIA-568 recommendation).</li><li><b>Rated cable:</b> plenum OFNP / CMP in plenum spaces; riser OFNR / CMR in vertical risers; LSZH where local code requires.</li></ol>' +
    '<table class="t center"><thead><tr><th>Cable diameter (example)</th><th>Loaded minimum radius (20×)</th><th>Unloaded minimum radius (10×)</th></tr></thead><tbody><tr><td>0.20 in</td><td>4 in</td><td>2 in</td></tr><tr><td>0.25 in</td><td>5 in</td><td>2.5 in</td></tr><tr><td>0.30 in</td><td>6 in</td><td>3 in</td></tr><tr><td>0.40 in</td><td>8 in</td><td>4 in</td></tr><tr><td>0.50 in</td><td>10 in</td><td>5 in</td></tr></tbody></table><p class="muted small">Use your cable\'s real diameter. If the manufacturer\'s spec is larger, use the spec. A radius is half the width of the loop.</p>' +
    '<h3>DRS 01.00.03 Cable Dressing Basket Trays (revised 6/9/2026)</h3><ol>' +
    '<li>Bundle neatly in the tray with <b>Velcro every 12-18 in</b>.</li>' +
    '<li><b>Do not secure bundles to the tray</b> except at corners, exits and vertical runs: <b>3× at each corner, 3× at each exit</b>.</li>' +
    '<li><b>1/2-inch Velcro</b> for all cable bundling.</li>' +
    '<li><b>Waterfalls centered over the rack VCMs.</b></li>' +
    '<li>Keep the <b>manufacturer\'s recommended bend radius</b> at all times (drawing: 20× cable diameter at a tray corner).</li></ol>' +
    '<p class="small"><b>Never let cable drop over a tray edge unsupported.</b> Waterfalls keep the bend radius at every tray exit.</p>' +
    '<h3>DRS 01.00.03.01 Cable Dressing Vertical Pathways (revised 6/9/2026)</h3><ol>' +
    '<li>Velcro every 12-18 in, in vertical tray as well.</li>' +
    '<li><b>Secure bundles to the tray when running vertically</b> (horizontal bundles float).</li>' +
    '<li>Vertical cable <b>secured to be self-supporting</b>: too much weight on horizontal transitions damages tray and cable.</li>' +
    '<li><b>Waterfalls at all vertical transitions.</b></li>' +
    '<li><b>3/4-inch Velcro may secure cable to vertical tray</b> (bundling stays 1/2-inch).</li></ol>' +
    '<p class="small">Drawing: all bends greater than 20× cable diameter. Too little Velcro lets cable drop to the bottom.</p>' +
    '<h3>DRS 01.00.02 Front of Rack Cable Dressing (revised 6/9/2026)</h3><ol>' +
    '<li><b>Never cross devices you do not patch into.</b> Every device must be replaceable without unpatching another device\'s cables.</li>' +
    '<li>Exit the basket tray <b>directly above the rack edge or VCM</b>.</li>' +
    '<li><b>Waterfalls</b> support every cable entering or leaving the tray (bend radius); each lines up with the rack VCM.</li>' +
    '<li><b>Over-the-top waterfalls</b> at network racks (guide p.39, 41: DCN-PP and spine racks).</li>' +
    '<li>Bundle neatly with <b>1/2-inch Velcro</b>.</li>' +
    '<li>Use the waterfall <b>on the side of the rack you patch into</b>.</li></ol>' +
    '<p class="small">Tray accessories must fit trays made by Basor, WBT, Legrand or equivalent: 2 × 4 in (50 × 100 mm) openings, 5 mm wire.</p>' +
    '<h3>VCM, slack and tiers (guide p.7; their DRS sheet has not been added yet)</h3><ol start="9">' +
    '<li>VCM: exit between the fingers closest to the device; slack downstream; nothing touches the floor.</li><li>Trunk slack above the split point on top of the rack, never in the tray.</li><li>Tiers from the bottom: Tier 1 OCS · Tier 2 144F + CAT6 (this site).</li></ol>' +
    '<p class="muted small">Guide p.7 also allows 3/4-inch Velcro on vertical tray (DRS 01.00.03.01 agrees: for securing cable to vertical tray) and recommends 15× long-term bend radius (not on any DRS so far: open item 13).</p></section>';

  R.open =
    '<table class="t"><thead><tr><th>#</th><th>Open item</th><th>Guide pages</th><th>What the course does</th></tr></thead><tbody>' +
    '<tr><td>1</td><td>Revision mismatch: the cover says <b>Rev D - October 8, 2026</b>; every page footer says <b>Rev C, 10/8/2026</b>.</td><td>p.1 vs all footers</td><td>Notes both. Confirm you have the current revision.</td></tr>' +
    '<tr><td>2</td><td>CAT6 tray tier: Tier 2 at this site (recently changed) vs p.14 "Run copper in the Tier 1 tray".</td><td>p.7, 14, 16, 31, 47</td><td>Teaches Tier 2 (four places agree, one explains the change) and flags p.14.</td></tr>' +
    '<tr><td>3</td><td>OCS spare leg: drawings say coil on top of the rack; reference cutsheet says "left hanging".</td><td>p.15, 21, 22</td><td>Teaches "follow what your site decided" (as the guide does).</td></tr>' +
    '<tr><td>4</td><td>w/BMS management trunk size: one drawing says 12F; patching drawing and patch data say 24F.</td><td>p.30</td><td>Teaches 24F (the guide\'s choice); stop and ask if you see 12F at a w/BMS rack.</td></tr>' +
    '<tr><td>5</td><td>Shuffle module: patch data lists 2x2 P/N 760262482 (3 packs per panel); field reports mention a 4x4 (P/N 760262479).</td><td>p.40</td><td>Teaches the P/N check; stop if 760262479.</td></tr>' +
    '<tr><td>6</td><td>SPOCS uplinks: 24F table reserves 6 duplex positions (4-9) per trunk; the p.30 description (3 SPOCS racks × 1 switch × 1 uplink per spine) gives 3 per trunk.</td><td>p.29, 30</td><td>Teaches "use the cutsheet positions"; flags the count.</td></tr>' +
    '<tr><td>7</td><td>192F at the AIO rear: p.42 checklist says "odd legs left, even legs right"; p.37 says odd legs on the right port (rear view). Likely the same physical position described from different sides.</td><td>p.37, 42</td><td>Teaches the p.37 rear-view wording with the mirror explanation.</td></tr>' +
    '<tr><td>8</td><td>AIO elevations are not RU-exact (the drawing shows 2 blank units between the RU 39 LC panel and the 4RU MPO panel at RU 32-35, which leaves RU 36-38; the guide names RU 36-37 as blank), show a 4th copper panel with no stated purpose, and do not show the console switch or the w/BMS FB0 switch / copper panel.</td><td>p.26, 35</td><td>Uses the checked RU values (39, 32, 30, 24, 22); flags the rest.</td></tr>' +
    '<tr><td>9</td><td>Two port-code notations: cutsheet <code>r1-a1</code> (row, column, port) and AIO panel pre-label <code>A1-1</code> (column, port, row).</td><td>p.6, 36</td><td>Teaches both.</td></tr>' +
    '<tr><td>10</td><td>DCN-PP racks are numbered 1-8 (p.37) and lettered A-H (p.41, 44).</td><td>p.37, 41, 44</td><td>Teaches 1 = A … 8 = H.</td></tr>' +
    '<tr><td>11</td><td>OCS "leg" numbering: position 1-8 (+9 spare) in the text vs printed labels 9-16 and 17-24 on cables 2 and 3.</td><td>p.15, 20, 21</td><td>Teaches both: label = pp1 port, color = position.</td></tr>' +
    '<tr><td>12</td><td><b>Velcro width (answered by DRS 01.00.03.01).</b> Bundling: 1/2-inch everywhere (DRS 01.00.01 rule 2, 01.00.02 rule 5, 01.00.03 rule 3 "for all cable bundling"). Securing cable to vertical tray: 3/4-inch may be used (DRS 01.00.03.01 rule 5), matching guide p.7.</td><td>Guide p.7; DRS 01.00.01, 01.00.02, 01.00.03, 01.00.03.01</td><td>Teaches 1/2-inch to bundle and 3/4-inch only to secure to vertical tray. Confirm this reading.</td></tr>' +
    '<tr><td>13</td><td><b>Bend radius 15× long-term.</b> Guide p.7 recommends 15× for long-term installed cable. DRS 01.00.01 gives 20× loaded / 10× unloaded (or the manufacturer spec) and points to DRS 01.00.07, which has not been supplied.</td><td>Guide p.7; DRS 01.00.01</td><td>Teaches the DRS minimums and shows 15× as the guide\'s recommendation. Ask for DRS 01.00.07.</td></tr>' +
    '<tr><td>14</td><td><b>DRS numbering.</b> The guide lists DRS sections with two parts (01.00, 01.01, 02.00, 05.00, 10.01, 10.04, 10.08, 10.10; page drawings cite 01.02, 08.01 …). The sheets use three parts (01.00.00 to 01.00.03; 01.00.07 is referenced), and some add a fourth (01.00.03.01 builds on 01.00.03). Which sheets, and which current revisions, govern each of the five cable paths is not stated.</td><td>Guide p.1; DRS sheets</td><td>Cites DRS sheets by their full numbers. Ask your lead for the list of sheets per task.</td></tr>' +
    '<tr><td>15</td><td><b>Support spacing wording.</b> The DRS 01.00.01 drawing says "TIA-568 recommends" support every 4-5 ft; the portal summary says "Support cable every 4-5 feet".</td><td>DRS 01.00.01</td><td>Teaches 4-5 ft as the DRS rule.</td></tr>' +
    '<tr><td>16</td><td><b>Scope of DRS 01.00.01.</b> The drawing title says "General Fiber Cable Dressing"; the portal title says "General Cable Dressing", and rule 6 names copper ratings (CMP/CMR).</td><td>DRS 01.00.01</td><td>Applies it to every cable you dress; confirm whether copper has its own DRS.</td></tr>' +
    '<tr><td>17</td><td><b>Having the DRS on the floor.</b> The DRS allows a printed copy or a digital copy on a device. Not stated: whether crews get portal logins or printed sets, and whether phones or tablets are allowed in the hall.</td><td>DRS 01.00.00</td><td>Teaches "get or print it before you go onto the floor". Ask your lead how your crew gets its copies.</td></tr>' +
    '<tr><td>18</td><td><b>Which racks are "network racks"?</b> DRS 01.00.02 rule 4 requires over-the-top waterfalls for network racks but does not list them. The guide puts the note on the DCN-PP and spine rack pages (network rows 1-2).</td><td>DRS 01.00.02; guide p.39, 41</td><td>Teaches over-the-top at DCN-PP, spine and management spine racks in network rows 1-2. Ask about EOR (AIO) and SPOCS racks.</td></tr>' +
    '<tr><td>19</td><td><b>"Should" on a DRS.</b> DRS 01.00.02 rule 6 says cables <i>should</i> use the waterfall on their side; the other rules say shall or must.</td><td>DRS 01.00.02; DRS 01.00.00</td><td>Teaches it as required (DRS 01.00.00: every DRS is a requirement). Confirm.</td></tr>' +
    '<tr><td>20</td><td><b>Bend radius in tray pathways.</b> The DRS 01.00.03 drawing marks 20× cable diameter at a tray corner, and the DRS 01.00.03.01 drawing says "all bends greater than 20× diameter of cable". DRS 01.00.01 gives 20× loaded and 10× unloaded, plus the manufacturer\'s spec and DRS 01.00.07.</td><td>DRS 01.00.01, 01.00.03, 01.00.03.01</td><td>Teaches: in tray pathways (corners, vertical transitions) keep every bend above 20×, or the spec if larger. Confirm.</td></tr>' +
    '</tbody></table>' +
    '<h2>Details the guide does not give</h2><table class="t"><thead><tr><th>Missing detail</th><th>Why it matters</th><th>What to provide or ask</th></tr></thead><tbody>' +
    '<tr><td>Which physical rack is TPU 1-144 in each pod</td><td>Decides OCS port X and left/right dressing</td><td>Cutsheet rows (device names include rack number in pod, e.g. rack1)</td></tr>' +
    '<tr><td>OCS port X for each TPU rack; copper jack numbers; spine line-card ports</td><td>Exact port assignments</td><td>Cutsheet / BOM Builder extract</td></tr>' +
    '<tr><td>Copper termination standard (T568A/B), jack type, copper test/certification</td><td>Termination and verification</td><td>Site standard or spec</td></tr>' +
    '<tr><td>Fiber test requirements beyond scope-and-clean</td><td>Verification</td><td>Site test plan</td></tr>' +
    '<tr><td>FB0 BMS switch and its copper panel: RU, connected devices, who cables them; meaning of "FB0"</td><td>BMS connections</td><td>Rack integration spec / BMS drawings</td></tr>' +
    '<tr><td>Which spine racks are spines 1-32; which MGMT rack (R131/R204) is spine 1</td><td>Final patching</td><td>Cutsheet</td></tr>' +
    '<tr><td>Meaning of TROSS, RMU, FIS, SASL, Oxide, FU, CDU</td><td>Vocabulary only</td><td>Ask your lead (CDU is commonly Coolant Distribution Unit)</td></tr>' +
    '<tr><td>Ports 305-320 on the OCS shelf: the guide marks only 145-160 unused, but 144 TPU racks × 2 ports = 288 ports</td><td>Avoid assuming unused ports</td><td>Cutsheet</td></tr>' +
    '</tbody></table>';

  var COV = [
    ['1', 'Scope, revision, guide sources', 'L1 s1; L15 s3', 'overview', '—', 'V01, V15'],
    ['4', 'Your job: five cable paths; do not touch', 'L1 s2-s5', 'overview', 'a1-explore, a1-match, a1-mistake', 'V01 ch.2-4'],
    ['5, 11, 18, 25, 33', 'Hall map, location codes, row pattern, pods', 'L2 s1-s5', 'hallMap, locationCode', 'a2-pick, a2-decode', 'V02'],
    ['6', 'Device names, port codes, cutsheet row, SPARE', 'L4 s1-s3, s5', 'cutsheet', 'a4-wrong', 'V04 ch.1-3'],
    ['DRS 01.00.00', 'What a DRS is, contents, standards, approval, revisions, where to get it, on-site rule', 'L0 all', 'drsStack, drsAccess, drsSheet, standardsMap', 'a0-order, a0-explore, a0-scen, a0-match', 'V00'],
    ['DRS 01.00.01', 'General cable dressing: standards, Velcro, bend radius, supports, spacing, rated cable', 'L5 s1-s4, s6-s10; L3 s6', 'dressRules, standardsMap, bend, cableRatings', 'a5-explore, a5-bend, a5-match, a5-spot', 'V05; V03 ch.7'],
    ['DRS 01.00.02', 'Front of rack dressing: no crossing, tray exit, waterfalls, over-the-top at network racks, Velcro, side, tray accessories', 'L5B s1, s4, s6-s9; L9 s3, s5', 'frontRack', 'a5-front, a5b-match, a5b-spot', 'V05B ch.3'],
    ['DRS 01.00.03', 'Basket tray dressing: Velcro every 12-18 in, secure 3× at corners and exits only, 1/2-in Velcro, waterfalls centered over VCMs, bend radius, no unsupported drops', 'L5B s1-s2, s6-s9; L11 s6; L12 s5', 'trayPlan', 'a5b-tray, a5b-match, a5b-spot', 'V05B ch.2; V11'],
    ['DRS 01.00.03.01', 'Vertical pathways: Velcro 12-18 in, secured, self-supporting, waterfalls at all vertical transitions, 3/4-in Velcro to secure, bends over 20×', 'L5B s1, s3, s6, s8-s9; L5 s3; L11 s6', 'vertPath', 'a5b-vert, a5b-match, a5b-spot', 'V05B ch.3'],
    ['7', 'Cable dressing rules, tiers, bend radius', 'L5 s3, s5-s6; L5B s5; L3 s6', 'tray, bend', 'a5-order, a5-spot', 'V05; V05B; V03 ch.7'],
    ['8', 'Labels, TIA-598, copper colors', 'L4 s4; L3 s4-s5', 'labels, colorStrip', 'a4-labels, a3-order, a3-scen', 'V04 ch.4; V03 ch.4-5'],
    ['9', 'Guide set and install order', 'Home; L1 s3', '—', '—', 'V01'],
    ['12', 'TPU rack: sides A/B, units, what is yours', 'L6 s1-s4', 'tpuRack', 'a6-explore, a6-pick', 'V06'],
    ['13', '144F trunk at the TOR: odd ports 1-31, legs, spares, colors', 'L7 all', 'trunk144, torSwitch', 'a7-pick, a7-mistake', 'V07'],
    ['14', 'TROSS / RMU copper; all 6 copper cables', 'L12 s2-s6', 'rmuFace, mgmtFlow', 'a12-match, a12-scen', 'V12'],
    ['15', 'OCS panel pp1, port groups, spare conflict', 'L10 s4-s8', 'ocsPanel', 'a10-pick, a10-mistake', 'V10 ch.5-7'],
    ['16, 23, 31, 42', 'Done-when checklists', 'L15 s2; Tables', '—', 'a15-scen', 'V15 ch.4'],
    ['18-19', 'SPOCS racks, slots, OCS shelf 320 ports', 'L10 s2; L11 s1-s2', 'spocsRack, ocsShelf', 'a11-scen', 'V10 ch.2; V11 ch.1-2'],
    ['20', 'OCS cable: 18F Type B, 9 LC/APC legs, jacket colors, labels', 'L10 s3-s4', 'ocsCable', 'a10-pick', 'V10 ch.3-4'],
    ['21', 'Patching one OCS cable: lengths, slots, X / X+1', 'L11 s3-s5', 'spocsRack (legs), ocsShelf', 'a11-match, a11-scen', 'V11 ch.3-5'],
    ['22', 'Dressing OCS: split point, left/right, Tier 1, slack, spares', 'L11 s6', 'ocsShelf', 'a11-scen', 'V11 ch.6'],
    ['26, 35', 'AIO EOR rack elevation and panel RUs', 'L8 s1-s2; L12 s4', 'aioRack', '—', 'V08 ch.1'],
    ['27', 'Landing copper runs: jack = port, patch cords', 'L12 s4', 'copperPanel', 'a12-scen', 'V12 ch.4'],
    ['28', 'Management trunks 12F', 'L13 s1-s4', 'lcPanel (12F)', 'a13-scen', 'V13 ch.1-2'],
    ['29', 'Management trunks 24F (w/BMS), duplex assignments', 'L13 s2-s4; L14 s2', 'lcPanel (24F)', 'a13-pick', 'V13 ch.2; V14 ch.2'],
    ['30', 'SPOCS management uplinks; 12F/24F correction', 'L13 s5', 'spocsMgmt', 'a13-scen', 'V13 ch.4'],
    ['25-26, 29 (BMS)', 'BMS: w/BMS racks, FB0 switch, uplink path', 'L14 all', 'bmsFlow, hallMap', 'a14-trace', 'V14'],
    ['34', 'Large trunk path at a glance', 'L8; L9; L15 s1', 'largePath', 'a15-trace', 'V15 ch.2'],
    ['36', 'AIO front: 144F, one TPU per row', 'L8 s3; L7 s6', 'aioFront', 'a8-front', 'V08 ch.2; V07 ch.7'],
    ['37', 'AIO back: 192F, mirror rule, line-up', 'L8 s4-s5', 'aioRear, aioFront', 'a8-scen', 'V08 ch.3-4'],
    ['38-39', 'DCN-PP rack, landing 192F, lanes', 'L9 s1-s3', 'dcnppRear', 'a9-lookup', 'V09 ch.1-3'],
    ['40', '2x2 shuffle module, P/N check', 'L9 s4', 'shuffle', 'a9-lookup', 'V09 ch.4'],
    ['41', 'DCN-PP front to spines, spine groups', 'L9 s5-s6', 'dcnppFront', 'a9-lookup', 'V09 ch.5-6'],
    ['43-45', 'Trunk Landing Sheet (all 48 AIO racks)', 'L8 s6; L9 s2; Tables §5', 'networkRows', 'a8-scen, a9-lookup', 'V08 ch.5; V09 ch.2'],
    ['46-47', 'Glossary', 'Glossary page; term pop-ups throughout', '—', '—', 'Term cards in every video']
  ];
  R.sources =
    '<h2>Project sources</h2><p><b>Fluidstack DRS (Deployment Requirement Sheets)</b>, Fluidstack Internal Use Only, supplied one section at a time:</p><ul>' +
    '<li><b>DRS 01.00.00 — introduction</b> (portal page): what a DRS is, what it contains, why it exists, approval (Tom Marsh, Infrastructure Deployment Manager, 6/9/2026), revisions, where to get it, and the on-site requirement. Used in Lesson 0.</li>' +
    '<li><b>DRS 01.00.01 — General Fiber Cable Dressing</b> (drawing, REVISED 6/9/2026, approved by Tom Marsh) and its portal summary "General Cable Dressing". Used in Lessons 0, 3 and 5.</li>' +
    '<li><b>DRS 01.00.02 — Front of Rack Cable Dressing</b> (drawing, REVISED 6/9/2026, approved by Tom Marsh) and its portal summary. Used in Lessons 5B and 9.</li>' +
    '<li><b>DRS 01.00.03 — Cable Dressing Basket Trays</b> (drawing, REVISED 6/9/2026, approved by Tom Marsh) and its portal summary "Basket Tray Cable Dressing". Used in Lessons 5B, 11 and 12.</li>' +
    '<li><b>DRS 01.00.03.01 — Cable Dressing Vertical Pathways</b> (drawing, REVISED 6/9/2026, approved by Tom Marsh) and its portal summary "Vertical Pathway Dressing". Used in Lessons 5, 5B and 11.</li></ul>' +
    '<p>The <a href="#/drs">DRS sheets</a> page lists every sheet in plain words with where it is taught. <a href="drs-explained/DRS_Explained.html">DRS Explained</a> breaks each sheet down rule by rule, with drawings.</p>' +
    '<p>Where the DRS and the guide differ, the course teaches the DRS and lists the difference under Open items.</p>' +
    '<p><b>Large Site Cable Installation Guide</b>, data hall 4 (pods 10, 11, 12), D. Moore — cover Rev D (October 8, 2026), page footers Rev C (10/8/2026), 47 pages. Every project-specific instruction, port mapping, color sequence and quiz answer in this course comes from this guide. Page numbers are cited throughout.</p>' +
    '<p class="muted">The guide says it was built from the DRS (sections 01.00, 01.01, 02.00, 05.00, 10.01, 10.04, 10.08, 10.10) and the BUF102 patch panel matrix v0.97 (ICT cutsheet v0.97). Apart from DRS 01.00.00 to 01.00.03.01, those documents have not been supplied, so the guide\'s "checked against the patch data" statements are reported as the guide states them.</p>' +
    '<h2>Public sources used for background only</h2><p>These explain concepts (what a TPU or an OCS is, why APC connectors must not mix with UPC, and so on). They never replace the guide\'s wiring instructions.</p><ul>' +
    '<li><a href="https://docs.cloud.google.com/tpu/docs/tpu7x" target="_blank" rel="noopener">Google Cloud — TPU7x (Ironwood) documentation</a>: seventh-generation TPU; 9,216 chips per pod; 64-chip 4×4×4 cubes.</li>' +
    '<li><a href="https://blog.google/products/google-cloud/ironwood-google-tpu-things-to-know/" target="_blank" rel="noopener">Google — 3 things to know about Ironwood</a>: superpods of up to 9,216 chips.</li>' +
    '<li><a href="https://www.servethehome.com/googles-ironwood-tpu-swings-for-reasoning-model-leadership-at-hot-chips-2025/" target="_blank" rel="noopener">ServeTheHome — Ironwood at Hot Chips 2025</a>: 16 trays × 4 TPUs = 64 per rack; liquid-cooled; copper inside the rack, OCS between racks.</li>' +
    '<li><a href="https://www.hc2025.hotchips.org/assets/program/tutorials/HC2025.T1DCRacks.S7.Pankaj.pdf" target="_blank" rel="noopener">Hot Chips 2025 tutorial (Google data center racks)</a>: OCS rack with OCS1-OCS4, CDU (Coolant Distribution Unit), AC/DC rectifiers, battery backup.</li>' +
    '<li><a href="https://arxiv.org/abs/2208.10041v1" target="_blank" rel="noopener">Mission Apollo: Landing Optical Circuit Switching at Datacenter Scale (arXiv)</a>: 3D MEMS-mirror optical circuit switches.</li>' +
    '<li><a href="https://www.thefoa.org/tech/ColCodes.htm" target="_blank" rel="noopener">Fiber Optic Association — color codes</a>: TIA-598 order; APC = green connector; singlemode = yellow jacket.</li>' +
    '<li><a href="https://assets.testequity.com/te1/Documents/pdf/fluke/Fluke_Networks_APC-Connector-and-How-Do-I-Test-It_0424.pdf" target="_blank" rel="noopener">Fluke Networks — What is an APC connector</a>: 8° angle; never mate APC with UPC.</li>' +
    '<li><a href="https://www.viavisolutions.com/en-uk/what-fiber-inspection" target="_blank" rel="noopener">VIAVI — What is fiber inspection</a>: contamination is the #1 reason to troubleshoot optical networks; inspect both sides.</li>' +
    '<li><a href="https://www.senko.com/mpo-connector-polarity-tia-568/" target="_blank" rel="noopener">SENKO — MPO connector polarity (TIA-568)</a>: transmit must reach receive; Type A/B/C.</li>' +
    '<li><a href="https://www.techtarget.com/searchdatacenter/definition/building-management-system" target="_blank" rel="noopener">TechTarget — Building management system</a>: what a BMS monitors and controls.</li>' +
    '<li><a href="https://www.supermicro.com/en/glossary/cdu" target="_blank" rel="noopener">Supermicro — Coolant distribution unit</a>.</li>' +
    '<li><a href="https://www.wti.com/pages/out-of-band-network-management-in-the-data-center" target="_blank" rel="noopener">WTI — Out-of-band management in the data center</a>: OOB vs in-band; console ports.</li></ul>' +
    '<h2>Standards named in the DRS (background only)</h2><p>These explain what each standard covers. The DRS turns them into the rules you follow; on site, follow the DRS.</p><ul>' +
    '<li><a href="https://tiaonline.org/standard/tia-568/" target="_blank" rel="noopener">TIA — TIA-568</a>: Commercial Building Telecommunications Cabling Standards.</li>' +
    '<li><a href="https://tiaonline.org/products/tia-942/" target="_blank" rel="noopener">TIA — TIA-942</a>: "specifies the requirements for infrastructure of data centers and computer rooms".</li>' +
    '<li><a href="https://www.ecmag.com/magazine/articles/article-detail/systems-tia-redefine-telecommunications-administration" target="_blank" rel="noopener">Electrical Contractor — TIA redefines telecommunications administration</a>: TIA-606 defines how identifiers, labels and records work together.</li>' +
    '<li><a href="https://www.cablinginstall.com/connectivity/article/16465694/boiling-down-the-606-a-labeling-standard" target="_blank" rel="noopener">Cabling Installation &amp; Maintenance — Boiling down the 606-A labeling standard</a>: identifiers and labels; handwritten labels are not acceptable.</li>' +
    '<li><a href="https://www.ecmweb.com/construction/intelligent-buildings/article/20892418/plenum-datacom-wiring-what-you-need-to-know" target="_blank" rel="noopener">EC&amp;M — Plenum datacom wiring</a>: NEC Article 100 definition of a plenum; higher-rated cable may substitute for lower.</li>' +
    '<li><a href="https://open-exam-prep.com/study-guides/bicsi-rcdd/grounding-bonding/electrical-protection-nec" target="_blank" rel="noopener">Open Exam Prep — Electrical protection and the NEC</a>: NEC Articles 770 and 800; CMP for plenums, CMR for floor-to-floor risers; OFNP above OFNR; never substitute a lower rating.</li>' +
    '<li><a href="https://en.wikipedia.org/wiki/Low_smoke_zero_halogen" target="_blank" rel="noopener">Low smoke zero halogen (Wikipedia)</a>: LSZH jackets give off limited smoke and no halogen when heated.</li>' +
    '<li><a href="https://standardsportal.org/usa_en/sdo/bicsi.aspx" target="_blank" rel="noopener">ANSI Standards Portal — BICSI</a>: professional association for the ICT profession; ANSI-accredited standards developer; training and credentials.</li>' +
    '<li><a href="https://nema.org/standards/all-standards-by-product" target="_blank" rel="noopener">NEMA — Standards by product</a>: product standards including enclosures, cable tray, wiring devices, and wire and cable.</li></ul>' +
    '<h2>Coverage map: guide → lesson → visual → practice → video</h2><div class="tscroll"><table class="t small"><thead><tr><th>Guide page(s)</th><th>Topic</th><th>Lesson / section</th><th>Visual</th><th>Practice</th><th>Video</th></tr></thead><tbody>' +
    COV.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
    '<h2>Mandatory focus topics</h2><table class="t"><thead><tr><th>Topic</th><th>Lessons</th><th>Videos</th><th>Practice</th></tr></thead><tbody>' +
    '<tr><td>DRS — what it is, where to get it, on-site rule; dressing per DRS 01.00.01, 01.00.02, 01.00.03 and 01.00.03.01 and the standards they name</td><td>0, 5, 5B</td><td>V00, V05, V05B</td><td>Order the steps; explore a DRS sheet; which source answers it; bend radius; which rule says so</td></tr>' +
    '<tr><td>TPU — what it is, the rack, what is yours</td><td>6 (and 1)</td><td>V06</td><td>Explore the rack; click the parts</td></tr>' +
    '<tr><td>144-fiber arrangement, odd ports 1-31, both ends</td><td>7, 8</td><td>V07, V08</td><td>Plug legs into TOR ports; find the wrong leg; AIO front ports</td></tr>' +
    '<tr><td>OCS — purpose, cables, colors, ports, both ends</td><td>10, 11</td><td>V10, V11</td><td>pp1 port picking; find the swapped legs; slots and X/X+1</td></tr>' +
    '<tr><td>Copper / Ethernet</td><td>12</td><td>V12</td><td>Match runs to panels; spot problems</td></tr>' +
    '<tr><td>BMS</td><td>14 (and 13)</td><td>V14</td><td>Trace the FB0 BMS uplink</td></tr></tbody></table>';

  R.help =
    '<div class="card"><h2>Opening the course</h2><ol><li>Unzip the package. Keep the folders together: <code>course</code>, <code>videos</code>, <code>reference</code>.</li><li>Double-click <b>START_HERE.html</b> (or <code>course/index.html</code>). It opens in your web browser. No internet connection or installation is needed.</li><li>Use a current browser: Chrome, Edge, Firefox or Safari.</li></ol></div>' +
    '<div class="card"><h2>Moving around</h2><ul><li><b>Menu</b> (left, or ☰ on phones): every lesson, the final assessment, videos and reference pages.</li><li><b>Underlined terms</b>: select to see the definition. Press Esc to close.</li><li><b>Enlarge</b> on any diagram opens it full screen with zoom buttons.</li><li>Everything works with mouse, touch or keyboard (Tab to move, Enter or Space to select, arrow buttons to reorder).</li></ul></div>' +
    '<div class="card"><h2>Videos</h2><ul><li>Each lesson has a <b>Watch video</b> button. Controls: play/pause, back/forward 10 seconds, speed (0.75× to 1.5×), captions (CC), chapters and a clickable transcript that follows along.</li><li>The same MP4 files, captions (<code>.vtt</code>) and transcripts (<code>.txt</code>) are in the <code>videos</code> folder for use in any player.</li></ul></div>' +
    '<div class="card"><h2>Progress</h2><p>Your progress (lesson checks, practice, video position, final assessment) is saved in this browser on this computer. It is not sent anywhere. If your browser blocks saving for local files, the course still works but progress resets when you close it.</p><p><button type="button" class="btn sec" onclick="if(confirm(\'Reset all progress in this browser?\'))COURSE_APP.reset()">Reset my progress</button></p></div>' +
    '<div class="card"><h2>What needs the internet</h2><p>Nothing in the lessons, practice, assessment or videos. Only the links on the Sources page open public websites.</p></div>';
  window.COURSE.reference = R;
})();
