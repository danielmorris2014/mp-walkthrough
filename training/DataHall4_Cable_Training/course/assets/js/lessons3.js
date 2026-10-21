/* Lessons 10-15: OCS (TPU end, SPOCS end), copper, management trunks, BMS, putting it together. */
window.COURSE = window.COURSE || {};
COURSE.lessons = COURSE.lessons || [];

COURSE.lessons.push({
  id: 'l10', num: 10, title: 'What OCS is, and the OCS cable at the TPU rack', short: 'OCS at the TPU rack', video: 'v10', mins: 18,
  pages: 'Guide p.15, 18, 20, 46-47',
  objectives: [
    'Explain what an optical circuit switch (OCS) does and why every TPU rack connects to three of them.',
    'Recognize an OCS cable: 18 fibers, Type B, 9 LC/APC legs at each end.',
    'Read what each color means: jacket color, leg color and the yellow spare.',
    'Plug all three OCS cables into the OCS panel (pp1) in the right ports.'
  ],
  sections: [
    { id: 's1', stage: 'Understand', title: 'What an optical circuit switch does',
      html: `<p><b>[[OCS]]</b> stands for <b>Optical Circuit Switch</b>. The guide defines it as "a shelf that steers light between fibers" (p.18).</p>
<p>Light comes in on one fiber, and the switch points it out on another fiber. Change the setting and the same light goes somewhere else — without anyone touching a cable.</p>
<div class="callout info"><b>Background (public sources):</b> Google's research paper <i>Mission Apollo</i> describes its OCS as a switch built on tiny movable mirrors (3D MEMS). Hot Chips 2025 material says Ironwood racks use copper inside the rack and OCS to connect to other racks. This lets the system link racks of one pod together in different shapes for different jobs.</div>
<p><b>Why it matters to you:</b> the switch can only steer light it receives. Every OCS leg must be in exactly the right port, or that link simply does not exist.</p>`,
      analogy: 'An OCS is like an old telephone switchboard, where an operator connected callers by plugging cords. <b>Where the analogy stops:</b> nobody plugs anything in to make a connection — mirrors steer the light. Your job is to build the fixed cabling the switch depends on: every leg in its documented port.' },
    { id: 's2', stage: 'Recognize', title: 'SPOCS racks: three per pod',
      html: `<p>The OCS shelves live in <b>[[SPOCS]]</b> racks (Super Pod OCS racks). Each SPOCS rack holds <b>4 OCS shelves</b>. Each pod has <b>3 SPOCS racks</b>, color coded (guide p.18):</p>
<table class="t center"><thead><tr><th>Color</th><th>SPOCS rack</th><th>OCS cable</th><th>Pod 10</th><th>Pod 11</th><th>Pod 12</th></tr></thead><tbody>
<tr><td><span class="sw" style="--c:#D62839"></span><b>RED</b></td><td>1</td><td>OCS 1</td><td>512</td><td>1312</td><td>2112</td></tr>
<tr><td><span class="sw" style="--c:#F08C1B"></span><b>ORANGE</b></td><td>2</td><td>OCS 2</td><td>612</td><td>1412</td><td>2212</td></tr>
<tr><td><span class="sw" style="--c:#F5D21E"></span><b>YELLOW</b></td><td>3</td><td>OCS 3</td><td>712</td><td>1512</td><td>2312</td></tr></tbody></table>
<p>Every TPU rack sends <b>one OCS cable to each</b> of its pod's 3 SPOCS racks. Your site's cutsheet lists the exact row and spot of each SPOCS rack.</p>` },
    { id: 's3', stage: 'Recognize', title: 'The OCS cable',
      figs: [{ dg: 'ocsCable', o: { cable: 2 }, cap: 'OCS cable 2 (orange jacket). 9 LC legs at each end. Labels 9-16 = the pp1 ports they plug into (guide p.20).' }],
      html: `<ul><li><b>18 fibers</b>, built as a <b>[[typeB|Type B]]</b> assembly, with <b>9 LC legs at each end</b>. Each leg is an <b>LC duplex</b> (2 fibers) with the angled <b>APC</b> polish. 9 × 2 = 18.</li>
<li><b>8 legs are used; 1 is a spare.</b> The spare is the 9th leg: fibers 17 and 18.</li>
<li><b>Each cable is cut to length for its rack.</b> Check the part number and length on the reel against the cutsheet <b>before you pull</b>.</li></ul>
<h3 class="h4">Type B in plain words</h3><p>In each duplex pair, one fiber sends and one receives. Sending has to arrive at receiving on the other end. A Type B cable crosses them over inside the cable so that happens. <b>The cutsheet already accounts for it — you do not swap anything.</b></p>` },
    { id: 's4', stage: 'Understand', title: 'What each color tells you',
      html: `<table class="t"><thead><tr><th>Color you see</th><th>What it identifies</th></tr></thead><tbody>
<tr><td><b>Jacket</b>: red / orange / yellow</td><td><b>Which cable, and which SPOCS rack it goes to.</b> Red = OCS 1 → SPOCS 1. Orange = OCS 2 → SPOCS 2. Yellow = OCS 3 → SPOCS 3.</td></tr>
<tr><td><b>Leg</b>: blue, orange, green, brown, slate, white, red, black</td><td><b>The leg's position in its cable</b>, 1 to 8 (TIA-598). Position decides the order at both ends.</td></tr>
<tr><td><b>Leg</b>: yellow</td><td><b>Position 9 = the spare</b> (fibers 17 and 18).</td></tr>
<tr><td><b>Leg label number</b></td><td><b>The pp1 port it plugs into</b>: cable 1 = 1-8, cable 2 = 9-16, cable 3 = 17-24.</td></tr></tbody></table>
<div class="callout warn"><b>Two numbers per leg.</b> The guide talks about "leg 1 … leg 8" (position in the cable) and also prints labels 9-16 and 17-24 on cables 2 and 3. Position 1 of cable 2 is labeled <b>9</b>. Use the <b>label</b> to pick the pp1 port, and the <b>position (color)</b> as a check.</div>` },
    { id: 's5', stage: 'Work with it', title: 'The TPU end: OCS panel pp1',
      figs: [{ dg: 'ocsPanel', o: {}, cap: 'OCS panel pp1, ports 1-24 across sides A and B. Port colors show the leg color that belongs there (guide p.15).' }],
      html: `<ol><li><b>OCS 1 (red)</b> → the left group of 8 ports: <b>1-8</b> (side A).</li>
<li><b>OCS 2 (orange)</b> spans both sides, 4 on each: <b>9-16</b> (9-12 on side A, 13-16 on side B).</li>
<li><b>OCS 3 (yellow)</b> → the right group of 8 ports: <b>17-24</b> (side B).</li>
<li>In each group, <b>leg 1 (blue) goes in the lowest port and leg 8 (black) in the highest.</b> Leg 9 (yellow) is the spare.</li>
<li>Scope and clean every leg before it goes in.</li>
<li>Route and dress the cables to the side of the rack (lesson 11).</li></ol>
<p class="muted">The drawings show the 24 ports across both sides of the rack. The cutsheet lists them all as one panel, pp1. Go by the port numbers.</p>
<table class="t center small"><thead><tr><th>Position / color</th><th>OCS 1 (red)</th><th>OCS 2 (orange)</th><th>OCS 3 (yellow)</th></tr></thead><tbody>
<tr><td>1 · Blue</td><td>port 1</td><td>port 9</td><td>port 17</td></tr><tr><td>2 · Orange</td><td>port 2</td><td>port 10</td><td>port 18</td></tr>
<tr><td>3 · Green</td><td>port 3</td><td>port 11</td><td>port 19</td></tr><tr><td>4 · Brown</td><td>port 4</td><td>port 12</td><td>port 20</td></tr>
<tr><td>5 · Slate</td><td>port 5</td><td>port 13 (side B)</td><td>port 21</td></tr><tr><td>6 · White</td><td>port 6</td><td>port 14 (side B)</td><td>port 22</td></tr>
<tr><td>7 · Red</td><td>port 7</td><td>port 15 (side B)</td><td>port 23</td></tr><tr><td>8 · Black</td><td>port 8</td><td>port 16 (side B)</td><td>port 24</td></tr>
<tr class="spare"><td>9 · Yellow</td><td>spare</td><td>spare</td><td>spare</td></tr></tbody></table>` },
    { id: 's6', stage: 'Work with it', title: 'Worked example: OCS 2 at the TPU end',
      html: `<ol class="steps"><li><b>Identify the cable:</b> orange jacket → OCS 2 → goes to SPOCS rack 2 of this pod (for pod 10 that is rack 612).</li>
<li><b>Check the reel:</b> part number and length match the cutsheet before pulling.</li>
<li><b>Find the legs:</b> labels 9-16 (blue through black) and one yellow spare.</li>
<li><b>Side A:</b> leg <b>9</b> (blue) → port 9 · <b>10</b> (orange) → 10 · <b>11</b> (green) → 11 · <b>12</b> (brown) → 12.</li>
<li><b>Side B:</b> leg <b>13</b> (slate) → port 13 · <b>14</b> (white) → 14 · <b>15</b> (red) → 15 · <b>16</b> (black) → 16.</li>
<li><b>Scope and clean</b> each leg before it goes in.</li>
<li><b>Spare (yellow):</b> label it and handle it the way your site decided (see below).</li>
<li><b>Labels:</b> wrap-around label on the bundle 1-2 in from the boot; flag label on each leg 4 in from the boot.</li></ol>
<div class="callout conflict"><b>Ask your lead (guide p.15, 22):</b> the drawings say to coil spare legs and place them on top of the rack. The reference cutsheet says leg 9 is "left hanging." Follow what your site decided.</div>` },
    { id: 's7', stage: 'Apply', title: 'Guided practice: plug in OCS legs',
      act: { type: 'pick', id: 'a10-pick', title: 'Click the correct pp1 port', dg: 'ocsPanel', o: { empty: true }, clickPrefix: 'pp-',
        tasks: [
          { q: 'OCS <b>1</b> (red), leg labeled <b>1</b> (blue).', ok: ['pp-1'], hint: 'OCS 1 uses ports 1-8. Leg 1 goes in the lowest port.', why: 'The label is the port: 1.' },
          { q: 'OCS <b>3</b> (yellow), leg labeled <b>20</b> (brown).', ok: ['pp-20'], hint: 'The label number is the pp1 port.', why: 'Port 20, on side B. Brown is position 4: 17, 18, 19, 20.' },
          { q: 'OCS <b>2</b> (orange), leg labeled <b>13</b> (slate). Careful: which side?', ok: ['pp-13'], hint: 'OCS 2 spans both sides: 9-12 on side A, 13-16 on side B.', why: 'Port 13 is the first port on side B.', wrong: { 'pp-5': 'Port 5 belongs to OCS 1. The label says 13.' } },
          { q: 'OCS <b>2</b> (orange), leg labeled <b>12</b> (brown).', ok: ['pp-12'], hint: 'Still side A.', why: 'Port 12 is the last side-A port of OCS 2.' }
        ] } },
    { id: 's8', stage: 'Apply', title: 'Independent practice: find the wrong connection',
      act: { type: 'scenario', id: 'a10-mistake', title: 'Check this OCS panel', dg: 'ocsPanel', o: { wrong: { 10: 11, 11: 10 }, wrongColor: { 10: 3, 11: 2 } },
        qs: [
          { q: 'The chips show the leg label and color in each port. Which ports are wrong?', opts: [
            { t: 'Ports 10 and 11: legs 10 (orange) and 11 (green) are swapped', ok: true, why: 'Port 10 should hold leg 10 (orange, position 2) and port 11 should hold leg 11 (green, position 3).' },
            { t: 'Ports 13-16: they belong on side A', ok: false, why: 'Ports 13-16 are on side B by design. OCS 2 spans both sides.' },
            { t: 'Port 9: it should be yellow', ok: false, why: 'Yellow is the spare (position 9), which is not plugged in. Port 9 takes leg 9 (blue).' },
            { t: 'Nothing is wrong', ok: false, why: 'Compare the color order in ports 9-12 with blue, orange, green, brown.' }], hint: 'The colors in each group should run blue, orange, green, brown, slate, white, red, black.' },
          { q: 'Why does a swap like this matter, even though both legs are in the same cable?', opts: [
            { t: 'Each port is a specific link to a specific OCS slot; swapped legs connect the wrong fibers', ok: true, why: 'At the SPOCS end, positions 1-2 go to slot 1, 3-4 to slot 2 … A swap breaks the documented path.' },
            { t: 'It does not matter as long as all legs are in', ok: false, why: 'Every leg has one documented port.' },
            { t: 'It only matters for the spare', ok: false, why: 'The spare is not plugged in at all.' },
            { t: 'It only matters on side B', ok: false, why: 'Every port matters.' }] }
        ] } }
  ],
  check: [
    { q: 'What does OCS stand for in this project?', opts: [
      { t: 'Optical Circuit Switch', ok: true, why: 'Guide p.18 and glossary.' }, { t: 'Optical Cable System', ok: false, why: 'OCS = Optical Circuit Switch.' },
      { t: 'Out-of-band Control Switch', ok: false, why: 'Out-of-band is OOB.' }, { t: 'Overhead Cable Support', ok: false, why: 'OCS = Optical Circuit Switch.' }], ref: 's1' },
    { q: 'An OCS cable has a yellow jacket. Where does it go?', opts: [
      { t: 'SPOCS rack 3 of the pod, from pp1 ports 17-24', ok: true, why: 'Yellow = OCS 3 = SPOCS 3 (p.18, 20).' }, { t: 'SPOCS rack 1', ok: false, why: 'Red goes to SPOCS 1.' },
      { t: 'The EOR rack', ok: false, why: 'OCS cables go to SPOCS racks.' }, { t: 'It is a spare cable', ok: false, why: 'Yellow legs are spares; a yellow jacket is OCS 3.' }], ref: 's2' },
    { q: 'An OCS cable has how many fibers and legs?', opts: [
      { t: '18 fibers; 9 LC duplex legs at each end (8 used + 1 spare)', ok: true, why: 'Guide p.20.' }, { t: '144 fibers; 18 legs', ok: false, why: 'That is the 144F trunk.' },
      { t: '8 fibers; 1 MPO leg', ok: false, why: 'OCS cables use LC legs.' }, { t: '24 fibers; 12 legs', ok: false, why: '18 fibers, 9 legs.' }], ref: 's3' },
    { q: 'OCS 2\'s leg labeled 15 (red) plugs into which pp1 port?', opts: [
      { t: 'Port 15, on side B', ok: true, why: 'The label is the port. OCS 2\'s ports 13-16 are on side B.' }, { t: 'Port 7', ok: false, why: 'Port 7 is OCS 1\'s red leg.' },
      { t: 'Port 15, on side A', ok: false, why: 'Side A holds ports 1-12.' }, { t: 'It is the spare', ok: false, why: 'The spare is yellow (position 9).' }], ref: 's5' },
    { q: 'What does a yellow LEG on an OCS cable mean?', opts: [
      { t: 'It is position 9 — the spare (fibers 17 and 18)', ok: true, why: 'Guide p.20-21.' }, { t: 'It goes to SPOCS 3', ok: false, why: 'The jacket color picks the SPOCS rack; a yellow leg is the spare.' },
      { t: 'It plugs into port 9', ok: false, why: 'Port 9 takes OCS 2\'s blue leg (labeled 9).' }, { t: 'It is damaged', ok: false, why: 'Yellow is simply the 9th TIA-598 color.' }], ref: 's4' }
  ]
});

COURSE.lessons.push({
  id: 'l11', num: 11, title: 'The OCS cable at the SPOCS rack', short: 'OCS at the SPOCS rack', video: 'v11', mins: 18,
  pages: 'Guide p.19, 21-23',
  objectives: [
    'Recognize a SPOCS rack, its 4 slots and the 320-port OCS shelf.',
    'Land the 8 legs on the right slots using the 4 leg lengths.',
    'Use port X and X+1 the same way on every slot of all 3 SPOCS racks.',
    'Dress the bundle correctly: split point, left or right side, Tier 1, slack and spares.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'Inside a SPOCS rack',
      figs: [{ dg: 'spocsRack', o: {}, cap: 'SPOCS rack (guide p.19). Only the 4 OCS shelves are yours.' }],
      html: `<ul><li>The SPOCS rack holds <b>4 OCS shelves</b>, one in each <b>[[slot]]</b>.</li>
<li>The slots count from the <b>top down</b>: <b>slot 1 is the top shelf</b>, slot 4 the bottom shelf.</li>
<li>The power, TROSS, rectifier and battery shelves are not OCS slots. They are not yours.</li></ul>` },
    { id: 's2', stage: 'Recognize', title: 'The OCS shelf: 320 LC ports',
      figs: [{ dg: 'ocsShelf', o: { hl: [17, 18] }, cap: 'One OCS shelf (guide p.19, 22). The pair 017/018 is marked as an example.' }],
      html: `<ul><li>Each shelf has <b>320 LC ports</b>, numbered with 3 digits: <b>001 to 320</b>.</li>
<li>Each box on the drawing is a <b>pair</b>: <b>odd port on top, even below</b>.</li>
<li>Ports count <b>down a column of 20</b>, then move right: 001-020 in the first column, 021-040 in the next …</li>
<li>Ports <b>145-160</b> (grey) are <b>not used</b>.</li>
<li>Left half = ports 001-160, for <b>TPU 1-72</b>. Right half = ports 161-320, for <b>TPU 73-144</b>.</li></ul>` },
    { id: 's3', stage: 'Understand', title: 'Which leg goes to which slot',
      figs: [{ dg: 'spocsRack', o: { legs: true, cable: 1 }, cap: 'One OCS bundle landing on a SPOCS rack (guide p.21). The shortest legs go to the top slot.' }],
      html: `<table class="t center"><thead><tr><th>Legs (position)</th><th>Colors</th><th>Leg length</th><th>Slot</th></tr></thead><tbody>
<tr><td>1-2</td><td>blue, orange</td><td><b>1480 mm</b> (about 4 ft 10 in)</td><td>Slot 1 (top)</td></tr>
<tr><td>3-4</td><td>green, brown</td><td><b>1840 mm</b> (about 6 ft 0 in)</td><td>Slot 2</td></tr>
<tr><td>5-6</td><td>slate, white</td><td><b>2200 mm</b> (about 7 ft 3 in)</td><td>Slot 3</td></tr>
<tr><td>7-8</td><td>red, black</td><td><b>2560 mm</b> (about 8 ft 5 in)</td><td>Slot 4 (bottom)</td></tr>
<tr class="spare"><td>9</td><td>yellow</td><td>—</td><td>spare</td></tr></tbody></table>
<p>The legs are made in 4 lengths so each one reaches its shelf from the split point above the rack. <b>If a leg seems too short or far too long for its slot, it is probably the wrong leg.</b></p>
<p class="muted">For cable 2 the labels are 9-16 and for cable 3 they are 17-24, but the positions and colors are the same: the first two legs go to slot 1, and so on.</p>` },
    { id: 's4', stage: 'Understand', title: 'Port X and X+1',
      html: `<ol><li>The cutsheet (or BOM Builder) gives your TPU rack a port number <b>[[portX|X]]</b>.</li>
<li><b>Each slot gets 2 LC duplex legs: one on port X and one on port X+1. The odd leg goes on X.</b></li>
<li><b>All cables from one TPU rack use the same port numbers on every slot and on all 3 SPOCS racks.</b></li></ol>
<p class="formula">legs 1, 3, 5, 7 → port X (slots 1, 2, 3, 4) &nbsp;·&nbsp; legs 2, 4, 6, 8 → port X+1</p>
<p class="muted">Guide p.21: "X and X+1 matched on all 8,640 OCS bundles in the reference cutsheet. Your rack's X is on your cutsheet."</p>
<div class="callout info"><b>Why the same X everywhere?</b> Each OCS shelf sees one pair of ports per TPU rack. Using the same pair on every shelf in every SPOCS rack keeps each TPU rack in the same place across the whole switch fabric.</div>` },
    { id: 's5', stage: 'Work with it', title: 'Worked example: X = 017',
      html: `<div class="callout info">The guide's own drawing (p.21) uses ports <b>017 and 018</b> to show the pattern. Your real X comes from the cutsheet.</div>
<table class="t center"><thead><tr><th>Leg (position)</th><th>Color</th><th>Slot</th><th>Port</th></tr></thead><tbody>
<tr><td>1</td><td>blue</td><td>1</td><td>017 (X)</td></tr><tr><td>2</td><td>orange</td><td>1</td><td>018 (X+1)</td></tr>
<tr><td>3</td><td>green</td><td>2</td><td>017</td></tr><tr><td>4</td><td>brown</td><td>2</td><td>018</td></tr>
<tr><td>5</td><td>slate</td><td>3</td><td>017</td></tr><tr><td>6</td><td>white</td><td>3</td><td>018</td></tr>
<tr><td>7</td><td>red</td><td>4</td><td>017</td></tr><tr><td>8</td><td>black</td><td>4</td><td>018</td></tr>
<tr class="spare"><td>9</td><td>yellow</td><td colspan="2">spare: label, coil, top of rack*</td></tr></tbody></table>
<p>Repeat the <b>same ports</b> with the orange cable at SPOCS rack 2 and the yellow cable at SPOCS rack 3. Port 017 is in the <b>left half</b> (001-160), so this TPU rack is in TPU 1-72 and its bundles <b>dress left</b>.</p>
<p class="muted">* Spare handling: ask your lead (drawings: coil on top of the rack; reference cutsheet: "left hanging").</p>` },
    { id: 's6', stage: 'Work with it', title: 'Pulling and dressing the OCS bundles',
      html: `<ol class="steps"><li><b>Pull from the OCS rack to the TPU rack.</b> Start at the SPOCS rack.</li>
<li><b>Split point:</b> where the bundle breaks into legs, <b>12 to 18 inches above the top of the OCS rack</b>.</li>
<li><b>Which side?</b> Bundles from <b>TPU 1-72</b> exit the tray on the <b>left</b> side of the OCS rack and are dressed on the left. <b>TPU 73-144</b> exit and dress on the <b>right</b>.</li>
<li><b>Tier 1 tray.</b> Do not secure bundles to the tray except at corners, exits and vertical runs: secure 3 times at each corner and exit (DRS 01.00.03 rule 2). Use a waterfall where they leave the tray, centered over the rack VCM (DRS 01.00.02 rule 3; DRS 01.00.03 rule 4), and at every vertical transition (DRS 01.00.03.01 rule 4).</li>
<li><b>Velcro</b> (1/2 inch) every 12-18 inches (DRS 01.00.03 rules 1, 3). No zip ties (DRS 01.00.01 rule 2). Keep bends wide: at least 20 × the cable diameter while pulling (DRS 01.00.01 rule 3). Nothing touches the floor.</li>
<li><b>Slack:</b> store OCS slack on top of the <b>TPU rack</b>. Never in the tray.</li>
<li><b>Spares</b> (fibers 17-18): label, coil, top of rack — or as your site decided.</li>
<li><b>Labels:</b> wrap-around on the bundle 1-2 in from the boot at each end; flag label on each leg 4 in from the boot.</li></ol>
<div class="callout info"><b>Which TPU number is my rack?</b> The guide splits racks as "TPU 1-72" and "TPU 73-144" but does not list which physical rack has which number. Device names include the rack's number in its pod (for example <code>rack1</code>). Confirm on the cutsheet — your port X also tells you: 001-160 is the left half, 161-320 the right.</div>` },
    { id: 's7', stage: 'Apply', title: 'Guided practice: slots and ports',
      act: { type: 'match', id: 'a11-match', title: 'Where does each leg land?', intro: 'Your cutsheet says X = 133. Choose the slot and port for each leg of the red cable.',
        pairs: [['Leg 1 (blue)', 'Slot 1, port 133'], ['Leg 2 (orange)', 'Slot 1, port 134'], ['Leg 5 (slate)', 'Slot 3, port 133'], ['Leg 6 (white)', 'Slot 3, port 134'], ['Leg 8 (black)', 'Slot 4, port 134']],
        extra: ['Slot 2, port 133', 'Slot 4, port 133', 'Slot 1, port 135'],
        why: 'Legs go to slots in pairs (1-2 slot 1 … 7-8 slot 4). Odd legs on X = 133, even legs on X+1 = 134.' } },
    { id: 's8', stage: 'Apply', title: 'Independent practice',
      act: { type: 'scenario', id: 'a11-scen', title: 'Decide',
        qs: [
          { q: 'Your cutsheet gives <b>X = 241</b>. Which side of the SPOCS rack do these bundles exit and dress on?', opts: [
            { t: 'Right — 241 is in the right half (161-320), TPU 73-144', ok: true, why: 'Guide p.22 notes 5-6.' },
            { t: 'Left — all bundles dress left', ok: false, why: 'Only TPU 1-72 (ports 001-160) dress left.' },
            { t: 'Either side', ok: false, why: 'The side is set by the half of the shelf.' }, { t: 'Through the top center', ok: false, why: 'Left or right side only.' }] },
          { q: 'With X = 241, where does <b>leg 4 (brown)</b> of the orange cable go?', opts: [
            { t: 'SPOCS rack 2, slot 2, port 242', ok: true, why: 'Orange → SPOCS 2. Legs 3-4 → slot 2. Even leg → X+1 = 242.' },
            { t: 'SPOCS rack 2, slot 4, port 241', ok: false, why: 'Slot 4 is for legs 7-8; brown is leg 4.' },
            { t: 'SPOCS rack 1, slot 2, port 242', ok: false, why: 'The orange cable goes to SPOCS rack 2.' },
            { t: 'SPOCS rack 2, slot 2, port 241', ok: false, why: 'Even legs go on X+1.' }] },
          { q: 'You are holding a leg that is <b>2560 mm</b> long. Which slot is it for?', opts: [
            { t: 'Slot 4, the bottom shelf (legs 7-8)', ok: true, why: 'Longest legs go to the lowest slot.' }, { t: 'Slot 1', ok: false, why: 'Slot 1 gets the shortest legs, 1480 mm.' },
            { t: 'Slot 2', ok: false, why: 'Slot 2 gets 1840 mm.' }, { t: 'It is the spare', ok: false, why: 'The spare is the yellow 9th leg.' }] },
          { q: 'Where is OCS cable slack stored?', opts: [
            { t: 'On top of the TPU rack, never in the tray', ok: true, why: 'Guide p.22 note 3.' }, { t: 'Coiled in the Tier 1 tray', ok: false, why: 'Never in the tray.' },
            { t: 'On the floor behind the SPOCS rack', ok: false, why: 'Nothing touches the floor.' }, { t: 'Inside the SPOCS rack', ok: false, why: 'On top of the TPU rack.' }] }
        ] } }
  ],
  check: [
    { q: 'In a SPOCS rack, which shelf is slot 1?', opts: [
      { t: 'The top OCS shelf', ok: true, why: 'Slots count from the top down (p.19).' }, { t: 'The bottom OCS shelf', ok: false, why: 'Slot 4 is the bottom.' },
      { t: 'The power shelf', ok: false, why: 'Power is not an OCS slot.' }, { t: 'The battery shelf', ok: false, why: 'Batteries are not an OCS slot.' }], ref: 's1' },
    { q: 'Which legs go to slot 3?', opts: [
      { t: 'Legs 5-6 (slate, white), 2200 mm', ok: true, why: 'Guide p.21.' }, { t: 'Legs 3-4', ok: false, why: 'Legs 3-4 go to slot 2.' },
      { t: 'Legs 7-8', ok: false, why: 'Legs 7-8 go to slot 4.' }, { t: 'Only leg 3', ok: false, why: 'Each slot gets two legs.' }], ref: 's3' },
    { q: 'Your X is 089. Where do the odd legs go?', opts: [
      { t: 'Port 089 on every slot, in all 3 SPOCS racks', ok: true, why: 'Odd legs on X; same X everywhere (p.21).' }, { t: 'Port 090', ok: false, why: '090 = X+1 is for even legs.' },
      { t: 'Ports 089, 091, 093, 095 on slots 1-4', ok: false, why: 'The same X on every slot.' }, { t: 'Port 089 in SPOCS 1 only', ok: false, why: 'Same X in all 3 SPOCS racks.' }], ref: 's4' },
    { q: 'Where is the split point of an OCS bundle at the SPOCS rack?', opts: [
      { t: '12 to 18 inches above the top of the OCS rack', ok: true, why: 'Guide p.22 note 2.' }, { t: 'Inside the rack at slot 1', ok: false, why: 'Above the rack.' },
      { t: 'In the tray', ok: false, why: 'Above the rack.' }, { t: '4 inches from the boot', ok: false, why: '4 inches is the flag label distance.' }], ref: 's6' },
    { q: 'Bundles from TPU 1-72 are dressed on which side of the OCS rack?', opts: [
      { t: 'The left side', ok: true, why: 'Guide p.22 note 5.' }, { t: 'The right side', ok: false, why: 'TPU 73-144 dress right.' },
      { t: 'Whichever side is closer', ok: false, why: 'The side is fixed by TPU number.' }, { t: 'Over the top', ok: false, why: 'Left for TPU 1-72.' }], ref: 's6' }
  ]
});

COURSE.lessons.push({
  id: 'l12', num: 12, title: 'Copper / Ethernet: the six home runs', short: 'Copper home runs', video: 'v12', mins: 16,
  pages: 'Guide p.8, 13-14, 16, 26-27, 31',
  objectives: [
    'Explain what the copper connections do and how they differ from the fiber connections.',
    'Name all six copper runs on a TPU rack, both endpoints of each, and the EOR panel each lands on.',
    'Terminate a home run and patch it to the switch (jack number = port number).',
    'Tell look-alike copper runs apart and label them correctly.'
  ],
  sections: [
    { id: 's1', stage: 'Understand', title: 'What copper does here',
      html: `<p>The fiber you have learned so far carries the <b>AI data</b>: huge amounts, very fast. The copper does a different job. It connects the rack to the <b>management network</b>:</p>
<ul><li><b>Management (ETH / GIG E 1):</b> a separate network ([[OOB]], out-of-band) people use to set up, monitor and control equipment, even when the main data network is down.</li>
<li><b>[[console|Console]]:</b> a direct, text-only connection to a device for first setup and recovery. All console runs go to the console switch in the EOR rack.</li></ul>
<p>Copper is <b>[[CAT6]]</b> cable with an <b>[[RJ45]]</b> plug.</p>`,
      figs: [{ dg: 'mgmtFlow', o: {}, cap: 'The management path: copper to the EOR rack, then fiber uplinks to the management spines (lesson 13).' }] },
    { id: 's2', stage: 'Recognize', title: 'The six copper runs on one TPU rack',
      html: `<table class="t"><thead><tr><th>From (TPU rack)</th><th>Port</th><th>Goes to (same row's EOR rack)</th></tr></thead><tbody>
<tr><td>TOR (side A)</td><td><b>ETH</b> (Management1)</td><td>Copper panel <b>RU 24</b> → MGMT leaf</td></tr>
<tr><td>TOR (side A)</td><td><b>CONSOLE</b></td><td>Copper panel <b>RU 30</b> → console switch</td></tr>
<tr><td>TROSS / RMU1 (side A, RU 38)</td><td><b>GIG E 1</b></td><td>Copper panel <b>RU 22</b> → TROSS leaf</td></tr>
<tr><td>TROSS / RMU1</td><td><b>CONSOLE</b></td><td>Copper panel <b>RU 30</b> → console switch</td></tr>
<tr><td>TROSS / RMU2 (side B, RU 38)</td><td><b>GIG E 1</b></td><td>Copper panel <b>RU 22</b> → TROSS leaf</td></tr>
<tr><td>TROSS / RMU2</td><td><b>CONSOLE</b></td><td>Copper panel <b>RU 30</b> → console switch</td></tr></tbody></table>
<p class="muted">Guide p.14 table and p.26. Checked in the guide: "jack number = switch port number on all 2,592 copper runs in this hall's patch data" (432 racks × 6 = 2,592).</p>`,
      figs: [{ dg: 'rmuFace', o: {}, cap: 'TROSS / RMU units. Look for the ports labeled GIG E 1 and CONSOLE (positions simplified in the guide).' }] },
    { id: 's3', stage: 'Work with it', title: 'The TPU end: home runs',
      html: `<ul><li>Each cable is a <b>[[homerun|home run]]</b>: an <b>RJ45 plug at the TPU rack</b>, running straight to a <b>jack on the EOR copper panel</b>. There is <b>no panel at the TPU end</b>.</li>
<li>Each TROSS / RMU sends 2 CAT6 cables to the EOR rack in the same row: GIG E 1 and CONSOLE.</li>
<li>The TOR's two copper ports (ETH and CON) are at the right end of the switch.</li></ul>` },
    { id: 's4', stage: 'Work with it', title: 'The EOR end: jacks and patch cords',
      figs: [{ dg: 'copperPanel', o: { cords: [1, 10] }, cap: 'Each home run ends on a jack. A short CAT6 patch cord connects jack N to switch port N (guide p.27).' }],
      html: `<ol class="steps"><li><b>Find the panel:</b> console runs at <b>RU 30</b>, TOR management runs at <b>RU 24</b>, TROSS / RMU GIG E 1 runs at <b>RU 22</b>.</li>
<li><b>Terminate</b> each home run on the <b>jack the cutsheet gives you</b>. (To terminate is to attach the cable's wires to the jack.)</li>
<li><b>Patch:</b> connect the jack to the switch with a short CAT6 patch cord. <b>The jack number is the switch port number</b>: jack 10 goes to port 10.</li>
<li><b>VCM:</b> cables exit between the fingers closest to the switch they patch. Slack on the downstream side. Velcro only. Nothing touches the floor.</li>
<li><b>Label:</b> flag label 4 inches from the plug at each end, printed on both sides.</li></ol>
<div class="callout info"><b>Simple math check (derived, not stated in the guide):</b> one EOR serves 9 TPU racks, so its RU 24 panel gets 9 TOR management runs, RU 22 gets 18 GIG E 1 runs, and RU 30 gets 27 console runs (3 per rack). Each panel has 48 jacks.</div>` },
    { id: 's5', stage: 'Work with it', title: 'Routing and labels',
      html: `<ul><li><b>Tray:</b> at this site CAT6 runs in <b>Tier 2</b> with the 144F trunks (guide p.7, 16, 31). Use a waterfall where cables leave the tray, on the side of the rack you patch into (DRS 01.00.02 rules 3, 6).</li>
<li><b>1/2-inch Velcro</b> every 12-18 inches in the tray (DRS 01.00.03 rules 1, 3). No zip ties. Nothing touches the floor.</li>
<li><b>Flag label 4 inches from the plug at each end</b>, both sides printed, matching the cutsheet.</li>
<li><b>Color:</b> orange = OOB management. Check which color your site stocks.</li></ul>
<div class="callout conflict"><b>Conflict — ask your lead:</b> guide p.14 says to run copper in the Tier 1 tray. Pages 7, 16 and 31 say CAT6 is in Tier 2 at this site and that it changed recently.</div>
<div class="callout info"><b>Not in the guide:</b> the copper termination standard (T568A or T568B), the jack type, and any copper test or certification step. Ask your lead what your site requires.</div>` },
    { id: 's6', stage: 'Connect', title: 'Telling look-alike runs apart',
      html: `<p>All six runs are the same kind of cable, often the same color. What makes each one different is <b>where it starts and where it ends</b>:</p>
<table class="t"><thead><tr><th>Look-alikes</th><th>How to tell them apart</th></tr></thead><tbody>
<tr><td>TOR <b>ETH</b> vs TOR <b>CONSOLE</b></td><td>Same switch, different ports. ETH → RU 24 (MGMT leaf). CONSOLE → RU 30 (console switch).</td></tr>
<tr><td>RMU <b>GIG E 1</b> vs RMU <b>CONSOLE</b></td><td>Same unit, different ports. GIG E 1 → RU 22 (TROSS leaf). CONSOLE → RU 30.</td></tr>
<tr><td><b>RMU1</b> vs <b>RMU2</b> runs</td><td>RMU1 is on side A, RMU2 on side B (both RU 38). Labels say rmu1 or rmu2.</td></tr>
<tr><td>Copper home run vs <b>patch cord</b></td><td>The home run comes from the TPU rack and is terminated on the jack. The patch cord is short and goes jack → switch.</td></tr></tbody></table>
<p class="tip"><b>The rule:</b> all <b>four console</b> runs go to <b>RU 30</b>. The label (line 1 A device and port, line 2 Z device and port) is how you confirm each one.</p>` },
    { id: 's7', stage: 'Apply', title: 'Guided practice: match each run to its panel',
      act: { type: 'match', id: 'a12-match', title: 'Which EOR copper panel?', intro: 'Choose the EOR copper panel for each run.',
        pairs: [['TOR ETH (Management1)', 'RU 24 — MGMT leaf'], ['TOR CONSOLE', 'RU 30 — console switch'], ['RMU1 GIG E 1', 'RU 22 — TROSS leaf'], ['RMU2 CONSOLE', 'RU 30 — console switch'], ['RMU2 GIG E 1', 'RU 22 — TROSS leaf']],
        why: 'Management from the TOR → RU 24. GIG E 1 from either TROSS / RMU → RU 22. Every console → RU 30.' } },
    { id: 's8', stage: 'Apply', title: 'Independent practice: spot the problem',
      act: { type: 'scenario', id: 'a12-scen', title: 'Is this right?',
        qs: [
          { q: 'A home run from a TOR\'s ETH port has been terminated on the RU 30 panel. What is wrong?', opts: [
            { t: 'TOR ETH (management) belongs on the RU 24 panel for the MGMT leaf. RU 30 is for console runs.', ok: true, why: 'Guide p.14 table.' },
            { t: 'Nothing; any copper panel works', ok: false, why: 'Each panel feeds a different switch.' },
            { t: 'It should be on RU 22', ok: false, why: 'RU 22 is for TROSS GIG E 1 runs.' },
            { t: 'It should go to the TPU rack\'s own panel', ok: false, why: 'There is no panel at the TPU end.' }] },
          { q: 'A home run is terminated on jack 17 of the RU 22 panel. Which switch port does its patch cord go to?', opts: [
            { t: 'Port 17 on the TROSS leaf', ok: true, why: 'Jack number = switch port number; RU 22 feeds the TROSS leaf.' },
            { t: 'Port 17 on the MGMT leaf', ok: false, why: 'RU 22 feeds the TROSS leaf.' },
            { t: 'Port 1 — patch cords start at port 1', ok: false, why: 'The jack number is the port number.' },
            { t: 'Whatever port is open', ok: false, why: 'Jack 17 → port 17.' }] },
          { q: 'Where do copper runs get their labels?', opts: [
            { t: 'A flag label 4 inches from the plug at each end, printed on both sides', ok: true, why: 'Guide p.14 note 5, p.16, p.27.' },
            { t: 'A wrap-around label 1-2 inches from the plug', ok: false, why: 'Wrap-around labels are for trunks.' },
            { t: 'Only at the EOR end', ok: false, why: 'Both ends.' }, { t: 'A handwritten tag at the jack', ok: false, why: 'Machine printed only.' }] }
        ] } }
  ],
  check: [
    { q: 'What is the copper (CAT6) cabling on a TPU rack used for?', opts: [
      { t: 'Management and console connections to the EOR rack', ok: true, why: 'All six runs are management, TROSS GIG E 1 and console (p.14).' },
      { t: 'The main AI data', ok: false, why: 'AI data goes over the 144F trunk and OCS fiber.' },
      { t: 'Power for the TOR switch', ok: false, why: 'These are network cables, not power.' }, { t: 'Connecting to the SPOCS racks', ok: false, why: 'OCS fiber goes to the SPOCS racks.' }], ref: 's1' },
    { q: 'Which EOR copper panel receives every console run?', opts: [
      { t: 'RU 30', ok: true, why: 'TOR, RMU1 and RMU2 consoles all go to RU 30 (p.14).' }, { t: 'RU 24', ok: false, why: 'RU 24 is TOR management.' },
      { t: 'RU 22', ok: false, why: 'RU 22 is TROSS GIG E 1.' }, { t: 'RU 39', ok: false, why: 'RU 39 is the LC panel for management trunks.' }], ref: 's2' },
    { q: 'What is at the TPU-rack end of a copper home run?', opts: [
      { t: 'An RJ45 plug, straight into the device port — no panel', ok: true, why: 'Guide p.14 note 2.' }, { t: 'A jack on a copper panel in the TPU rack', ok: false, why: 'There is no panel at the TPU end.' },
      { t: 'An LC connector', ok: false, why: 'LC is fiber.' }, { t: 'A patch cord to the OCS panel', ok: false, why: 'The OCS panel is fiber.' }], ref: 's3' },
    { q: 'At the EOR copper panel, how do you know which switch port a jack connects to?', opts: [
      { t: 'The jack number is the switch port number', ok: true, why: 'Guide p.14 and p.27.' }, { t: 'Count from the right', ok: false, why: 'Jack N → port N.' },
      { t: 'Use the next open port', ok: false, why: 'Jack N → port N.' }, { t: 'Add 24 to the jack number', ok: false, why: 'Jack N → port N.' }], ref: 's4' }
  ]
});

COURSE.lessons.push({
  id: 'l13', num: 13, title: 'Management trunks and SPOCS management', short: 'Management trunks', video: 'v13', mins: 16,
  pages: 'Guide p.25, 28-31',
  objectives: [
    'Recognize the RU 39 LC panel and tell a 12F trunk from a 24F trunk.',
    'Land the trunks on the correct positions for management spine 1 and spine 2.',
    'Say what rides on each duplex.',
    'Route the SPOCS management cords to the right EOR w/BMS rack.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'The RU 39 LC panel',
      html: `<p>Every AIO rack has one <b>1RU LC panel at RU 39</b> for its management trunks. The management switches in the rack (MGMT leaf, TROSS leaf) reach the <b>[[mgmtspine|management spines]]</b> through it.</p>
<ul><li>Columns A-L, each with <b>2 positions</b> (A1 A2, B3 B4 … L23 L24), in <b>3 rows</b> (row 1 at the bottom).</li>
<li>The <b>trunk lands on the rear</b> of the panel. The <b>switch cords plug into the front</b>. Switch cords are <b>2-fiber LC duplex</b> patch cords.</li>
<li>The rear view is the mirror image (column A on the right).</li></ul>` },
    { id: 's2', stage: 'Understand', title: '12F for standard racks, 24F for w/BMS racks',
      html: `<p>Each AIO rack connects to <b>each</b> of the 2 management spines with one trunk:</p>
<table class="t center"><thead><tr><th>Rack type</th><th>Trunk</th><th>Duplex legs</th><th>Spine 1 positions</th><th>Spine 2 positions</th></tr></thead><tbody>
<tr><td>AIO EOR</td><td><b>12F</b></td><td>6</td><td>A1:A2, rows 1-3</td><td>C5:C6, rows 1-3</td></tr>
<tr><td>AIO EOR w/BMS (611, 613, 1411, 1413, 2211, 2213)</td><td><b>24F</b></td><td>12</td><td>A1:B4, rows 1-3</td><td>C5:D8, rows 1-3</td></tr></tbody></table>
<p class="muted">"A1:A2, rows 1-3" means positions A1 and A2 in all 3 rows. Management spine racks: R131 and R204.</p>`,
      figs: [{ dg: 'lcPanel', o: { type: '12F' }, cap: '12F (standard AIO EOR): front view, duplex numbers shown (guide p.28).' }, { dg: 'lcPanel', o: { type: '24F' }, cap: '24F (AIO EOR w/BMS): front view, duplex numbers shown (guide p.29).' }] },
    { id: 's3', stage: 'Understand', title: 'What rides on each duplex',
      html: `<div class="two"><div><h3 class="h4">12F trunk</h3><table class="t"><tbody>
<tr><td>Duplex 1</td><td>MGMT LEAF uplink</td></tr><tr><td>Duplex 2</td><td>TROSS LEAF uplink</td></tr><tr><td>Duplex 3-6</td><td>Spares</td></tr></tbody></table></div>
<div><h3 class="h4">24F trunk (w/BMS)</h3><table class="t"><tbody>
<tr><td>Duplex 1</td><td>MGMT LEAF uplink</td></tr><tr><td>Duplex 2</td><td>TROSS LEAF uplink</td></tr><tr><td>Duplex 3</td><td><b>FB0 BMS uplink</b></td></tr>
<tr><td>Duplex 4-9</td><td>SPOCS management uplinks, 3 SPOCS racks</td></tr><tr><td>Duplex 10-12</td><td>Spares</td></tr></tbody></table></div></div>
<p>The <b>same duplex number</b> is used on the spine 1 trunk and the spine 2 trunk. On the guide's drawings the duplex numbers count <b>up each column, bottom to top</b>: A1 row 1 = 1, A1 row 2 = 2, A1 row 3 = 3, A2 row 1 = 4 … <b>The cutsheet gives the exact panel position for each cord.</b></p>` },
    { id: 's4', stage: 'Work with it', title: 'Landing the management trunks',
      html: `<ol class="steps"><li><b>Confirm the rack type.</b> w/BMS racks (611, 613, 1411, 1413, 2211, 2213) get <b>24F</b>; all others get <b>12F</b>.</li>
<li><b>Rear:</b> land the spine 1 trunk on A1:A2 (12F) or A1:B4 (24F), rows 1-3. Land the spine 2 trunk on C5:C6 (12F) or C5:D8 (24F), rows 1-3.</li>
<li><b>Front:</b> plug the switch cords: duplex 1 MGMT leaf, duplex 2 TROSS leaf, duplex 3 FB0 BMS (w/BMS only).</li>
<li><b>Slack:</b> store trunk slack (above the split point) on top of the rack. Never in the tray.</li>
<li><b>Labels:</b> wrap-around label on the trunk 1-2 inches from each boot; flag label on each patch cord.</li>
<li><b>Far end:</b> at the management spine rack (R131 / R204) each trunk lands on a panel; from the panel front a <b>breakout harness</b> joins 4 LC legs into one MPO-8 plug at the spine port. The cutsheet gives the panel and position. <b>Final patching at the management spine rack must be done before rack turn-up.</b></li></ol>
<div class="callout conflict"><b>Correction noted in the guide (p.30):</b> one drawing says the w/BMS rack uses a 12F trunk. The AIO w/BMS patching drawing and the hall's patch data both say <b>24F</b>, and the guide follows 24F. Confirm with your lead.</div>` },
    { id: 's5', stage: 'Connect', title: 'SPOCS management uplinks',
      figs: [{ dg: 'spocsMgmt', o: {}, cap: 'SPOCS management uplinks pass through the nearest AIO EOR w/BMS rack (guide p.30).' }],
      html: `<ul><li>Each SPOCS rack has <b>2 management switches</b> near the top (pre-installed): <b>mgmt1</b> and <b>mgmt2</b>.</li>
<li><b>mgmt1 → the w/BMS rack at spot 11</b> of its pod's w/BMS row. <b>mgmt2 → the w/BMS rack at spot 13.</b> Pod 10 uses 611 / 613, pod 11 uses 1411 / 1413, pod 12 uses 2211 / 2213.</li>
<li>Each switch has <b>2 uplinks, one toward each spine</b>.</li>
<li>Each uplink is a <b>long 2-fiber LC cord</b> that runs straight to the <b>front</b> of the w/BMS rack's RU 39 LC panel, into a position whose rear carries the 24F trunk. The cutsheet gives the exact position. No trunk is used for this hop.</li>
<li>Velcro only. Nothing touches the floor. Flag label both ends. The cords leave the SPOCS rack from the top.</li></ul>
<div class="callout conflict"><b>Open question:</b> the 24F table reserves 6 duplex positions (4-9) for SPOCS uplinks on each trunk. The description on p.30 works out to 3 SPOCS uplinks per trunk (3 SPOCS racks × 1 switch × 1 uplink toward that spine). Use the exact positions on the cutsheet and ask your lead if they do not match.</div>` },
    { id: 's6', stage: 'Apply', title: 'Guided practice: click the position',
      act: { type: 'pick', id: 'a13-pick', title: 'RU 39 LC panel (24F, w/BMS rack)', dg: 'lcPanel', o: { type: '24F' }, clickPrefix: 'lc-',
        tasks: [
          { q: 'Spine <b>1</b> trunk, duplex <b>1</b> (MGMT leaf uplink). Click its position.', ok: ['lc-A1-1'], hint: 'Spine 1 starts at A1. Duplex numbers count up the column from row 1.', why: 'A1, row 1 = duplex 1 on the spine 1 trunk.' },
          { q: 'Spine <b>2</b> trunk, duplex <b>3</b> (FB0 BMS uplink). Click its position.', ok: ['lc-C5-3'], hint: 'Spine 2 starts at C5. Duplex 3 is the top of the first column.', why: 'C5, row 3 = duplex 3 on the spine 2 trunk.' },
          { q: 'Spine <b>1</b> trunk, duplex <b>10</b> (a spare). Click its position.', ok: ['lc-B4-1'], hint: '1-3 in A1, 4-6 in A2, 7-9 in B3 …', why: 'B4, row 1 = duplex 10.' }
        ] } },
    { id: 's7', stage: 'Apply', title: 'Independent practice',
      act: { type: 'scenario', id: 'a13-scen', title: 'Decide',
        qs: [
          { q: 'AIO rack <b>R0911</b>. Which management trunks does it get?', opts: [
            { t: 'Two 12F trunks: spine 1 on A1:A2, spine 2 on C5:C6, rows 1-3', ok: true, why: '911 is a standard AIO EOR (not w/BMS).' },
            { t: 'Two 24F trunks', ok: false, why: '24F is only for the six w/BMS racks.' },
            { t: 'One 12F trunk to spine 1 only', ok: false, why: 'One trunk to each of the 2 spines.' },
            { t: 'One 24F trunk shared by both spines', ok: false, why: 'One trunk per spine.' }] },
          { q: 'SPOCS rack <b>1512</b> (pod 11). Where do its <b>mgmt2</b> uplink cords go?', opts: [
            { t: 'The front of the RU 39 LC panel in w/BMS rack 1413', ok: true, why: 'mgmt2 → spot 13 of pod 11\'s w/BMS row → 1413.' },
            { t: 'Rack 1411', ok: false, why: '1411 (spot 11) takes mgmt1.' },
            { t: 'Rack 1513', ok: false, why: '1513 is not a w/BMS rack.' },
            { t: 'Straight to the management spine', ok: false, why: 'They pass through the w/BMS rack\'s 24F trunks.' }] },
          { q: 'On a w/BMS rack\'s 24F trunk, what rides on duplex 3?', opts: [
            { t: 'The FB0 BMS uplink', ok: true, why: 'Guide p.29.' }, { t: 'The TROSS leaf uplink', ok: false, why: 'That is duplex 2.' },
            { t: 'A spare', ok: false, why: 'Spares are 10-12 on a 24F.' }, { t: 'SPOCS management', ok: false, why: 'SPOCS uses duplex 4-9.' }] }
        ] } }
  ],
  check: [
    { q: 'Where do management trunks land in the AIO rack?', opts: [
      { t: 'The rear of the 1RU LC panel at RU 39', ok: true, why: 'Guide p.28-29.' }, { t: 'The MPO 4RU panel at RU 32', ok: false, why: 'That panel is for 144F / 192F.' },
      { t: 'The copper panel at RU 24', ok: false, why: 'Copper panels take copper home runs.' }, { t: 'The front of the LC panel', ok: false, why: 'Trunks land on the rear; switch cords plug in front.' }], ref: 's1' },
    { q: 'Which racks use 24F management trunks?', opts: [
      { t: 'The six AIO EOR w/BMS racks: 611, 613, 1411, 1413, 2211, 2213', ok: true, why: 'Guide p.25, 29, 31.' }, { t: 'All AIO racks', ok: false, why: 'Standard AIO racks use 12F.' },
      { t: 'The SPOCS racks', ok: false, why: 'SPOCS racks use long 2F LC cords.' }, { t: 'Only R131 and R204', ok: false, why: 'Those are the management spine racks.' }], ref: 's2' },
    { q: 'On a 12F management trunk, what rides on duplex 1?', opts: [
      { t: 'The MGMT leaf uplink', ok: true, why: 'Guide p.28.' }, { t: 'The TROSS leaf uplink', ok: false, why: 'Duplex 2.' },
      { t: 'The FB0 BMS uplink', ok: false, why: 'Only on 24F trunks, duplex 3.' }, { t: 'A spare', ok: false, why: 'Duplex 3-6 are spares on a 12F.' }], ref: 's3' },
    { q: 'When must final patching at the management spine rack be done?', opts: [
      { t: 'Before rack turn-up', ok: true, why: 'Guide p.30 note 6.' }, { t: 'After the rack is online', ok: false, why: 'Before turn-up.' },
      { t: 'Only if the link fails', ok: false, why: 'It is required before turn-up.' }, { t: 'At the end of the project', ok: false, why: 'Before turn-up.' }], ref: 's4' }
  ]
});

COURSE.lessons.push({
  id: 'l14', num: 14, title: 'BMS: building management connections', short: 'BMS', video: 'v14', mins: 14,
  pages: 'Guide p.8, 25-26, 29-31, 46-47',
  objectives: [
    'Explain what a Building Management System (BMS) is and why a data hall needs one.',
    'Identify the six EOR w/BMS racks and what they add (FB0 BMS switch, copper panel, 24F trunks).',
    'Trace how BMS information travels from the FB0 BMS switch to the management spines.',
    'Know what you connect and verify for BMS, and which details to ask your lead about.'
  ],
  sections: [
    { id: 's1', stage: 'Understand', title: 'What a BMS is',
      html: `<p><b>[[BMS]]</b> stands for <b>Building Management System</b>: a control system that <b>monitors and manages a building's mechanical and electrical systems</b> (TechTarget). Typical BMS jobs include:</p>
<ul><li>watching <b>power</b> and <b>cooling</b> equipment,</li><li><b>water detection</b> (leaks),</li><li><b>fire safety</b>, lighting and access,</li><li>raising an <b>alarm</b> when a reading goes outside its safe range.</li></ul>
<p>How it works in general: sensors and controllers around the building send readings over a network to the BMS, which shows them on screens and sends alerts. <b>A BMS can only see what its network can reach</b>, which is where your cabling comes in.</p>
<div class="callout info">The paragraph above is general background. The guide itself only describes the BMS network connections in the EOR racks; it does not say which building systems are monitored in this hall.</div>` },
    { id: 's2', stage: 'Recognize', title: 'What the guide says about BMS',
      html: `<ul><li><b>Two types of AIO rack:</b> the AIO EOR and the <b>AIO EOR [[wbms|w/BMS]]</b> (with Building Management System). The w/BMS type <b>adds an [[FB0|FB0 BMS switch]] and a copper panel</b> (guide p.26).</li>
<li><b>Six w/BMS racks</b> in this hall: <b>611, 613, 1411, 1413, 2211, 2213</b> — two per pod, in the middle SPOCS row of each pod (rows 6, 14, 22), marked "EOR bms" on the map.</li>
<li><b>Their management trunks are 24F</b>, not 12F (p.29).</li>
<li><b>Duplex 3</b> of each 24F trunk carries the <b>FB0 BMS uplink</b> (p.29).</li>
<li>They also carry the <b>SPOCS management uplinks</b> (duplex 4-9, lesson 13).</li>
<li><b>Copper color:</b> blue = BMS (p.8). Check which colors your site stocks.</li></ul>` },
    { id: 's3', stage: 'Connect', title: 'How BMS information travels',
      figs: [{ dg: 'bmsFlow', o: {}, cap: 'BMS path through the hall, built from guide p.26, 29 and 30. The device end is not described in the guide.' }],
      html: `<ol class="steps"><li><b>BMS devices</b> connect by copper to the <b>FB0 BMS switch</b> and its copper panel in a w/BMS EOR rack. <span class="muted">(Which devices, and who runs those cables, is not in the guide.)</span></li>
<li>The <b>FB0 BMS switch</b> uplinks with a 2-fiber LC cord into the <b>front</b> of the RU 39 LC panel, at the <b>duplex 3</b> position.</li>
<li>Behind that position, the <b>24F trunk</b> carries it to the management spine. There is one trunk to <b>spine 1</b> and one to <b>spine 2</b>, both using duplex 3.</li>
<li>At the management spine rack (<b>R131 / R204</b>) the trunk lands on a panel and a breakout harness connects it to the spine port.</li>
<li>From the spines it reaches the systems that collect and display BMS data — <b>past the spines is not yours</b>.</li></ol>
<p><b>Why two trunks?</b> Every AIO rack connects to both management spines, so the management network (BMS included) has two paths.</p>` },
    { id: 's4', stage: 'Work with it', title: 'What you identify, connect, label and verify',
      html: `<table class="t"><thead><tr><th>Step</th><th>At a w/BMS rack (611, 613, 1411, 1413, 2211, 2213)</th></tr></thead><tbody>
<tr><td><b>Identify</b></td><td>Confirm the rack is a w/BMS type ("EOR bms" on the map). Expect an FB0 BMS switch and an extra copper panel.</td></tr>
<tr><td><b>Connect</b></td><td>Land <b>24F</b> trunks on the rear of the RU 39 LC panel: spine 1 on A1:B4, spine 2 on C5:D8, rows 1-3. Plug the switch cords on the front: duplex 1 MGMT leaf, 2 TROSS leaf, <b>3 FB0 BMS</b>.</td></tr>
<tr><td><b>Label</b></td><td>Wrap-around label on each trunk 1-2 in from each boot; flag label on each patch cord.</td></tr>
<tr><td><b>Verify</b></td><td>Both trunks are 24F (not 12F). The FB0 cord is in the duplex 3 position for both spines, per the cutsheet. SPOCS management cords from the pod's 3 SPOCS racks are in (mgmt1 at spot 11, mgmt2 at spot 13). Far ends patched at the management spine rack before turn-up.</td></tr></tbody></table>` },
    { id: 's5', stage: 'Work with it', title: 'What the guide does not cover — ask your lead',
      html: `<div class="callout conflict"><ul class="tight">
<li>Which <b>RU</b> the FB0 BMS switch and its copper panel occupy in the w/BMS rack.</li>
<li>Which <b>BMS devices</b> connect to the FB0 copper panel, where those cables come from, and whether your crew runs them.</li>
<li>What <b>FB0</b> stands for.</li>
<li>Any <b>test</b> required on BMS links.</li></ul></div>
<p>Do not guess these. A missing BMS connection may not show up until someone needs an alarm.</p>` },
    { id: 's6', stage: 'Apply', title: 'Practice: trace the BMS path',
      act: { type: 'trace', id: 'a14-trace', title: 'Follow the FB0 BMS uplink', dg: 'bmsFlow', o: {},
        steps: [
          { hl: ['fb0'], t: 'Start at the <b>FB0 BMS switch</b> in an EOR w/BMS rack.', q: { q: 'Which racks can hold an FB0 BMS switch?', opts: [
            { t: 'Only the six EOR w/BMS racks', ok: true, why: 'The w/BMS type adds the FB0 BMS switch (p.26).' }, { t: 'Every EOR rack', ok: false, why: 'Standard AIO EOR racks do not have it.' },
            { t: 'The SPOCS racks', ok: false, why: 'SPOCS racks have management switches, not FB0.' }, { t: 'The TPU racks', ok: false, why: 'Not in the TPU rack.' }] } },
          { hl: ['e-cord', 'lc'], t: 'A 2-fiber LC cord goes into the <b>front of the RU 39 LC panel</b>.', q: { q: 'Which duplex position does the FB0 BMS uplink use?', opts: [
            { t: 'Duplex 3', ok: true, why: 'Guide p.29.' }, { t: 'Duplex 1', ok: false, why: 'Duplex 1 is the MGMT leaf uplink.' },
            { t: 'Duplex 4-9', ok: false, why: '4-9 are SPOCS uplinks.' }, { t: 'Duplex 10', ok: false, why: '10-12 are spares.' }] } },
          { hl: ['e-t1', 'e-t2'], t: 'Behind the panel, <b>24F trunks</b> carry it onward.', q: { q: 'How many trunks, and of what size?', opts: [
            { t: 'Two 24F trunks — one to each management spine', ok: true, why: 'Guide p.29: one 24F to each spine.' }, { t: 'One 12F trunk', ok: false, why: 'w/BMS racks use 24F, one per spine.' },
            { t: 'Eight 192F trunks', ok: false, why: '192F trunks go to the DCN-PP racks.' }, { t: 'One 24F to spine 1 only', ok: false, why: 'One to each spine.' }] } },
          { hl: ['sp1', 'sp2'], t: 'The trunks end at the <b>management spines</b> in racks R131 and R204. Beyond the spines is not yours.' }
        ] } }
  ],
  check: [
    { q: 'In this project, BMS stands for:', opts: [
      { t: 'Building Management System', ok: true, why: 'Guide p.25.' }, { t: 'Backbone Management Switch', ok: false, why: 'BMS = Building Management System.' },
      { t: 'Battery Monitoring Shelf', ok: false, why: 'BMS = Building Management System.' }, { t: 'Bundle Management Standard', ok: false, why: 'BMS = Building Management System.' }], ref: 's1' },
    { q: 'What does an AIO EOR w/BMS rack add compared with a standard AIO EOR?', opts: [
      { t: 'An FB0 BMS switch and a copper panel; its management trunks are 24F', ok: true, why: 'Guide p.26 and p.29.' }, { t: 'A second MPO panel', ok: false, why: 'It adds the FB0 BMS switch and a copper panel.' },
      { t: 'An OCS shelf', ok: false, why: 'OCS shelves are in SPOCS racks.' }, { t: 'Nothing; the name is just a label', ok: false, why: 'It has extra parts and 24F trunks.' }], ref: 's2' },
    { q: 'Which of these is an EOR w/BMS rack?', opts: [
      { t: '1413', ok: true, why: 'The six are 611, 613, 1411, 1413, 2211, 2213.' }, { t: '1313', ok: false, why: 'Not a w/BMS rack.' },
      { t: '1412', ok: false, why: '1412 is a SPOCS rack.' }, { t: '2311', ok: false, why: 'Not a w/BMS rack.' }], ref: 's2' },
    { q: 'Where does the FB0 BMS uplink travel after the RU 39 LC panel?', opts: [
      { t: 'On duplex 3 of both 24F trunks, to management spines 1 and 2', ok: true, why: 'Guide p.29.' }, { t: 'To the DCN spines through the 192F trunks', ok: false, why: '192F trunks are the data network.' },
      { t: 'To the SPOCS racks', ok: false, why: 'SPOCS racks send their own uplinks to the w/BMS rack.' }, { t: 'Nowhere; it stays in the rack', ok: false, why: 'It is an uplink to the management spines.' }], ref: 's3' }
  ]
});

COURSE.lessons.push({
  id: 'l15', num: 15, title: 'Putting it all together', short: 'Putting it together', video: 'v15', mins: 18,
  pages: 'Guide p.16, 23, 31, 42, 44-45',
  objectives: [
    'Trace every cable of one TPU rack from start to finish.',
    'Use the "done when" checklists before calling work complete.',
    'Know which questions to bring to your lead.'
  ],
  sections: [
    { id: 's1', stage: 'Connect', title: 'One rack, every cable: TPU rack 504',
      html: `<p>Follow TPU rack <b>504</b> (row 5, spot 04) through everything you have learned. Rack 504 is north of the middle aisle, in <b>pod 10</b>, served by <b>EOR 511</b> (a standard AIO EOR, not w/BMS).</p>
<div class="callout info">Values in this walk-through come from the guide's rules and tables. Port X, copper jack numbers and spine line-card ports are on the cutsheet only, so they are shown as "per cutsheet". The row for rack 504 on EOR 511 applies the guide's rule (lowest-numbered rack on the bottom row: 502 → row 1, 503 → row 2, 504 → row 3); confirm it on the cutsheet.</div>
<table class="t"><thead><tr><th>Cable</th><th>A end (rack 504)</th><th>Z end</th></tr></thead><tbody>
<tr><td><b>144F trunk</b></td><td>TOR odd ports 1, 3 … 31 (leg N → port 2N−1). Legs 17-18 spares.</td><td>EOR 511, MPO panel RU 32 <b>front, row 3</b>: A1-3 … H16-3. Legs 17-18 → I17-3, I18-3.</td></tr>
<tr><td><b>192F trunks</b> (from EOR 511)</td><td>Rear columns A-H. Rack 504's legs ride <b>row 3</b> of every trunk (trunk legs 5-6).</td><td>A → R107, B → R114, C → R120, D → R127, E → R207, F → R214, G → R220, H → R227. Panel <b>RU 35</b>, lane <b>AIO-PP3 · CD #1</b>.</td></tr>
<tr><td><b>MPO cords</b></td><td>DCN-PP front, module C-D, row 3</td><td>Spines 1-4 of each group (A: 1-4 … H: 29-32), line-card port per cutsheet.</td></tr>
<tr><td><b>OCS 1 (red)</b></td><td>pp1 ports 1-8</td><td>SPOCS <b>512</b>, slots 1-4, ports X / X+1 per cutsheet</td></tr>
<tr><td><b>OCS 2 (orange)</b></td><td>pp1 ports 9-16</td><td>SPOCS <b>612</b>, same X / X+1</td></tr>
<tr><td><b>OCS 3 (yellow)</b></td><td>pp1 ports 17-24</td><td>SPOCS <b>712</b>, same X / X+1</td></tr>
<tr><td><b>TOR ETH</b></td><td>TOR, ETH (Management1)</td><td>EOR 511 copper panel <b>RU 24</b>, jack per cutsheet → MGMT leaf port with the same number</td></tr>
<tr><td><b>TOR CONSOLE</b></td><td>TOR, CONSOLE</td><td>EOR 511 copper panel <b>RU 30</b> → console switch</td></tr>
<tr><td><b>RMU1 GIG E 1 / CONSOLE</b></td><td>Side A, RU 38</td><td>RU 22 (TROSS leaf) / RU 30 (console)</td></tr>
<tr><td><b>RMU2 GIG E 1 / CONSOLE</b></td><td>Side B, RU 38</td><td>RU 22 (TROSS leaf) / RU 30 (console)</td></tr>
<tr><td><b>Mgmt trunks</b> (EOR 511)</td><td>RU 39 LC panel rear: <b>12F</b> spine 1 on A1:A2, spine 2 on C5:C6, rows 1-3</td><td>Management spines (R131 / R204)</td></tr></tbody></table>`,
      act: { type: 'trace', id: 'a15-trace', title: 'Trace one fiber path: rack 504, leg 1', dg: 'largePath', o: {},
        steps: [
          { hl: ['tpu'], t: 'Start: TPU rack 504, 144F trunk <b>leg 1</b> (blue).', q: { q: 'Which TOR port does leg 1 use?', opts: [
            { t: 'Port 1', ok: true, why: '2 × 1 − 1 = 1.' }, { t: 'Port 2', ok: false, why: 'Even ports go to the machines.' }, { t: 'Port 31', ok: false, why: 'Port 31 is leg 16.' }, { t: 'pp1 port 1', ok: false, why: 'pp1 is the OCS panel.' }] } },
          { hl: ['e144', 'aio'], t: 'The trunk runs to <b>EOR 511</b>, the front of the MPO panel.', q: { q: 'Where does leg 1 land on the front (rack 504 = TPU 3 on this AIO)?', opts: [
            { t: 'A1-3: column A, port 1, row 3', ok: true, why: 'One TPU per row; leg 1 in column A, left port.' }, { t: 'A1-1', ok: false, why: 'Row 1 is TPU 1 (rack 502).' },
            { t: 'C5-3', ok: false, why: 'C5 is leg 5.' }, { t: 'I17-3', ok: false, why: 'Column I holds spares 17-18.' }] } },
          { hl: ['e192', 'dcn'], t: 'Behind A1-3 is the <b>column A</b> 192F trunk, row 3.', q: { q: 'Which 192F leg, and which rack?', opts: [
            { t: 'Trunk leg 5, to R107 (DCN-PP A-N)', ok: true, why: 'Row 3 holds legs 5-6; odd leg 5 sits behind A1. Spot 11 → N rack; column A → R107.' },
            { t: 'Trunk leg 1, to R107', ok: false, why: 'Row 1 holds legs 1-2. Rack 504 is on row 3.' },
            { t: 'Trunk leg 5, to R108', ok: false, why: 'R108 is the S rack, for spot-13 AIO racks.' }, { t: 'Trunk leg 3, to R114', ok: false, why: 'Column A goes to DCN-PP A.' }] } },
          { hl: ['dcn'], t: 'At R107 the trunk lands on the <b>RU 35</b> panel in lane <b>AIO-PP3 · CD #1</b>.', q: { q: 'Leg 5 is odd. Where does it sit on the back of that panel?', opts: [
            { t: 'Column C (first column of the C-D pair), row 3, lane 1', ok: true, why: 'Odd legs in the first column; legs 5-6 in row 3.' }, { t: 'Column D, row 3', ok: false, why: 'Even legs go in column D.' },
            { t: 'Column C, row 5', ok: false, why: 'Two legs per row: leg 5 is in row 3.' }, { t: 'Column A, row 3', ok: false, why: 'This trunk\'s lane is in pair C-D.' }] } },
          { hl: ['empo', 'sp'], t: 'The C-D module in row 3 mixes this trunk with its neighbor (AIO-PP4 = EOR 611) and sends 4 MPO cords to <b>spines 1-4</b> of group A, at the row-3 line-card port from the cutsheet. Path complete.' }
        ] } },
    { id: 's2', stage: 'Work with it', title: 'Done when: the checklists',
      html: `<div class="checklists">
<div><h3 class="h4">TPU rack (guide p.16)</h3><ul class="check">
<li>16 legs of the 144F trunk in TOR odd ports 1-31, in order (leg N in the Nth odd port).</li>
<li>Legs 17 and 18 not plugged in at the TOR. Dressed and labeled. Not touching the floor.</li>
<li>OCS cable 1 (red) in ports 1-8, cable 2 (orange) in 9-16, cable 3 (yellow) in 17-24.</li>
<li>Three spare OCS legs handled the way your site decided. Labeled.</li>
<li>6 CAT6 cables: TOR ETH and console, RMU1 GIG E 1 and console, RMU2 GIG E 1 and console.</li>
<li>Every fiber scoped and cleaned before it went in.</li>
<li>Every cable flag-labeled at both ends, matching its cutsheet row.</li>
<li>Nothing touched on the machine trays, batteries or rectifiers.</li></ul></div>
<div><h3 class="h4">OCS cables (guide p.23)</h3><ul class="check">
<li>Right cable color to the right SPOCS rack: red 1, orange 2, yellow 3.</li>
<li>Cable part number and length on the reel match the cutsheet.</li>
<li>Legs 1-2 in slot 1, 3-4 in slot 2, 5-6 in slot 3, 7-8 in slot 4. Shortest legs at the top.</li>
<li>Odd leg on port X, even leg on port X+1. Same X on all 4 slots and all 3 SPOCS racks.</li>
<li>Spare leg (fibers 17-18) labeled and handled the way your site decided.</li>
<li>Split point 12-18 inches above the OCS rack.</li>
<li>TPU 1-72 dressed left. TPU 73-144 dressed right.</li>
<li>Slack on top of the TPU rack, not in the tray. Nothing touches the floor.</li>
<li>Every leg scoped and cleaned. Bundle and legs labeled at both ends.</li></ul></div>
<div><h3 class="h4">EOR copper and management (guide p.31)</h3><ul class="check">
<li>Every copper home run terminated on the jack the cutsheet gives.</li>
<li>A patch cord from each jack to the switch port with the same number.</li>
<li>Management trunk to spine 1 in A1:A2 (12F) or A1:B4 (24F), rows 1-3.</li>
<li>Management trunk to spine 2 in C5:C6 (12F) or C5:D8 (24F), rows 1-3.</li>
<li>Switch cords in the front of the RU 39 panel: duplex 1 MGMT leaf, 2 TROSS leaf, 3 FB0 (w/BMS only).</li>
<li>SPOCS management cords in the w/BMS panel (611/613, 1411/1413, 2211/2213): mgmt1 to spot 11, mgmt2 to spot 13.</li>
<li>Far end patched at the management spine rack before turn-up.</li>
<li>Trunk slack on top of the rack. Every cable labeled at both ends. Nothing touches the floor.</li></ul></div>
<div><h3 class="h4">Large trunks (guide p.42)</h3><ul class="check">
<li>Each AIO front row = one TPU rack: TPU 1 on row 1, up to TPU 9 on row 9.</li>
<li>144F legs 1-16 left to right in columns A-H. Legs 17-18 in column I.</li>
<li>Rows 10-12 and columns J-L left open on the front.</li>
<li>One 192F trunk per column on the AIO rear: A = DCN-PP 1 … H = DCN-PP 8.</li>
<li>192F odd legs right, even legs left (rear view), legs going up. Legs 19-24 in rows 10-12.</li>
<li>At the DCN-PP: 192F on the rear, in the trunk lane the cutsheet gives.</li>
<li>Every 2x2 module holds trunks from 2 different AIO racks. Module P/N 760262482.</li>
<li>Cords from the DCN-PP front to the spines patched per the cutsheet.</li>
<li>Every leg scoped and cleaned. Trunk slack on top of the rack. Both ends labeled.</li></ul></div></div>
<p class="muted">The guide's p.42 checklist says "192F odd legs left, even legs right"; its own p.37 drawing and notes say odd legs on the right port (rear view). The list above uses the rear-view wording from p.37 — see "Ask your lead" below.</p>` },
    { id: 's3', stage: 'Work with it', title: 'Ask your lead: open items in the guide',
      html: `<table class="t"><thead><tr><th>#</th><th>Item</th><th>Where</th></tr></thead><tbody>
<tr><td>1</td><td>Guide revision: cover says <b>Rev D</b>, every page footer says <b>Rev C</b> (both dated 10/8/2026). Confirm you have the current revision.</td><td>p.1 vs footers</td></tr>
<tr><td>2</td><td>CAT6 tray tier: <b>Tier 2</b> (p.7, 16, 31, glossary) vs <b>Tier 1</b> (p.14).</td><td>p.7, 14</td></tr>
<tr><td>3</td><td>OCS spare legs: coil on top of the rack (drawings) vs "left hanging" (reference cutsheet).</td><td>p.15, 22</td></tr>
<tr><td>4</td><td>w/BMS management trunk: 24F (patching drawing, patch data) vs 12F (one drawing).</td><td>p.30</td></tr>
<tr><td>5</td><td>Shuffle module: 2x2 P/N 760262482 vs a 4x4 (P/N 760262479) mentioned in field reports.</td><td>p.40</td></tr>
<tr><td>6</td><td>SPOCS uplinks: 6 duplex positions (4-9) reserved per 24F trunk vs 3 uplinks per trunk from the p.30 description.</td><td>p.29, 30</td></tr>
<tr><td>7</td><td>192F at the AIO rear: p.42 checklist says "odd legs left, even legs right"; p.37 says odd on the right port in the rear view (same physical position as A1). Confirm the wording your site uses.</td><td>p.37, 42</td></tr>
<tr><td>8</td><td>AIO elevation drawings are not RU-exact, show a 4th copper panel with no stated purpose, and do not show the console switch or the w/BMS FB0 switch.</td><td>p.26, 35</td></tr>
<tr><td>9</td><td>Not in the guide: which rack is TPU 1-144 in each pod; copper termination standard and tests; fiber tests beyond scope-and-clean; FB0 switch location and what connects to it; spine 1-32 rack locations; which MGMT rack is spine 1.</td><td>—</td></tr></tbody></table>` },
    { id: 's4', stage: 'Apply', title: 'Final practice: what do you do next?',
      act: { type: 'scenario', id: 'a15-scen', title: 'Real situations',
        qs: [
          { q: 'You finish the 144F at a TOR. Legs 17 and 18 are lying on the floor behind the rack. What now?', opts: [
            { t: 'Label them and dress them up so they do not touch the floor', ok: true, why: 'Guide p.13 and p.16.' }, { t: 'Plug them into ports 2 and 4', ok: false, why: 'Even ports belong to the machines.' },
            { t: 'Leave them; spares do not matter', ok: false, why: 'Spares are labeled and dressed off the floor.' }, { t: 'Cut them off', ok: false, why: 'Spares stay.' }] },
          { q: 'At SPOCS rack 612 you find the cutsheet gives X = 097 for your TPU rack, but at rack 512 you used X = 099. What do you do?', opts: [
            { t: 'Stop and ask your lead — the same X should be used on all 3 SPOCS racks', ok: true, why: 'Guide p.21: same port numbers on every slot and all 3 SPOCS racks.' },
            { t: 'Use 097 here and keep 099 at 512', ok: false, why: 'A mismatch between racks breaks the rule. Ask.' },
            { t: 'Use 099 here to match', ok: false, why: 'Do not override the cutsheet on your own. Ask.' }, { t: 'Use 098', ok: false, why: '098 is X+1 for 097, not a fix.' }] },
          { q: 'You are about to land a management trunk on EOR 2213. It is labeled 12F. What do you do?', opts: [
            { t: 'Stop and ask: 2213 is a w/BMS rack, which should get 24F trunks', ok: true, why: 'Guide p.29-30; the 12F/24F correction is flagged in the guide.' },
            { t: 'Land it on A1:A2 and C5:C6 as usual', ok: false, why: '2213 is w/BMS: 24F on A1:B4 / C5:D8.' },
            { t: 'Land it, the FB0 can use a spare', ok: false, why: 'Do not improvise. Ask.' }, { t: 'Use two 12F trunks per spine', ok: false, why: 'Do not improvise. Ask.' }] }
        ] } }
  ],
  check: [
    { q: 'TPU rack 1720 is served by which EOR, and which SPOCS racks get its OCS cables?', opts: [
      { t: 'EOR 1713; SPOCS 1312, 1412, 1512 (pod 11)', ok: true, why: 'Spot 20 → south → EOR 1713. Row 17 → pod 11.' },
      { t: 'EOR 1711; SPOCS 1312, 1412, 1512', ok: false, why: 'Spot 20 is south: EOR 1713.' },
      { t: 'EOR 1713; SPOCS 2112, 2212, 2312', ok: false, why: 'Row 17 is pod 11, not pod 12.' }, { t: 'EOR 1712; SPOCS 1712', ok: false, why: 'Spot 12 in row 17 is not an EOR or SPOCS rack.' }], ref: 's1' },
    { q: 'Before you call a TPU rack done, every fiber must have been:', opts: [
      { t: 'Scoped and cleaned before it went in', ok: true, why: 'Guide p.16 checklist.' }, { t: 'Tested with a light meter', ok: false, why: 'The guide requires scope-and-clean; ask your lead about any tests.' },
      { t: 'Plugged in, then cleaned', ok: false, why: 'Before it goes in.' }, { t: 'Labeled at one end', ok: false, why: 'Both ends.' }], ref: 's2' },
    { q: 'Which statement about conflicts in the guide is right?', opts: [
      { t: 'When the guide, a label or this course disagrees with the cutsheet, stop and ask your lead', ok: true, why: 'Guide p.1, 6, 8, 9.' },
      { t: 'The most recent page of the guide wins', ok: false, why: 'The cutsheet is the final word; conflicts go to your lead.' },
      { t: 'Use whichever is quicker', ok: false, why: 'Stop and ask.' }, { t: 'Follow this course over the cutsheet', ok: false, why: 'The cutsheet decides.' }], ref: 's3' }
  ]
});
