/* Final assessment. Each question has a topic (for results by topic) and a review link (lesson#section). */
window.COURSE = window.COURSE || {};
COURSE.finalTopics = {
  drs: 'The DRS', big: 'Big picture', hall: 'Hall map & locations', basics: 'Fiber & copper basics', labels: 'Cutsheet & labels',
  dress: 'Dressing: general rules', tray: 'Dressing: tray & front of rack', tpu: 'TPU rack', f144: '144F trunk at the TOR', aio: 'AIO panel & 192F', dcn: 'DCN-PP & spines',
  ocs: 'OCS cables', cu: 'Copper home runs', mgmt: 'Management trunks', bms: 'BMS'
};
COURSE.finalExam = [
  { topic: 'drs', ref: 'l00#s1', q: 'What is a DRS, and how must you treat it?', opts: [
    { t: 'A Deployment Requirement Sheet: a requirement that says exactly how a task must be done', ok: true, why: 'DRS documents are requirements, not guidelines (DRS 01.00.00).' },
    { t: 'A guideline you can adapt on site', ok: false, why: 'They are requirements, not guidelines.' },
    { t: 'The cutsheet for one pod', ok: false, why: 'The cutsheet says where; the DRS says how.' },
    { t: 'A drawing for designers only', ok: false, why: 'Every on-site task has a DRS, and you must have it on hand.' }] },
  { topic: 'drs', ref: 'l00#s6', q: 'You reach the rack and realize you do not have the DRS for the task with you. What do you do?', opts: [
    { t: 'Stop work and get it (printed, on a device, or from your PM or site supervisor)', ok: true, why: 'Working from memory alone is not acceptable (DRS 01.00.00).' },
    { t: 'Work from memory, then check the DRS later', ok: false, why: 'The DRS must be on hand while you work.' },
    { t: 'Ask a coworker how they did it last time', ok: false, why: 'Only the current DRS counts.' },
    { t: 'Use this course instead', ok: false, why: 'The course is a training aid, not the DRS.' }] },
  { topic: 'drs', ref: 'l00#s4', q: 'Where do you get the current DRS, and how do you know it is current?', opts: [
    { t: 'Fluidstack Confluence (LVC Deployment → DEPLOYMENT REQUIREMENTS SHEETS); check the revision date on the cover page', ok: true, why: 'The portal is the authoritative source; always use the current revision.' },
    { t: 'Any printed copy on site; printed copies are always current', ok: false, why: 'A printout can be an old revision.' },
    { t: 'The cutsheet; it lists DRS revisions', ok: false, why: 'Get the DRS from the portal, or from your PM or site supervisor.' },
    { t: 'A photo from another site', ok: false, why: 'It may be another revision.' }] },
  { topic: 'big', ref: 'l01#s4', q: 'Which of these five cable paths is NOT your crew\'s job?', opts: [
    { t: 'Cabling between machine trays inside the TPU rack', ok: true, why: 'Inside the TPU rack is pre-cabled (p.4).' },
    { t: '144F trunks from TPU racks to EOR racks', ok: false, why: 'That is path 1.' }, { t: 'OCS cables to the SPOCS racks', ok: false, why: 'That is path 3.' },
    { t: 'Management trunks to the management spines', ok: false, why: 'That is path 5.' }] },
  { topic: 'big', ref: 'l01#s2', q: 'Which network do the 144F and 192F trunks build?', opts: [
    { t: 'The DCN (Data Center Network), ending at the DCN spines', ok: true, why: 'TOR → AIO → DCN-PP → spines.' },
    { t: 'The OCS fabric', ok: false, why: 'The OCS fabric uses the 3 OCS cables to the SPOCS racks.' },
    { t: 'The management network', ok: false, why: 'Management uses copper and 12F/24F trunks.' }, { t: 'The BMS', ok: false, why: 'BMS rides the management trunks.' }] },
  { topic: 'big', ref: 'l01#s5', q: 'What is the final word on any port?', opts: [
    { t: 'Your site\'s cutsheet', ok: true, why: 'Stated on every page of the guide.' }, { t: 'The cable label', ok: false, why: 'If the label disagrees with the cutsheet, stop and ask.' },
    { t: 'This course', ok: false, why: 'The course explains; the cutsheet decides.' }, { t: 'Whatever the last crew did', ok: false, why: 'The cutsheet decides.' }] },
  { topic: 'hall', ref: 'l02#s2', q: 'SITE-DH4-R2212 is:', opts: [
    { t: 'Row 22, spot 12: SPOCS rack 2 (orange) of pod 12', ok: true, why: 'Pod 12 SPOCS: 2112, 2212, 2312.' },
    { t: 'Row 2, spot 212', ok: false, why: 'R22 = row 22; 12 = spot.' }, { t: 'An EOR w/BMS rack', ok: false, why: 'Those are at spots 11 and 13.' }, { t: 'Network rack 212', ok: false, why: 'Network racks are rows 1-2.' }] },
  { topic: 'hall', ref: 'l02#s6', q: 'TPU rack 818 is served by:', opts: [
    { t: 'EOR 813', ok: true, why: 'Spot 18 is south (14-22) → spot 13.' }, { t: 'EOR 811', ok: false, why: 'Spot 11 serves spots 2-10.' },
    { t: 'EOR 812', ok: false, why: 'Spot 12 is the middle aisle.' }, { t: 'EOR 913', ok: false, why: 'Same row: 813.' }] },
  { topic: 'hall', ref: 'l02#s4', q: 'Which rows make up pod 11?', opts: [
    { t: 'Rows 11-18', ok: true, why: 'Pod 10: 3-10, pod 11: 11-18, pod 12: 19-26.' }, { t: 'Rows 13-15', ok: false, why: 'Those rows hold pod 11\'s SPOCS racks.' },
    { t: 'Rows 3-10', ok: false, why: 'That is pod 10.' }, { t: 'Rows 1-2', ok: false, why: 'Those are the network rows.' }] },
  { topic: 'hall', ref: 'l02#s5', q: 'Where are DCN-PP racks A-N and A-S?', opts: [
    { t: 'R107 and R108', ok: true, why: 'Network row 1 (p.44).' }, { t: 'R131 and R204', ok: false, why: 'Those are management spines.' },
    { t: 'R207 and R208', ok: false, why: 'Those are E-N and E-S.' }, { t: 'Spot 12 of row 1', ok: false, why: 'A-N is row 1 spot 07.' }] },
  { topic: 'basics', ref: 'l03#s3', q: 'How many fibers does an LC duplex leg carry?', opts: [
    { t: '2', ok: true, why: 'Duplex = 2 fibers.' }, { t: '8', ok: false, why: '8 is an MPO-8.' }, { t: '1', ok: false, why: 'Duplex is 2.' }, { t: '18', ok: false, why: '18 is a whole OCS cable.' }] },
  { topic: 'basics', ref: 'l03#s4', q: 'What color is TIA-598 position 10?', opts: [
    { t: 'Violet', ok: true, why: '9 yellow, 10 violet, 11 rose, 12 aqua.' }, { t: 'Rose', ok: false, why: 'Rose is 11.' }, { t: 'Yellow', ok: false, why: 'Yellow is 9.' }, { t: 'Aqua', ok: false, why: 'Aqua is 12.' }] },
  { topic: 'basics', ref: 'l03#s3', q: 'A green LC connector and a blue LC adapter: what should you assume?', opts: [
    { t: 'Likely APC vs UPC — do not mate them; stop and ask', ok: true, why: 'Mating APC to UPC performs badly and can damage end faces.' },
    { t: 'Colors do not matter on LC', ok: false, why: 'Green usually means APC; blue usually means UPC.' }, { t: 'Push gently and it will seat', ok: false, why: 'Never force it.' }, { t: 'Use a different port', ok: false, why: 'Ports come from the cutsheet.' }] },
  { topic: 'basics', ref: 'l03#s6', q: 'When do you scope and clean a fiber leg?', opts: [
    { t: 'Every leg, before it goes in', ok: true, why: 'Guide p.13, 15, 22, 36.' }, { t: 'Only if it looks dirty', ok: false, why: 'Dirt is often invisible without the scope.' },
    { t: 'After a link fails', ok: false, why: 'Before it goes in.' }, { t: 'Only on spares', ok: false, why: 'Every leg.' }] },
  { topic: 'labels', ref: 'l04#s4', q: 'A breakout leg gets which label, where?', opts: [
    { t: 'A flag label 4 in from the boot, printed both sides, barcode at the bottom', ok: true, why: 'Guide p.8 rule 3.' },
    { t: 'A wrap-around label 1-2 in from the boot', ok: false, why: 'That is for trunks.' }, { t: 'A handwritten tag', ok: false, why: 'Machine printed only.' }, { t: 'No label if it is a spare', ok: false, why: 'Spares are labeled.' }] },
  { topic: 'labels', ref: 'l04#s2', q: 'The AIO panel label "C5-3" means:', opts: [
    { t: 'Column C, port 5, row 3', ok: true, why: '(column)(port)-(row) (p.36).' }, { t: 'Row C, column 5, port 3', ok: false, why: 'The letter is the column.' },
    { t: 'Cable 5 of 3', ok: false, why: 'It is a panel position.' }, { t: 'Column C, row 5, port 3', ok: false, why: 'The number after the dash is the row.' }] },
  { topic: 'labels', ref: 'l04#s4', q: 'Which statement about label text is correct?', opts: [
    { t: 'Line 1 = A device and port, line 2 = Z device and port, same at both ends, matching the cutsheet', ok: true, why: 'Guide p.8 rule 2.' },
    { t: 'Each end shows only the far end', ok: false, why: 'Both ends get the same text.' }, { t: 'Line 1 is Z', ok: false, why: 'Line 1 is A.' }, { t: 'Text is optional if the barcode is printed', ok: false, why: 'Both lines are required.' }] },
  { topic: 'tray', ref: 'l05b#s5', q: 'Where is trunk slack (above the split point) stored?', opts: [
    { t: 'On top of the rack, never in the tray', ok: true, why: 'Guide p.7 rule 10.' }, { t: 'Coiled in the tray', ok: false, why: 'Never in the tray.' }, { t: 'In the VCM', ok: false, why: 'On top of the rack.' }, { t: 'Under the raised floor', ok: false, why: 'On top of the rack.' }] },
  { topic: 'tray', ref: 'l05b#s5', q: 'In the VCM, where do cables exit?', opts: [
    { t: 'Between the fingers closest to the device they patch', ok: true, why: 'Guide p.7 rule 9.' }, { t: 'At the top finger', ok: false, why: 'Closest to the device.' },
    { t: 'Wherever there is room', ok: false, why: 'Closest to the device.' }, { t: 'At the bottom of the rack', ok: false, why: 'Closest to the device.' }] },
  { topic: 'dress', ref: 'l05#s3', q: 'How far apart are supports on horizontal runs?', opts: [
    { t: 'Every 4 to 5 feet', ok: true, why: 'DRS 01.00.01 rule 5 (TIA-568 recommendation).' }, { t: 'Every 12-18 inches', ok: false, why: 'That is bundle (Velcro) spacing in the tray.' }, { t: 'Every 10 feet', ok: false, why: '4-5 ft.' }, { t: 'Only at corners', ok: false, why: '4-5 ft.' }] },
  { topic: 'tray', ref: 'l05b#s2', q: 'Where is a waterfall required?', opts: [
    { t: 'Where cables leave the tray and at every vertical transition', ok: true, why: 'DRS 01.00.02 rule 3 and DRS 01.00.03 (every cable entering or leaving the tray; never drop over a tray edge unsupported); DRS 01.00.03.01 rule 4 (all vertical transitions).' }, { t: 'Only at network racks', ok: false, why: 'Network racks use over-the-top waterfalls, but all exits need one.' },
    { t: 'Only for copper', ok: false, why: 'Every cable.' }, { t: 'Never; it is optional', ok: false, why: 'Required.' }] },
  { topic: 'dress', ref: 'l05#s3', q: 'Which tie does DRS 01.00.01 allow for bundling cables?', opts: [
    { t: '1/2-inch hook-and-loop (Velcro); nylon zip ties are not allowed', ok: true, why: 'DRS 01.00.01 rule 2; DRS 01.00.02 rule 5; DRS 01.00.03 rule 3.' },
    { t: 'Nylon zip ties, loosely', ok: false, why: 'Not allowed.' }, { t: 'Metal staples', ok: false, why: 'No metal staples (rule 4).' }, { t: 'Any tie that is handy', ok: false, why: '1/2-inch Velcro.' }] },
  { topic: 'dress', ref: 'l05#s3', q: 'A 0.20 in cable is being pulled. What is the smallest bend radius allowed (manufacturer spec is smaller)?', opts: [
    { t: '4 in (20 × 0.20)', ok: true, why: 'Loaded (under tension): 20 × the diameter (DRS 01.00.01 rule 3).' },
    { t: '2 in (10 × 0.20)', ok: false, why: '10 × is for unloaded cable.' }, { t: '3 in (15 × 0.20)', ok: false, why: '15 × is the guide\'s long-term recommendation.' }, { t: '0.2 in', ok: false, why: 'That is the diameter.' }] },
  { topic: 'dress', ref: 'l05#s4', q: 'A run passes through a plenum space. Which cable rating is required?', opts: [
    { t: 'OFNP (fiber) or CMP (copper)', ok: true, why: 'DRS 01.00.01 rule 6: plenum-rated cable in plenum spaces.' },
    { t: 'OFNR or CMR', ok: false, why: 'Riser-rated cable is for vertical risers and may not replace plenum.' },
    { t: 'Any cable with LSZH printed on it', ok: false, why: 'LSZH is used where local code requires it; plenum spaces need plenum-rated cable.' },
    { t: 'Any rating, if bundled with Velcro', ok: false, why: 'Bundling does not change the fire rating.' }] },
  { topic: 'dress', ref: 'l05#s2', q: 'DRS 01.00.01 says cables are dressed in accordance with which standards?', opts: [
    { t: 'ANSI/TIA-568, ANSI/TIA-606 and ANSI/TIA-942', ok: true, why: 'DRS 01.00.01 rule 1.' },
    { t: 'TIA-598 only', ok: false, why: 'TIA-598 is the fiber color code.' }, { t: 'NEMA only', ok: false, why: 'Rule 1 names three ANSI/TIA standards.' }, { t: 'None; dressing is up to the crew', ok: false, why: 'Rule 1 names the standards.' }] },
  { topic: 'tray', ref: 'l05b#s4', q: 'At a spine rack in network row 2, how must cables leave the basket tray?', opts: [
    { t: 'Over an over-the-top waterfall, lined up with the rack VCM, on the side of the rack they patch into', ok: true, why: 'DRS 01.00.02 rules 4 and 6 (guide p.41: over-the-top waterfalls at the spine racks).' },
    { t: 'Straight down from the middle of the tray', ok: false, why: 'Exit directly above the rack edge or VCM, over a waterfall (rules 2, 3).' },
    { t: 'Over any waterfall on the nearest side', ok: false, why: 'Network racks need over-the-top waterfalls, on the side you patch into.' },
    { t: 'Across the front of the next rack to reach the shorter path', ok: false, why: 'Never cross devices you do not patch into (rule 1).' }] },
  { topic: 'tray', ref: 'l05b#s4', q: 'Why must cables not cross devices they do not patch into?', opts: [
    { t: 'So any device can be replaced without unpatching cables that end in another device', ok: true, why: 'DRS 01.00.02 rule 1.' },
    { t: 'Because it makes the cable too long', ok: false, why: 'The reason is replaceability.' },
    { t: 'Only because it looks untidy', ok: false, why: 'It blocks replacing that device.' },
    { t: 'It is allowed if the cable is labeled', ok: false, why: 'Labeling does not fix the routing.' }] },
  { topic: 'tray', ref: 'l05b#s2', q: 'In the basket tray, where are bundles secured to the tray, and how?', opts: [
    { t: 'Only at corners, exits and vertical runs: 3 times at each corner and 3 times at each exit', ok: true, why: 'DRS 01.00.03 rule 2.' },
    { t: 'Every 12-18 inches along the whole run', ok: false, why: '12-18 in is the Velcro bundling spacing; bundles are not strapped to the tray on straight runs.' },
    { t: 'Never; bundles always lie loose', ok: false, why: 'They are secured at corners, exits and vertical runs.' },
    { t: 'Once at each end of the tray', ok: false, why: '3× at each corner and 3× at each exit.' }] },
  { topic: 'tray', ref: 'l05b#s2', q: 'A waterfall is installed beside the rack instead of over the vertical cable manager. What does DRS 01.00.03 say?', opts: [
    { t: 'Waterfalls are centered over the rack VCMs', ok: true, why: 'DRS 01.00.03 rule 4.' },
    { t: 'Any position is fine if the cable is supported', ok: false, why: 'Centered over the rack VCM.' },
    { t: 'Waterfalls go in the middle of the rack top', ok: false, why: 'Centered over the VCM, above the rack edge.' },
    { t: 'Waterfalls are only needed at corners', ok: false, why: 'They are at every tray exit.' }] },
  { topic: 'tray', ref: 'l05b#s3', q: 'Which statement about a vertical tray run is correct?', opts: [
    { t: 'Bundles are secured to the tray so the cable is self-supporting; 3/4-inch Velcro may be used to secure it', ok: true, why: 'DRS 01.00.03.01 rules 2, 3 and 5.' },
    { t: 'Bundles float, the same as on horizontal runs', ok: false, why: 'Only horizontal bundles float. Vertical bundles are secured.' },
    { t: 'Waterfalls are optional at vertical transitions', ok: false, why: 'Waterfalls are required at all vertical transitions (rule 4).' },
    { t: 'One strap at the top is enough', ok: false, why: 'Too little Velcro lets the cable drop to the bottom and damage the cable and tray.' }] },
  { topic: 'tpu', ref: 'l06#s2', q: 'Where is TROSS / RMU2?', opts: [
    { t: 'Side B, RU 38', ok: true, why: 'Guide p.14.' }, { t: 'Side A, RU 38', ok: false, why: 'RMU1 is on side A.' }, { t: 'In the EOR rack', ok: false, why: 'In the TPU rack.' }, { t: 'Under the batteries', ok: false, why: 'RU 38, below the TOR / blank.' }] },
  { topic: 'tpu', ref: 'l06#s3', q: 'Which group of cables makes up "Con. Mgmt (4 per rack)" on the hall map?', opts: [
    { t: 'TOR ETH, TOR CONSOLE, RMU1 CONSOLE, RMU2 CONSOLE', ok: true, why: 'The other 2 copper runs are the Gig E1 group.' },
    { t: 'The 4 OCS cables', ok: false, why: 'There are 3 OCS cables.' }, { t: 'Four 144F legs', ok: false, why: 'Con. Mgmt is copper.' }, { t: 'RMU1 and RMU2 GIG E 1, twice', ok: false, why: 'GIG E 1 is its own group of 2.' }] },
  { topic: 'tpu', ref: 'l06#s1', q: 'What is a TPU?', opts: [
    { t: 'A Tensor Processing Unit — a chip built for AI; a TPU rack holds many of them', ok: true, why: 'Guide p.11, 47.' },
    { t: 'A type of patch panel', ok: false, why: 'It is the AI chip.' }, { t: 'A trunk with 144 fibers', ok: false, why: 'That is the 144F trunk.' }, { t: 'A management switch', ok: false, why: 'That is TROSS / RMU.' }] },
  { topic: 'f144', ref: 'l07#s4', q: 'Leg 12 (aqua) goes in TOR port:', opts: [
    { t: '23', ok: true, why: '2 × 12 − 1 = 23.' }, { t: '12', ok: false, why: 'Even, and not the formula.' }, { t: '24', ok: false, why: 'Even port.' }, { t: '25', ok: false, why: 'Leg 13.' }] },
  { topic: 'f144', ref: 'l07#s4', q: 'TOR port 29 holds which leg?', opts: [
    { t: 'Leg 15 (green, second round)', ok: true, why: '(29 + 1) ÷ 2 = 15.' }, { t: 'Leg 29', ok: false, why: 'There are only 18 legs.' }, { t: 'Leg 14', ok: false, why: 'Leg 14 → port 27.' }, { t: 'A spare', ok: false, why: 'Spares are not plugged in.' }] },
  { topic: 'f144', ref: 'l07#s2', q: 'How many fibers in the 144F trunk are actually in use?', opts: [
    { t: '128 (16 legs × 8)', ok: true, why: '2 spare legs = 16 spare fibers.' }, { t: '144', ok: false, why: 'Legs 17-18 are spares.' }, { t: '136', ok: false, why: '16 × 8 = 128.' }, { t: '16', ok: false, why: '16 legs, 128 fibers.' }] },
  { topic: 'f144', ref: 'l07#s1', q: '"Odd" in "144F to the odd ports" refers to:', opts: [
    { t: 'Odd-numbered TOR ports (1, 3 … 31), which are the top row', ok: true, why: 'Guide p.13.' }, { t: 'Odd-numbered rows of racks', ok: false, why: 'It is TOR port numbers.' },
    { t: 'Odd-numbered AIO panel rows', ok: false, why: 'At the AIO each TPU gets rows 1-9.' }, { t: 'Odd-numbered legs only', ok: false, why: 'All 16 active legs go in odd ports.' }] },
  { topic: 'f144', ref: 'l07#s7', q: 'You find leg 3 (green) in port 6. What is wrong?', opts: [
    { t: 'Port 6 is an even port (machines). Leg 3 belongs in port 5. Tell your lead.', ok: true, why: '2 × 3 − 1 = 5; even ports are pre-installed.' },
    { t: 'Nothing; green legs go in port 6', ok: false, why: 'Port = 2 × leg − 1.' }, { t: 'It should be in port 3', ok: false, why: 'Port 3 is leg 2.' }, { t: 'It should be in port 7', ok: false, why: 'Port 7 is leg 4.' }] },
  { topic: 'aio', ref: 'l08#s3', q: 'At the AIO front, TPU 7 leg 14 goes in:', opts: [
    { t: 'G14-7', ok: true, why: 'Legs 13-14 → column G; port 14; row 7.' }, { t: 'G14-14', ok: false, why: 'The row is the TPU number: 7.' },
    { t: 'N14-7', ok: false, why: 'Columns run A-L; legs 13-14 are column G.' }, { t: 'H14-7', ok: false, why: 'H holds legs 15-16.' }] },
  { topic: 'aio', ref: 'l08#s4', q: 'On the AIO rear, which column\'s 192F goes to DCN-PP 5?', opts: [
    { t: 'Column E', ok: true, why: 'A = 1, B = 2, C = 3, D = 4, E = 5.' }, { t: 'Column F', ok: false, why: 'F = DCN-PP 6.' }, { t: 'Column I', ok: false, why: 'I holds TPU spares.' }, { t: 'Row 5', ok: false, why: 'Columns pick the DCN-PP.' }] },
  { topic: 'aio', ref: 'l08#s4', q: 'Which 192F legs are spares to the DCN-PP?', opts: [
    { t: 'Legs 19-24 (rows 10-12)', ok: true, why: 'Guide p.37 note 5.' }, { t: 'Legs 17-18', ok: false, why: 'Those are the 144F spares.' }, { t: 'Legs 1-6', ok: false, why: 'Those carry TPU 1-3.' }, { t: 'None', ok: false, why: 'Legs 19-24.' }] },
  { topic: 'aio', ref: 'l08#s5', q: 'Why do the 192F\'s odd legs sit on the RIGHT port when you face the rear?', opts: [
    { t: 'The rear view is mirrored, so they land directly behind the front A1-type port where each TPU\'s odd leg is', ok: true, why: 'Front left = rear right.' },
    { t: 'To leave room for spares', ok: false, why: 'It is about the mirror image.' }, { t: 'Because 192F legs are reversed', ok: false, why: 'It is the view, not the cable.' }, { t: 'It is optional', ok: false, why: 'It is the documented position.' }] },
  { topic: 'dcn', ref: 'l09#s2', q: 'AIO rack R1013 lands its trunks in which panel and lane?', opts: [
    { t: 'RU 35 · AIO-PP8 · GH #2', ok: true, why: 'Row 10 → RU 35, AIO-PP8, GH lane 2 (p.45).' }, { t: 'RU 39 · AIO-PP8 · GH #2', ok: false, why: 'Rows 3-14 → RU 35.' },
    { t: 'RU 35 · AIO-PP10 · IJ #2', ok: false, why: 'That is row 12.' }, { t: 'RU 32', ok: false, why: 'RU 32 is the AIO\'s MPO panel.' }] },
  { topic: 'dcn', ref: 'l09#s4', q: 'What part number should a Large-site shuffle module have?', opts: [
    { t: '760262482 (2x2)', ok: true, why: 'If it reads 760262479 (4x4), stop.' }, { t: '760262479', ok: false, why: 'That is the 4x4: stop and ask.' }, { t: 'Any 2x2 part number', ok: false, why: 'Check for 760262482.' }, { t: 'It does not matter', ok: false, why: 'It matters.' }] },
  { topic: 'dcn', ref: 'l09#s5', q: 'DCN-PP H (R227 / R228) feeds which spines?', opts: [
    { t: '29-32', ok: true, why: 'Guide p.41.' }, { t: '25-28', ok: false, why: 'That is G.' }, { t: '1-4', ok: false, why: 'That is A.' }, { t: '8', ok: false, why: 'Each pair feeds 4 spines.' }] },
  { topic: 'ocs', ref: 'l10#s5', q: 'OCS cable 1 (red) plugs into which pp1 ports?', opts: [
    { t: '1-8, on side A', ok: true, why: 'Guide p.15.' }, { t: '9-16', ok: false, why: 'That is OCS 2.' }, { t: '17-24', ok: false, why: 'That is OCS 3.' }, { t: 'TOR odd ports', ok: false, why: 'The TOR takes the 144F.' }] },
  { topic: 'ocs', ref: 'l10#s4', q: 'On an OCS cable, the jacket color tells you:', opts: [
    { t: 'Which SPOCS rack the cable goes to (red 1, orange 2, yellow 3)', ok: true, why: 'Guide p.18, 20.' }, { t: 'Which slot each leg goes to', ok: false, why: 'Leg position decides the slot.' },
    { t: 'Its length', ok: false, why: 'Check the reel for length.' }, { t: 'Which TPU rack it came from', ok: false, why: 'The label tells you that.' }] },
  { topic: 'ocs', ref: 'l11#s3', q: 'At the SPOCS rack, legs 7-8 (red, black) go to:', opts: [
    { t: 'Slot 4 (bottom), the 2560 mm legs', ok: true, why: 'Guide p.21.' }, { t: 'Slot 1', ok: false, why: 'Slot 1 takes legs 1-2.' }, { t: 'Slot 7 and 8', ok: false, why: 'There are 4 slots.' }, { t: 'They are spares', ok: false, why: 'Only leg 9 is spare.' }] },
  { topic: 'ocs', ref: 'l11#s4', q: 'X = 201. Where does leg 3 (green) of the yellow cable go?', opts: [
    { t: 'SPOCS 3, slot 2, port 201', ok: true, why: 'Yellow → SPOCS 3; legs 3-4 → slot 2; odd leg → X.' }, { t: 'SPOCS 3, slot 3, port 201', ok: false, why: 'Slot 3 is legs 5-6.' },
    { t: 'SPOCS 3, slot 2, port 202', ok: false, why: 'Odd legs go on X.' }, { t: 'SPOCS 1, slot 2, port 201', ok: false, why: 'Yellow goes to SPOCS 3.' }] },
  { topic: 'ocs', ref: 'l11#s6', q: 'Which direction do you pull OCS bundles?', opts: [
    { t: 'From the OCS (SPOCS) rack to the TPU rack', ok: true, why: 'Guide p.22 note 1.' }, { t: 'From the TPU rack to the SPOCS rack', ok: false, why: 'Start at the OCS rack.' }, { t: 'From the EOR rack', ok: false, why: 'OCS bundles do not go to the EOR.' }, { t: 'Either way', ok: false, why: 'From the OCS rack.' }] },
  { topic: 'cu', ref: 'l12#s2', q: 'RMU1 GIG E 1 lands on which EOR copper panel?', opts: [
    { t: 'RU 22 (TROSS leaf)', ok: true, why: 'Guide p.14.' }, { t: 'RU 24 (MGMT leaf)', ok: false, why: 'RU 24 is TOR ETH.' }, { t: 'RU 30 (console)', ok: false, why: 'Console runs only.' }, { t: 'RU 39', ok: false, why: 'RU 39 is the LC panel.' }] },
  { topic: 'cu', ref: 'l12#s4', q: 'A home run lands on jack 31 of the RU 30 panel. Its patch cord goes to:', opts: [
    { t: 'Port 31 of the console switch', ok: true, why: 'Jack = port; RU 30 feeds the console switch.' }, { t: 'Port 31 of the MGMT leaf', ok: false, why: 'RU 30 → console switch.' },
    { t: 'Port 7', ok: false, why: 'Jack 31 → port 31.' }, { t: 'The TROSS leaf', ok: false, why: 'RU 30 → console switch.' }] },
  { topic: 'cu', ref: 'l12#s5', q: 'Which detail does the guide NOT give for copper?', opts: [
    { t: 'The termination standard (T568A or T568B) and copper test steps', ok: true, why: 'Not in the guide — ask your lead.' }, { t: 'Which panel each run lands on', ok: false, why: 'Given on p.14.' },
    { t: 'Where to put the flag label', ok: false, why: '4 in from the plug (p.14).' }, { t: 'That jack = port', ok: false, why: 'Given on p.14, 27.' }] },
  { topic: 'mgmt', ref: 'l13#s2', q: 'A standard AIO EOR rack\'s spine 2 management trunk lands on:', opts: [
    { t: 'C5:C6, rows 1-3 (12F)', ok: true, why: 'Guide p.28.' }, { t: 'A1:A2, rows 1-3', ok: false, why: 'That is spine 1.' }, { t: 'C5:D8', ok: false, why: 'That is the 24F (w/BMS) layout.' }, { t: 'RU 32', ok: false, why: 'RU 39 LC panel.' }] },
  { topic: 'mgmt', ref: 'l13#s5', q: 'SPOCS rack 712\'s mgmt1 uplinks go to:', opts: [
    { t: 'EOR w/BMS 611 (spot 11 of pod 10\'s w/BMS row)', ok: true, why: 'mgmt1 → spot 11; pod 10 uses 611/613.' }, { t: 'EOR 613', ok: false, why: '613 takes mgmt2.' }, { t: 'EOR 711', ok: false, why: '711 is not w/BMS.' }, { t: 'R131 directly', ok: false, why: 'Through the w/BMS rack.' }] },
  { topic: 'bms', ref: 'l14#s2', q: 'How many EOR w/BMS racks are in Data Hall 4?', opts: [
    { t: 'Six: 611, 613, 1411, 1413, 2211, 2213', ok: true, why: 'Guide p.25.' }, { t: 'Three, one per pod', ok: false, why: 'Two per pod.' }, { t: 'All 48', ok: false, why: 'Only six.' }, { t: 'None', ok: false, why: 'Six.' }] },
  { topic: 'bms', ref: 'l14#s3', q: 'Which duplex on the w/BMS 24F trunks carries the FB0 BMS uplink?', opts: [
    { t: 'Duplex 3, on both the spine 1 and spine 2 trunks', ok: true, why: 'Guide p.29.' }, { t: 'Duplex 1', ok: false, why: 'MGMT leaf.' }, { t: 'Duplex 12', ok: false, why: 'Spare.' }, { t: 'Only on the spine 1 trunk', ok: false, why: 'Same duplex on both.' }] },
  { topic: 'bms', ref: 'l14#s5', q: 'You are asked which RU the FB0 BMS switch is in. What is the right answer from the guide?', opts: [
    { t: 'The guide does not say — check the rack integration spec or ask your lead', ok: true, why: 'Not documented in the guide.' }, { t: 'RU 39', ok: false, why: 'RU 39 is the LC panel.' },
    { t: 'RU 22', ok: false, why: 'RU 22 is the TROSS copper panel.' }, { t: 'RU 32', ok: false, why: 'RU 32 is the MPO panel.' }] }
];
