# Static verification harness for index.html:
# 1. Parses the main <script> with esprima (real JS syntax check).
# 2. Cross-checks every onclick/oninput/onkeydown handler function against
#    defined functions.
# 3. Cross-checks getElementById('X') references against static HTML ids
#    (whitelisting dynamically-built ids).
import re, sys, esprima

src = open(r'C:\Users\DanielMorris\Downloads\fluidstack\walkthrough-app\index.html', encoding='utf-8').read()
fail = []

# --- extract main script (the last <script> block) ---
scripts = re.findall(r'<script>(.*?)</script>', src, re.S)
js = scripts[-1] if scripts else ''
print('script blocks:', len(scripts), '| main script chars:', len(js))

# --- 1. syntax ---
try:
    esprima.parseScript(js)
    print('SYNTAX: OK')
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

# --- 3. id references ---
html_ids = set(re.findall(r'id="([^"]+)"', src))
dynamic_ok = re.compile(r'^(grpName|grpFrom|grpTo)\d+$')
js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js))
missing_ids = sorted(i for i in js_ids if i not in html_ids and not dynamic_ok.match(i))
if missing_ids:
    fail.append('MISSING IDS: ' + ', '.join(missing_ids))
print('ids referenced:', len(js_ids), '| missing:', missing_ids or 'none')

print('RESULT:', 'FAIL' if fail else 'ALL CHECKS PASS')
sys.exit(1 if fail else 0)
