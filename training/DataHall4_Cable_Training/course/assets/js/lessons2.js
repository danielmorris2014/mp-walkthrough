/* Lessons 6-9: TPU rack, 144F at the TOR, AIO panel and 192F trunks, DCN patch panels. */
window.COURSE = window.COURSE || {};
COURSE.lessons = COURSE.lessons || [];

COURSE.lessons.push({
  id: 'l06', num: 6, title: 'The TPU rack', short: 'TPU rack', video: 'v06', mins: 14,
  pages: 'Guide p.4, 11, 12, 14, 16',
  objectives: [
    'Explain what a TPU is and what a TPU rack does.',
    'Recognize side A and side B of an Ironwood TPU rack and name each unit.',
    'Identify the parts that are yours: the TOR switch, TROSS / RMU1 and RMU2, and the OCS panel (pp1).',
    'Name the six cable groups that leave every TPU rack.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'What a TPU is',
      html: `<p><b>TPU</b> stands for <b>Tensor Processing Unit</b>. It is a computer chip designed for the math that artificial intelligence uses. The guide calls the rack that holds these computers a <b>TPU rack</b>, and sometimes just "TPU" (for example "TPU 1-72"). The drawings call it an <b>Ironwood TPU rack</b>.</p>
<div class="callout info"><b>Background (public sources, not the guide):</b> Ironwood is Google's seventh-generation TPU (Google Cloud). Hot Chips 2025 material describes an Ironwood rack as 16 TPU trays with 4 chips each (64 chips), liquid-cooled, with copper cables inside the rack and <b>optical circuit switches (OCS)</b> connecting racks to each other. That is why you install OCS cables from every TPU rack.</div>` },
    { id: 's2', stage: 'Recognize', title: 'The two faces of the rack',
      html: `<p>A TPU rack has two faces: <b>side A</b> and <b>side B</b> (guide p.12). Parts outlined in black are yours to connect. Grey parts are pre-installed: leave them alone. Select each part to learn what it is.</p>`,
      act: { type: 'explore', id: 'a6-explore', title: 'Explore the TPU rack', dg: 'tpuRack', o: {},
        spots: [
          { k: 'tor', t: 'TOR switch (side A) — yours', d: '<b>Top Of Rack switch</b>, an Arista 7060. The rack\'s door to the data network. The <b>144F trunk</b> plugs into its 16 odd ports, and 2 copper runs (ETH and CONSOLE) leave it. Lesson 7.' },
          { k: 'rmu1', t: 'TROSS / RMU1 (side A, RU 38) — yours', d: 'The rack\'s management box. Drawings say TROSS; the cutsheet says <b>rmu1</b>. Sends 2 copper runs: <b>GIG E 1</b> and <b>CONSOLE</b>. Lesson 12.' },
          { k: 'rmu2', t: 'TROSS / RMU2 (side B, RU 38) — yours', d: 'The side-B management box, <b>rmu2</b> on the cutsheet. Same 2 copper runs as RMU1.' },
          { k: 'pp1-a', t: 'OCS panel, side A (pp1 ports 1-12) — yours', d: 'Where OCS cable 1 (red, ports 1-8) and half of OCS cable 2 (orange, ports 9-12) plug in. Lesson 10.' },
          { k: 'pp1-b', t: 'OCS panel, side B (pp1 ports 13-24) — yours', d: 'Where the other half of OCS cable 2 (ports 13-16) and OCS cable 3 (yellow, ports 17-24) plug in. The cutsheet lists sides A and B as one panel, pp1.' },
          { k: 'rect-a3', t: 'Rectifiers — pre-installed', d: 'Power units that convert incoming AC power to the DC power the rack uses. Not yours.' },
          { k: 'blank-b', t: 'Blank (side B) — not used', d: 'Side B has a blank panel where side A has the TOR switch.' },
          { k: 'trays-a', t: 'Machine trays — pre-installed', d: 'The AI computers themselves, with their internal DAC and CDFP cables. Do not touch.' },
          { k: 'batt-a', t: 'Batteries — pre-installed', d: 'Backup power for the rack. Do not touch.' }
        ] } },
    { id: 's3', stage: 'Connect', title: 'Six cable groups leave every TPU rack',
      html: `<p>On the hall map each TPU rack has six colored stripes. They are the six cable groups you install on it:</p>
<table class="t"><thead><tr><th>Cable group</th><th>From</th><th>To</th><th>Guide</th></tr></thead><tbody>
<tr><td><b>144F trunk</b> (1)</td><td>TOR, odd ports 1-31</td><td>EOR rack, MPO panel front</td><td>p.13, 36</td></tr>
<tr><td><b>OCS red</b> (OCS 1)</td><td>pp1 ports 1-8</td><td>SPOCS rack 1</td><td>p.15, 21</td></tr>
<tr><td><b>OCS orange</b> (OCS 2)</td><td>pp1 ports 9-16</td><td>SPOCS rack 2</td><td>p.15, 21</td></tr>
<tr><td><b>OCS yellow</b> (OCS 3)</td><td>pp1 ports 17-24</td><td>SPOCS rack 3</td><td>p.15, 21</td></tr>
<tr><td><b>Gig E1</b> (2 per rack)</td><td>RMU1 and RMU2 GIG E 1</td><td>EOR copper panel RU 22</td><td>p.14</td></tr>
<tr><td><b>Con. Mgmt</b> (4 per rack)</td><td>TOR ETH, TOR CONSOLE, RMU1 and RMU2 CONSOLE</td><td>EOR copper panels RU 24 and RU 30</td><td>p.14</td></tr></tbody></table>
<p class="muted">Map stripe colors are map colors. Only the OCS stripes match a real jacket color.</p>` },
    { id: 's4', stage: 'Work with it', title: 'What you never touch inside the rack',
      html: `<ul><li>Machine trays, and the <b>[[DAC]]</b> and <b>[[CDFP]]</b> cables between them.</li><li>Batteries and rectifiers.</li><li>The <b>even</b> ports on the TOR switch (they go to the machines).</li></ul>
<p class="tip"><b>The guide's test (p.12):</b> if a cable never leaves the rack, it is not yours.</p>
<p>The TROSS full name is not given in the guide, and RMU is not expanded either. What matters for you: TROSS and RMU are the same box, and there is one on each side.</p>` },
    { id: 's5', stage: 'Apply', title: 'Practice: which parts are yours?',
      act: { type: 'pick', id: 'a6-pick', title: 'Click the part', dg: 'tpuRack', o: {}, clickKeys: ['tor', 'rmu1', 'rmu2', 'pp1-a', 'pp1-b', 'rect-a3', 'rect-a2', 'rect-a1', 'rect-b3', 'rect-b2', 'rect-b1', 'blank-b', 'trays-a', 'trays-b', 'batt-a', 'batt-b'],
        tasks: [
          { q: 'Click the device where the <b>144F trunk</b> plugs in.', ok: ['tor'], hint: 'It is the rack\'s door to the data network, on side A.', why: 'The 144F trunk plugs into the TOR switch\'s odd ports.' },
          { q: 'Click where <b>OCS cable 3 (yellow)</b> plugs in.', ok: ['pp1-b'], hint: 'OCS 3 uses pp1 ports 17-24.', why: 'Ports 17-24 are on the side-B half of pp1.' },
          { q: 'Click the unit the cutsheet calls <b>rmu2</b>.', ok: ['rmu2'], hint: 'RMU2 is on side B.', why: 'TROSS / RMU2 is on side B at RU 38.' },
          { q: 'Click a part that is <b>not</b> yours to touch.', ok: ['rect-a3', 'rect-a2', 'rect-a1', 'rect-b3', 'rect-b2', 'rect-b1', 'trays-a', 'trays-b', 'batt-a', 'batt-b'], hint: 'Grey parts are pre-installed.', why: 'Rectifiers, machine trays and batteries are pre-installed.' }
        ] } }
  ],
  check: [
    { q: 'Which three kinds of device on a TPU rack are yours to connect?', opts: [
      { t: 'The TOR switch, the two TROSS / RMU units, and the OCS panel (pp1)', ok: true, why: 'Guide p.12: parts outlined in black.' },
      { t: 'The rectifiers, the TOR switch and the batteries', ok: false, why: 'Rectifiers and batteries are pre-installed.' },
      { t: 'The machine trays, the OCS panel and the TOR', ok: false, why: 'Machine trays are pre-installed.' },
      { t: 'Only the TOR switch', ok: false, why: 'You also connect the TROSS / RMUs and the OCS panel.' }], ref: 's2' },
    { q: 'The drawings say TROSS. What does the cutsheet call the same unit on side A?', opts: [
      { t: 'rmu1', ok: true, why: 'TROSS = rmu1 (side A) and rmu2 (side B) on the cutsheet (p.12).' }, { t: 'tor1', ok: false, why: 'tor1 is the TOR switch.' },
      { t: 'pp1', ok: false, why: 'pp1 is the OCS panel.' }, { t: 'tross-a', ok: false, why: 'The cutsheet uses rmu1 and rmu2.' }], ref: 's4' },
    { q: 'How many copper (CAT6) runs leave one TPU rack?', opts: [
      { t: '6: 2 from the TOR and 2 from each TROSS / RMU', ok: true, why: 'Guide p.12 note 3 and p.14.' }, { t: '2', ok: false, why: 'Each of the three devices sends 2.' },
      { t: '4', ok: false, why: '4 is the Con. Mgmt group alone; add the 2 Gig E1 runs.' }, { t: '18', ok: false, why: '18 is the number of 144F trunk legs.' }], ref: 's3' },
    { q: 'On side B, what is in the position where side A has the TOR switch?', opts: [
      { t: 'A blank panel', ok: true, why: 'Guide p.12: side B shows BLANK there.' }, { t: 'A second TOR switch', ok: false, why: 'There is one TOR switch, on side A.' },
      { t: 'The OCS panel', ok: false, why: 'The OCS panel is below the TROSS on both sides.' }, { t: 'A rectifier', ok: false, why: 'The three rectifiers are above it.' }], ref: 's2' }
  ]
});

COURSE.lessons.push({
  id: 'l07', num: 7, title: 'The 144-fiber trunk at the TOR: odd ports 1-31', short: '144F at the TOR', video: 'v07', mins: 18,
  pages: 'Guide p.12, 13, 16, 36, 46',
  objectives: [
    'Explain exactly what "144" counts and how the trunk breaks out.',
    'Explain what "odd" means here and why only ports 1, 3, 5 ... 31 are used.',
    'Place any leg in the correct TOR port (leg N → port 2N − 1) and handle the two spares.',
    'Describe where the other end of the same trunk lands.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'Your notes, checked against the guide',
      html: `<div class="callout key"><b>"144 fiber connecting to odd rows, ports 1-31."</b> Checked against guide p.13: it is <b>odd-numbered ports</b> on the TOR switch, not odd rows of racks. The odd ports happen to be the <b>top row</b> of the switch, which is probably where "rows" came from. The trunk uses the 16 odd ports <b>1, 3, 5 … 31</b>. At the other end (the EOR rack), each TPU rack gets one panel <b>row</b> — rows 1 to 9, not odd rows.</div>` },
    { id: 's2', stage: 'Understand', title: 'What 144 counts',
      figs: [{ dg: 'trunk144', o: {}, cap: '144 fibers = 18 legs × 8 fibers. 16 active legs + 2 spare legs.' }],
      html: `<ul><li><b>144</b> is the number of <b>fibers</b> in the trunk.</li>
<li>The trunk breaks out into <b>18 legs</b>. Each leg is an <b>[[MPO|MPO-8]]</b> plug holding <b>8 fibers</b>. 18 × 8 = 144.</li>
<li><b>Legs 1-16 are active</b> (16 × 8 = 128 fibers in use). <b>Legs 17 and 18 are spares</b>.</li>
<li>Each leg is color-coded by TIA-598 and numbered on its label. Legs 13-16 repeat blue, orange, green and brown.</li></ul>` },
    { id: 's3', stage: 'Recognize', title: 'The TOR switch',
      figs: [{ dg: 'torSwitch', o: { legs: [] }, cap: 'Arista 7060 TOR switch, side A (guide p.13). 32 ports in 16 cages. Odd ports on top, even ports on the bottom.' }],
      html: `<ul><li>The TOR switch has <b>32 ports</b> arranged in <b>16 cages</b>. Each cage has two ports stacked: the <b>odd</b> number on top (▲) and the <b>even</b> number below (▼).</li>
<li><b>Only the odd ports (top row) are yours</b>: 1, 3, 5 … 31.</li>
<li>The <b>even</b> ports below go to the machines inside the rack and are <b>pre-installed</b>. Do not touch them.</li>
<li>At the right end are the two copper ports: <b>ETH</b> (management) and <b>CON</b> (console). Lesson 12.</li></ul>` },
    { id: 's4', stage: 'Understand', title: 'The rule: leg N goes in the Nth odd port',
      html: `<p>Leg 1 goes in port 1. Leg 2 goes in port 3. Keep going in order: <b>leg N goes in the Nth odd port</b>. Leg 16 goes in port 31 (guide p.13).</p>
<p class="formula">port = 2 × leg − 1</p>
<table class="t center"><thead><tr><th>Leg</th><th>Color</th><th>TOR port</th><th>Leg</th><th>Color</th><th>TOR port</th></tr></thead><tbody>
<tr><td>1</td><td><span class="sw" style="--c:#1E6FD9"></span>Blue</td><td><b>1</b></td><td>9</td><td><span class="sw" style="--c:#F5D21E"></span>Yellow</td><td><b>17</b></td></tr>
<tr><td>2</td><td><span class="sw" style="--c:#F08C1B"></span>Orange</td><td><b>3</b></td><td>10</td><td><span class="sw" style="--c:#7A3FA6"></span>Violet</td><td><b>19</b></td></tr>
<tr><td>3</td><td><span class="sw" style="--c:#3E9E4F"></span>Green</td><td><b>5</b></td><td>11</td><td><span class="sw" style="--c:#F2A6C2"></span>Rose</td><td><b>21</b></td></tr>
<tr><td>4</td><td><span class="sw" style="--c:#7B4B26"></span>Brown</td><td><b>7</b></td><td>12</td><td><span class="sw" style="--c:#59D0D8"></span>Aqua</td><td><b>23</b></td></tr>
<tr><td>5</td><td><span class="sw" style="--c:#7D8996"></span>Slate</td><td><b>9</b></td><td>13</td><td><span class="sw" style="--c:#1E6FD9"></span>Blue (2nd round)</td><td><b>25</b></td></tr>
<tr><td>6</td><td><span class="sw" style="--c:#FFFFFF"></span>White</td><td><b>11</b></td><td>14</td><td><span class="sw" style="--c:#F08C1B"></span>Orange (2nd round)</td><td><b>27</b></td></tr>
<tr><td>7</td><td><span class="sw" style="--c:#D62839"></span>Red</td><td><b>13</b></td><td>15</td><td><span class="sw" style="--c:#3E9E4F"></span>Green (2nd round)</td><td><b>29</b></td></tr>
<tr><td>8</td><td><span class="sw" style="--c:#1B1B1B"></span>Black</td><td><b>15</b></td><td>16</td><td><span class="sw" style="--c:#7B4B26"></span>Brown (2nd round)</td><td><b>31</b></td></tr>
<tr class="spare"><td>17</td><td><span class="sw" style="--c:#7D8996"></span>Slate</td><td>spare — not plugged</td><td>18</td><td><span class="sw" style="--c:#FFFFFF"></span>White</td><td>spare — not plugged</td></tr></tbody></table>
<p class="muted">Guide p.13: "leg N in the Nth odd port matches every TPU rack in this hall's patch data (432 racks)."</p>`,
      figs: [{ dg: 'torSwitch', o: { legs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] }, cap: 'All 16 active legs in place. Spares 17 and 18 are dressed off the floor, not plugged in.' }] },
    { id: 's5', stage: 'Work with it', title: 'Worked example: landing the trunk on one TOR',
      html: `<ol class="steps">
<li><b>Confirm the trunk.</b> Read the wrap-around label near the boot. It must match the cutsheet row for this TPU rack.</li>
<li><b>Leg 1 (blue).</b> Read the leg label: "1". Scope and clean it. Plug into <b>port 1</b>, the top port of the first cage.</li>
<li><b>Leg 2 (orange).</b> The next odd port is <b>3</b> — not port 2. Port 2 is the even port directly below port 1 and belongs to the machines.</li>
<li><b>Leg 7 (red).</b> 2 × 7 − 1 = <b>13</b>.</li>
<li><b>Leg 13 (blue again).</b> Blue could be leg 1, so read the label: "13". 2 × 13 − 1 = <b>25</b>.</li>
<li><b>Leg 16 (brown).</b> Port <b>31</b>, the top port of the last cage.</li>
<li><b>Legs 17 and 18.</b> Spares. Nothing plugs into them at the TOR. Label them and dress them so they do not touch the floor.</li>
<li><b>Store trunk slack</b> (above the split point) on top of the rack, never in the tray.</li></ol>` },
    { id: 's6', stage: 'Connect', title: 'Both ends of the same trunk',
      html: `<p>This same trunk runs to the <b>EOR rack</b> at the end of the row and plugs into the <b>front</b> of its MPO 4RU panel (lesson 8):</p>
<table class="t center"><thead><tr><th>End</th><th>Legs 1-16</th><th>Legs 17-18</th></tr></thead><tbody>
<tr><td><b>TPU rack (A end)</b></td><td>TOR odd ports 1, 3 … 31</td><td>spares, dressed</td></tr>
<tr><td><b>EOR rack (Z end)</b></td><td>MPO panel, this TPU's row: legs 1-2 in column A … legs 15-16 in column H</td><td>column I (spares back to the TPU)</td></tr></tbody></table>`,
      figs: [{ dg: 'aioFront', o: { rows: [3], allRows: true }, cap: 'Preview: at the EOR rack the trunk for TPU 3 fills row 3, left to right. Lesson 8 explains this panel.' }] },
    { id: 's7', stage: 'Work with it', title: 'Common mistakes',
      html: `<table class="t"><thead><tr><th>Mistake</th><th>How you notice</th><th>What to do</th></tr></thead><tbody>
<tr><td>Leg plugged into an <b>even</b> port</td><td>It is in the bottom row of a cage</td><td>Even ports are pre-installed to the machines. Do not disturb them; ask your lead.</td></tr>
<tr><td><b>Off by one:</b> leg 2 in port 2 or port 5</td><td>Count: port must equal 2 × leg − 1</td><td>Move it to the correct odd port.</td></tr>
<tr><td>Leg 13 mistaken for leg 1 (both blue)</td><td>Two blue legs; label numbers differ</td><td>Always read the leg number on the label.</td></tr>
<tr><td>A spare (17 or 18) plugged in</td><td>A leg in a port beyond 31, or in an even port</td><td>Unplug, label, dress off the floor.</td></tr>
<tr><td>Leg plugged in without scoping</td><td>—</td><td>Scope and clean every leg before it goes in.</td></tr></tbody></table>` },
    { id: 's8', stage: 'Apply', title: 'Guided practice: plug in the legs',
      act: { type: 'pick', id: 'a7-pick', title: 'Click the correct TOR port', dg: 'torSwitch', o: { legs: [], spares: false }, clickPrefix: 'p',
        tasks: [
          { q: 'Where does <b>leg 1 (blue)</b> go?', ok: ['p1'], hint: 'Leg 1 goes in the first odd port.', why: '2 × 1 − 1 = port 1.' },
          { q: 'Where does <b>leg 2 (orange)</b> go?', ok: ['p3'], hint: 'Skip the even port below port 1.', why: '2 × 2 − 1 = port 3. Port 2 is an even port for the machines.', wrong: { p2: 'Port 2 is the even port under port 1. Even ports go to the machines.' , p4: 'That is an even port. Odd ports only.' } },
          { q: 'Where does <b>leg 9 (yellow)</b> go?', ok: ['p17'], hint: 'Port = 2 × 9 − 1.', why: '2 × 9 − 1 = 17.', wrong: { p9: 'That is leg 5\'s port. Leg 9 goes in the 9th odd port: 17.', p18: 'Even port. The 9th odd port is 17.' } },
          { q: 'You pick up a <b>blue leg labeled 13</b>. Where does it go?', ok: ['p25'], hint: 'Read the number, not just the color.', why: '2 × 13 − 1 = 25. Blue alone could have meant leg 1.', wrong: { p1: 'Port 1 is for leg 1, which is also blue. This leg is labeled 13.' , p13: 'Port 13 is for leg 7. Use 2 × 13 − 1.' } },
          { q: 'Where does <b>leg 16 (brown)</b> go?', ok: ['p31'], hint: 'It is the last active leg.', why: '2 × 16 − 1 = 31, the top port of the last cage.' }
        ] } },
    { id: 's9', stage: 'Apply', title: 'Independent practice: find the mistake',
      act: { type: 'scenario', id: 'a7-mistake', title: 'Check this TOR', dg: 'torSwitch', o: { legs: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16], place: { 14: 7 } },
        qs: [
          { q: 'Look at the switch above. Which leg is in the wrong port?', opts: [
            { t: 'Leg 7 — it is in port 14 (an even port). It belongs in port 13.', ok: true, why: '2 × 7 − 1 = 13. Port 14 is the even port below 13, which goes to the machines.' },
            { t: 'Leg 13 — it should be in port 13', ok: false, why: 'Leg 13 goes in port 25, where it is.' },
            { t: 'Leg 16 — it should be in port 32', ok: false, why: 'Port 32 is even. Leg 16 belongs in port 31.' },
            { t: 'Nothing is wrong', ok: false, why: 'Look at port 13 (empty) and port 14.' }], hint: 'Look for an empty top port.' },
          { q: 'What should you do about it?', opts: [
            { t: 'Stop: an even port was disturbed. Tell your lead, then move leg 7 to port 13 as directed.', ok: true, why: 'Even ports are pre-installed to the machines; your lead decides how to restore it.' },
            { t: 'Leave it; any open port works', ok: false, why: 'Every leg has exactly one correct port.' },
            { t: 'Move the machine cable from port 13 to port 14', ok: false, why: 'Never move pre-installed machine cables.' },
            { t: 'Re-label the leg as leg 14', ok: false, why: 'Labels must match the cutsheet; you fix the connection, not the label.' }] }
        ] } }
  ],
  check: [
    { q: 'What does the 144 in "144F trunk" count?', opts: [
      { t: 'Fibers: 18 MPO-8 legs × 8 fibers each', ok: true, why: 'Guide p.12-13.' }, { t: 'Ports on the TOR switch', ok: false, why: 'The TOR has 32 ports.' },
      { t: 'Feet of cable', ok: false, why: 'F = fibers.' }, { t: 'TPU racks in a pod', ok: false, why: 'A pod is 144 TPU racks, but 144F counts fibers.' }], ref: 's2' },
    { q: 'Which TOR port does leg 10 go in?', opts: [
      { t: '19', ok: true, why: '2 × 10 − 1 = 19.' }, { t: '10', ok: false, why: 'Port 10 is even. Use 2 × leg − 1.' },
      { t: '20', ok: false, why: 'Even port.' }, { t: '21', ok: false, why: '21 is for leg 11.' }], ref: 's4' },
    { q: 'Who uses the even ports on the TOR switch?', opts: [
      { t: 'The machines inside the rack — they are pre-installed, not yours', ok: true, why: 'Guide p.13 note 1.' },
      { t: 'The spare legs 17 and 18', ok: false, why: 'Spares are not plugged in at the TOR.' },
      { t: 'The OCS cables', ok: false, why: 'OCS cables go to the OCS panel.' }, { t: 'Copper runs', ok: false, why: 'Copper uses the ETH and CON ports.' }], ref: 's3' },
    { q: 'What happens to legs 17 and 18 at the TOR?', opts: [
      { t: 'Nothing plugs into them. They are labeled and dressed off the floor.', ok: true, why: 'Guide p.13 note 3 and p.16.' },
      { t: 'They go in ports 33 and 35', ok: false, why: 'The switch has no ports 33 or 35; 17-18 are spares.' },
      { t: 'They go in ports 2 and 4', ok: false, why: 'Even ports belong to the machines.' }, { t: 'They are cut off', ok: false, why: 'Spares are kept and dressed.' }], ref: 's5' },
    { q: 'Two legs are blue. How do you tell leg 1 from leg 13?', opts: [
      { t: 'Read the leg number on the label', ok: true, why: 'Colors repeat after 12; "always check the leg number on the label" (p.13).' },
      { t: 'Leg 13 is always longer', ok: false, why: 'Length is not how you identify legs.' },
      { t: 'Leg 1 is always on top of the bundle', ok: false, why: 'Position in the bundle is not reliable.' }, { t: 'You cannot; either one works in port 1', ok: false, why: 'Each leg has one correct port.' }], ref: 's4' }
  ]
});

COURSE.lessons.push({
  id: 'l08', num: 8, title: 'The other end: the AIO panel and the 192F trunks', short: 'AIO panel & 192F', video: 'v08', mins: 20,
  pages: 'Guide p.26, 34-37, 42, 44',
  objectives: [
    'Recognize the AIO rack and its MPO 4RU panel (RU 32).',
    'Land a 144F trunk on the front of the panel: one TPU rack per row, legs left to right.',
    'Land 192F trunks on the back of the panel: one per column, A = DCN-PP 1 … H = DCN-PP 8.',
    'Explain how the front and back line up, and why the rear view is mirrored.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'The AIO (EOR) rack',
      html: `<p>The rack at the end of your row has two names: <b>[[EOR]]</b> (End Of Row) and <b>[[AIO]]</b> (All-In-One). Same rack. There are two types: the <b>AIO EOR</b> and the <b>AIO EOR w/BMS</b> (lesson 14).</p>`,
      figs: [{ dg: 'aioRack', o: {}, cap: 'AIO rack elevation in the order the guide draws it. RU numbers are the checked values from guide p.26 and p.35.' }],
      after: `<ul><li><b>MPO 4RU panel at RU 32</b> — where the 144F trunks (front) meet the 192F trunks (rear). This lesson.</li>
<li><b>Copper panels</b> at RU 30 (console), RU 24 (TOR management) and RU 22 (TROSS) — lesson 12.</li>
<li><b>LC 1RU panel at RU 39</b> — management trunks — lesson 13.</li>
<li>RU 36-37 are blank, reserved for future use. The switches are pre-installed; you patch to them.</li></ul>
<div class="callout conflict"><b>Drawing note:</b> the elevation drawings (p.26, p.35) are not to RU scale and show a fourth copper panel whose purpose is not stated. Go by the checked RU numbers and the rack integration spec.</div>` },
    { id: 's2', stage: 'Understand', title: 'The MPO 4RU panel',
      html: `<ul><li><b>12 rows</b>, numbered from the bottom (row 1) to the top (row 12).</li>
<li><b>12 columns</b>, A to L. Each column has <b>2 ports</b>, so each row has 24 ports.</li>
<li>Ports are pre-labeled <b>(column)(port)-(row)</b>: <code>A1-1</code> is column A, port 1, row 1. In each row the ports are A1, A2, B3, B4, C5, C6 … L23, L24.</li></ul>` },
    { id: 's3', stage: 'Work with it', title: 'Front: the 144F trunks from the TPU racks',
      figs: [{ dg: 'aioFront', o: { rows: [1], allRows: true }, cap: 'Front view, facing the front of the AIO rack (guide p.36). TPU 1\'s trunk shown in row 1.' }],
      html: `<ol><li><b>One TPU rack per row.</b> The 144F trunk patches horizontally across the front.</li>
<li><b>Left to right, lowest number on the left:</b> legs 1-2 in column A, 3-4 in B … 15-16 in column H.</li>
<li><b>Legs 17 and 18 are spares back to the TPU</b>, in column I.</li>
<li><b>The lowest-numbered TPU rack is on the bottom row.</b> Rack numbers go up row by row: TPU 1 on row 1 … TPU 9 on row 9.</li>
<li><b>Rows 10-12</b> are patched on the back side, reserved as operational spares to the DCN-PP. Leave them open on the front.</li>
<li><b>Columns J-L</b> are left open for future expansion.</li></ol>
<p class="formula">TPU N, leg L → column (A for legs 1-2, B for 3-4 … I for 17-18), port L, row N</p>
<p>Example: TPU 3, leg 5 → column C, port 5, row 3 → label <code>C5-3</code>.</p>
<div class="callout info"><b>Which rack is "TPU 1"?</b> The guide says the lowest-numbered TPU rack the AIO serves is on the bottom row. For EOR 511 (serving racks 502-510) that rule puts 502 on row 1 and 510 on row 9. Confirm the rack-to-row assignment on your cutsheet.</div>` },
    { id: 's4', stage: 'Work with it', title: 'Back: the 192F trunks to the DCN-PP racks',
      figs: [{ dg: 'aioRear', o: { cols: ['A'], allCols: true }, cap: 'Rear view, facing the back of the AIO rack (guide p.37). Column A is on the RIGHT. The column A trunk (to DCN-PP 1) is shown.' }],
      html: `<ol><li><b>Facing the rear, column A is on the right.</b> Work right to left.</li>
<li><b>Each 192F trunk takes one column:</b> A = DCN-PP 1, B = DCN-PP 2 … H = DCN-PP 8. That is 8 trunks per AIO rack.</li>
<li><b>The 24 legs split between the 2 ports of the column:</b> odd legs on the right port, even legs on the left port (rear view).</li>
<li><b>Leg numbers go up the column:</b> legs 1-2 in row 1 … legs 23-24 in row 12.</li>
<li><b>Legs 19-24</b> (rows 10-12) are spares to the DCN-PP.</li>
<li><b>Column I</b> holds the TPU spares; <b>columns J-L</b> are open.</li></ol>` },
    { id: 's5', stage: 'Connect', title: 'How the front and back line up',
      html: `<p>Each panel port goes straight through: the front of a port and the back of the same port are joined. So:</p>
<ul><li><b>TPU rack N</b> (front row N) meets <b>every DCN-PP trunk in rear row N</b>.</li>
<li>In rear row N, each column's trunk has <b>legs 2N − 1 and 2N</b>.</li>
<li>So <b>legs 1-2 of every TPU go to DCN-PP 1</b> (column A), <b>legs 3-4 to DCN-PP 2</b> … <b>legs 15-16 to DCN-PP 8</b> (column H).</li></ul>
<h3 class="h4">Why "odd on the right" from the back</h3>
<p>From the front, port A1 is on the <b>left</b> of column A. Walk around to the back and everything is mirrored: A1 is now on the <b>right</b>. The 192F's odd legs go on the right (rear view) so that they land behind A1 — exactly where the TPU's odd leg sits in front.</p>
<table class="t center"><thead><tr><th>Front (144F)</th><th>Same port, back (192F)</th></tr></thead><tbody>
<tr><td>TPU 1 leg 1 at <code>A1-1</code></td><td>column A trunk, leg 1, row 1 (right port)</td></tr>
<tr><td>TPU 1 leg 2 at <code>A2-1</code></td><td>column A trunk, leg 2, row 1 (left port)</td></tr>
<tr><td>TPU 3 leg 5 at <code>C5-3</code></td><td>column C trunk, leg 5, row 3 (right port)</td></tr>
<tr><td>TPU 9 leg 16 at <code>H16-9</code></td><td>column H trunk, leg 18, row 9 (left port)</td></tr></tbody></table>` },
    { id: 's6', stage: 'Connect', title: 'Which DCN-PP rack does each column go to?',
      html: `<p>The <b>Trunk Landing Sheet</b> (guide p.44) gives the rack. AIO racks at <b>spot 11</b> (north) land in the <b>N</b> rack of each pair; AIO racks at <b>spot 13</b> (south) land in the <b>S</b> rack.</p>
<table class="t center"><thead><tr><th>AIO column</th><th>DCN-PP</th><th>From spot 11 (N)</th><th>From spot 13 (S)</th></tr></thead><tbody>
<tr><td>A</td><td>1 / A</td><td>R107</td><td>R108</td></tr><tr><td>B</td><td>2 / B</td><td>R114</td><td>R115</td></tr>
<tr><td>C</td><td>3 / C</td><td>R120</td><td>R121</td></tr><tr><td>D</td><td>4 / D</td><td>R127</td><td>R128</td></tr>
<tr><td>E</td><td>5 / E</td><td>R207</td><td>R208</td></tr><tr><td>F</td><td>6 / F</td><td>R214</td><td>R215</td></tr>
<tr><td>G</td><td>7 / G</td><td>R220</td><td>R221</td></tr><tr><td>H</td><td>8 / H</td><td>R227</td><td>R228</td></tr></tbody></table>
<p class="muted">The guide numbers the DCN-PP racks 1-8 on p.37 and letters them A-H on p.41 and p.44. DCN-PP 1 = DCN-PP A, and so on. Checked in the guide against all 48 AIO racks.</p>` },
    { id: 's7', stage: 'Apply', title: 'Guided practice: the front of the panel',
      act: { type: 'pick', id: 'a8-front', title: 'Click the correct front port', dg: 'aioFront', o: { allRows: true }, clickPrefix: 'f-',
        tasks: [
          { q: 'TPU <b>4</b>, leg <b>7</b>. Click its port.', ok: ['f-4-7'], hint: 'Row 4. Legs 7-8 are in column D. Leg 7 is the left port.', why: 'Column D, port 7, row 4 → D7-4.' },
          { q: 'TPU <b>1</b>, leg <b>16</b>. Click its port.', ok: ['f-1-16'], hint: 'Row 1, column H, right port.', why: 'Legs 15-16 are in column H. Leg 16 → H16-1.' },
          { q: 'TPU <b>9</b>, leg <b>17</b> (a spare). Click its port.', ok: ['f-9-17'], hint: 'Spares go in column I.', why: 'Legs 17-18 are spares back to the TPU in column I → I17-9.' },
          { q: 'TPU <b>6</b>, leg <b>1</b>. Click its port.', ok: ['f-6-1'], hint: 'Row 6, column A, left port.', why: 'A1-6.' }
        ] } },
    { id: 's8', stage: 'Apply', title: 'Independent practice: front, back and landing',
      act: { type: 'scenario', id: 'a8-scen', title: 'Work it out',
        qs: [
          { q: 'On the <b>back</b> of the panel, the column A trunk\'s <b>leg 9</b> lands in which row, and which port (rear view)?', opts: [
            { t: 'Row 5, right port', ok: true, why: 'Legs 9-10 are in row 5; odd legs go on the right port in the rear view.' },
            { t: 'Row 9, right port', ok: false, why: 'Two legs per row: leg 9 is in row 5.' },
            { t: 'Row 5, left port', ok: false, why: 'Odd legs are on the right (rear view).' },
            { t: 'Row 4, left port', ok: false, why: 'Row 4 holds legs 7-8.' }] },
          { q: 'TPU 5\'s <b>legs 11-12</b> go to which DCN-PP?', opts: [
            { t: 'DCN-PP 6 (F), through the column F trunk', ok: true, why: 'Legs 11-12 sit in column F on the front; column F\'s trunk goes to DCN-PP 6 / F.' },
            { t: 'DCN-PP 5', ok: false, why: 'Legs 9-10 go to DCN-PP 5 (column E).' },
            { t: 'DCN-PP 11', ok: false, why: 'There are only 8 DCN-PP racks.' },
            { t: 'All 8 DCN-PP racks', ok: false, why: 'Each pair of legs goes to one DCN-PP.' }] },
          { q: 'AIO rack <b>R1813</b>, column <b>D</b>. Which rack does that 192F land in?', opts: [
            { t: 'R128 (DCN-PP D-S)', ok: true, why: 'Spot 13 → S rack. Column D → DCN-PP D-S = R128.' },
            { t: 'R127 (DCN-PP D-N)', ok: false, why: 'R127 is for spot-11 AIO racks.' },
            { t: 'R214', ok: false, why: 'R214 is DCN-PP F-N.' },
            { t: 'R1812', ok: false, why: '192F trunks go to the network rows.' }] }
        ] } }
  ],
  check: [
    { q: 'On the front of the AIO MPO panel, what does one row hold?', opts: [
      { t: 'One TPU rack\'s 144F trunk, legs left to right', ok: true, why: 'Guide p.36 note 1.' }, { t: 'One 192F trunk', ok: false, why: '192F trunks use columns on the back.' },
      { t: 'All legs numbered 1 from every TPU', ok: false, why: 'Each row is one TPU rack.' }, { t: 'Copper runs', ok: false, why: 'Copper lands on the copper panels.' }], ref: 's3' },
    { q: 'Facing the BACK of the AIO panel, where is column A?', opts: [
      { t: 'On the right — work right to left', ok: true, why: 'Guide p.37: rear view, column A is on the right.' }, { t: 'On the left', ok: false, why: 'That is the front view.' },
      { t: 'At the top', ok: false, why: 'Columns run across; rows run up.' }, { t: 'It depends on the rack', ok: false, why: 'Rear view always mirrors: A on the right.' }], ref: 's4' },
    { q: 'Which DCN-PP does every TPU\'s legs 1-2 reach?', opts: [
      { t: 'DCN-PP 1 (A), through the column A trunk', ok: true, why: 'Guide p.37 "How it lines up".' }, { t: 'DCN-PP 8', ok: false, why: 'Legs 15-16 reach DCN-PP 8.' },
      { t: 'Its own row\'s DCN-PP', ok: false, why: 'The column, not the row, picks the DCN-PP.' }, { t: 'The SPOCS rack', ok: false, why: 'SPOCS racks get OCS cables, not trunk legs.' }], ref: 's5' },
    { q: 'An AIO rack at spot 11 sends its column B trunk to:', opts: [
      { t: 'R114, DCN-PP B-N', ok: true, why: 'Spot 11 → N racks. Column B → R114.' }, { t: 'R115, DCN-PP B-S', ok: false, why: 'R115 is for spot-13 AIO racks.' },
      { t: 'R107', ok: false, why: 'R107 is column A.' }, { t: 'R131', ok: false, why: 'R131 is a management spine rack.' }], ref: 's6' }
  ]
});

COURSE.lessons.push({
  id: 'l09', num: 9, title: 'DCN patch panels, shuffles and spines', short: 'DCN-PP & spines', video: 'v09', mins: 16,
  pages: 'Guide p.34, 38-42, 44-45',
  objectives: [
    'Use the Trunk Landing Sheet to find the rack, panel and trunk lane for any 192F trunk.',
    'Land a 192F trunk on the back of a DCN-PP panel.',
    'Explain what the 2x2 shuffle module does, and check its part number.',
    'Patch the front of a DCN-PP panel to the correct spines.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'The DCN-PP rack',
      html: `<p>A <b>[[DCNPP|DCN-PP]]</b> (DCN Patch Panel) rack is a passive 52 RU rack in network rows 1-2, holding <b>eight 4RU patch panels</b> (guide p.38). Each panel has 12 rows and columns A-L with 2 ports each, like the AIO panel. Large sites use <b>2x2 shuffle modules</b> in these panels.</p>
<p>The 192F trunks land on the <b>back</b>. Short 8-fiber MPO cords leave the <b>front</b> for the spines.</p>` },
    { id: 's2', stage: 'Understand', title: 'Finding rack, panel and lane',
      html: `<p>The Trunk Landing Sheet (guide p.44-45) answers three questions for every AIO rack:</p>
<ol><li><b>Which rack?</b> Column A-H picks the DCN-PP pair; spot 11 → N rack, spot 13 → S rack (lesson 8).</li>
<li><b>Which panel?</b> AIO racks in <b>rows 3-14</b> land in the <b>RU 35</b> panel; rows <b>15-26</b> land in the <b>RU 39</b> panel. (Halls 1-3 land in RU 11-31.)</li>
<li><b>Which lane?</b> Written like <code>AIO-PP3 · CD #1</code>: the trunk's AIO-PP number, the column pair, and lane 1 or 2 of that pair.</li></ol>
<table class="t center small"><thead><tr><th>AIO row</th><th>Panel</th><th>Lane</th><th>AIO row</th><th>Panel</th><th>Lane</th></tr></thead><tbody>
<tr><td>3</td><td>RU 35</td><td>AIO-PP1 · AB #1</td><td>15</td><td>RU 39</td><td>AIO-PP1 · AB #1</td></tr>
<tr><td>4</td><td>RU 35</td><td>AIO-PP2 · AB #2</td><td>16</td><td>RU 39</td><td>AIO-PP2 · AB #2</td></tr>
<tr><td>5</td><td>RU 35</td><td>AIO-PP3 · CD #1</td><td>17</td><td>RU 39</td><td>AIO-PP3 · CD #1</td></tr>
<tr><td>6</td><td>RU 35</td><td>AIO-PP4 · CD #2</td><td>18</td><td>RU 39</td><td>AIO-PP4 · CD #2</td></tr>
<tr><td>7</td><td>RU 35</td><td>AIO-PP5 · EF #1</td><td>19</td><td>RU 39</td><td>AIO-PP5 · EF #1</td></tr>
<tr><td>8</td><td>RU 35</td><td>AIO-PP6 · EF #2</td><td>20</td><td>RU 39</td><td>AIO-PP6 · EF #2</td></tr>
<tr><td>9</td><td>RU 35</td><td>AIO-PP7 · GH #1</td><td>21</td><td>RU 39</td><td>AIO-PP7 · GH #1</td></tr>
<tr><td>10</td><td>RU 35</td><td>AIO-PP8 · GH #2</td><td>22</td><td>RU 39</td><td>AIO-PP8 · GH #2</td></tr>
<tr><td>11</td><td>RU 35</td><td>AIO-PP9 · IJ #1</td><td>23</td><td>RU 39</td><td>AIO-PP9 · IJ #1</td></tr>
<tr><td>12</td><td>RU 35</td><td>AIO-PP10 · IJ #2</td><td>24</td><td>RU 39</td><td>AIO-PP10 · IJ #2</td></tr>
<tr><td>13</td><td>RU 35</td><td>AIO-PP11 · KL #1</td><td>25</td><td>RU 39</td><td>AIO-PP11 · KL #1</td></tr>
<tr><td>14</td><td>RU 35</td><td>AIO-PP12 · KL #2</td><td>26</td><td>RU 39</td><td>AIO-PP12 · KL #2</td></tr></tbody></table>
<p class="muted">The same panel and lane apply to all 8 columns of an AIO rack, and to both its spot-11 and spot-13 racks; only the DCN-PP rack changes (guide p.45).</p>` },
    { id: 's3', stage: 'Work with it', title: 'Landing the 192F on the back',
      figs: [{ dg: 'dcnppRear', o: { lanes: [{ pair: 'AB', lane: 1 }] }, cap: 'Rear view of one DCN-PP panel (guide p.39). Column A on the right. AIO-PP1 is shown in lane 1 of column pair AB.' }],
      html: `<ol><li>Facing the rear, <b>column A is on the right</b>. Work right to left.</li>
<li>The 24 legs split between <b>2 columns</b>: <b>odd legs in the first column</b> of the pair (A), <b>even legs in the second</b> (B).</li>
<li>Each trunk uses <b>one lane</b> of the column pair; the next AIO's trunk uses the lane beside it. The lanes split vertically.</li>
<li>Leg numbers go up: legs 1-2 in row 1 … legs 23-24 in row 12. <b>Legs 19-24</b> (top 3 rows) are spares to the AIO.</li>
<li><b>One panel holds 12 AIO trunks.</b> Network racks use <b>over-the-top waterfalls</b> (guide p.39; DRS 01.00.02 rule 4), on the side of the rack you patch into (rule 6). Trunk slack on top of the rack. Wrap-around label with the port list; flag label on each leg.</li></ol>` },
    { id: 's4', stage: 'Understand', title: 'The 2x2 shuffle module',
      figs: [{ dg: 'shuffle', o: {}, cap: '2x2 shuffle module, P/N 760262482 (guide p.40).' }],
      html: `<ul><li>A <b>[[2x2|2x2 shuffle module]]</b> takes <b>2 MPO-8 inputs</b> on the back and gives <b>2 MPO-8 outputs</b> on the front. <b>Each output carries fibers from both inputs.</b></li>
<li>There are <b>two</b> 2x2 shuffles inside each module. Each module takes up 4 ports side by side (a column pair).</li>
<li><b>That is why two different AIO trunks must share each module</b>: the two lanes of a column pair. Correct patching spreads every TPU rack across all DCN spines.</li></ul>
<div class="callout conflict"><b>Check the part number before you install (guide p.40).</b> The site patch data lists the 2x2 module, <b>P/N 760262482</b>. Field reports mention a 4x4 module. If a module reads <b>760262479</b>, <b>stop</b>: that is the 4x4 and this lesson does not apply.</div>`,
      analogy: 'Think of shuffling two decks of cards together so every pile you deal out has cards from both decks. <b>Where it stops:</b> the shuffle is fixed glass inside the module — the same fibers always go to the same outputs. Nobody reshuffles it, and you never open it.' },
    { id: 's5', stage: 'Work with it', title: 'The front: cords to the spines',
      figs: [{ dg: 'dcnppFront', o: { row: 1 }, cap: 'Front of one DCN-PP panel, row 1 (guide p.41). Every module\'s 4 front ports go to spines 1, 2, 3, 4 of that DCN-PP\'s group.' }],
      html: `<ul><li>Each module has <b>4 front ports</b>: a1, a2, b3, b4 in the first module, c5, c6, d7, d8 in the next, and so on.</li>
<li>In every module the 4 ports go to <b>spine 1, 2, 3, 4 of that DCN-PP's group</b>, in order.</li>
<li>Each front port is <b>one 8-fiber MPO cord to one spine port</b>. Each cord carries 2 TOR lanes.</li>
<li><b>Each row of the panel lands on the next line-card port</b> on those same 4 spines. The cutsheet gives the exact spine port for every cord.</li>
<li>Flag label both ends. Scope and clean. <b>Over-the-top waterfalls at the spine racks</b> (guide p.41; DRS 01.00.02 rule 4).</li></ul>
<table class="t center small"><thead><tr><th>DCN-PP</th><th>Racks</th><th>Spines</th><th>DCN-PP</th><th>Racks</th><th>Spines</th></tr></thead><tbody>
<tr><td>A</td><td>R107 / R108</td><td>1-4</td><td>E</td><td>R207 / R208</td><td>17-20</td></tr>
<tr><td>B</td><td>R114 / R115</td><td>5-8</td><td>F</td><td>R214 / R215</td><td>21-24</td></tr>
<tr><td>C</td><td>R120 / R121</td><td>9-12</td><td>G</td><td>R220 / R221</td><td>25-28</td></tr>
<tr><td>D</td><td>R127 / R128</td><td>13-16</td><td>H</td><td>R227 / R228</td><td>29-32</td></tr></tbody></table>
<p class="muted">Which physical spine rack is "spine 1" is not listed in the guide. Use the cutsheet.</p>` },
    { id: 's6', stage: 'Connect', title: 'Worked example: one AIO rack, start to finish',
      html: `<p><b>AIO rack R1411</b> (a w/BMS rack, north side of row 14), <b>column E</b> trunk:</p>
<ol class="steps"><li><b>Rack:</b> column E → DCN-PP E. Spot 11 → N rack → <b>R207</b> (DCN-PP E-N).</li>
<li><b>Panel:</b> row 14 is in rows 3-14 → <b>RU 35</b> panel.</li>
<li><b>Lane:</b> landing sheet row R1411 → <b>AIO-PP12 · KL #2</b>: column pair K-L, lane 2.</li>
<li><b>Legs:</b> odd legs in column K, even legs in column L, going up. Legs 19-24 (rows 10-12) are spares.</li>
<li><b>Module:</b> the K-L module mixes this trunk (lane 2) with AIO-PP11 in lane 1 — that is AIO rack R1311. Two different AIO racks: correct.</li>
<li><b>Front:</b> the K-L module's 4 front ports go to spines 1-4 of group E — spines <b>17, 18, 19, 20</b> — at the line-card port for each row, from the cutsheet.</li></ol>` },
    { id: 's7', stage: 'Apply', title: 'Practice: use the landing sheet',
      act: { type: 'scenario', id: 'a9-lookup', title: 'Look it up',
        qs: [
          { q: 'AIO rack <b>R0713</b>, column <b>A</b>. Which rack, panel and lane?', opts: [
            { t: 'R108 · RU 35 panel · AIO-PP5 · EF #1', ok: true, why: 'Spot 13 → S rack (A-S = R108). Row 7 → RU 35, AIO-PP5, EF lane 1.' },
            { t: 'R107 · RU 35 panel · AIO-PP5 · EF #1', ok: false, why: 'R107 is the N rack, for spot-11 AIO racks.' },
            { t: 'R108 · RU 39 panel · AIO-PP5 · EF #1', ok: false, why: 'Rows 3-14 use the RU 35 panel.' },
            { t: 'R108 · RU 35 panel · AIO-PP7 · GH #1', ok: false, why: 'Row 7 is AIO-PP5. Row 9 is AIO-PP7.' }] },
          { q: 'AIO rack <b>R2211</b> (w/BMS), column <b>H</b>. Which rack, panel and lane?', opts: [
            { t: 'R227 · RU 39 panel · AIO-PP8 · GH #2', ok: true, why: 'Column H, spot 11 → R227 (H-N). Row 22 → RU 39, AIO-PP8, GH lane 2.' },
            { t: 'R228 · RU 39 panel · AIO-PP8 · GH #2', ok: false, why: 'Spot 11 lands in the N rack.' },
            { t: 'R227 · RU 35 panel · AIO-PP8 · GH #2', ok: false, why: 'Rows 15-26 use the RU 39 panel.' },
            { t: 'R227 · RU 39 panel · AIO-PP10 · IJ #2', ok: false, why: 'Row 22 = AIO-PP8.' }] },
          { q: 'You open a new box of modules and the label reads <b>P/N 760262479</b>. What do you do?', opts: [
            { t: 'Stop and ask your lead — that is the 4x4 module, and the 2x2 instructions do not apply', ok: true, why: 'Guide p.40.' },
            { t: 'Install it; it is just a newer part number', ok: false, why: 'The guide says stop if it reads 760262479.' },
            { t: 'Install it but only use two of its ports', ok: false, why: 'Do not improvise. Stop and ask.' },
            { t: 'Install it in the RU 39 panel only', ok: false, why: 'Panel position does not change the rule.' }] },
          { q: 'On the front of DCN-PP <b>C</b> (R120), module 3\'s port <b>e10</b> goes to which spine?', opts: [
            { t: 'Spine 10 (the 2nd spine of group C: 9-12)', ok: true, why: 'Ports in a row run A1 A2 B3 B4 C5 C6 D7 D8 E9 E10 F11 F12 … Module 3 = e9, e10, f11, f12 → spines 1-4 of the group. e10 is the 2nd → spine 10.' },
            { t: 'Spine 6', ok: false, why: 'Spine numbers come from the DCN-PP group: C = 9-12.' },
            { t: 'Spine 2', ok: false, why: '2 is the position in the group; group C starts at spine 9.' },
            { t: 'Spine 12', ok: false, why: 'e10 is the 2nd port of the module, not the 4th.' }] }
        ] } }
  ],
  check: [
    { q: 'An AIO rack in row 20 lands its trunks in which DCN-PP panel?', opts: [
      { t: 'The RU 39 panel', ok: true, why: 'Rows 15-26 → RU 39 (p.44).' }, { t: 'The RU 35 panel', ok: false, why: 'RU 35 is for rows 3-14.' },
      { t: 'RU 11-31', ok: false, why: 'Those panels are for halls 1-3.' }, { t: 'The RU 32 panel', ok: false, why: 'RU 32 is the AIO\'s own MPO panel.' }], ref: 's2' },
    { q: 'Why must every 2x2 module hold trunks from two different AIO racks?', opts: [
      { t: 'The module mixes its two inputs so every output carries fibers from both, spreading each TPU rack across all spines', ok: true, why: 'Guide p.40 notes 2 and 4.' },
      { t: 'To balance the weight in the rack', ok: false, why: 'It is about how fibers are mixed.' },
      { t: 'Because each AIO rack only has one trunk', ok: false, why: 'Each AIO rack has 8 trunks.' }, { t: 'So spares can be shared', ok: false, why: 'Spares are separate (legs 19-24).' }], ref: 's4' },
    { q: 'On the back of a DCN-PP panel, where do a trunk\'s odd legs go?', opts: [
      { t: 'In the first column of the column pair (for example column A)', ok: true, why: 'Guide p.39 note 2.' }, { t: 'In the second column of the pair', ok: false, why: 'Even legs go in the second column.' },
      { t: 'In the top three rows', ok: false, why: 'Top three rows hold spare legs 19-24.' }, { t: 'On the front of the panel', ok: false, why: 'Trunks land on the back.' }], ref: 's3' },
    { q: 'DCN-PP F feeds which spines?', opts: [
      { t: 'Spines 21-24', ok: true, why: 'Guide p.41 table.' }, { t: 'Spines 17-20', ok: false, why: 'That is DCN-PP E.' },
      { t: 'Spines 1-4', ok: false, why: 'That is DCN-PP A.' }, { t: 'All 32 spines', ok: false, why: 'Each DCN-PP pair feeds a group of 4.' }], ref: 's5' }
  ]
});
