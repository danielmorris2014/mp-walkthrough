# Build reference.html from the training zip's Reference_Guide.html:
#  - MP Kit back pill
#  - responsive tables: every wide table becomes labeled stacked cards on
#    phones (no horizontal scrolling anywhere - the v51 design fix)
import zipfile, io, os, re

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
z = zipfile.ZipFile(r"C:\Users\DanielMorris\Downloads\DataHall4_Cable_Training_Course_Only.zip")
html = z.read("DataHall4_Cable_Training/reference/Reference_Guide.html").decode("utf-8", "replace")

PILL = """<style id="mp-ref-back">
.mp-ref-back { position: fixed; top: calc(10px + env(safe-area-inset-top)); left: 10px; z-index: 9999;
  min-height: 44px; padding: 0 14px; border-radius: 999px; background: rgba(17,17,19,0.85);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  border: 1px solid #363a3f; color: #b0b4ba; font: 800 13px -apple-system, sans-serif;
  display: inline-flex; align-items: center; text-decoration: none; }
.mp-ref-back:active { transform: scale(.96); }
</style>
<a class="mp-ref-back" href="./index.html#/home">&#8249; MP Kit</a>"""

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
html = html[:m.end()] + PILL + html[m.end():]
html = html.replace("</head>", TABLES.split("<script")[0] + "</head>", 1)  # style -> head
m2 = re.search(r"</body>", html)
html = html[:m2.start()] + TABLES[TABLES.find("<script"):] + html[m2.start():]
html = html.replace("</head>", "<style>body{padding-top:8px}@media(max-width:600px){body{padding-top:52px}}</style></head>", 1)

out = os.path.join(APP, "reference.html")
io.open(out, "w", encoding="utf-8", newline="").write(html)
print("reference.html rebuilt:", len(html), "chars (pill + responsive tables)")
