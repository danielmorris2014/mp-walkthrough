# Static verification harness for index.html:
# 1. Parses the main <script> with esprima (real JS syntax check).
# 2. Cross-checks every onclick/oninput/onkeydown handler function against
#    defined functions.
# 3. Cross-checks getElementById('X') references against static HTML ids
#    (whitelisting dynamically-built ids).
# 4. Rejects leftover git conflict markers (v35 shipped with them live).
# 5. Asserts sw.js CACHE_VERSION pairs with index.html APP_VERSION
#    (v35.4 shipped with them out of sync -> stale-cache bugs).
import collections, os, re, sys, esprima

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(APP, 'index.html'), encoding='utf-8').read()
fail = []

# --- extract main script (the last <script> block) ---
scripts = re.findall(r'<script>(.*?)</script>', src, re.S)
js = scripts[-1] if scripts else ''
print('script blocks:', len(scripts), '| main script chars:', len(js))

# --- 1. syntax (index.html + all shared JS modules) ---
js_modules = ['kit-data.js', 'report-engine.js', 'stamp-engine.js', 'sync-engine.js',
              'cutsheet-engine.js', 'tools/cutsheet-parser.js']
try:
    esprima.parseScript(js)
    for mod in js_modules:
        mod_src = open(os.path.join(APP, mod), encoding='utf-8').read()
        esprima.parseScript(mod_src)
    print('SYNTAX: OK (index.html +', len(js_modules), 'modules)')
except Exception as e:
    fail.append('SYNTAX FAIL: ' + str(e))
    print('SYNTAX FAIL:', e)

# --- 2. handler functions exist ---
defined = set(re.findall(r'function\s+([A-Za-z_$][\w$]*)\s*\(', js))
assigned = set(re.findall(r'var\s+([A-Za-z_$][\w$]*)\s*=\s*function', js))
defined |= assigned
handlers = set()
for m in re.finditer(r'on(?:click|input|change|keydown|blur)="([A-Za-z_$][\w$]*)\s*\(', src):
    handlers.add(m.group(1))
for m in re.finditer(r"on(?:click|input|change|keydown)=\\?'([A-Za-z_$][\w$]*)\s*\(", js):
    handlers.add(m.group(1))
KEYWORDS = {'if', 'for', 'while', 'switch', 'return', 'event', 'void', 'document'}
missing = sorted(h for h in handlers if h not in defined and h not in KEYWORDS)
if missing:
    fail.append('MISSING HANDLERS: ' + ', '.join(missing))
print('handlers referenced:', len(handlers), '| missing:', missing or 'none')

# --- 3. id references & unique static HTML ids ---
html_ids = set(re.findall(r'id="([^"]+)"', src))
dynamic_ok = re.compile(r'^(grpName|grpFrom|grpTo)\d+$')
js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js))
missing_ids = sorted(i for i in js_ids if i not in html_ids and not dynamic_ok.match(i))
if missing_ids:
    fail.append('MISSING IDS: ' + ', '.join(missing_ids))
print('ids referenced:', len(js_ids), '| missing:', missing_ids or 'none')

html_pages = ['index.html', 'buf103.html', 'scan.html', 'labels.html', 'flashcards.html']
dup_ids = []
for hp in html_pages:
    hp_path = os.path.join(APP, hp)
    if not os.path.exists(hp_path):
        continue
    hp_src = open(hp_path, encoding='utf-8').read()
    hp_markup = re.sub(r'<script\b[^>]*>.*?</script>', '', hp_src, flags=re.S | re.I)
    counts = collections.Counter(re.findall(r'\bid="([^"]+)"', hp_markup))
    for k, cnt in sorted(counts.items()):
        if cnt > 1:
            dup_ids.append(f'{hp}#{k}(x{cnt})')
if dup_ids:
    fail.append('DUPLICATE HTML IDS: ' + ', '.join(dup_ids))
print('duplicate html ids:', dup_ids or 'none')

# --- 4. git conflict markers must never ship ---
check_files = ['index.html', 'sw.js', 'kit-data.js', 'report-engine.js', 'stamp-engine.js',
               'sync-engine.js', 'cutsheet-engine.js', 'tools/cutsheet-parser.js',
               'tools/guide_directory.js', 'buf103.html', 'scan.html', 'labels.html', 'flashcards.html']
marker_hits = []
for f in check_files:
    path = os.path.join(APP, f)
    if not os.path.exists(path):
        continue
    body = open(path, encoding='utf-8').read()
    for n, line in enumerate(body.splitlines(), 1):
        if line.startswith('<<<<<<< ') or line.startswith('>>>>>>> '):
            marker_hits.append(f'{f}:{n}')
if marker_hits:
    fail.append('CONFLICT MARKERS: ' + ', '.join(marker_hits))
print('conflict markers:', marker_hits or 'none')

# --- 5. APP_VERSION and CACHE_VERSION must pair ---
m_app = re.search(r"var APP_VERSION = '([^']+)';", src)
sw = open(os.path.join(APP, 'sw.js'), encoding='utf-8').read()
m_cache = re.search(r"var CACHE_VERSION = '([^']+)';", sw)
app_v = m_app.group(1) if m_app else None
cache_v = m_cache.group(1) if m_cache else None
expected_cache = ('mp-walk-' + app_v) if app_v else None
if not app_v or not cache_v or cache_v != expected_cache:
    fail.append(f'VERSION MISMATCH: APP_VERSION={app_v} CACHE_VERSION={cache_v} (expected {expected_cache})')
print(f'version pair: APP={app_v} CACHE={cache_v} ->', 'OK' if cache_v == expected_cache else 'MISMATCH')

print('RESULT:', 'FAIL' if fail else 'ALL CHECKS PASS')
sys.exit(1 if fail else 0)
