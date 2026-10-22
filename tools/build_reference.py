# Build reference.html from the training zip's Reference_Guide.html:
#  - MP Kit back pill
#  - responsive tables: every wide table becomes labeled stacked cards on
#    phones (no horizontal scrolling anywhere - the v51 design fix)
import zipfile, io, os, re

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
z = zipfile.ZipFile(r"C:\Users\DanielMorris\Downloads\DataHall4_Cable_Training_Course_Only.zip")
html = z.read("DataHall4_Cable_Training/reference/Reference_Guide.html").decode("utf-8", "replace")

PILL = """<link rel="stylesheet" href="./chrome.css">
<a class="mp-back-pill" href="./index.html#/home">&#8249; MP Kit</a>"""

TABLES = """<style id="mp-responsive-tables">
/* v51: wide tables become stacked, labeled cards on phones - a row you can
   read top-to-bottom instead of a grid you must chase sideways. */
@media (max-width: 720px) {
  html, body { overflow-x: clip; }
  table { display: block; width: 100%; border-collapse: collapse; }
  table thead { display: none; }
  table tr { display: block; background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.10); border-radius: 12px;
    padding: 8px 10px; margin: 8px 0; }
  table td { display: block; border: 0 !important; padding: 3px 0 !important;
    text-align: left !important; min-width: 0 !important; width: auto !important; }
  table td[data-label]:not([data-label=""])::before {
    content: attr(data-label) ": ";
    font: 700 10px -apple-system, sans-serif; letter-spacing: .4px;
    text-transform: uppercase; opacity: .55; margin-right: 4px; }
}
</style>
<script id="mp-table-labels">
// copy each column's header text into its cells so the CSS above can label them
(function () {
  document.querySelectorAll('table').forEach(function (t) {
    var head = t.querySelectorAll('thead th, tr:first-child th');
    var labels = Array.from(head).map(function (h) { return (h.textContent || '').trim().slice(0, 18); });
    if (!labels.length) return;
    t.querySelectorAll('tr').forEach(function (tr) {
      if (tr.querySelector('th')) return; // header row
      var tds = tr.querySelectorAll('td');
      tds.forEach(function (td, i) { td.setAttribute('data-label', labels[i] || ''); });
    });
  });
})();
</script>"""

m = re.search(r"<body[^>]*>", html)
assert m, "no body tag"
m_tag = m.group(0)
if 'class=' in m_tag:
    html = html[:m.start()] + m_tag.replace('class="', 'class="mp-pill-page ') + PILL + html[m.end():]
else:
    html = html[:m.start()] + m_tag[:-1] + ' class="mp-pill-page">' + PILL + html[m.end():]
html = html.replace("</head>", TABLES.split("<script")[0] + "</head>", 1)  # style -> head
m2 = re.search(r"</body>", html)
html = html[:m2.start()] + TABLES[TABLES.find("<script"):] + html[m2.start():]



# v56: the vendor's dark DRS cards/sections ship without light-text overrides
# (dark text on dark cards on real phones) and captions/td run 1.8-2.1:1.
# One normalizer layer, injected AFTER their styles, forces a consistent
# light theme - measured fix for the 10 failing pairs the audit found.
GRAPHITE_CSS = '<style id="mp-graphite">\n/* MP Kit Graphite identity - component-level overrides (v65).\n   The v57 token-remap failed because their CSS vars are dual-role (text\n   AND background). This layer targets their actual components with\n   explicit values instead. Diagrams (svg.dg) stay on light plates. */\n:root { color-scheme: dark; }\nhtml, body { background: #0b0c0e !important; color: #edeef0 !important; }\nbody { font-family: -apple-system, \'SF Pro Text\', system-ui, sans-serif !important; }\n\n/* surfaces */\n.card, .box, .lsec, figure.fig, .checklists, .matchrow { background: #111113 !important;\n  border: 1px solid #363a3f !important; border-radius: 14px !important;\n  box-shadow: 0 1px 2px rgba(0,0,0,.4), 0 4px 14px rgba(0,0,0,.3) !important; }\n.hero { background: linear-gradient(180deg, #141519, #0b0c0e) !important; }\n\n/* text */\nbody, p, li, td, th, dt, dd, figcaption, .muted { color: #b0b4ba !important; }\nh1, h2, h3, h4, b, strong, .brand b, .term { color: #edeef0 !important; }\na { color: #55d0d6 !important; }\ncode, pre, .mono { background: #1b1d20 !important; color: #d3d6db !important;\n  border: 1px solid #2a2d33 !important; border-radius: 6px !important; }\n::placeholder { color: #777b84 !important; }\n\n/* buttons + interactive */\n.btn, button { background: rgba(255,255,255,.06) !important; color: #edeef0 !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\n.btn.pri, .btn.fib, button.pri { background: #fff !important; color: #111 !important;\n  border-color: #fff !important; font-weight: 700 !important; }\n.btn:active, button:active { transform: scale(0.96) !important; }\n\n/* progress + status */\n.prog, .pbar { background: rgba(255,255,255,.08) !important; }\n.prog .pbar, .pbar > div { background: #30a46c !important; }\n.done-badge { background: #12271a !important; color: #46a758 !important;\n  border: 1px solid rgba(48,164,108,.4) !important; }\n\n/* inputs */\ninput, select, textarea { background: #18191b !important; color: #edeef0 !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\n\n/* diagrams: light plates (they are drawn for light backgrounds) */\nfigure.fig .svgbox { background: #f5f2eb !important; border-radius: 12px !important;\n  padding: 10px !important; overflow-x: visible !important; }\nfigure.fig svg.dg { min-width: 0 !important; width: 100% !important; height: auto !important; }\nimg { max-width: 100% !important; height: auto !important; }\n\n/* tables: stacked labeled cards on phones (the proven pattern) */\n@media (max-width: 720px) {\n  html, body { overflow-x: clip !important; }\n  table { display: block !important; width: 100% !important; }\n  table thead { display: none !important; }\n  table tr { display: block !important; background: rgba(255,255,255,.03) !important;\n    border: 1px solid rgba(255,255,255,.08) !important; border-radius: 10px !important;\n    padding: 8px 10px !important; margin: 8px 0 !important; }\n  table td { display: block !important; border: 0 !important; padding: 3px 0 !important;\n    text-align: left !important; color: #b0b4ba !important; }\n  table td[data-label]:not([data-label=""])::before {\n    content: attr(data-label) ": "; font-weight: 700; opacity: .55; font-size: .85em; }\n}\n/* phone reading sizes */\n@media (max-width: 720px) {\n  main p, main li, .lesson p, .lesson li { font-size: 15.5px !important; line-height: 1.62 !important; }\n  main .muted, .lesson .muted { font-size: 13px !important; }\n}\n\n/* accent callout boxes + specific light-bg components (v65 finding:\n   objectives/connector-lists/etc. carry inline soft-accent bgs) */\n.objectives, .notice, .callout, .tip, .warning, .info-box,\n.pgrid li, ol.stripe li, .matchrow { background: #18191b !important;\n  border: 1px solid #363a3f !important; border-radius: 10px !important; }\nh2, h3 { background: transparent !important; }\na { background: transparent !important; }\ntd, th, li { background: transparent !important; }\ntable { background: transparent !important; }\ntable.t { background: #111113 !important; border: 1px solid #363a3f !important; border-radius: 10px !important; }\n/* kill ALL remaining soft-accent inline backgrounds in content areas */\nmain [style*="background"], .lesson [style*="background"],\nmain [style*="--teal-soft"], main [style*="--amber-soft"],\nmain [style*="--hl-soft"], main [style*="--ok-soft"],\nmain [style*="--bad-soft"], main [style*="--info-soft"], main [style*="--warn-soft"] {\n  background: #18191b !important; border-radius: 10px !important; border: 1px solid #363a3f;\n}\n/* the connector-color chart: li items with white bg - dark them */\nol li, ul li { background: transparent !important; }\n\n/* NUCLEAR: kill every background in content areas, then restore known-good.\n   This catches inline styles, JS-set bgs, and any vendor class we missed. */\nmain *, .lesson *, #content *, article *, section *,\n.pgrid *, ol *, ul *, .fig-tools * { background-color: transparent !important; }\n/* restore surfaces + status elements */\nmain .card, .lesson .card, main .box, .lesson .box,\nmain table.t, .lesson table.t, main .objectives, .lesson .objectives {\n  background-color: #111113 !important; }\nmain pre, main code, .lesson pre, .lesson code { background-color: #1b1d20 !important; }\nfigure.fig .svgbox { background-color: #f5f2eb !important; }\n.prog .pbar, .prog .pbar > div { background-color: #30a46c !important; }\n.done-badge { background-color: #12271a !important; }\n/* kicker + sub text: bump to readable on dark */\n.kicker, .sub, .muted, figcaption { color: #777b84 !important; opacity: 1 !important; }\nem { color: #9aa0a8 !important; }\n.formula { background-color: #1b1d20 !important; color: #d3d6db !important;\n  border: 1px solid #2a2d33 !important; border-radius: 8px !important; }\n\n/* final stragglers: specific text colors + the last light-bg elements */\nspan.stage-tag { color: #6aa9e8 !important; }\n.kicker, .sub { color: #8a919c !important; }\np.muted, .muted { color: #8a919c !important; }\nem { color: #a0a7b0 !important; }\na { background: transparent !important; }\nh2, h3 { background: transparent !important; }\ntitle { color: inherit !important; }\n/* kill the #EEE9DF bg anywhere it still exists */\n[style*="238, 233, 223"], [style*="#EEE9DF"], [style*="#eee9df"] {\n  background: #18191b !important; }\n/* broader: any heading or link inside the topbar/brand area */\n.topbar *, .brand *, .side *, .menu-btn { background: transparent !important; }\n.topbar { background: rgba(11,12,14,.96) !important; }\n</style>'
TABLE_JS = '<script id="mp-table-labels">\n(function () {\n  function labelTables() {\n    document.querySelectorAll(\'table\').forEach(function (tb) {\n      if (tb.getAttribute(\'mp-labeled\')) return;\n      var head = tb.querySelectorAll(\'thead th, tr:first-child th\');\n      var labels = Array.from(head).map(function (h) { return (h.textContent || \'\').trim().slice(0, 18); });\n      if (!labels.length) return;\n      tb.setAttribute(\'mp-labeled\', \'1\');\n      tb.querySelectorAll(\'tr\').forEach(function (tr) {\n        if (tr.querySelector(\'th\')) return;\n        Array.from(tr.querySelectorAll(\'td\')).forEach(function (td, i) { td.setAttribute(\'data-label\', labels[i] || \'\'); });\n      });\n    });\n  }\n  new MutationObserver(function () { setTimeout(labelTables, 50); })\n    .observe(document.documentElement, { childList: true, subtree: true });\n  document.addEventListener(\'DOMContentLoaded\', labelTables);\n})();\n</script>'
html = html.replace("</head>", GRAPHITE_CSS + "</head>", 1)

out = os.path.join(APP, "reference.html")
io.open(out, "w", encoding="utf-8", newline="").write(html)
print("reference.html rebuilt:", len(html), "chars (pill + responsive tables)")
