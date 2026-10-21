/* Lesson 0 — Before you start: the DRS.
   Sources: DRS 01.00.00 introduction ("DRS stands for Deployment Requirement Sheet ...", provided 10/18/2026),
   DRS 01.00.01 General Fiber Cable Dressing sheet (as the example of a DRS sheet), guide p.1.
   Standards definitions: public primary sources (TIA, NFPA/NEC references, BICSI, NEMA) — see Sources. */
window.COURSE = window.COURSE || {};
COURSE.lessons = COURSE.lessons || [];
COURSE.lessons.push({
  id: 'l00', num: 0, title: 'Before you start: the DRS', short: 'The DRS', video: 'v00', mins: 14,
  pages: 'DRS 01.00.00 (intro), DRS 01.00.01 (example sheet), guide p.1',
  objectives: [
    'Say what a [[DRS]] is, and why it is a requirement, not a guideline.',
    'Name what a DRS contains and the industry standards it references.',
    'Find the current DRS for a task, and know who to ask when you cannot.',
    'Read a DRS sheet: number, title, revision date, approval and rules.',
    'Apply the on-site rule: the DRS on hand, or stop work.'
  ],
  sections: [
    { id: 's1', stage: 'Recognize', title: 'What a DRS is',
      html: `<p><b>DRS</b> stands for <b>Deployment Requirement Sheet</b>. A DRS is one of [[fluidstack|Fluidstack]]'s technical standards for <b>how installation work must be done</b> in every data center Fluidstack deploys. DRS rules apply to every contractor and every site on Fluidstack deployments.</p>
<div class="callout key"><b>DRS documents are not guidelines. They are requirements.</b> Every task you do on site has a matching DRS that says exactly how it must be done.</div>
<table class="t"><thead><tr><th>Question</th><th>A guideline</th><th>A requirement (DRS)</th></tr></thead><tbody>
<tr><th scope="row">What it is</th><td>Advice: a good way to do something</td><td>The way it must be done, every time</td></tr>
<tr><th scope="row">Can you choose another way?</th><td>Sometimes</td><td>No. If the job seems to need something else, stop and ask.</td></tr>
<tr><th scope="row">Example</th><td>"Try to keep cables tidy."</td><td>"Use 1/2-inch hook-and-loop straps. Nylon zip ties are not allowed." (DRS 01.00.01)</td></tr></tbody></table>
<p class="muted small">Source: DRS 01.00.00 introduction.</p>`,
      analogy: 'A DRS is like the recipe a restaurant chain gives every kitchen, so the dish comes out the same in every city. <b>Where the analogy stops:</b> a cook may add salt to taste. You may not change a DRS step. If something on site does not fit the DRS, stop and ask.' },
    { id: 's2', stage: 'Understand', title: 'What is in a DRS, and why it exists',
      figs: [{ dg: 'standardsMap', o: {}, cap: 'The industry standards named in the DRS documents you have so far, and what each one covers.' }],
      html: `<div class="two">
<div class="card"><h3 class="h4">What a DRS contains</h3><p>Step-by-step installation requirements, technical specifications, <b>approved materials</b>, diagrams, and compliance references to industry standards: ANSI/TIA, BICSI, NEC and NEMA.</p></div>
<div class="card"><h3 class="h4">Why it exists</h3><p>So every Fluidstack deployment meets the <b>same quality standard</b>, no matter which contractor or site does the work. Consistency protects the equipment and lowers the risk of an <b>outage</b> (a network or system going down).</p></div>
<div class="card"><h3 class="h4">Who approves it</h3><p>Every DRS is reviewed and approved by Fluidstack <b>[[ICT]] leadership</b>. Example: DRS 01.00.00 was approved by Tom Marsh, Infrastructure Deployment Manager, on 6/9/2026.</p></div>
<div class="card"><h3 class="h4">How it changes</h3><p>DRS documents have <b>[[revision|revisions]]</b>. When a standard changes, a new revision is issued and you are notified through the portal. <b>Always use the current version: check the revision date on the cover page.</b></p></div></div>
<h3>The industry standards a DRS points to</h3>
<p>You do not need to memorize these. The DRS turns them into the rules you follow. Know the names so you recognize them on a sheet:</p>
<ul>
<li><b>[[ANSITIA|ANSI/TIA]]</b>: telecom cabling standards written by the TIA (Telecommunications Industry Association) and approved as American National Standards by ANSI (American National Standards Institute). DRS 01.00.01 names three: <b>TIA-568</b> (building telecom cabling), <b>TIA-606</b> (labels, identifiers and records) and <b>TIA-942</b> (data center infrastructure). Lesson 5 uses them.</li>
<li><b>[[BICSI]]</b> (Building Industry Consulting Service International): a professional association for ICT that writes design and installation standards and runs training and certification.</li>
<li><b>[[NEC]]</b> (National Electrical Code, NFPA 70): the U.S. electrical safety code. It includes the <b>fire ratings</b> printed on cable jackets, such as plenum and riser.</li>
<li><b>[[NEMA]]</b> (National Electrical Manufacturers Association): standards for electrical products, such as enclosures and cable tray.</li></ul>
<div class="callout info"><b>Background, not from the DRS:</b> what each standard covers comes from the standards bodies themselves (see Sources). The DRS is what you follow on site.</div>` },
    { id: 's3', stage: 'Connect', title: 'How the DRS fits with the guide, the cutsheet and this course',
      figs: [{ dg: 'drsStack', o: {}, cap: 'The DRS says HOW. The cutsheet says WHERE. The installation guide was built from both. This course and the Field Kit app only explain them.' }],
      html: `<ul>
<li><b>The DRS</b> says <b>how</b> each task must be done.</li>
<li><b>The [[cutsheet]]</b> says <b>where</b> each cable goes. It is the final word on any port (Lesson 1).</li>
<li><b>The Large Site Cable Installation Guide</b> was built from the DRS (it lists 01.00, 01.01, 02.00, 05.00, 10.01, 10.04, 10.08 and 10.10) and from the BUF102 patch panel matrix v0.97 (guide p.1).</li>
<li>The <a href="#/drs">DRS sheets</a> page lists every DRS sheet this course covers so far, in plain words, with links to where each is taught.</li>
<li><b>This course and the Field Kit app</b> are training aids. They help you learn and check. They are <b>never a substitute</b> for the DRS on site.</li></ul>
<div class="callout key">You work from two documents: the <b>DRS</b> for how, and the <b>cutsheet</b> for where. If this course or the guide ever differs from the current DRS, the DRS is the requirement: follow it and tell your lead about the difference.</div>
<div class="callout conflict"><b>Ask your lead:</b> the guide lists DRS numbers with two parts (01.00, 01.01 …). The DRS sheets themselves use three parts (01.00.00, 01.00.01, 01.00.02, 01.00.03 … and 01.00.07, which 01.00.01 points to). Some add a fourth part: 01.00.03.01 builds on 01.00.03. Which sheets make up "01.00" and the others is not stated. Ask which DRS numbers (and current revisions) cover each of your tasks.</div>` },
    { id: 's4', stage: 'Work with it', title: 'Getting the right DRS',
      figs: [{ dg: 'drsAccess', o: {}, cap: 'Primary source: the Fluidstack Confluence portal. Backup: your Fluidstack PM or site supervisor. No DRS on hand means stop.' }],
      html: `<ol class="steps">
<li><b>Primary: Fluidstack [[confluence|Confluence]].</b> The Confluence portal is the authoritative source for all current DRS documents. Log in at <code>fluidstack.atlassian.net</code> and open the <b>LVC Deployment</b> space → <b>DEPLOYMENT REQUIREMENTS SHEETS</b>.</li>
<li><b>Backup: your Fluidstack PM or site supervisor.</b> If you cannot reach the portal, contact your assigned Fluidstack project manager ([[PM]]) or site supervisor. They can give you the document directly or restore your access.</li>
<li><b>Check the version.</b> Look at the revision date on the cover page and make sure it is the current revision.</li>
<li><b>Have it on hand</b> at the work location: printed, or on a device you can read there.</li></ol>
<div class="callout warn"><b>Plan ahead.</b> Data halls often have weak signal and sometimes no internet, and the portal needs both and a login. Get or print the DRS for the day's tasks before you go onto the floor.</div>
<p class="muted small">This course works offline, but the Confluence portal does not.</p>`,
      act: { type: 'order', id: 'a0-order', title: 'Before you start a task', intro: 'Put these steps in order, from planning the task to starting it.',
        items: ['Know which task you are about to do', 'Find its DRS in Fluidstack Confluence (or get it from your PM or site supervisor)', 'Check the revision date on the cover page is the current revision', 'Have the DRS on hand at the work location: printed or on a device', 'Do the work the way the DRS says, with the cutsheet for the ports'],
        why: 'Know the task, get its DRS, make sure it is current, have it with you, then work: DRS for how, cutsheet for where.' } },
    { id: 's5', stage: 'Work with it', title: 'Reading a DRS sheet',
      act: { type: 'explore', id: 'a0-explore', title: 'Explore a DRS sheet', dg: 'drsSheet', o: {},
        intro: 'This is a redrawn layout of DRS 01.00.01 (General Fiber Cable Dressing). Select each part to learn what it tells you.',
        spots: [
          { k: 'tb-num', t: 'DRS number — 01.00.01', d: 'Every sheet has a number. Use it to find, ask about and cite the sheet. A sheet can point to another one by number.' },
          { k: 'tb-title', t: 'Title — what task it covers', d: 'This one: General Fiber Cable Dressing. The portal page for the same DRS calls it "General Cable Dressing".' },
          { k: 'tb-rev', t: 'Revision date — check it every time', d: 'REVISED 6/9/2026 on this sheet. Always use the current version: if the portal shows a newer revision, get the new one.' },
          { k: 'tb-appr', t: 'Approved by', d: 'Each DRS is approved by Fluidstack ICT leadership. This sheet shows the approver\'s name.' },
          { k: 'tb-int', t: 'Internal Use Only', d: 'The sheet says it is confidential Fluidstack property and may not be copied, distributed or disclosed without explicit written permission. Use it for the work; do not post or share it.' },
          { k: 'sec-1', t: 'Numbered rules', d: 'The rules themselves, numbered so you can point to one: "rule 2 of DRS 01.00.01". They also name the industry standards they follow.' },
          { k: 'no-zip', t: 'Pictures of what is NOT allowed', d: 'A crossed-out picture means "never": here, nylon zip ties and metal staples.' },
          { k: 'xref', t: 'Cross-reference — SEE DRS 01.00.07', d: 'The sheet points to another DRS for more detail (fiber bend radius). Get that DRS too when you do that part of the work. We have not been given 01.00.07 yet.' }
        ] } },
    { id: 's6', stage: 'Apply', title: 'The on-site rule',
      html: `<div class="callout stop"><b>On-site requirement.</b> You must have the applicable DRS on hand when you do the work it describes: a <b>printed copy</b>, or a <b>digital copy on a device</b> you can read at the work location. <b>Working from memory alone is not acceptable.</b> If you do not have the DRS, <b>stop work and get it before you go on.</b> This is a Fluidstack site requirement on all deployments.</div>
<h3>Common mistakes</h3>
<table class="t"><thead><tr><th>Mistake</th><th>Why it is wrong</th><th>What to do</th></tr></thead><tbody>
<tr><td>"I've done this a hundred times," so no DRS on hand</td><td>Working from memory alone is not acceptable</td><td>Have the DRS on hand anyway, printed or on a device</td></tr>
<tr><td>Working from an old printout</td><td>A newer revision may have changed a rule</td><td>Check the revision date against the current revision</td></tr>
<tr><td>Using this course, a photo from another site, or a coworker's word instead</td><td>Only the current DRS is the requirement</td><td>Get the DRS from Confluence, your PM or your site supervisor</td></tr>
<tr><td>Posting or sharing a DRS sheet outside the job</td><td>DRS documents are Fluidstack Internal Use Only</td><td>Use it for the work only</td></tr></tbody></table>`,
      act: { type: 'scenario', id: 'a0-scen', title: 'What do you do?',
        qs: [
          { q: 'You are about to dress a bundle. You know the steps by heart, but the DRS is on your phone and the battery just died. There is no printed copy.', opts: [
            { t: 'Stop and get the DRS before you go on: a printed copy, or from your PM or site supervisor', ok: true, why: 'If you do not have the DRS, stop work and get it first. Memory alone is not acceptable (DRS 01.00.00).' },
            { t: 'Keep going from memory, since you know it', ok: false, why: 'Working from memory alone is not acceptable.' },
            { t: 'Ask a coworker to read the steps out from their phone, and keep working', ok: false, why: 'The DRS has to be on hand where you work, printed or on a device you can read. Get your own copy first.' },
            { t: 'Use this course\'s Lesson 5 instead', ok: false, why: 'The course is a training aid, not the DRS.' }] },
          { q: 'Your printed DRS says REVISED 6/9/2026. The portal notified you that a new revision was issued.', opts: [
            { t: 'Get the new revision and use it', ok: true, why: 'Always use the current version: check the revision date.' },
            { t: 'Use the printout until the end of the job', ok: false, why: 'A newer revision replaces it.' },
            { t: 'Use whichever one is easier to follow', ok: false, why: 'Only the current revision counts.' },
            { t: 'Ignore it; revisions only matter for designers', ok: false, why: 'You are told through the portal because it matters for your work.' }] },
          { q: 'You cannot log in to the Fluidstack Confluence portal.', opts: [
            { t: 'Contact your assigned Fluidstack PM or site supervisor', ok: true, why: 'They can give you the document directly or restore your access.' },
            { t: 'Search the internet for the DRS', ok: false, why: 'The portal is the authoritative source. DRS documents are internal.' },
            { t: 'Start the work and get it later', ok: false, why: 'No DRS on hand means stop work.' },
            { t: 'Use another contractor\'s method', ok: false, why: 'The DRS exists so every contractor does it the same way.' }] },
          { q: 'This course (or your notes) says one thing, and the current DRS says something different.', opts: [
            { t: 'Follow the current DRS and tell your lead about the difference', ok: true, why: 'The DRS is the requirement. The course is only a training aid.' },
            { t: 'Follow the course, because it is newer', ok: false, why: 'The course never replaces the DRS.' },
            { t: 'Do whichever is faster', ok: false, why: 'The DRS says exactly how it must be done.' },
            { t: 'Split the difference', ok: false, why: 'Requirements are not negotiated on the floor.' }] }
        ] } },
    { id: 's7', stage: 'Apply', title: 'Practice: where do you find the answer?',
      act: { type: 'match', id: 'a0-match', title: 'Which source answers it?', intro: 'Choose where each answer comes from on the job.',
        pairs: [
          ['Which port does this leg plug into?', 'The cutsheet row for that cable'],
          ['Which ties may I use to bundle cables?', 'The DRS for that task (here, DRS 01.00.01)'],
          ['Is my printed DRS still the current version?', 'The revision date on its cover page, checked against the portal'],
          ['I cannot log in to Confluence', 'My Fluidstack PM or site supervisor'],
          ['The label and the cutsheet do not match', 'Stop and ask my lead']
        ],
        why: 'DRS for how, cutsheet for where. The portal is the source of current DRS revisions, your PM or site supervisor is the backup, and any mismatch means stop and ask.' } }
  ],
  check: [
    { q: 'What is a DRS?', opts: [
      { t: 'A Deployment Requirement Sheet: Fluidstack\'s required standard for how a task must be done', ok: true, why: 'DRS documents are requirements, not guidelines (DRS 01.00.00).' },
      { t: 'A suggested way to do a task', ok: false, why: 'They are requirements, not guidelines.' },
      { t: 'The cutsheet for one rack', ok: false, why: 'The cutsheet says where cables go. The DRS says how the work is done.' },
      { t: 'A training video', ok: false, why: 'The DRS is the requirement; training only explains it.' }], ref: 's1' },
    { q: 'You are about to start a task and you do not have its DRS with you. What do you do?', opts: [
      { t: 'Stop work and get it before you go on', ok: true, why: 'Fluidstack site requirement on all deployments.' },
      { t: 'Work from memory if you have done it before', ok: false, why: 'Memory alone is not acceptable.' },
      { t: 'Start, and read the DRS at the end of the day', ok: false, why: 'It must be on hand while you do the work.' },
      { t: 'Use the course instead', ok: false, why: 'The course is not the DRS.' }], ref: 's6' },
    { q: 'Where is the authoritative source for current DRS documents?', opts: [
      { t: 'Fluidstack Confluence: LVC Deployment space → DEPLOYMENT REQUIREMENTS SHEETS', ok: true, why: 'Log in at fluidstack.atlassian.net.' },
      { t: 'The cutsheet', ok: false, why: 'The cutsheet gives ports, not work methods.' },
      { t: 'A photo from the last site', ok: false, why: 'It may be another revision or another site.' },
      { t: 'This course', ok: false, why: 'The course is a training aid.' }], ref: 's4' },
    { q: 'How do you know your DRS copy is the current version?', opts: [
      { t: 'Check the revision date on the cover page against the current revision', ok: true, why: 'Always use the current version; new revisions are announced through the portal.' },
      { t: 'If it is printed, it is current', ok: false, why: 'A printout can be an old revision.' },
      { t: 'Ask whoever printed it', ok: false, why: 'Check the revision date.' },
      { t: 'All revisions say the same thing', ok: false, why: 'A new revision is issued because something changed.' }], ref: 's5' },
    { q: 'Which document tells you which port a cable lands on?', opts: [
      { t: 'The cutsheet', ok: true, why: 'The cutsheet is the final word on any port. The DRS tells you how to do the work.' },
      { t: 'The DRS', ok: false, why: 'The DRS gives the method; the cutsheet gives the port.' },
      { t: 'The cable label alone', ok: false, why: 'If the label and the cutsheet disagree, stop and ask.' },
      { t: 'The industry standards', ok: false, why: 'Standards set methods and ratings, not your site\'s ports.' }], ref: 's3' }
  ]
});
