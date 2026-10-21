/* DRS sheets covered by this course, in plain words, with where each is taught.
   Source: the Fluidstack DRS sheets supplied one at a time (Fluidstack Internal Use Only).
   Add one entry per new sheet. "taught" = [lessonId, sectionId, label]. "open" = open-item numbers. */
window.COURSE = window.COURSE || {};
COURSE.drs = [
  { num: '01.00.00', title: 'Introduction: what a DRS is', kind: 'Portal page', rev: 'approved 6/9/2026', appr: 'Tom Marsh, Infrastructure Deployment Manager',
    rules: [
      'DRS = Deployment Requirement Sheet: Fluidstack\'s technical standards for how installation work must be done. <b>Requirements, not guidelines.</b> Every on-site task has a matching DRS.',
      'Contains step-by-step requirements, specifications, approved materials, diagrams, and references to ANSI/TIA, BICSI, NEC and NEMA standards.',
      'Exists so every deployment meets the same quality standard, whoever does the work; protects equipment and lowers outage risk.',
      'Approved by Fluidstack ICT leadership. New revisions are announced through the portal. <b>Always use the current version: check the revision date on the cover page.</b>',
      'Get it from Fluidstack Confluence (fluidstack.atlassian.net → LVC Deployment space → DEPLOYMENT REQUIREMENTS SHEETS). Backup: your Fluidstack PM or site supervisor.',
      '<b>On site:</b> have the applicable DRS on hand, printed or on a device. Working from memory alone is not acceptable. No DRS: <b>stop work and get it.</b>'
    ],
    stds: ['ANSI/TIA', 'BICSI', 'NEC', 'NEMA'], xref: [],
    taught: [['l00', 's1', 'Lesson 0 · What a DRS is'], ['l00', 's4', 'Lesson 0 · Getting the right DRS'], ['l00', 's6', 'Lesson 0 · The on-site rule']],
    video: 'Lesson 0 video', open: [14, 17] },
  { num: '01.00.01', title: 'General Fiber Cable Dressing', alt: 'portal title: General Cable Dressing', kind: 'Drawing + portal summary', rev: 'revised 6/9/2026', appr: 'Tom Marsh',
    rules: [
      'Dress cables in accordance with <b>ANSI/TIA-568, ANSI/TIA-606 and ANSI/TIA-942</b>.',
      'Bundle with <b>1/2-inch hook-and-loop (Velcro)</b>. Nylon zip ties are not allowed.',
      '<b>Bend radius:</b> follow the manufacturer\'s spec; minimum <b>20 × diameter loaded</b> (under tension), <b>10 × unloaded</b>. See DRS 01.00.07 for fiber bend radius.',
      'Cable supports must not damage the cable: <b>no metal staples</b>.',
      '<b>Support every 4-5 feet</b> on horizontal runs (TIA-568 recommendation).',
      '<b>Rated cable for the space:</b> plenum OFNP / CMP in plenum spaces, riser OFNR / CMR in vertical risers, LSZH where local code requires.'
    ],
    stds: ['ANSI/TIA-568', 'ANSI/TIA-606', 'ANSI/TIA-942', 'NEC (cable ratings)'], xref: ['01.00.07'],
    taught: [['l05', 's1', 'Lesson 5 · The six rules'], ['l05', 's2', 'Lesson 5 · The standards behind the rules'], ['l05', 's3', 'Lesson 5 · Ties, bends and supports'], ['l05', 's4', 'Lesson 5 · Rated cable'], ['l05', 's5', 'Lesson 5 · Bend radius worked example'], ['l03', 's6', 'Lesson 3 · Handling fiber']],
    video: 'Lesson 5 video; Lesson 3 video (Handling fiber)', open: [12, 13, 15, 16] },
  { num: '01.00.02', title: 'Front of Rack Cable Dressing', kind: 'Drawing + portal summary', rev: 'revised 6/9/2026', appr: 'Tom Marsh',
    rules: [
      'Cables shall <b>not cross devices they do not patch into</b>. Every device must be replaceable without unpatching cables that end in another device.',
      'Cable shall <b>exit the basket tray directly above the rack edge or the vertical cable managers</b> (VCMs).',
      'All cables entering or leaving the basket tray must be <b>supported by waterfalls</b> to keep the proper bend radius.',
      '<b>Over-the-top waterfalls</b> must be used for <b>network racks</b>.',
      'Bundle cable neatly with <b>1/2-inch Velcro</b>.',
      'Cables should use the <b>waterfall next to the side of the rack they patch into</b>.',
      'Drawing note: each waterfall lines up with the rack VCM. <b>Tray accessories must fit</b> trays made by Basor, WBT, Legrand or equivalent, with 2 × 4 inch (50 × 100 mm) openings and 5 mm wire.'
    ],
    stds: [], xref: [],
    taught: [['l05b', 's4', 'Lesson 5B · Front of the rack'], ['l05b', 's6', 'Lesson 5B · Worked example'], ['l09', 's3', 'Lesson 9 · Landing the 192F (network rack)'], ['l09', 's5', 'Lesson 9 · Cords to the spines (network rack)']],
    video: 'Lesson 5B video (Front of the rack)', open: [12, 18, 19] },
  { num: '01.00.03', title: 'Cable Dressing Basket Trays', alt: 'portal title: Basket Tray Cable Dressing', kind: 'Drawing + portal summary', rev: 'revised 6/9/2026', appr: 'Tom Marsh',
    rules: [
      'Bundle cables neatly in the tray with <b>Velcro 12 to 18 inches apart</b>.',
      '<b>Do not secure bundles to the basket tray</b> except going around bends, exiting the tray, or running vertically. <b>Secure 3× at corners and 3× at exits.</b>',
      '<b>1/2-inch Velcro</b> for all cable bundling.',
      '<b>Waterfalls centered over the rack VCMs.</b>',
      'Cables keep the <b>manufacturer\'s recommended bend radius</b> at all times. Drawing: fiber bend radius at a tray corner shown as <b>20 × cable diameter</b>.',
      'Portal summary: <b>never allow cable to drop over a tray edge unsupported</b>. Waterfalls keep the bend radius at every tray exit.'
    ],
    stds: [], xref: [],
    taught: [['l05b', 's1', 'Lesson 5B · From the tray to the device'], ['l05b', 's2', 'Lesson 5B · In the basket tray'], ['l05b', 's6', 'Lesson 5B · Worked example'], ['l11', 's6', 'Lesson 11 · Pulling and dressing the OCS bundles'], ['l12', 's5', 'Lesson 12 · Routing and labels']],
    video: 'Lesson 5B video (In the basket tray); Lesson 11 video (Pulling and dressing)', open: [12, 20] },
  { num: '01.00.03.01', title: 'Cable Dressing Vertical Pathways', alt: 'portal title: Vertical Pathway Dressing', kind: 'Drawing + portal summary', rev: 'revised 6/9/2026', appr: 'Tom Marsh',
    rules: [
      'Bundle cables neatly with <b>Velcro 12 to 18 inches apart</b>, in vertical tray as well.',
      '<b>Secure bundles to the cable tray when running vertically</b> (horizontal bundles float).',
      'Cable in vertical tray or ladder must be <b>secured to be self-supporting</b>. Excessive cable weight on horizontal transitions damages the tray and the cable.',
      '<b>Waterfalls are required at all vertical transitions</b> to keep the cable bend radius. A missing waterfall can damage the cable.',
      '<b>3/4-inch Velcro may be used to secure cable to vertical tray.</b>',
      'Drawing: <b>all bends greater than 20 × the cable diameter</b>. Portal: <b>too little Velcro on vertical runs lets cable drop to the bottom</b> under its own weight, damaging cable and tray.'
    ],
    stds: [], xref: [],
    taught: [['l05b', 's1', 'Lesson 5B · From the tray to the device'], ['l05b', 's3', 'Lesson 5B · Vertical pathways'], ['l05b', 's6', 'Lesson 5B · Worked example'], ['l05', 's3', 'Lesson 5 · Velcro sizes'], ['l11', 's6', 'Lesson 11 · Pulling and dressing the OCS bundles']],
    video: 'Lesson 5B video (Vertical pathways)', open: [12, 20] }
];
COURSE.drsPending = [
  { num: '01.00.07', why: 'Fiber bend radius. DRS 01.00.01 says "see DRS 01.00.07".' },
  { num: '01.00, 01.01, 02.00, 05.00, 10.01, 10.04, 10.08, 10.10', why: 'The DRS sections the installation guide says it was built from (guide p.1). Which 3-part sheets belong to each is not stated.' }
];
