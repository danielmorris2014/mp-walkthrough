/* Lessons 1-5. Source page numbers refer to the Large Site Cable Installation Guide.
   Markup: [[key]] or [[key|shown text]] links a glossary term. */
window.COURSE = window.COURSE || {};
COURSE.lessons = COURSE.lessons || [];

COURSE.lessons.push({
  id: 'l01', num: 1, title: 'The big picture: what we are building', short: 'Big picture', video: 'v01', mins: 12,
  pages: 'Guide p.1, 4, 11, 46-47',
  objectives: [
    'Say in one sentence what Data Hall 4 is being built for.',
    'Name the places your cables connect: TPU racks, EOR racks, SPOCS racks, DCN patch panels, spines.',
    'List the five cable paths your crew installs, and what you do not touch.',
    'Know the one rule that beats every other: the cutsheet is the final word on any port.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'A room full of AI computers',
      html: `<p>A <b>data hall</b> is one large room filled with <b>racks</b>: tall metal cabinets that hold computer equipment. You are working in <b>Data Hall 4</b> of a large site.</p>
<p>Most racks in this hall are <b>[[TPU|TPU racks]]</b>. TPU stands for <b>Tensor Processing Unit</b>, a computer chip built for artificial-intelligence (AI) work. A TPU rack holds many of these chips. The drawings call it an <b>Ironwood</b> TPU rack.</p>
<div class="callout info"><b>Background (public sources, not the guide):</b> Ironwood is Google's seventh-generation TPU. Google says up to <b>9,216</b> Ironwood chips can work together as one "superpod", and Hot Chips 2025 material describes <b>64 chips per rack</b>. This hall's pods are 144 TPU racks each, and 144 × 64 = 9,216.</div>
<p>One rack on its own is powerful. The big jobs happen when hundreds of racks work as one machine. <b>Your cables are how they work together.</b></p>`,
      analogy: 'Think of each TPU rack as one strong worker, and your cables as the radios that let hundreds of workers act as one crew. <b>Where the analogy stops:</b> the racks do not talk with voices. They send light through glass fiber and electrical signals through copper, and every connection must land on the exact port the cutsheet names.' },
    { id: 's2', stage: 'Understand', title: 'Three jobs your cables do',
      html: `<p>Your cables build three separate connection systems. Each has a different job:</p>
<ol class="big">
<li><b>The data network ([[DCN]] = Data Center Network).</b> Moves the main data between TPU racks and the rest of the data center. Path: the rack's <b>[[TOR|TOR switch]]</b> → <b>[[144F|144-fiber trunk]]</b> → <b>[[EOR|EOR]] / [[AIO|AIO]] rack</b> → <b>[[192F|192-fiber trunks]]</b> → <b>[[DCNPP|DCN patch panels]]</b> → <b>[[spine|DCN spines]]</b>.</li>
<li><b>The optical switch fabric ([[OCS]] = Optical Circuit Switch).</b> Links the TPU racks of one pod to each other through optical switches in the <b>[[SPOCS]]</b> racks. Path: the rack's <b>OCS panel</b> → <b>3 OCS cables</b> → <b>3 SPOCS racks</b>.</li>
<li><b>The management network ([[MGMT]], also called [[OOB]]) and building systems ([[BMS]]).</b> A smaller, separate network people use to set up, control and monitor equipment. Path: <b>copper runs</b> → EOR copper panels → switches → <b>management trunks</b> → <b>management spines</b>.</li>
</ol>
<p>Why three? Each does a different job, and keeping them separate means one can keep working when another has a problem. For example, the management network is how people reach equipment even when the main data network is down.</p>` },
    { id: 's3', stage: 'Connect', title: 'The five cable paths you install',
      html: `<p>This is the whole job on one page (guide p.4). Select any rack or cable to learn what it is.</p>`,
      act: { type: 'explore', id: 'a1-explore', title: 'Explore the cable paths', dg: 'overview', o: {},
        spots: [
          { k: 'n-tpu', t: 'TPU rack — where you start', d: 'A rack of AI computers. Everything inside it arrives pre-cabled. You connect the cables that <b>leave</b> it: one 144F trunk, three OCS cables and six copper runs.' },
          { k: 'n-aio', t: 'EOR / AIO rack — end of the row', d: 'End Of Row rack, also called the All-In-One (AIO) rack. Each one serves 9 TPU racks. The 144F trunks and copper runs land here, and 192F and management trunks leave from here.' },
          { k: 'n-dcnpp', t: 'DCN patch panel rack', d: 'A passive rack in network rows 1-2. The 192F trunks land on its back. Shuffle modules mix fibers from two AIO racks, and short MPO cords connect it to the spines.' },
          { k: 'n-spine', t: 'DCN spine', d: 'The big switches of the Data Center Network. Your work ends at the spine port. Anything past the spines is not yours.' },
          { k: 'n-spocs', t: 'SPOCS racks', d: 'Super Pod OCS racks. Each pod has three (red = 1, orange = 2, yellow = 3), each holding four optical circuit switch shelves.' },
          { k: 'n-mgmt', t: 'Management spine', d: 'The switches that gather all management traffic, in racks R131 and R204.' },
          { k: 'p-144', t: '144F trunk (1 per TPU rack)', d: '144 fibers in 18 legs. From the TPU rack\'s TOR switch to the front of its EOR rack\'s MPO panel. Guide 1 and the Large Size Guide.' },
          { k: 'p-cu', t: '6 CAT6 copper runs', d: 'Two from the TOR, two from each TROSS / RMU. Straight to jacks in the EOR copper panels. Guides 1 and 3.' },
          { k: 'p-192', t: '8 × 192F trunks (per EOR rack)', d: 'From the back of the EOR rack\'s MPO panel, one to each of the 8 DCN patch panel racks (A-H). Large Size Guide and Trunk Landing Sheet.' },
          { k: 'p-mpo', t: 'MPO cords to the spines', d: 'Short 8-fiber cords from the front of the DCN patch panels to the spine ports. The cutsheet gives each spine port.' },
          { k: 'p-ocs', t: '3 OCS cables (18 fibers each)', d: 'From the TPU rack\'s OCS panel to its pod\'s three SPOCS racks. Jacket color tells you the destination: red → SPOCS 1, orange → SPOCS 2, yellow → SPOCS 3.' },
          { k: 'p-mgmt', t: '12F / 24F management trunks', d: 'From each EOR rack\'s RU 39 LC panel to the two management spines. Standard EOR racks use 12F; the six w/BMS racks use 24F.' },
          { k: 'p-smgmt', t: 'SPOCS management cords', d: 'Long 2-fiber LC cords from each SPOCS rack\'s management switches to the nearest EOR w/BMS rack.' }
        ] } },
    { id: 's4', stage: 'Work with it', title: 'What is yours, and what is not',
      html: `<div class="two"><div><h3 class="h4">You install (guide p.4)</h3><ol>
<li>The <b>144F trunk</b> from each TPU rack to its EOR rack.</li>
<li>The <b>192F trunks</b> from each EOR rack to the DCN patch panels, and the cords to the spines.</li>
<li>The <b>3 OCS cables</b> from each TPU rack to its 3 SPOCS racks.</li>
<li>The <b>6 copper runs</b> from each TPU rack to its EOR rack.</li>
<li>The <b>management trunks</b> from each EOR rack to the management spines, and the <b>SPOCS management cords</b>.</li></ol></div>
<div><h3 class="h4">You do not touch</h3><ol>
<li><b>Anything inside the TPU rack</b>: machines, trays, [[DAC]] and [[CDFP]] cables, batteries. It arrives pre-cabled.</li>
<li><b>Anything past the spines.</b></li></ol>
<p class="tip"><b>Quick test from the guide (p.12):</b> if a cable never leaves the rack, it is not yours.</p></div></div>` },
    { id: 's5', stage: 'Work with it', title: 'The rule that beats every other rule',
      html: `<div class="callout key"><b>Your site's [[cutsheet]] is the final word on any port.</b> The cutsheet is the spreadsheet that lists every cable and every stop it makes. If a label, this course or the guide disagrees with the cutsheet: <b>stop and ask your lead.</b> Do not guess.</div>
<p>This course teaches the patterns in the guide so you understand <i>why</i> each cable goes where it goes. On the job, you confirm each connection against the cutsheet row for that cable.</p>` },
    { id: 's6', stage: 'Apply', title: 'Practice: match the cable to its job',
      act: { type: 'match', id: 'a1-match', title: 'Where does each cable go?', intro: 'Pick the destination for each cable that leaves a TPU rack or EOR rack.',
        pairs: [
          ['144F trunk (from the TPU rack)', 'The front of its EOR rack\'s MPO panel'],
          ['3 OCS cables', 'The 3 SPOCS racks of its pod'],
          ['6 CAT6 copper runs', 'Jacks in its EOR rack\'s copper panels'],
          ['8 × 192F trunks (from the EOR rack)', 'The 8 DCN patch panel racks'],
          ['12F / 24F management trunks', 'The 2 management spines']
        ],
        why: 'Fiber trunks carry data toward the DCN spines. OCS cables tie the pod\'s racks to its SPOCS racks. Copper and management trunks carry the management network.' } },
    { id: 's7', stage: 'Apply', title: 'Practice: spot the mistake',
      act: { type: 'scenario', id: 'a1-mistake', title: 'Is this right?',
        qs: [
          { q: 'A new crew member wants to make room for a cable, so he starts unplugging a short DAC cable inside the TPU rack. What should happen?',
            opts: [
              { t: 'Stop him. Anything inside the TPU rack, including DAC and CDFP cables, is pre-installed and not ours.', ok: true, why: 'The guide is clear: anything inside the TPU rack arrives pre-cabled and is not touched (p.4).' },
              { t: 'Let him, as long as he plugs it back into the same port.', ok: false, why: 'Even a careful unplug and replug risks damage, and it is outside your scope. Leave internal cabling alone.' },
              { t: 'Let him, but label the DAC cable first.', ok: false, why: 'Labeling does not make it ours. DAC cables inside the rack are pre-installed and not touched.' },
              { t: 'It is fine because DAC cables are copper, not fiber.', ok: false, why: 'Material does not matter here. The rule is about location: inside the TPU rack is not yours.' }
            ], hint: 'Think about the "do not touch" list.' }
        ] } }
  ],
  check: [
    { q: 'In this project, what does TPU stand for?', opts: [
      { t: 'Tensor Processing Unit — a chip built for AI work; a "TPU rack" is a rack of these computers', ok: true, why: 'Guide p.11 and glossary p.47.' },
      { t: 'Top Port Unit — the top row of ports on a switch', ok: false, why: 'The top row of ports is on the TOR (Top Of Rack) switch. TPU is the AI chip.' },
      { t: 'Trunk Patch Unit — the panel where trunks land', ok: false, why: 'Trunks land on patch panels (PP). TPU is the AI chip and its rack.' },
      { t: 'Terminal Power Unit — the rack\'s battery shelf', ok: false, why: 'Batteries are inside the TPU rack, but TPU means Tensor Processing Unit.' }], ref: 's1' },
    { q: 'Which cables go from one TPU rack to its pod\'s three SPOCS racks?', opts: [
      { t: 'Three 18-fiber OCS cables: red, orange and yellow', ok: true, why: 'One OCS cable goes to each SPOCS rack (p.4, 18).' },
      { t: 'The 144F trunk, split three ways', ok: false, why: 'The 144F trunk goes to the EOR rack, not the SPOCS racks.' },
      { t: 'Three of the six CAT6 copper runs', ok: false, why: 'All six copper runs go to the EOR rack.' },
      { t: 'Three 192F trunks', ok: false, why: '192F trunks leave the EOR rack for the DCN patch panels.' }], ref: 's3' },
    { q: 'Which of these is NOT yours to touch?', opts: [
      { t: 'The CDFP cables inside the TPU rack', ok: true, why: 'Machines, trays, DAC and CDFP cables and batteries inside the TPU rack are pre-installed (p.4).' },
      { t: 'The odd ports on the TOR switch', ok: false, why: 'The odd TOR ports are exactly where your 144F trunk legs go.' },
      { t: 'The OCS panel (pp1) on the TPU rack', ok: false, why: 'The OCS panel is where your 3 OCS cables plug in.' },
      { t: 'The EOR copper panels', ok: false, why: 'Your 6 copper home runs land on the EOR copper panels.' }], ref: 's4' },
    { q: 'The label on a cable and the cutsheet row for it do not match. What do you do?', opts: [
      { t: 'Stop and ask your lead before connecting anything', ok: true, why: '"If the label and the cutsheet row do not match, stop and ask" (p.6, 8).' },
      { t: 'Follow the label, because it is attached to the cable', ok: false, why: 'Labels can be wrong. The cutsheet is the final word, and a mismatch means stop and ask.' },
      { t: 'Follow this course\'s pattern instead', ok: false, why: 'The course explains patterns; the cutsheet decides. A mismatch means stop and ask.' },
      { t: 'Reprint the label to match the cutsheet and keep going', ok: false, why: 'A mismatch may mean the cable itself is wrong. Ask your lead first.' }], ref: 's5' }
  ]
});

COURSE.lessons.push({
  id: 'l02', num: 2, title: 'Finding your way in Data Hall 4', short: 'Hall map', video: 'v02', mins: 15,
  pages: 'Guide p.5, 11, 18, 25, 33, 44',
  objectives: [
    'Read a rack location code such as SITE-DH4-R0512.',
    'Find the network rows, compute rows and the three pods on the hall map.',
    'Know where TPU racks, EOR racks, SPOCS racks and w/BMS racks sit in a row.',
    'Work out which EOR rack serves a TPU rack.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'The hall map',
      html: `<p>This is Data Hall 4 from above (guide p.5). It is a <b>Large</b> hall: three pods (10, 11 and 12) in <b>compute rows 3-26</b>, with <b>network rows 1-2</b> on the west end (left side of the map).</p>
<p>Each little striped box is one <b>TPU rack</b>. The stripes stand for the six cable groups you install on it. White boxes are <b>EOR</b> racks. Orange boxes in the middle aisle are <b>SPOCS</b> racks.</p>`,
      figs: [{ dg: 'hallMap', o: {}, cap: 'Data Hall 4 (Large). Rows run left to right. Spots count down each row. Drawn from guide p.5 and p.33.', zoom: true }] },
    { id: 's2', stage: 'Understand', title: 'Reading a location code',
      html: `<p>Every rack has a location. Read it left to right: <b>site - hall - row - spot</b>.</p>`,
      figs: [{ dg: 'locationCode', o: {}, cap: 'SITE-DH4-R0512 = hall 4, row 5, spot 12: the first SPOCS rack of pod 10 (guide p.5).' }],
      after: `<ul><li>On the map a rack shows only <b>row + spot</b>: 512 means row 5, spot 12.</li>
<li>Network racks read the same way: <b>107</b> is row 1, spot 07.</li>
<li>A <b>[[spot]]</b> is a rack's place in its row. Rows run left to right on the map; spots count down each row.</li></ul>
<p class="tip"><b>Tip:</b> split the last digits. The last two digits are the spot. Everything before them is the row. 1412 → row 14, spot 12. 2213 → row 22, spot 13.</p>` },
    { id: 's3', stage: 'Understand', title: 'The pattern inside every compute row',
      html: `<p>Every compute row follows the same pattern from top to bottom of the map (guide p.33):</p>
<table class="t"><thead><tr><th>Spot</th><th>What is there</th></tr></thead><tbody>
<tr><td>end of row</td><td>CDU (row-end block on the map; not part of your work)</td></tr>
<tr><td>02-10</td><td><b>9 TPU racks</b> north of the middle aisle</td></tr>
<tr><td>11</td><td><b>EOR (AIO) rack</b> for the 9 north racks</td></tr>
<tr><td>12</td><td>Middle aisle. <b>SPOCS rack</b> here only in rows 5-7, 13-15, 21-23</td></tr>
<tr><td>13</td><td><b>EOR (AIO) rack</b> for the 9 south racks</td></tr>
<tr><td>14-22</td><td><b>9 TPU racks</b> south of the middle aisle</td></tr>
<tr><td>end of row</td><td>CDU</td></tr></tbody></table>
<p>So each row has <b>18 TPU racks</b> and <b>2 EOR racks</b>. Rows pair up across a <b>hot aisle</b> (rows 3-4, 5-6 ...), and even rows are mirror images.</p>
<div class="callout info"><b>CDU</b> is not defined in the guide. In liquid-cooled data centers it normally means <b>Coolant Distribution Unit</b>, the unit that pumps coolant to the racks. You do not cable it.</div>` },
    { id: 's4', stage: 'Connect', title: 'Pods and their SPOCS racks',
      html: `<p>A <b>[[pod]]</b> is a group of <b>144 TPU racks</b> that share <b>3 SPOCS racks</b>. Each pod covers 8 rows (8 × 18 = 144).</p>
<table class="t"><thead><tr><th>Pod</th><th>Compute rows</th><th>SPOCS 1 (red)</th><th>SPOCS 2 (orange)</th><th>SPOCS 3 (yellow)</th><th>EOR w/BMS racks</th></tr></thead><tbody>
<tr><td>10</td><td>3-10</td><td>512</td><td>612</td><td>712</td><td>611, 613</td></tr>
<tr><td>11</td><td>11-18</td><td>1312</td><td>1412</td><td>1512</td><td>1411, 1413</td></tr>
<tr><td>12</td><td>19-26</td><td>2112</td><td>2212</td><td>2312</td><td>2211, 2213</td></tr></tbody></table>
<p>The six <b>[[wbms|EOR w/BMS]]</b> racks are a special EOR type with extra building-management parts. You will meet them again in lessons 13 and 14.</p>` },
    { id: 's5', stage: 'Connect', title: 'Network rows 1 and 2',
      html: `<p>The west end of the hall holds the network racks your trunks end at (guide p.44).</p>`,
      figs: [{ dg: 'networkRows', o: {}, cap: 'Network rows 1 and 2. Pink = DCN patch panel racks (PP A-N ... PP H-S). Purple = DCN spines. White = management spines R131 and R204.' }],
      after: `<ul><li><b>DCN-PP racks come in pairs:</b> an N rack and an S rack. A-N 107 / A-S 108, B 114/115, C 120/121, D 127/128 in row 1; E 207/208, F 214/215, G 220/221, H 227/228 in row 2.</li>
<li><b>Management spines:</b> R131 and R204.</li>
<li>Oxide, SASL and FU racks are not explained in the guide and are not part of your work.</li>
<li>The other three halls on this site also send trunks into these same network rows.</li></ul>` },
    { id: 's6', stage: 'Work with it', title: 'Worked example: which EOR serves rack 1517?',
      html: `<ol class="steps">
<li><b>Split the number:</b> 1517 → row 15, spot 17.</li>
<li><b>Which side of the middle aisle?</b> Spot 17 is in 14-22, so it is <b>south</b>.</li>
<li><b>South racks use the EOR at spot 13.</b> So the EOR is <b>1513</b>.</li>
<li><b>Which pod?</b> Row 15 is in 11-18, so <b>pod 11</b>. Its SPOCS racks are 1312, 1412 and 1512.</li></ol>
<p>Same steps for rack 905: row 9, spot 05 → north → EOR <b>911</b>, pod 10.</p>` },
    { id: 's7', stage: 'Apply', title: 'Practice: find it on the map',
      act: { type: 'pick', id: 'a2-pick', title: 'Click the right rack', dg: 'hallMap', o: {}, clickPrefix: 'r-',
        tasks: [
          { q: 'Click the <b>SPOCS 2 (orange)</b> rack for <b>pod 11</b>.', ok: ['r-1412'], hint: 'Pod 11 SPOCS racks are at spot 12 in rows 13, 14, 15. SPOCS 2 is the middle one.', why: 'Pod 11 uses rows 13-15 for its SPOCS racks: 1312 (red, 1), 1412 (orange, 2), 1512 (yellow, 3).' },
          { q: 'Click the <b>EOR rack that serves TPU rack 2306</b>.', ok: ['r-2311'], hint: 'Spot 06 is north of the middle aisle. North racks use spot 11.', why: '2306 = row 23, spot 06, north side → EOR at spot 11 → 2311.' },
          { q: 'Click any <b>EOR w/BMS</b> rack in <b>pod 12</b>.', ok: ['r-2211', 'r-2213'], hint: 'The w/BMS racks sit in the middle SPOCS row of each pod.', why: 'Pod 12\'s w/BMS racks are 2211 and 2213 (guide p.25).' },
          { q: 'Click <b>DCN-PP A-N</b> in network row 1.', ok: ['r-107'], hint: 'Network racks read row + spot. DCN-PP A-N is row 1, spot 07.', why: 'R107 is DCN-PP A-N; its partner A-S is R108.' }
        ] } },
    { id: 's8', stage: 'Apply', title: 'Practice: decode the location',
      act: { type: 'match', id: 'a2-decode', title: 'What is at each location?', intro: 'Choose what you will find at each location.',
        pairs: [
          ['SITE-DH4-R0512', 'SPOCS rack 1 (red) for pod 10'],
          ['SITE-DH4-R1411', 'EOR w/BMS rack, north side of row 14'],
          ['SITE-DH4-R0820', 'TPU rack, south side of row 8'],
          ['SITE-DH4-R0204', 'Management spine rack (MGMT) in network row 2'],
          ['SITE-DH4-R0128', 'DCN patch panel rack D-S']
        ],
        why: 'Read site - hall - row - spot. Spot 12 in rows 5-7 = pod 10 SPOCS; spot 11/13 = EOR; spots 2-10 and 14-22 = TPU racks; network rows are 1 and 2.' } }
  ],
  check: [
    { q: 'What does the location SITE-DH4-R0613 tell you?', opts: [
      { t: 'Hall 4, row 6, spot 13 — an EOR w/BMS rack on the south side', ok: true, why: 'Row 06, spot 13. 613 is one of the six w/BMS racks.' },
      { t: 'Hall 4, rack 613 in pod 13', ok: false, why: 'There is no pod 13. The last two digits are the spot.' },
      { t: 'Hall 6, row 13', ok: false, why: 'DH4 is the hall. R06 is the row, 13 the spot.' },
      { t: 'Hall 4, row 61, spot 3', ok: false, why: 'Rows only go up to 26. R06 = row 6, then spot 13.' }], ref: 's2' },
    { q: 'TPU rack 1009 is served by which EOR rack?', opts: [
      { t: '1011', ok: true, why: 'Spot 09 is north (spots 2-10), so the EOR is at spot 11 of the same row.' },
      { t: '1013', ok: false, why: 'Spot 13 serves the south racks (spots 14-22). Spot 09 is north.' },
      { t: '1012', ok: false, why: 'Spot 12 is the middle aisle, not an EOR.' },
      { t: '911', ok: false, why: 'EOR racks serve their own row. Rack 1009 is in row 10.' }], ref: 's6' },
    { q: 'How many TPU racks are in one pod, and how many SPOCS racks do they share?', opts: [
      { t: '144 TPU racks sharing 3 SPOCS racks', ok: true, why: '8 rows × 18 TPU racks = 144, sharing 3 SPOCS racks (p.33).' },
      { t: '18 TPU racks sharing 1 SPOCS rack', ok: false, why: '18 is one row. A pod is 8 rows.' },
      { t: '432 TPU racks sharing 9 SPOCS racks', ok: false, why: '432 is the whole hall (3 pods).' },
      { t: '9 TPU racks sharing 3 SPOCS racks', ok: false, why: '9 is how many TPU racks one EOR serves.' }], ref: 's4' },
    { q: 'Where are the management spine racks?', opts: [
      { t: 'R131 and R204 in the network rows', ok: true, why: 'Guide p.25 and p.30.' },
      { t: 'At spot 12 of every row', ok: false, why: 'Spot 12 holds SPOCS racks in some rows; the management spines are in the network rows.' },
      { t: 'In the EOR w/BMS racks', ok: false, why: 'The w/BMS racks send trunks to the management spines, which are in R131 and R204.' },
      { t: 'R107 and R108', ok: false, why: 'R107 and R108 are DCN-PP A-N and A-S.' }], ref: 's5' }
  ]
});

COURSE.lessons.push({
  id: 'l03', num: 3, title: 'Fiber and copper basics', short: 'Fiber & copper basics', video: 'v03', mins: 18,
  pages: 'Guide p.7, 8, 12-13, 20, 46-47; DRS 01.00.01',
  objectives: [
    'Explain what a fiber count like 144F means.',
    'Recognize a trunk, a leg, a split point, an MPO-8 plug, an LC duplex plug and an RJ45 plug.',
    'Recite the TIA-598 color order and know why you still read the leg number.',
    'Handle fiber correctly: scope and clean, keep the bend wide (DRS 01.00.01), never mix APC and UPC.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'What a fiber is',
      html: `<p>An optical <b>fiber</b> is a strand of glass about as thin as a hair. Equipment sends data through it as pulses of light. Fibers usually work in pairs: one fiber <b>sends</b> and the other <b>receives</b>.</p>
<p>In the guide, the letter <b>[[F]]</b> means fibers. <b>144F</b> means 144 fibers. <b>2F</b> means 2 fibers.</p>
<p>Fiber is used for the data network and the OCS fabric because it carries huge amounts of data over long runs. Copper (CAT6) is used for the management connections, which carry much less data over shorter runs.</p>` },
    { id: 's2', stage: 'Recognize', title: 'Trunks, legs and the split point',
      html: `<p>A <b>[[trunk]]</b> is a thick cable with many fibers inside one jacket. At each end it breaks out at the <b>[[split|split point]]</b> into <b>[[leg|legs]]</b>. Each leg ends in a connector.</p>`,
      figs: [{ dg: 'trunk144', o: {}, cap: 'The 144F trunk: 18 legs, each an MPO-8 plug with 8 fibers. 18 × 8 = 144.' }],
      after: `<ul><li>The <b>144F trunk</b> has <b>18 legs</b> (16 used + 2 spares).</li><li>The <b>192F trunk</b> has <b>24 legs</b>.</li><li>An <b>OCS cable</b> (18F) has <b>9 LC legs</b> at each end (8 used + 1 spare).</li></ul>`,
      analogy: 'A trunk is like a tree trunk that splits into branches. <b>Where it stops:</b> every branch here has a number and a color, and each one must go to one exact port.' },
    { id: 's3', stage: 'Recognize', title: 'The connectors you will handle',
      figs: [{ dg: 'connectors', o: {}, cap: 'Left to right: MPO-8 (trunk legs and MPO cords), LC duplex APC (OCS legs and management cords), RJ45 plug (copper), and the jack it ends on.' }],
      html: `<table class="t"><thead><tr><th>Connector</th><th>Fibers / wires</th><th>Where you see it</th></tr></thead><tbody>
<tr><td><b>[[MPO|MPO-8]]</b> (Multi-fiber Push-On)</td><td>8 fibers</td><td>Every 144F and 192F trunk leg; the MPO cords to the spines</td></tr>
<tr><td><b>[[LC]] duplex, [[APC]]</b></td><td>2 fibers</td><td>OCS cable legs (LC/APC); management cords are 2-fiber LC duplex</td></tr>
<tr><td><b>[[RJ45]]</b> plug</td><td>8 copper wires</td><td>TPU-rack end of the 6 copper home runs</td></tr>
<tr><td><b>[[jack|Jack]]</b></td><td>socket</td><td>EOR copper panels, where home runs are terminated</td></tr></tbody></table>
<div class="callout warn"><b>APC vs UPC:</b> APC connectors have an angled (8°) glass end face and are usually <b>green</b>. UPC connectors are flat and usually <b>blue</b>. <b>Never plug one into the other</b>: the fiber cores do not line up and the end faces can be damaged (Fluke Networks). If a plug and a port do not match, stop and ask.</div>` },
    { id: 's4', stage: 'Understand', title: 'The TIA-598 color code',
      html: `<p>Legs and fibers are told apart by color, using the <b>[[TIA598|TIA-598]]</b> standard (guide p.8):</p>`,
      figs: [{ dg: 'colorStrip', o: {}, cap: 'TIA-598 order, 1 to 12. Learn it in three groups of four.' }],
      after: `<p class="big-order"><b>Blue · Orange · Green · Brown</b> &nbsp;|&nbsp; <b>Slate · White · Red · Black</b> &nbsp;|&nbsp; <b>Yellow · Violet · Rose · Aqua</b></p>
<p>After 12 the colors <b>repeat</b>. On the 144F trunk, legs 13-16 are blue, orange, green and brown again (guide p.13). The guide's drawing marks the second round with a dark bar. <b>Because colors repeat, always check the leg number on the label.</b> Color helps you find a leg fast; the number tells you for sure.</p>`,
      figs2: [{ dg: 'colorStrip', o: { from: 13, to: 18 }, cap: 'Legs 13-18 repeat colors 1-6. Leg 13 and leg 1 are both blue.' }] },
    { id: 's5', stage: 'Understand', title: 'Copper cable',
      html: `<p><b>[[CAT6]]</b> is copper network (Ethernet) cable. It ends in an <b>RJ45</b> plug. In this job copper carries the <b>management</b> and <b>console</b> connections from each TPU rack to its EOR rack.</p>
<p>Copper jacket colors (guide p.8): <b>orange = [[OOB]] management</b>, <b>blue = BMS</b>, <b>green = [[FIS]]</b>, <b>black = intra-rack</b>. The guide says to check which colors your site stocks. "FIS" is not explained in the guide; ask your lead if you see green copper.</p>` },
    { id: 's6', stage: 'Work with it', title: 'Handling fiber the right way',
      html: `<ol class="steps">
<li><b>Scope and clean every leg before it goes in</b> (guide p.13, 15, 22, 36). The <b>[[scope]]</b> is a handheld camera for looking at the fiber end face.<br><span class="muted">Why: dirt is the number-one reason optical networks need troubleshooting (VIAVI), and it can permanently damage equipment. Inspecting <b>both</b> sides of a connection is the only way to be sure it is clean.</span></li>
<li><b>Keep the bend wide.</b> DRS 01.00.01 rule 3: follow the manufacturer's spec, and never less than <b>20 × the cable diameter</b> while loaded (pulling) or <b>10 ×</b> unloaded (no tension). The guide (p.7) adds <b>15 ×</b> as the long-term recommendation. Lesson 5 covers this in full.</li>
<li><b>Nothing touches the floor.</b> Spares are dressed up, not left hanging to the floor.</li>
<li><b>Match connector types.</b> APC to APC. Never force a plug.</li></ol>`,
      figs: [{ dg: 'bend', o: {}, cap: 'Bend radius: DRS 01.00.01 minimums (20× loaded, 10× unloaded, or the manufacturer\'s spec if larger), plus the guide\'s 15× long-term recommendation.' }] },
    { id: 's7', stage: 'Apply', title: 'Practice: put the colors in order',
      act: { type: 'order', id: 'a3-order', title: 'TIA-598 colors 1 to 12', intro: 'Use the arrow buttons to put the colors in TIA-598 order, 1 at the top.',
        items: ['Blue', 'Orange', 'Green', 'Brown', 'Slate', 'White', 'Red', 'Black', 'Yellow', 'Violet', 'Rose', 'Aqua'],
        why: 'Blue, Orange, Green, Brown | Slate, White, Red, Black | Yellow, Violet, Rose, Aqua.' } },
    { id: 's8', stage: 'Apply', title: 'Practice: connectors and colors',
      act: { type: 'scenario', id: 'a3-scen', title: 'Quick decisions',
        qs: [
          { q: 'You pick up a 144F trunk leg with a blue boot. Which leg is it?', opts: [
            { t: 'Either leg 1 or leg 13. Read the number on the label to know.', ok: true, why: 'Colors repeat after 12, so blue can be leg 1 or leg 13.' },
            { t: 'Leg 1, because blue is always first', ok: false, why: 'Leg 13 is also blue. The label number decides.' },
            { t: 'Leg 13, because second-round legs are on the outside', ok: false, why: 'You cannot tell from position. Read the label.' },
            { t: 'It is a spare, because spares are blue', ok: false, why: 'The 144F spares are legs 17 (slate) and 18 (white).' }] },
          { q: 'An OCS leg (green connector) does not seem to fit a port with a blue adapter. What do you do?', opts: [
            { t: 'Stop and ask your lead. Green usually means APC and blue usually means UPC; never mix them.', ok: true, why: 'Mating APC to UPC causes poor performance and can damage end faces.' },
            { t: 'Push harder; LC connectors are stiff when new', ok: false, why: 'Never force a fiber connector. A mismatch can damage it.' },
            { t: 'Use the nearest open port with a green adapter', ok: false, why: 'Ports come from the cutsheet. Moving to another port creates a wrong connection.' },
            { t: 'Swap the leg with another leg that fits', ok: false, why: 'Each leg has one correct port. Ask instead of swapping.' }] },
          { q: 'Which is the correct order when you connect a fiber leg?', opts: [
            { t: 'Check the label against the cutsheet, scope and clean, then plug in', ok: true, why: 'Confirm it is the right leg, make sure it is clean, then connect.' },
            { t: 'Plug in, then scope if the link does not work', ok: false, why: 'Scope and clean every leg <i>before</i> it goes in. A dirty plug can contaminate the port.' },
            { t: 'Clean only the legs that look dirty', ok: false, why: 'Contamination is often invisible without the scope. Every leg gets scoped and cleaned.' },
            { t: 'Plug in all legs first, label them afterwards', ok: false, why: 'Labels are checked against the cutsheet before connecting.' }] }
        ] } }
  ],
  check: [
    { q: 'What does "144F" tell you?', opts: [
      { t: 'The cable has 144 fibers', ok: true, why: 'F means fibers (p.4).' },
      { t: 'The cable is 144 feet long', ok: false, why: 'F is a fiber count, not feet.' },
      { t: 'The cable has 144 legs', ok: false, why: 'It has 18 legs of 8 fibers each.' },
      { t: 'It goes to port 144', ok: false, why: 'The number is the fiber count.' }], ref: 's1' },
    { q: 'How many fibers does one MPO-8 leg hold?', opts: [
      { t: '8', ok: true, why: 'MPO-8 = 8 fibers. 18 legs × 8 = 144.' }, { t: '2', ok: false, why: '2 fibers is an LC duplex leg.' },
      { t: '12', ok: false, why: 'This job uses MPO-8: 8 fibers.' }, { t: '144', ok: false, why: '144 is the whole trunk.' }], ref: 's3' },
    { q: 'What is the 7th color in the TIA-598 order?', opts: [
      { t: 'Red', ok: true, why: 'Blue, Orange, Green, Brown, Slate, White, Red.' }, { t: 'Black', ok: false, why: 'Black is 8th.' },
      { t: 'White', ok: false, why: 'White is 6th.' }, { t: 'Yellow', ok: false, why: 'Yellow is 9th.' }], ref: 's4' },
    { q: 'What is the minimum bend radius while you are pulling a cable?', opts: [
      { t: '20 times the cable diameter', ok: true, why: 'DRS 01.00.01 rule 3: loaded (under tension) 20 ×, unloaded 10 ×, or the manufacturer\'s spec if larger.' },
      { t: '10 times the cable diameter', ok: false, why: '10 × is the minimum with no tension, not while pulling.' },
      { t: '15 times the cable diameter', ok: false, why: '15 × is the guide\'s long-term recommendation, not the minimum while pulling.' },
      { t: 'As tight as it will go without breaking', ok: false, why: 'Tight bends damage fiber even when it does not break.' }], ref: 's6' },
    { q: 'Orange copper cable at this site usually means:', opts: [
      { t: 'OOB (out-of-band) management — check which colors your site stocks', ok: true, why: 'Guide p.8: orange = OOB management, blue = BMS, green = FIS, black = intra-rack.' },
      { t: 'BMS', ok: false, why: 'Blue is BMS.' }, { t: 'OCS cable 2', ok: false, why: 'Orange OCS cables are fiber, not copper.' }, { t: 'Intra-rack', ok: false, why: 'Black is intra-rack.' }], ref: 's5' }
  ]
});

COURSE.lessons.push({
  id: 'l04', num: 4, title: 'Reading the cutsheet and labels', short: 'Cutsheet & labels', video: 'v04', mins: 14,
  pages: 'Guide p.6, 8, 36',
  objectives: [
    'Tell a device name from a location.',
    'Read panel port codes in both forms the guide uses.',
    'Read one cutsheet row from A to Z, including SPARE rows.',
    'Choose the right label type, place it correctly and check its text.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'Names and locations',
      html: `<p>Every device has a <b>name</b> and a <b>location</b>. The cutsheet gives both (guide p.6).</p>
<ul><li>A <b>name</b> says <i>what</i> a device is, from big to small: <code>site</code> · <code>pod1</code> · <code>rack1</code> · <code>tor1</code> (data center, pod, rack in pod, device).</li>
<li>A <b>location</b> says <i>where</i> it is: <code>SITE-DH4-R0512</code> (lesson 2).</li></ul>
<p>Device names you will meet: <code>tor1</code> (the TOR switch), <code>rmu1</code> and <code>rmu2</code> (the TROSS units), <code>pp1</code> (the TPU rack's OCS panel).</p>` },
    { id: 's2', stage: 'Understand', title: 'Panel port codes',
      html: `<p>A panel port code says exactly which hole on a panel to use. The guide shows two ways of writing the same spot:</p>
<table class="t"><thead><tr><th>Where you see it</th><th>Example</th><th>Means</th></tr></thead><tbody>
<tr><td>Cutsheet code (p.6)</td><td><code>r1-a1</code></td><td>row 1, column a, port 1</td></tr>
<tr><td>Pre-printed on the AIO MPO panel (p.36)</td><td><code>A1-1</code></td><td>column A, port 1, row 1</td></tr></tbody></table>
<p><b>Rows count up from the bottom</b> of the panel: row 1 is the lowest. <b>Column letters</b> are printed on the panel.</p>
<div class="callout warn">The two forms put the pieces in a different order. Read each piece by its letter: <b>r</b> = row in the cutsheet code; in the panel label the <b>letter</b> is the column and the number after the dash is the row. If you are unsure which form a document uses, ask.</div>` },
    { id: 's3', stage: 'Understand', title: 'One cutsheet row',
      figs: [{ dg: 'cutsheet', o: {}, cap: 'Every cable you install has one row in the cutsheet (guide p.6).' }],
      html: `<ul><li><b>A side</b>: where the cable starts — A_loc, A_name, A_port.</li>
<li><b>A panel</b>: the first panel and port it lands on.</li>
<li><b>Trunk / leg</b>: the big cable in the middle, and which leg.</li>
<li><b>Z panel</b>: the last panel and port it lands on.</li>
<li><b>Z side</b>: where the cable ends — Z_loc, Z_name, Z_port.</li></ul>
<p>A row that says <b>[[spare|SPARE]]</b> is a leg you <b>land and label</b> but <b>do not plug into a device</b>.</p>` },
    { id: 's4', stage: 'Work with it', title: 'Labels: which kind, where, and what text',
      figs: [{ dg: 'labels', o: {}, cap: 'Flag label and wrap-around label (guide p.8).' }],
      html: `<table class="t"><thead><tr><th>Cable</th><th>Label</th><th>Where</th></tr></thead><tbody>
<tr><td>Single connector, breakout leg, copper run</td><td><b>[[flag|Flag label]]</b>, printed both sides, barcode at bottom</td><td><b>4 in</b> from the boot (or plug)</td></tr>
<tr><td>Trunk (144F, 192F, 12F, 24F, OCS bundle)</td><td><b>[[wrap|Wrap-around label]]</b>, at least 1 in wide</td><td><b>1-2 in</b> from the boot of each end connector</td></tr></tbody></table>
<h3 class="h4">Label rules (guide p.8)</h3><ol>
<li><b>Machine printed only.</b> No handwritten labels. Calibri Bold, 8 pt minimum on 2-inch labels, 10 pt on larger labels.</li>
<li><b>Line 1: the A device and port. Line 2: the Z device and port.</b></li>
<li><b>Both ends get the same text</b>, and it must match the cutsheet.</li>
<li>Trunk labels list every port the legs land on: <code>[1:4]</code> = ports 1 through 4; <code>[1,3,5,7]</code> = a list; <code>/</code> separates line card / port / channel.</li>
<li>If a label and the cutsheet disagree, <b>stop and ask</b>.</li></ol>` },
    { id: 's5', stage: 'Work with it', title: 'Worked example: reading a row and checking a label',
      html: `<div class="callout info"><b>Illustration only.</b> This row is made up to show the format. Your cutsheet's exact columns and device names come from your site.</div>
<table class="t mono"><thead><tr><th>A_loc</th><th>A_name</th><th>A_port</th><th>Trunk / leg</th><th>Z_loc</th><th>Z_name</th><th>Z_port</th></tr></thead>
<tbody><tr><td>SITE-DH4-R0504</td><td>…rack3 · tor1</td><td>port 1</td><td>144F · leg 1</td><td>SITE-DH4-R0511</td><td>MPO panel</td><td>A1-3</td></tr></tbody></table>
<ol class="steps"><li><b>A side:</b> TPU rack 504, its TOR switch, port 1.</li>
<li><b>Middle:</b> the 144F trunk, leg 1 (blue).</li>
<li><b>Z side:</b> EOR rack 511, MPO panel position A1-3 = column A, port 1, row 3.</li>
<li><b>Label check:</b> the leg's flag label reads line 1 = the A device and port, line 2 = the Z device and port, the same at both ends, matching this row. If it does not match: stop and ask.</li></ol>` },
    { id: 's6', stage: 'Apply', title: 'Practice: choose the label',
      act: { type: 'match', id: 'a4-labels', title: 'Which label, and where?', intro: 'Choose the correct label for each item.',
        pairs: [
          ['A 144F trunk, near the end connector', 'Wrap-around label, 1-2 in from the boot'],
          ['One leg of an OCS cable', 'Flag label, 4 in from the boot'],
          ['A CAT6 copper home run', 'Flag label, 4 in from the plug, both sides printed'],
          ['A 24F management trunk', 'Wrap-around label, 1-2 in from the boot'],
          ['A spare leg that will not be plugged in', 'Still labeled: flag label, 4 in from the boot']
        ], why: 'Trunks get wrap-around labels near each end; single connectors, legs and copper runs get flag labels 4 inches from the boot. Spares are labeled too.' } },
    { id: 's7', stage: 'Apply', title: 'Practice: what is wrong?',
      act: { type: 'scenario', id: 'a4-wrong', title: 'Spot the label problems',
        qs: [
          { q: 'Select <b>every</b> problem with this situation: a crew member hand-writes the A and Z device names on a flag label, puts it on one end of an OCS leg, and plans to label the other end tomorrow.', multi: true, opts: [
            { t: 'Labels must be machine printed — no handwriting', ok: true, why: 'Guide p.8 rule 1.' },
            { t: 'Both ends must get the same label text', ok: true, why: 'Guide p.8 rule 2: both ends get the same text.' },
            { t: 'Leg labels should be wrap-around, not flag', ok: false, why: 'Legs DO get flag labels. Trunks get wrap-around labels.' },
            { t: 'Line 1 should be the Z device', ok: false, why: 'Line 1 is the A device and port; line 2 is Z.' }] },
          { q: 'A trunk label reads <code>[1:4]</code>. What does that mean?', opts: [
            { t: 'Ports 1 through 4', ok: true, why: '[1:4] is a range (p.8).' }, { t: 'Port 1 and port 4 only', ok: false, why: 'A list would be written [1,4].' },
            { t: 'Line card 1, port 4', ok: false, why: 'The / character separates line card / port / channel.' }, { t: 'Leg 1 of 4', ok: false, why: 'Bracket notation lists ports.' }] }
        ] } }
  ],
  check: [
    { q: 'In the cutsheet code r3-b4, what does "r3" mean?', opts: [
      { t: 'Row 3, counted up from the bottom of the panel', ok: true, why: 'Rows count up from the bottom (p.6).' }, { t: 'Rack 3', ok: false, why: 'r = row of the panel.' },
      { t: 'Row 3, counted down from the top', ok: false, why: 'Row 1 is the bottom row.' }, { t: 'Revision 3', ok: false, why: 'r = row.' }], ref: 's2' },
    { q: 'What goes on line 1 of a cable label?', opts: [
      { t: 'The A device and port', ok: true, why: 'Line 1 = A, line 2 = Z (p.8).' }, { t: 'The Z device and port', ok: false, why: 'Z goes on line 2.' },
      { t: 'The cable part number', ok: false, why: 'The label shows the A and Z devices and ports.' }, { t: 'The installer\'s initials', ok: false, why: 'The label shows the A and Z devices and ports.' }], ref: 's4' },
    { q: 'Where does a wrap-around label go on a trunk?', opts: [
      { t: '1-2 inches from the boot of each end connector', ok: true, why: 'Guide p.8 rule 4.' }, { t: '4 inches from the boot, one end only', ok: false, why: '4 inches is for flag labels, and both ends are labeled.' },
      { t: 'In the middle of the run', ok: false, why: 'Trunk labels go 1-2 inches from the boot at each end.' }, { t: 'On the panel, not the cable', ok: false, why: 'The cable itself is labeled at each end.' }], ref: 's4' },
    { q: 'A cutsheet row says SPARE. What do you do with that leg?', opts: [
      { t: 'Land it and label it, but do not plug it into a device', ok: true, why: 'Guide p.6.' }, { t: 'Cut it off', ok: false, why: 'Spares are kept, dressed and labeled.' },
      { t: 'Plug it into any open port', ok: false, why: 'Spares are not plugged into a device.' }, { t: 'Leave it unlabeled because it is not used', ok: false, why: 'Spares are labeled too.' }], ref: 's3' }
  ]
});

COURSE.lessons.push({
  id: 'l05', num: 5, title: 'Cable dressing: the general rules (DRS 01.00.01)', short: 'Dressing: general rules', video: 'v05', mins: 18,
  pages: 'DRS 01.00.01 (with 01.00.02, 01.00.03, 01.00.03.01 where they repeat or refine it); guide p.7',
  objectives: [
    'Name the DRS sheets that govern dressing, and what DRS 01.00.01 covers.',
    'Name the standards DRS 01.00.01 dresses to: ANSI/TIA-568, -606 and -942, and the NEC cable ratings.',
    'Apply the DRS 01.00.01 rules: Velcro only, bend radius, safe supports, support spacing and rated cable.',
    'Work out the minimum [[bendradius|bend radius]] for a cable from its diameter.',
    'Spot a general dressing mistake and say which rule it breaks.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'What "dressing" means, and which DRS covers it',
      html: `<p>To <b>dress</b> a cable is to route and fasten it so it hangs neatly, keeps a safe bend, and does not get in the way of any other equipment. Good dressing protects the cable and lets anyone replace a device later without disturbing other cables.</p>
<div class="callout key"><b>Four [[DRS]] sheets cover dressing so far</b> (all revised 6/9/2026). Their rules are requirements; have them on hand when you dress cable (Lesson 0).
<ul class="tight"><li><b>DRS 01.00.01, General Fiber Cable Dressing</b> (portal title "General Cable Dressing"): the rules for every cable you dress. <b>This lesson.</b></li>
<li><b>DRS 01.00.03, Cable Dressing Basket Trays</b>: inside the overhead tray, and <b>DRS 01.00.03.01, Cable Dressing Vertical Pathways</b>: vertical tray and ladder. <a href="#/lesson/l05b">Lesson 5B</a>.</li>
<li><b>DRS 01.00.02, Front of Rack Cable Dressing</b>: leaving the tray and coming down the rack. <a href="#/lesson/l05b">Lesson 5B</a>.</li></ul></div>
<p>DRS 01.00.01 has six rules. Select each one to see what it says and where it comes from.</p>`,
      act: { type: 'explore', id: 'a5-explore', title: 'The six rules of DRS 01.00.01', dg: 'dressRules', o: {},
        spots: [
          { k: 'r1', t: 'Rule 1 — Standards', d: 'Cables are dressed in accordance with <b>ANSI/TIA-568, ANSI/TIA-606 and ANSI/TIA-942</b>. The next section explains what each one covers.' },
          { k: 'r2', t: 'Rule 2 — 1/2-inch Velcro only', d: 'Use <b>1/2-inch hook-and-loop (Velcro)</b>. <b>Nylon zip ties are not allowed</b>; the portal summary calls them strictly prohibited.' },
          { k: 'r3', t: 'Rule 3 — Bend radius', d: 'Follow the <b>manufacturer\'s spec</b>, and never go below <b>20 × the cable diameter loaded</b> (under tension) or <b>10 × unloaded</b> (no tension). The drawing points to <b>DRS 01.00.07</b> for fiber bend radius.' },
          { k: 'r4', t: 'Rule 4 — Safe supports', d: 'Cable supports must not damage the cable. <b>No metal staples.</b>' },
          { k: 'r5', t: 'Rule 5 — Support spacing', d: 'Support cable <b>every 4-5 feet</b> on horizontal runs. The drawing gives this as the TIA-568 recommendation.' },
          { k: 'r6', t: 'Rule 6 — Rated cable', d: '<b>Plenum</b>-rated (OFNP / CMP) in plenum spaces, <b>riser</b>-rated (OFNR / CMR) in vertical risers, <b>LSZH</b> where local code requires it.' }
        ] },
      analogy: 'Dressing is like the plumbing in a building: pipes run in supported paths, clear of other fixtures, so any one fixture can be replaced without tearing out the rest. <b>Where the analogy stops:</b> fiber is glass. A bend a water pipe would shrug off can leak light out of a fiber and weaken the signal with no visible sign, so the bend radius rule is not optional.' },
    { id: 's2', stage: 'Understand', title: 'The standards behind the rules',
      figs: [{ dg: 'standardsMap', o: {}, cap: 'Rule 1 names the three ANSI/TIA standards on the top row. The NEC (bottom left) is where the cable fire ratings in rule 6 come from.' }],
      html: `<p><b>Rule 1:</b> cables are dressed in accordance with <b>[[ANSITIA|ANSI/TIA]]-568, -606 and -942</b>. You will not be handed these standards on site. The DRS turns them into the rules you follow. What each covers:</p>
<table class="t"><thead><tr><th>Standard</th><th>What it covers</th><th>Where you see it in this job</th></tr></thead><tbody>
<tr><td><b>[[TIA568|TIA-568]]</b></td><td>Telecommunications cabling in buildings: how cable is installed and supported</td><td>Rule 5: support every 4-5 ft on horizontal runs ("TIA-568 recommends", DRS drawing)</td></tr>
<tr><td><b>[[TIA606|TIA-606]]</b></td><td>Administration: identifiers, labels and records, so every cable can be traced</td><td>Lesson 4's label rules: machine-printed labels, the same text at both ends. Your exact label format is in guide p.8. (TIA-606-A also does not accept handwritten labels.)</td></tr>
<tr><td><b>[[TIA942|TIA-942]]</b></td><td>Infrastructure of data centers and computer rooms, including cabling and pathways</td><td>The data hall itself: racks, trays and the paths your cables take</td></tr>
<tr><td><b>[[NEC]]</b> (NFPA 70)</td><td>U.S. electrical safety code. Articles 770 (optical fiber) and 800 (communications) set cable fire ratings</td><td>Rule 6: OFNP, OFNR, CMP and CMR on the cable jacket</td></tr></tbody></table>
<div class="callout info"><b>Background, not from the DRS:</b> what each standard covers comes from TIA and NFPA (see Sources). On site, cite the DRS rule: for example, "DRS 01.00.01 rule 2: Velcro only".</div>` },
    { id: 's3', stage: 'Understand', title: 'Ties, bends and supports (DRS 01.00.01 rules 2 to 5)',
      html: `<ol class="steps" start="2">
<li><b>Bundle with 1/2-inch hook-and-loop ([[velcro|Velcro]]). Nylon zip ties are not allowed.</b><br><span class="muted">Why: a zip tie pulled tight squeezes the cable and can damage the fiber inside. Hook-and-loop holds the bundle without crushing it, and comes off without cutting near the cable.</span></li>
<li><b>Bend radius: follow the manufacturer's spec, and never less than 20 × the cable diameter loaded or 10 × unloaded.</b> DRS 01.00.03 rule 5 repeats it: cables shall keep the manufacturer's recommended bend radius at all times. <i>Loaded</i> means under tension, such as while you pull. <i>Unloaded</i> means no tension, once it is in place. Where the manufacturer's number is bigger, use it: you must meet both.<br><span class="muted">Why: a tight bend lets light leak out of the fiber (signal loss) and can crack the glass.</span></li>
<li><b>Supports must not damage the cable. No metal staples.</b></li>
<li><b>Support every 4 to 5 feet on horizontal runs.</b> The DRS drawing gives this as the TIA-568 recommendation; the portal summary says "support cable every 4-5 feet".</li></ol>`,
      figs: [{ dg: 'bend', o: {}, cap: 'DRS 01.00.01 rule 3 minimums: 20× loaded, 10× unloaded, or the manufacturer\'s spec if larger. 15× is the guide\'s long-term recommendation (guide p.7).' }],
      after: `<div class="callout info"><b>1/2-inch or 3/4-inch Velcro?</b> <b>Bundle</b> cables with <b>1/2-inch</b> everywhere (DRS 01.00.01 rule 2, 01.00.02 rule 5, 01.00.03 rule 3: "for all cable bundling"). <b>3/4-inch may be used to secure cable to vertical tray</b> (DRS 01.00.03.01 rule 5), which matches the guide (p.7). Lesson 5B covers vertical pathways.</div>
<div class="callout conflict"><b>Ask your lead (a difference between the guide and the DRS):</b><ul class="tight">
<li><b>15 × long-term bend radius:</b> the guide (p.7) recommends 15 × for long-term installed cable. DRS 01.00.01 gives 20 × loaded and 10 × unloaded, and points to DRS 01.00.07 for fiber bend radius, which this course does not have yet. Never go below the DRS minimums or the manufacturer's spec.</li></ul></div>` },
    { id: 's4', stage: 'Understand', title: 'Rated cable for the space (DRS 01.00.01 rule 6)',
      figs: [{ dg: 'cableRatings', o: {}, cap: 'A plenum space is part of the air-handling system. A riser runs floor to floor. The rating is printed on the cable jacket.' }],
      html: `<table class="t"><thead><tr><th>Space</th><th>Fiber cable</th><th>Copper cable</th></tr></thead><tbody>
<tr><td><b>[[plenum|Plenum space]]</b> (part of the air-handling system)</td><td><b>OFNP</b></td><td><b>CMP</b></td></tr>
<tr><td><b>Vertical [[riser]]</b> (floor to floor)</td><td><b>OFNR</b></td><td><b>CMR</b></td></tr>
<tr><td>Where local code requires it</td><td colspan="2"><b>[[LSZH]]</b> (Low Smoke Zero Halogen)</td></tr></tbody></table>
<p><b>Reading the letters (NEC):</b> <b>OF</b> = optical fiber, <b>N</b> = nonconductive (no metal), <b>CM</b> = communications (copper), then <b>P</b> = plenum, <b>R</b> = riser.</p>
<div class="callout info"><b>Background, not from the DRS (NEC):</b> a higher rating can be used in place of a lower one (plenum where riser is called for), never the other way round. Smoke from burning cable in a plenum space would travel through the air system, which is why plenum is the strictest rating.</div>
<div class="callout warn">Check the rating printed on the jacket before you run cable through a ceiling, under-floor or riser space. If the rating does not match the space, <b>stop and ask your lead</b>.</div>` },
    { id: 's5', stage: 'Work with it', title: 'Worked example: bend radius for a real cable',
      html: `<ol class="steps">
<li><b>Find the cable's diameter</b> on its spec sheet or jacket print.</li>
<li><b>Loaded</b> (while you pull, and around tray corners as you pull through them): 20 × the diameter.</li>
<li><b>Unloaded</b> (in place, no tension): 10 × the diameter.</li>
<li><b>Compare with the manufacturer's number</b> and use whichever is bigger.</li></ol>
<h3>Bend check, worked out</h3>
<div class="callout info"><b>Illustration only.</b> Use your cable's real diameter and its manufacturer's spec sheet.</div>
<table class="t"><thead><tr><th>Step</th><th>Example: cable diameter 0.40 in</th></tr></thead><tbody>
<tr><td>Loaded (pulling): 20 × diameter</td><td>20 × 0.40 = <b>8 in</b> minimum radius</td></tr>
<tr><td>Unloaded (in place): 10 × diameter</td><td>10 × 0.40 = <b>4 in</b> minimum radius</td></tr>
<tr><td>Manufacturer says 5 in unloaded</td><td>5 in is bigger than 4 in, so use <b>5 in</b></td></tr>
<tr><td>What it looks like</td><td>A 5 in <i>radius</i> is a loop about <b>10 in across</b> (radius is half the width of the circle)</td></tr></tbody></table><p>Lesson 5B applies this at tray corners and waterfalls (DRS 01.00.03 rule 5).</p>` },
    { id: 's6', stage: 'Work with it', title: 'Guided practice: bend radius',
      act: { type: 'scenario', id: 'a5-bend', title: 'Work out the minimum bend radius',
        qs: [
          { q: 'A cable is <b>0.30 in</b> across. You are <b>pulling</b> it around a corner. What is the smallest radius DRS 01.00.01 allows?', opts: [
            { t: '6 in (20 × 0.30)', ok: true, why: 'Pulling means loaded: 20 × the diameter.' },
            { t: '3 in (10 × 0.30)', ok: false, why: '10 × is for unloaded cable. While pulling, the cable is under tension: 20 ×.' },
            { t: '4.5 in (15 × 0.30)', ok: false, why: '15 × is the guide\'s long-term recommendation, not the DRS loaded minimum.' },
            { t: '0.6 in (2 × 0.30)', ok: false, why: 'Far too tight. Loaded minimum is 20 × the diameter.' }], hint: 'Pulling = under tension = loaded.' },
          { q: 'The same 0.30 in cable is now dressed in place with <b>no tension</b>. Its manufacturer\'s spec sheet says <b>4 in</b> minimum. What do you use?', opts: [
            { t: '4 in: meet both, so use the bigger number', ok: true, why: 'Unloaded DRS minimum is 10 × 0.30 = 3 in, but you must also meet the manufacturer\'s spec. 4 in is larger.' },
            { t: '3 in, because the DRS beats the manufacturer', ok: false, why: 'The DRS itself says to adhere to the manufacturer\'s spec. Meeting both means the larger radius.' },
            { t: '6 in, because 20 × always applies', ok: false, why: '20 × applies while loaded. In place with no tension, the minimum is 10 × or the manufacturer\'s spec, whichever is larger.' },
            { t: 'Any bend, as long as the cable is not under tension', ok: false, why: 'Unloaded cable still has a minimum: 10 × the diameter or the spec.' }], hint: 'Two limits apply. Which one is bigger?' },
          { q: 'Your minimum radius is 4 in. About how wide is the loop at its tightest allowed size?', opts: [
            { t: 'About 8 in across', ok: true, why: 'Radius is half the width: a 4 in radius makes a circle about 8 in across.' },
            { t: 'About 4 in across', ok: false, why: '4 in is the radius, the distance from the center to the cable. The loop is twice that across.' },
            { t: 'About 2 in across', ok: false, why: 'That would be a 1 in radius: far too tight.' },
            { t: 'About 16 in across', ok: false, why: 'Bigger is fine, but the tightest allowed loop is 2 × 4 in = 8 in across.' }] }
        ] } },
    { id: 's7', stage: 'Apply', title: 'Practice: which rule says so?',
      act: { type: 'match', id: 'a5-match', title: 'Match each rule to DRS 01.00.01', intro: 'Choose the DRS 01.00.01 rule behind each requirement.',
        pairs: [
          ['Dress cables per ANSI/TIA-568, -606 and -942', 'Rule 1 (standards)'],
          ['Nylon zip ties are not allowed', 'Rule 2 (1/2-inch Velcro)'],
          ['At least 20 × diameter loaded, 10 × unloaded', 'Rule 3 (bend radius; see DRS 01.00.07)'],
          ['No metal staples', 'Rule 4 (supports must not damage the cable)'],
          ['Support horizontal runs every 4-5 feet', 'Rule 5 (TIA-568 recommendation)'],
          ['OFNR / CMR cable in a vertical riser', 'Rule 6 (NEC cable ratings)']
        ],
        why: 'DRS 01.00.01: 1 standards, 2 Velcro, 3 bend radius, 4 safe supports, 5 support spacing, 6 rated cable.' } },
    { id: 's8', stage: 'Apply', title: 'Practice: spot the mistakes',
      act: { type: 'scenario', id: 'a5-spot', title: 'What is wrong here?',
        qs: [
          { q: 'A coworker fixes a run to a wall board with metal staples "just to hold it until tomorrow". What do you say?', opts: [
            { t: 'Remove them: supports must not damage the cable, and metal staples are not allowed', ok: true, why: 'DRS 01.00.01 rule 4. Temporary does not make it allowed.' },
            { t: 'Fine for one night', ok: false, why: 'Staples can damage the cable the moment they go in.' },
            { t: 'Fine if they are not hammered all the way', ok: false, why: 'No metal staples at all.' },
            { t: 'Use zip ties instead', ok: false, why: 'Zip ties are not allowed either (rule 2). Use proper supports and 1/2-inch Velcro.' }] },
          { q: 'Your route passes through a ceiling space that the building uses for return air. The cable jacket reads <b>OFNR</b>.', opts: [
            { t: 'Stop and ask your lead: a plenum space needs plenum-rated cable (OFNP / CMP)', ok: true, why: 'DRS 01.00.01 rule 6. OFNR is riser-rated, which is lower than plenum.' },
            { t: 'Go ahead: OFNR is a fire rating, so it is fine anywhere', ok: false, why: 'Riser (OFNR) may not replace plenum. The space decides the rating.' },
            { t: 'Go ahead if the run is short', ok: false, why: 'Length does not change the rating needed.' },
            { t: 'Wrap it in Velcro to protect it', ok: false, why: 'Velcro does not change a cable\'s fire rating.' }] },
          { q: 'Your crew only has 3/4-inch Velcro today. Where may you use it?', opts: [
            { t: 'Only to secure cable to a vertical tray. Bundling cables together still needs 1/2-inch', ok: true, why: 'DRS 01.00.03.01 rule 5 allows 3/4-inch to secure cable to vertical tray; DRS 01.00.03 rule 3 says 1/2-inch for all cable bundling.' },
            { t: 'Anywhere: 3/4-inch is just stronger', ok: false, why: 'Bundling uses 1/2-inch (DRS 01.00.01 rule 2, 01.00.03 rule 3).' },
            { t: 'Nowhere: 3/4-inch is never allowed', ok: false, why: 'DRS 01.00.03.01 rule 5 allows it for securing cable to vertical tray.' },
            { t: 'Use zip ties until 1/2-inch arrives', ok: false, why: 'Nylon zip ties are never allowed.' }] },
          { q: 'A bundle is pulled tight around a post so it bends to about 3 times its diameter. It is not under tension now. Is that OK?', opts: [
            { t: 'No: unloaded cable needs at least 10 × its diameter, or the manufacturer\'s spec if bigger', ok: true, why: 'DRS 01.00.01 rule 3 (and DRS 01.00.03 rule 5: keep the recommended bend radius at all times).' },
            { t: 'Yes, because it is not under tension', ok: false, why: 'Unloaded cable still has a minimum: 10 ×.' },
            { t: 'Yes, if the link tests fine today', ok: false, why: 'A tight bend can lose light or crack the glass later.' },
            { t: 'Yes, if it is held with Velcro', ok: false, why: 'Velcro does not fix the bend.' }] }
        ] } }
  ],
  check: [
    { q: 'Which DRS governs general cable dressing?', opts: [
      { t: 'DRS 01.00.01', ok: true, why: 'DRS 01.00.01, General Fiber Cable Dressing (portal title: General Cable Dressing).' },
      { t: 'DRS 01.00.00', ok: false, why: '01.00.00 is the introduction: what a DRS is and the on-site rule.' },
      { t: 'DRS 01.00.07', ok: false, why: '01.00.01 points to 01.00.07 for fiber bend radius detail, but 01.00.01 is the dressing sheet.' },
      { t: 'The cutsheet', ok: false, why: 'The cutsheet says where cables go, not how they are dressed.' }], ref: 's1' },
    { q: 'Which tie is allowed for bundling cables?', opts: [
      { t: '1/2-inch hook-and-loop (Velcro)', ok: true, why: 'DRS 01.00.01 rule 2 (also 01.00.02 rule 5 and 01.00.03 rule 3). 3/4-inch may only secure cable to vertical tray (DRS 01.00.03.01).' },
      { t: 'Nylon zip ties, if not pulled tight', ok: false, why: 'Nylon zip ties are not allowed.' }, { t: 'Metal staples', ok: false, why: 'No metal staples (rule 4).' }, { t: 'Electrical tape', ok: false, why: '1/2-inch Velcro is the tie the DRS names.' }], ref: 's3' },
    { q: 'A 0.25 in cable is dressed in place with no tension. Its spec sheet gives no larger number. What is its minimum bend radius?', opts: [
      { t: '2.5 in (10 × the diameter)', ok: true, why: 'Unloaded: 10 × 0.25 = 2.5 in (DRS 01.00.01 rule 3).' },
      { t: '5 in (20 × the diameter)', ok: false, why: '20 × is the loaded minimum, while under tension.' },
      { t: '0.25 in', ok: false, why: 'That is the diameter, not the bend radius.' },
      { t: 'No minimum once it is in place', ok: false, why: 'Unloaded cable still needs 10 × the diameter.' }], ref: 's3' },
    { q: 'How far apart are supports on a horizontal run?', opts: [
      { t: 'Every 4 to 5 feet', ok: true, why: 'DRS 01.00.01 rule 5, the TIA-568 recommendation.' },
      { t: 'Every 12-18 inches', ok: false, why: 'That is bundle (Velcro) spacing in the tray (DRS 01.00.03 rule 1).' },
      { t: 'Every 10 feet', ok: false, why: '4-5 feet.' }, { t: 'Only at corners', ok: false, why: 'Every 4-5 feet on horizontal runs.' }], ref: 's3' },
    { q: 'Which cable may run through a plenum space?', opts: [
      { t: 'Plenum-rated: OFNP for fiber, CMP for copper', ok: true, why: 'DRS 01.00.01 rule 6.' },
      { t: 'Riser-rated OFNR or CMR', ok: false, why: 'Riser is for vertical risers. Riser may not replace plenum.' },
      { t: 'Any cable, if it is bundled with Velcro', ok: false, why: 'Bundling does not change the fire rating.' },
      { t: 'Any cable with a label', ok: false, why: 'The jacket rating must match the space.' }], ref: 's4' }
  ]
});

COURSE.lessons.push({
  id: 'l05b', num: 5.5, label: '5B', title: 'Cable dressing: trays, vertical runs and front of rack', short: 'Dressing: trays & racks', video: 'v05b', mins: 24,
  pages: 'DRS 01.00.03, 01.00.03.01, 01.00.02, 01.00.01; guide p.7, 14, 16, 22, 31, 39, 41, 47',
  objectives: [
    'Follow a cable from the tray to the device and name the DRS that covers each part.',
    'Dress cable in the [[baskettray|basket tray]] per DRS 01.00.03: Velcro every 12-18 in, secured only at corners, exits and vertical runs (3×), waterfalls centered over the rack VCMs, bend radius kept.',
    'Dress vertical tray and ladder per DRS 01.00.03.01: Velcro every 12-18 in, secured to the tray, self-supporting, waterfalls at every vertical transition; 3/4-inch Velcro may secure cable to vertical tray.',
    'Dress the front of the rack per DRS 01.00.02: no crossing devices, exit above the rack edge or VCM, waterfalls (over-the-top at network racks) on your side.',
    'Use the guide\'s remaining rules (VCM fingers, slack, tiers) and know which points to confirm with your lead.',
    'Spot a tray or front-of-rack mistake and say which rule it breaks.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'From the tray to the device: which DRS covers each part',
      html: `<p>Every cable you install runs overhead in the <b>[[baskettray|basket tray]]</b>, turns corners, leaves the tray, and comes down the front of a rack to its device. Different DRS sheets cover different parts of that trip:</p>
<figure class="dd-fig"><div class="ddw"><svg viewBox="0 0 960 624" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="drs-route-title drs-route-desc" style="min-width:960px"><title id="drs-route-title">One cable from the tray to the device</title><desc id="drs-route-desc">Front elevation of one cable route: an upper basket tray, a vertical tray, the basket tray over the rack, a waterfall exit over the rack vertical cable manager, and the drop to the device, each part labelled with the DRS sheet that covers it.</desc><defs><marker id="drs-route-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#59616b"/></marker><marker id="drs-route-arrow-ink" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#1f2429"/></marker><marker id="drs-route-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#b3261e"/></marker><marker id="drs-route-arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#0f5e63"/></marker></defs><rect width="100%" height="100%" fill="#f5f2eb"/><rect x="40" y="532" width="880" height="36" rx="6" fill="rgba(15,94,99,0.05)" stroke="#0f5e63" stroke-width="0.8"/><rect x="40" y="48" width="144" height="16" fill="#eee9df" stroke="#59616b" stroke-width="1"/><line x1="48" y1="48" x2="48" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="56" y1="48" x2="56" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="64" y1="48" x2="64" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="72" y1="48" x2="72" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="80" y1="48" x2="80" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="88" y1="48" x2="88" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="96" y1="48" x2="96" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="104" y1="48" x2="104" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="112" y1="48" x2="112" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="120" y1="48" x2="120" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="128" y1="48" x2="128" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="136" y1="48" x2="136" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="144" y1="48" x2="144" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="152" y1="48" x2="152" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="160" y1="48" x2="160" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="48" x2="168" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="176" y1="48" x2="176" y2="64" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="40" y1="60" x2="184" y2="60" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><rect x="168" y="64" width="16" height="112" fill="#eee9df" stroke="#59616b" stroke-width="1"/><line x1="168" y1="72" x2="184" y2="72" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="80" x2="184" y2="80" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="88" x2="184" y2="88" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="96" x2="184" y2="96" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="104" x2="184" y2="104" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="112" x2="184" y2="112" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="120" x2="184" y2="120" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="128" x2="184" y2="128" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="136" x2="184" y2="136" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="144" x2="184" y2="144" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="152" x2="184" y2="152" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="160" x2="184" y2="160" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="168" x2="184" y2="168" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="172" y1="64" x2="172" y2="176" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><rect x="168" y="176" width="424" height="16" fill="#eee9df" stroke="#59616b" stroke-width="1"/><line x1="176" y1="176" x2="176" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="184" y1="176" x2="184" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="192" y1="176" x2="192" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="200" y1="176" x2="200" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="208" y1="176" x2="208" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="216" y1="176" x2="216" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="224" y1="176" x2="224" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="232" y1="176" x2="232" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="240" y1="176" x2="240" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="248" y1="176" x2="248" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="256" y1="176" x2="256" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="264" y1="176" x2="264" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="272" y1="176" x2="272" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="280" y1="176" x2="280" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="288" y1="176" x2="288" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="296" y1="176" x2="296" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="304" y1="176" x2="304" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="312" y1="176" x2="312" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="320" y1="176" x2="320" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="328" y1="176" x2="328" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="336" y1="176" x2="336" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="344" y1="176" x2="344" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="352" y1="176" x2="352" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="360" y1="176" x2="360" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="368" y1="176" x2="368" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="376" y1="176" x2="376" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="384" y1="176" x2="384" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="392" y1="176" x2="392" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="400" y1="176" x2="400" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="408" y1="176" x2="408" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="416" y1="176" x2="416" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="424" y1="176" x2="424" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="432" y1="176" x2="432" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="440" y1="176" x2="440" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="448" y1="176" x2="448" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="456" y1="176" x2="456" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="464" y1="176" x2="464" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="472" y1="176" x2="472" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="480" y1="176" x2="480" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="488" y1="176" x2="488" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="496" y1="176" x2="496" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="504" y1="176" x2="504" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="512" y1="176" x2="512" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="520" y1="176" x2="520" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="528" y1="176" x2="528" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="536" y1="176" x2="536" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="544" y1="176" x2="544" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="552" y1="176" x2="552" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="560" y1="176" x2="560" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="568" y1="176" x2="568" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="576" y1="176" x2="576" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="584" y1="176" x2="584" y2="192" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="168" y1="188" x2="592" y2="188" stroke="rgba(31,36,41,0.16)" stroke-width="0.6"/><line x1="40" y1="488" x2="592" y2="488" stroke="#1f2429" stroke-width="1.2"/><line x1="48" y1="488" x2="40" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="64" y1="488" x2="56" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="80" y1="488" x2="72" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="96" y1="488" x2="88" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="112" y1="488" x2="104" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="128" y1="488" x2="120" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="144" y1="488" x2="136" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="160" y1="488" x2="152" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="176" y1="488" x2="168" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="192" y1="488" x2="184" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="208" y1="488" x2="200" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="224" y1="488" x2="216" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="240" y1="488" x2="232" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="256" y1="488" x2="248" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="272" y1="488" x2="264" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="288" y1="488" x2="280" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="304" y1="488" x2="296" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="320" y1="488" x2="312" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="336" y1="488" x2="328" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="352" y1="488" x2="344" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="368" y1="488" x2="360" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="384" y1="488" x2="376" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="400" y1="488" x2="392" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="416" y1="488" x2="408" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="432" y1="488" x2="424" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="448" y1="488" x2="440" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="464" y1="488" x2="456" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="480" y1="488" x2="472" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="496" y1="488" x2="488" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="512" y1="488" x2="504" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="528" y1="488" x2="520" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="544" y1="488" x2="536" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="560" y1="488" x2="552" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><line x1="576" y1="488" x2="568" y2="496" stroke="rgba(31,36,41,0.3)" stroke-width="0.8"/><rect x="360" y="240" width="160" height="248" fill="#ffffff" stroke="#1f2429" stroke-width="1.2"/><rect x="360" y="240" width="20" height="248" fill="rgba(31,36,41,0.06)" stroke="#1f2429" stroke-width="0.8"/><path d="M 360,252 h 5 M 375,252 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,264 h 5 M 375,264 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,276 h 5 M 375,276 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,288 h 5 M 375,288 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,300 h 5 M 375,300 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,312 h 5 M 375,312 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,324 h 5 M 375,324 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,336 h 5 M 375,336 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,348 h 5 M 375,348 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,360 h 5 M 375,360 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,372 h 5 M 375,372 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,384 h 5 M 375,384 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,396 h 5 M 375,396 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,408 h 5 M 375,408 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,420 h 5 M 375,420 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,432 h 5 M 375,432 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,444 h 5 M 375,444 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,456 h 5 M 375,456 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,468 h 5 M 375,468 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 360,480 h 5 M 375,480 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><rect x="500" y="240" width="20" height="248" fill="rgba(31,36,41,0.06)" stroke="#1f2429" stroke-width="0.8"/><path d="M 500,252 h 5 M 515,252 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,264 h 5 M 515,264 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,276 h 5 M 515,276 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,288 h 5 M 515,288 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,300 h 5 M 515,300 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,312 h 5 M 515,312 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,324 h 5 M 515,324 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,336 h 5 M 515,336 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,348 h 5 M 515,348 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,360 h 5 M 515,360 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,372 h 5 M 515,372 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,384 h 5 M 515,384 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,396 h 5 M 515,396 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,408 h 5 M 515,408 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,420 h 5 M 515,420 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,432 h 5 M 515,432 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,444 h 5 M 515,444 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,456 h 5 M 515,456 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,468 h 5 M 515,468 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><path d="M 500,480 h 5 M 515,480 h 5" stroke="rgba(31,36,41,0.35)" stroke-width="0.8"/><rect x="384" y="252" width="112" height="16" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="392" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="400" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="408" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="416" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="424" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="432" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="440" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="448" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="456" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="464" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="472" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="480" y="258.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="384" y="276" width="112" height="16" fill="rgba(31,36,41,0.1)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="392" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="400" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="408" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="416" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="424" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="432" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="440" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="448" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="456" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="464" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="472" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="480" y="282.0" width="5" height="4" fill="rgba(31,36,41,0.55)"/><rect x="384" y="304" width="112" height="24" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="384" y="336" width="112" height="24" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="384" y="368" width="112" height="24" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="384" y="400" width="112" height="24" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="384" y="432" width="112" height="24" fill="rgba(31,36,41,0.07)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><rect x="384" y="464" width="112" height="16" fill="rgba(31,36,41,0.04)" stroke="rgba(31,36,41,0.45)" stroke-width="0.8"/><path d="M 160,72 L 160.0,60.0 A 12,12 0 0,1 172.0,72.0 Z" fill="#cfc6b5" stroke="#1f2429" stroke-width="1"/><path d="M 192,168 L 192.0,180.0 A 12,12 0 0,1 180.0,168.0 Z" fill="#cfc6b5" stroke="#1f2429" stroke-width="1"/><path d="M 354,200 L 354.0,188.0 A 12,12 0 0,1 366.0,200.0 Z" fill="#cfc6b5" stroke="#1f2429" stroke-width="1"/><path d="M 48,56 L 160,56 A 16,16 0 0,1 176,72 L 176,168 A 16,16 0 0,0 192,184 L 354,184 A 16,16 0 0,1 370,200 L 370,364 A 16,16 0 0,0 386,380 L 396,380" fill="none" stroke="#9a5b00" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M 48,56 L 160,56 A 16,16 0 0,1 176,72 L 176,168 A 16,16 0 0,0 192,184 L 354,184 A 16,16 0 0,1 370,200 L 370,364 A 16,16 0 0,0 386,380 L 396,380" fill="none" stroke="#f2b134" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="398" cy="380" r="3" fill="#1f2429"/><line x1="620" y1="108" x2="184" y2="108" stroke="rgba(31,36,41,0.4)" stroke-width="0.8"/><circle cx="184" cy="108" r="2" fill="#1f2429"/><line x1="620" y1="180" x2="592" y2="180" stroke="rgba(31,36,41,0.4)" stroke-width="0.8"/><circle cx="592" cy="180" r="2" fill="#1f2429"/><line x1="620" y1="236" x2="376" y2="236" stroke="rgba(31,36,41,0.4)" stroke-width="0.8"/><circle cx="376" cy="236" r="2" fill="#1f2429"/><line x1="620" y1="304" x2="520" y2="304" stroke="rgba(31,36,41,0.4)" stroke-width="0.8"/><circle cx="520" cy="304" r="2" fill="#1f2429"/><line x1="620" y1="380" x2="520" y2="380" stroke="rgba(31,36,41,0.4)" stroke-width="0.8"/><circle cx="520" cy="380" r="2" fill="#1f2429"/><text x="48" y="512" fill="#5e6670" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">FLOOR</text><text x="440" y="512" fill="#5e6670" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle">RACK FRONT</text><line x1="58.0" y1="50.0" x2="58.0" y2="62.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="82.0" y1="50.0" x2="82.0" y2="62.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="106.0" y1="50.0" x2="106.0" y2="62.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="130.0" y1="50.0" x2="130.0" y2="62.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="154.0" y1="50.0" x2="154.0" y2="62.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="182.0" y1="84.0" x2="170.0" y2="84.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="182.0" y1="102.0" x2="170.0" y2="102.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="182.0" y1="120.0" x2="170.0" y2="120.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="182.0" y1="138.0" x2="170.0" y2="138.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="182.0" y1="156.0" x2="170.0" y2="156.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="208.0" y1="178.0" x2="208.0" y2="190.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="234.0" y1="178.0" x2="234.0" y2="190.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="260.0" y1="178.0" x2="260.0" y2="190.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="286.0" y1="178.0" x2="286.0" y2="190.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="312.0" y1="178.0" x2="312.0" y2="190.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="332.0" y1="178.0" x2="332.0" y2="190.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="344.0" y1="178.0" x2="344.0" y2="190.0" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="359.4" y1="178.7" x2="356.5" y2="190.3" stroke="#1f2429" stroke-width="2.2" stroke-linecap="butt"/><line x1="376.0" y1="257.0" x2="364.0" y2="257.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="376.0" y1="285.0" x2="364.0" y2="285.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="376.0" y1="313.0" x2="364.0" y2="313.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><line x1="376.0" y1="341.0" x2="364.0" y2="341.0" stroke="rgba(31,36,41,0.38)" stroke-width="2.0" stroke-linecap="butt"/><text x="632" y="112" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">Vertical pathway</text><rect x="756" y="101" width="88" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="800.0" y="111" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.03.01</text><text x="632" y="127" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">secured to the tray, self-supporting</text><text x="632" y="140" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">waterfall at every vertical transition</text><text x="632" y="184" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">In the basket tray</text><rect x="772" y="173" width="72" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="808.0" y="183" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.03</text><text x="632" y="199" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">½″ Velcro every 12–18″, bundles float</text><text x="632" y="212" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">at corners: secure 3×, bend ≥ 20× D</text><text x="632" y="240" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">Leaving the tray</text><rect x="756" y="229" width="72" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="792.0" y="239" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.03</text><rect x="834" y="229" width="72" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="870.0" y="239" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.02</text><text x="632" y="255" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">waterfall centred over the VCM</text><text x="632" y="268" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">secure 3× at the exit</text><text x="632" y="308" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">Down the front of the rack</text><rect x="828" y="297" width="72" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="864.0" y="307" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.02</text><text x="632" y="323" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">the VCM on the side you patch into</text><text x="632" y="336" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">cross no device you do not patch</text><text x="632" y="384" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">Into the device</text><rect x="748" y="373" width="60" height="14" rx="2" fill="rgba(31,36,41,0.04)" stroke="#5e6670" stroke-width="0.8"/><text x="778.0" y="383" fill="#5e6670" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">GUIDE P.7</text><text x="632" y="399" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">leave the VCM nearest the port</text><text x="632" y="412" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">slack downstream, nothing on the floor</text><text x="56" y="554" fill="#1f2429" font-size="12" font-family="Inter, 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600">The whole way</text><rect x="160" y="543" width="72" height="14" rx="2" fill="rgba(15,94,99,0.06)" stroke="#0f5e63" stroke-width="0.8"/><text x="196.0" y="553" fill="#0f5e63" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" text-anchor="middle" letter-spacing="0.06em">DRS 01.00.01</text><text x="244" y="553" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">½″ Velcro, no zip ties · bend radius · supports every 4–5 ft, no staples · rated jacket</text><line x1="40" y1="584" x2="920" y2="584" stroke="rgba(31,36,41,0.1)" stroke-width="0.8"/><text x="40" y="604" fill="#59616b" font-size="8" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace" letter-spacing="0.14em">LEGEND</text><line x1="112" y1="601" x2="136" y2="601" stroke="#9a5b00" stroke-width="5.5" stroke-linecap="round"/><line x1="112" y1="601" x2="136" y2="601" stroke="#f2b134" stroke-width="3.5" stroke-linecap="round"/><line x1="124" y1="595" x2="124" y2="607" stroke="rgba(31,36,41,0.38)" stroke-width="2.0"/><text x="146" y="604" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">Velcro bundle (floats)</text><line x1="298" y1="601" x2="322" y2="601" stroke="#9a5b00" stroke-width="5.5" stroke-linecap="round"/><line x1="298" y1="601" x2="322" y2="601" stroke="#f2b134" stroke-width="3.5" stroke-linecap="round"/><line x1="310" y1="595" x2="310" y2="607" stroke="#1f2429" stroke-width="2.2"/><text x="332" y="604" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">secured to tray</text><path d="M 452,607 L 452,594 A 13,13 0 0,1 465,607 Z" fill="#cfc6b5" stroke="#1f2429" stroke-width="1"/><text x="478" y="604" fill="#59616b" font-size="9" font-family="'DejaVu Sans Mono', Consolas, Menlo, ui-monospace, monospace">waterfall</text></svg></div><figcaption>One route from an upper tray to the device, with the sheet for each part. Grey ticks: Velcro bundles that float in the tray. Black ticks: ties to the tray. Every sheet is broken down rule by rule in <a href="DRS_Explained.html">DRS Explained</a>.</figcaption></figure>
<table class="t"><thead><tr><th>Part of the trip</th><th>Governing rules</th></tr></thead><tbody>
<tr><td>Running in the basket tray</td><td><b>DRS 01.00.03</b> rules 1-3 (bundling, securing, Velcro)</td></tr>
<tr><td>Turning a tray corner</td><td><b>DRS 01.00.03</b> rules 2 and 5 (secure 3×, bend radius); minimums in DRS 01.00.01 rule 3</td></tr>
<tr><td>Leaving the tray</td><td><b>DRS 01.00.03</b> rules 2 and 4 (secure 3×, waterfall centered over the VCM) and <b>DRS 01.00.02</b> rules 2-4, 6</td></tr>
<tr><td>Running up or down a vertical tray or ladder</td><td><b>DRS 01.00.03.01</b> rules 1-5 (secured, self-supporting, waterfalls at every vertical transition)</td></tr>
<tr><td>Coming down the front of the rack</td><td><b>DRS 01.00.02</b> rules 1 and 5</td></tr>
<tr><td>The VCM, slack and tray tiers</td><td>Guide p.7 (their DRS sheet has not been added yet)</td></tr></tbody></table>
<div class="callout key">The general rules from <a href="#/lesson/l05">Lesson 5</a> (DRS 01.00.01) apply the whole way: 1/2-inch Velcro to bundle, never zip ties, bend radius, safe supports every 4-5 ft, and rated cable.</div>`,
      analogy: 'Think of the tray as a highway and each waterfall as an exit ramp: the ramp is built so traffic leaves smoothly instead of dropping off the edge. <b>Where the analogy stops:</b> a car can take a sharp turn slowly. A fiber cannot: too tight a bend damages it however gently it happens, so every corner and every exit keeps the bend radius.' },
    { id: 's2', stage: 'Understand', title: 'In the basket tray (DRS 01.00.03)',
      html: `<p><b>DRS 01.00.03, Cable Dressing Basket Trays</b> (revised 6/9/2026; portal title "Basket Tray Cable Dressing") covers cable inside the overhead tray. Its five rules:</p>
<ol class="steps">
<li><b>Bundle cables neatly in the tray with Velcro, 12 to 18 inches apart.</b></li>
<li><b>Do not secure bundles to the basket tray</b> except going around bends (corners), exiting the tray, or running vertically. There, <b>secure 3 times at each corner and 3 times at each exit</b>.</li>
<li><b>Use 1/2-inch Velcro for all cable bundling.</b></li>
<li><b>Waterfalls are centered over the rack VCMs.</b></li>
<li><b>Cables keep the manufacturer's recommended bend radius at all times.</b></li></ol>
<div class="callout stop"><b>Never let cable drop over a tray edge unsupported.</b> Waterfalls keep the bend radius at every tray exit (DRS 01.00.03 portal summary; DRS 01.00.02 rule 3).</div>
<div class="callout conflict"><b>20 × at tray corners — confirm with your lead.</b> The DRS 01.00.03 drawing marks the fiber bend radius at a tray corner as <b>20 × the cable diameter</b>. DRS 01.00.01 gives 20 × as the loaded minimum (cable is under tension as it is pulled around tray corners) and 10 × unloaded. This course teaches: keep tray corners at <b>at least 20 ×</b>, or the manufacturer's spec if bigger.</div>
<p class="muted small">Why secure only at corners, exits and vertical runs? Those are the places where a bundle could slide, sag or be pulled into a tight bend. On straight runs the bundle lies loose in the tray. (Explanation, not DRS text.)</p>`,
      act: { type: 'explore', id: 'a5b-tray', title: 'Explore the basket tray', dg: 'trayPlan', o: {},
        intro: 'Redrawn from DRS 01.00.03. The numbers match the five rules. Select each part.',
        spots: [
          { k: 'b-spacing', t: 'Rules 1 and 3 — 1/2-inch Velcro every 12-18 inches', d: 'Bundles are held neatly with 1/2-inch Velcro, 12 to 18 inches apart. On straight runs they are not strapped to the tray.' },
          { k: 'c-corner', t: 'Rule 2 (corners) — secure 3× at each corner', d: 'Going around a bend, the bundle is secured to the tray three times.' },
          { k: 'c-exit', t: 'Rule 2 (exits) — secure 3× at each exit', d: 'Where the bundle leaves the tray, it is secured to the tray three times.' },
          { k: 'wf-c', t: 'Rule 4 — waterfall centered over the rack VCM', d: 'The waterfall at each exit sits centered over the vertical cable manager of the rack below.' },
          { k: 'bend20', t: 'Rule 5 (corners) — bend radius at corners', d: 'Cables keep the manufacturer\'s recommended bend radius at all times. The drawing marks 20 × the cable diameter at the corner.' },
          { k: 'side-wf', t: 'Rule 5 (exits) — the waterfall keeps the bend radius', d: 'Side view: the cable curves over the waterfall instead of bending over the tray edge.' },
          { k: 'bad-drop', t: 'Never drop over a tray edge unsupported', d: 'Without a waterfall the cable kinks over the tray wire. Not allowed.' }
        ] } },
    { id: 's3', stage: 'Understand', title: 'Vertical pathways (DRS 01.00.03.01)',
      html: `<p><b>DRS 01.00.03.01, Cable Dressing Vertical Pathways</b> (revised 6/9/2026; portal title "Vertical Pathway Dressing") covers cable running up or down a vertical tray or ladder. Its number adds a fourth part to DRS 01.00.03: it builds on the basket tray sheet. Its five rules:</p>
<ol class="steps">
<li><b>Bundle cables neatly with Velcro, 12 to 18 inches apart</b>, in vertical tray as well.</li>
<li><b>Secure bundles to the cable tray when running vertically.</b> Unlike horizontal runs, where bundles float.</li>
<li><b>Cable in vertical tray or ladder must be secured so it is self-supporting.</b> Too much cable weight on the horizontal transitions damages the tray and the cable.</li>
<li><b>Waterfalls are required at all vertical transitions</b>, to keep the cable bend radius. A missing waterfall can damage the cable.</li>
<li><b>3/4-inch Velcro may be used to secure cable to vertical tray.</b></li></ol>
<div class="callout stop"><b>Too little Velcro on a vertical run</b> lets the cable slide to the bottom under its own weight, damaging the cable and the tray (DRS 01.00.03.01 portal summary and drawing).</div>
<div class="callout info"><b>Velcro sizes, together:</b> bundle with <b>1/2-inch</b> everywhere (DRS 01.00.03 rule 3). <b>3/4-inch may be used to secure cable to vertical tray</b> (this sheet, rule 5). The guide (p.7) says the same. <b>Bend radius:</b> the drawing notes <b>all bends greater than 20 × the cable diameter</b>.</div>
<p class="muted small">Why: on a vertical run the cable's whole weight hangs from wherever it is held. Secured all the way up, each section carries its own weight; held loosely, the weight piles onto the bend at the bottom. (Explanation, not DRS text.)</p>`,
      act: { type: 'explore', id: 'a5b-vert', title: 'Explore a vertical pathway', dg: 'vertPath', o: {},
        intro: 'Redrawn from DRS 01.00.03.01 (side view). Right side: done right. Left side: two mistakes. Select each part.',
        spots: [
          { k: 'h-float', t: 'Rule 1 (horizontal) — bundled, floating', d: 'On the horizontal tray the bundles get Velcro every 12-18 inches but are not secured to the tray (DRS 01.00.03 rule 2).' },
          { k: 'v-secured', t: 'Rules 2 and 3 — vertical: secured, self-supporting', d: 'On the vertical tray the bundle is secured to the tray all the way up, so it carries its own weight.' },
          { k: 'v-velcro', t: 'Rule 5 — 3/4-inch Velcro may secure it', d: '3/4-inch Velcro may be used to secure cable to vertical tray. Bundling still uses 1/2-inch.' },
          { k: 'wf-top', t: 'Rule 4 — waterfall at every vertical transition', d: 'Where the cable turns from horizontal to vertical, a waterfall keeps the bend radius and protects the cable and the tray.' },
          { k: 'bend20', t: 'All bends over 20 × diameter', d: 'The drawing marks every bend in the pathway at more than 20 times the cable diameter.' },
          { k: 'bad-wf', t: 'Mistake: no waterfall — at the transition', d: 'The cable bends over the tray edge. The DRS drawing calls this potential cable damage.' },
          { k: 'bad-drop', t: 'Mistake: too little Velcro — on the vertical run', d: 'The cable has slid to the bottom under its own weight and bunched at the lower transition, damaging the cable and the tray.' }
        ] } },
    { id: 's4', stage: 'Understand', title: 'Front of the rack (DRS 01.00.02)',
      html: `<p><b>DRS 01.00.02, Front of Rack Cable Dressing</b> (revised 6/9/2026) covers how cable leaves the overhead <b>[[baskettray|basket tray]]</b> and comes down the front of the rack. Its six rules:</p>
<ol class="steps">
<li><b>Cables shall not cross devices they do not patch into.</b> Every device must be replaceable without unpatching cables that end in another device.</li>
<li><b>Cable shall exit the basket tray directly above the rack edge or the vertical cable managers ([[VCM|VCMs]]).</b></li>
<li><b>All cables entering or leaving the basket tray must be supported by [[waterfall|waterfalls]]</b>, to keep the proper bend radius (minimums: DRS 01.00.01 rule 3). DRS 01.00.03 rule 4 adds: waterfalls are <b>centered over the rack VCMs</b>.</li>
<li><b>[[overthetop|Over-the-top waterfalls]] must be used for network racks.</b></li>
<li><b>Bundle cable neatly with 1/2-inch Velcro.</b> The same rule as DRS 01.00.01 rule 2 and DRS 01.00.03 rule 3.</li>
<li><b>Use the waterfall next to the side of the rack the cables patch into.</b></li></ol>
<p>The drawing shows each waterfall <b>lined up with the rack's VCM</b>. It also says <b>tray accessories must fit the tray</b>: trays made by Basor, WBT, Legrand or equivalent, with <b>2 × 4 inch (50 × 100 mm) openings and 5 mm wire</b>. If a waterfall or other accessory does not fit the tray you are working on, stop and ask your lead.</p>
<div class="callout info"><b>Which racks are "network racks"?</b> In the guide, the over-the-top note sits on the DCN patch panel and spine rack pages (guide p.39, 41), in network rows 1-2 (Lessons 9 and 13). DRS 01.00.02 does not list which racks count. Ask your lead whether the EOR (AIO) and SPOCS racks need over-the-top waterfalls too.</div>
<div class="callout conflict"><b>"Should" on a DRS.</b> Rule 6 says cables <i>should</i> use the waterfall on their side; rules 1-5 say <i>shall</i> or <i>must</i>. DRS 01.00.00 says every DRS is a requirement, so this course teaches rule 6 as required. Confirm with your lead.</div>`,
      act: { type: 'explore', id: 'a5-front', title: 'Explore the front of the rack', dg: 'frontRack', o: {},
        intro: 'Redrawn from DRS 01.00.02. The numbers match the six rules. Select each part.',
        spots: [
          { k: 'bad-cross', t: 'Rule 1 — never cross devices you do not patch into', d: 'The red cable cuts across the front of devices it does not plug into. Anyone replacing those devices would have to unpatch it. Not allowed.' },
          { k: 'exit', t: 'Rule 2 — exit directly above the rack edge or VCM', d: 'The cable leaves the tray straight above the rack edge and drops into the vertical cable manager.' },
          { k: 'wf-l', t: 'Rule 3 — a waterfall where cable leaves the tray', d: 'Every cable entering or leaving the basket tray is supported by a waterfall, which keeps the bend wide. Each waterfall lines up with the rack VCM.' },
          { k: 'wf-top', t: 'Rule 4 — over-the-top waterfall for network racks', d: 'At a network rack the cable rides over the top of the tray on an over-the-top waterfall, lined up with the rack VCM.' },
          { k: 'velcro', t: 'Rule 5 — 1/2-inch Velcro', d: 'The bundle is held neatly with 1/2-inch hook-and-loop straps. No zip ties (DRS 01.00.01 rule 2).' },
          { k: 'side', t: 'Rule 6 — use the waterfall on your side', d: 'These cables patch into the left side of the rack, so they use the left waterfall and the left VCM.' },
          { k: 'acc', t: 'Tray accessories must fit the tray', d: 'Waterfalls and other accessories must fit trays made by Basor, WBT, Legrand or equivalent: 2 × 4 inch (50 × 100 mm) openings, 5 mm wire.' }
        ] } },
    { id: 's5', stage: 'Understand', title: 'The VCM, slack and tiers (guide p.7)',
      figs: [{ dg: 'tray', o: {}, cap: 'Tray tiers count from the bottom up. A waterfall keeps the bend wide where cables leave the tray (guide p.7; DRS 01.00.02 rule 3; DRS 01.00.03 rule 4).' }],
      html: `<p>These rules come from the guide's dressing page (p.7). Their DRS sheet has not been added yet. (Guide p.7 rules 5-8 are now covered by DRS 01.00.02, 01.00.03 and 01.00.03.01.)</p>
<ol class="steps" start="9">
<li><b>In the VCM</b> (Vertical Cable Manager, the channel on the side of the rack): cables exit between the fingers <b>closest to the device</b> they patch. Slack goes on the <b>[[downstream]]</b> side of the connection. <b>Nothing touches the floor.</b></li>
<li><b>Trunk slack</b> (above the split point) is stored <b>on top of the rack</b>, never in the tray.</li>
<li><b>Tray [[tier|tiers]] count from the bottom up.</b> Tier 1: OCS cables. Tier 2: 144F trunks and, at this site, CAT6.</li></ol>
<div class="callout conflict"><b>Conflict in the guide — ask your lead.</b> Pages 7, 16, 31 and the glossary say CAT6 runs in <b>Tier 2</b> at this site ("the CAT6 tier was changed recently and may differ at other sites"). Page 14 still says to run copper in the <b>Tier 1</b> tray. This course teaches Tier 2 because four places agree and one explains the change, but confirm with your lead.</div>` },
    { id: 's6', stage: 'Work with it', title: 'Worked example: dropping a bundle to a rack, rule by rule',
      html: `<p class="muted small">Citations: 01.00.01, 01.00.02, 01.00.03 and 01.00.03.01 are DRS sheet numbers; "guide" is guide p.7.</p>
<ol class="steps">
<li><b>Check the jacket rating</b> matches every space the run passes through: plenum, riser or LSZH. <span class="muted">(01.00.01 rule 6)</span></li>
<li><b>Bundle in its tier</b> with 1/2-inch Velcro every 12-18 inches, loose in the tray on straight runs. <span class="muted">(01.00.03 rules 1-3; guide rule 11)</span></li>
<li><b>On horizontal runs,</b> check there is a support every 4-5 ft and nothing that could damage the cable. <span class="muted">(01.00.01 rules 4, 5)</span></li>
<li><b>At the corner,</b> keep the bend at least 20 × the diameter (or the spec) and <b>secure it 3 times</b>. <span class="muted">(01.00.03 rules 2, 5; 01.00.01 rule 3)</span></li>
<li><b>Leave the tray</b> directly above the rack edge or VCM, <b>over the waterfall centered over the VCM on the side you patch into</b> (over-the-top at a network rack), and <b>secure 3 times</b> at the exit. Never drop over the tray edge unsupported. <span class="muted">(01.00.02 rules 2-4, 6; 01.00.03 rules 2, 4)</span></li>
<li><b>Down the rack,</b> cross nothing you do not patch into. <span class="muted">(01.00.02 rule 1)</span></li>
<li><b>On a vertical run,</b> Velcro every 12-18 inches and secure it to the tray so it is self-supporting (3/4-inch Velcro may be used to secure it), with a waterfall at each vertical transition. <span class="muted">(01.00.03.01 rules 1-5)</span></li>
<li><b>In the VCM,</b> come out between the fingers closest to the device. Slack on the downstream side; nothing touches the floor. Trunk slack on top of the rack. <span class="muted">(guide rules 9, 10)</span></li></ol>` },
    { id: 's7', stage: 'Apply', title: 'Practice: put the steps in order',
      act: { type: 'order', id: 'a5-order', title: 'Dress a bundle from tray to device', intro: 'Put these steps in order, from checking the cable to the final floor check.',
        items: ['Check the jacket rating matches the space (plenum, riser or LSZH)', 'Bundle in the tray with 1/2-inch Velcro every 12-18 inches', 'Secure 3 times at the corner where it turns', 'Exit over the waterfall above the rack edge or VCM', 'Secure the vertical run so it carries its own weight', 'Leave the VCM between the fingers closest to the device', 'Put slack on the downstream side and check nothing touches the floor'],
        why: 'Check the cable is rated for the space first (DRS 01.00.01 rule 6), then follow the cable: tray and corner (DRS 01.00.03), exit and front of rack (DRS 01.00.02), vertical run (DRS 01.00.03.01), VCM (guide p.7), then slack and a final floor check.' } },
    { id: 's8', stage: 'Apply', title: 'Practice: which rule says so?',
      act: { type: 'match', id: 'a5b-match', title: 'Match each rule to where it comes from', intro: 'Choose the source of each rule.',
        pairs: [
          ['Velcro every 12-18 inches in the tray', 'DRS 01.00.03 rule 1'],
          ['Secure to the tray 3× at corners and exits only', 'DRS 01.00.03 rule 2'],
          ['Waterfalls centered over the rack VCMs', 'DRS 01.00.03 rule 4'],
          ['Vertical runs secured to the tray, self-supporting', 'DRS 01.00.03.01 rules 2-3'],
          ['3/4-inch Velcro may secure cable to vertical tray', 'DRS 01.00.03.01 rule 5'],
          ['Never cross a device you do not patch into', 'DRS 01.00.02 rule 1'],
          ['Over-the-top waterfalls at network racks', 'DRS 01.00.02 rule 4'],
          ['Use the waterfall on the side you patch into', 'DRS 01.00.02 rule 6'],
          ['Trunk slack on top of the rack, never in the tray', 'Guide p.7 (DRS sheet not added yet)']
        ],
        why: 'DRS 01.00.03 covers the tray (bundling, securing, waterfalls centered over VCMs, bend radius); DRS 01.00.03.01 adds vertical pathways. DRS 01.00.02 covers the front of the rack (crossing devices, exits, over-the-top waterfalls, side). Slack, the VCM and tiers come from guide p.7 until their DRS sheet is added.' } },
    { id: 's9', stage: 'Apply', title: 'Practice: spot the dressing mistakes',
      act: { type: 'scenario', id: 'a5b-spot', title: 'What is wrong here?',
        qs: [
          { q: 'Select <b>every</b> mistake: a bundle is held with nylon zip ties, strapped to the tray every foot along a straight run, with its trunk slack coiled in the tray.', multi: true, opts: [
            { t: 'Zip ties are not allowed: use 1/2-inch Velcro', ok: true, why: 'DRS 01.00.01 rule 2; DRS 01.00.03 rule 3.' },
            { t: 'Bundles are not secured to the tray on straight runs, only at corners, exits and vertical runs', ok: true, why: 'DRS 01.00.03 rule 2.' },
            { t: 'Trunk slack goes on top of the rack, never in the tray', ok: true, why: 'Guide p.7 rule 10.' },
            { t: 'Bundles should be tied every 4 inches', ok: false, why: 'Bundle every 12-18 inches (DRS 01.00.03 rule 1).' }] },
          { q: 'A cable leaves the tray by dropping straight over the tray wire to the rack below. There is no waterfall there.', opts: [
            { t: 'Not allowed: never drop over a tray edge unsupported. Add a waterfall centered over the rack VCM', ok: true, why: 'DRS 01.00.03 (waterfalls keep the bend radius at every exit; rule 4) and DRS 01.00.02 rule 3.' },
            { t: 'Fine if the drop is short', ok: false, why: 'The edge kinks the cable whatever the length.' },
            { t: 'Fine if you Velcro it to the tray edge', ok: false, why: 'Velcro does not give it a bend radius. It needs a waterfall.' },
            { t: 'Fine for copper', ok: false, why: 'Every cable entering or leaving the tray needs a waterfall.' }] },
          { q: 'On a vertical ladder, a heavy bundle is held by two loose straps near the top. At the bottom transition the cable has bunched up against the tray. Select <b>every</b> problem.', multi: true, opts: [
            { t: 'Vertical cable must be secured to the tray so it is self-supporting', ok: true, why: 'DRS 01.00.03.01 rules 2 and 3.' },
            { t: 'Velcro every 12-18 inches on the vertical run too', ok: true, why: 'DRS 01.00.03.01 rule 1.' },
            { t: 'Its weight on the horizontal transition can damage the tray and the cable', ok: true, why: 'DRS 01.00.03.01 rule 3 and the drawing note: inadequate Velcro lets cable drop to the bottom.' },
            { t: 'Vertical runs should float, like horizontal runs', ok: false, why: 'Horizontal bundles float; vertical bundles are secured.' }] },
          { q: 'A waterfall is mounted about a foot to the side of the rack, not over the vertical cable manager.', opts: [
            { t: 'Move it: waterfalls are centered over the rack VCMs', ok: true, why: 'DRS 01.00.03 rule 4; DRS 01.00.02 drawing: aligned with the rack VCM.' },
            { t: 'Fine, as long as there is a waterfall', ok: false, why: 'It must be centered over the VCM.' },
            { t: 'Fine at network racks only', ok: false, why: 'Network racks use over-the-top waterfalls, also lined up with the VCM.' },
            { t: 'Remove it and drop the cable straight down', ok: false, why: 'Never drop over a tray edge unsupported.' }] },
          { q: 'At a DCN patch panel rack in network row 1, a bundle drops off the side of the tray through a regular waterfall, on the opposite side from the panels it patches into. Select <b>every</b> problem.', multi: true, opts: [
            { t: 'Network racks need over-the-top waterfalls', ok: true, why: 'DRS 01.00.02 rule 4 (guide p.39, 41).' },
            { t: 'It should use the waterfall on the side of the rack it patches into', ok: true, why: 'DRS 01.00.02 rule 6.' },
            { t: 'Waterfalls are not allowed at network racks', ok: false, why: 'They are required: over-the-top ones.' },
            { t: 'It should leave the tray in the middle of the rack top', ok: false, why: 'Exit directly above the rack edge or VCM (DRS 01.00.02 rule 2).' }] },
          { q: 'A copper run is routed across the front of a neighboring switch to reach its panel. Why is that a problem?', opts: [
            { t: 'Cables must not cross devices they do not patch into, so any device can be replaced without unpatching others', ok: true, why: 'DRS 01.00.02 rule 1.' },
            { t: 'It is fine if the run is shorter that way', ok: false, why: 'Shorter is not the test; crossing other devices is not allowed.' },
            { t: 'It is only a problem for fiber, not copper', ok: false, why: 'The rule applies to every cable.' },
            { t: 'It is fine if it is labeled', ok: false, why: 'Labeling does not fix the routing.' }] }
        ] } }
  ],
  check: [
    { q: 'In the basket tray, how often do you bundle, and where do you secure bundles to the tray?', opts: [
      { t: 'Velcro every 12-18 in; secure to the tray only at corners, exits and vertical runs, 3 times at each corner and exit', ok: true, why: 'DRS 01.00.03 rules 1 and 2 (vertical runs: DRS 01.00.03.01).' },
      { t: 'Velcro every 4-5 ft and secure everywhere', ok: false, why: '4-5 ft is support spacing (DRS 01.00.01 rule 5).' },
      { t: 'Velcro every 6 in and never secure', ok: false, why: '12-18 in, secured at corners, exits and vertical runs.' },
      { t: 'Secure to the tray every 12-18 in', ok: false, why: 'Bundles are not secured on straight runs.' }], ref: 's2' },
    { q: 'How is cable dressed on a vertical tray or ladder?', opts: [
      { t: 'Velcro every 12-18 in, secured to the tray so it is self-supporting, with waterfalls at each vertical transition', ok: true, why: 'DRS 01.00.03.01 rules 1-4.' },
      { t: 'Loose, like horizontal runs, so it can move', ok: false, why: 'Vertical bundles are secured; only horizontal bundles float.' },
      { t: 'Held only at the top so it hangs straight', ok: false, why: 'Its weight would pile onto the bottom transition. Secure it all the way.' },
      { t: 'Zip-tied tight to the ladder', ok: false, why: 'Never zip ties. 3/4-inch Velcro may be used to secure it.' }], ref: 's3' },
    { q: 'Where does a waterfall go?', opts: [
      { t: 'At every tray exit, centered over the rack VCM, and at every vertical transition', ok: true, why: 'DRS 01.00.03 rule 4; DRS 01.00.02 rule 3; DRS 01.00.03.01 rule 4.' },
      { t: 'Anywhere along the tray', ok: false, why: 'At the exit, centered over the rack VCM.' },
      { t: 'Only at network racks', ok: false, why: 'Every exit needs one; network racks need the over-the-top kind.' },
      { t: 'Only for fiber', ok: false, why: 'Every cable entering or leaving the tray.' }], ref: 's2' },
    { q: 'Where must a cable leave the basket tray?', opts: [
      { t: 'Directly above the rack edge or VCM, over a waterfall on the side you patch into', ok: true, why: 'DRS 01.00.02 rules 2, 3 and 6.' },
      { t: 'Anywhere it reaches the rack most directly', ok: false, why: 'It must exit above the rack edge or VCM, over a waterfall.' },
      { t: 'Over the tray edge without a waterfall', ok: false, why: 'Never drop over a tray edge unsupported.' }, { t: 'At the nearest tray joint', ok: false, why: 'Exits are above the rack edge or VCM.' }], ref: 's4' },
    { q: 'What kind of waterfall must be used at a network rack?', opts: [
      { t: 'An over-the-top waterfall, lined up with the rack VCM', ok: true, why: 'DRS 01.00.02 rule 4.' },
      { t: 'No waterfall; drop straight down', ok: false, why: 'Every cable leaving the tray needs a waterfall (rule 3).' },
      { t: 'Any waterfall, on whichever side is closer', ok: false, why: 'Over-the-top for network racks, on the side you patch into (rules 4, 6).' },
      { t: 'A zip-tied loop over the tray edge', ok: false, why: 'No zip ties, and a waterfall is required.' }], ref: 's4' },
    { q: 'At this site, which tray tier carries the OCS cables?', opts: [
      { t: 'Tier 1, the bottom tier', ok: true, why: 'Tiers count from the bottom up. Tier 1 = OCS (guide p.7).' },
      { t: 'Tier 2', ok: false, why: 'Tier 2 carries 144F trunks and, at this site, CAT6.' },
      { t: 'The top tier', ok: false, why: 'Tier 1 is the bottom tier.' }, { t: 'Any tier with space', ok: false, why: 'OCS cables run in Tier 1.' }], ref: 's5' }
  ]
});
