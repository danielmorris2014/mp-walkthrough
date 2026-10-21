# Pre-commit helper: verify the STAGED versions of index.html and sw.js pair.
# verify.py reads the working tree, so it cannot catch a forgotten
# `git add sw.js` (v42-v46 all shipped the v41 sw.js while local gates
# passed; only CI caught it). This reads exactly what the commit will
# contain: staged content if staged, else HEAD.
import subprocess, re, sys

def content(rev, path):
    r = subprocess.run(['git', 'show', rev + path], capture_output=True, text=True,
                       encoding='utf-8', errors='replace')
    return r.stdout if r.returncode == 0 else ''

idx = content(':', 'index.html') or content('HEAD:', 'index.html')
sw = content(':', 'sw.js') or content('HEAD:', 'sw.js')

m1 = re.search(r"var APP_VERSION = '([^']+)';", idx)
m2 = re.search(r"var CACHE_VERSION = '([^']+)';", sw)
app = m1.group(1) if m1 else None
cache = m2.group(1) if m2 else None
expected = ('mp-walk-' + app) if app else None

if app and cache and cache != expected:
    print(f"pre-commit: STAGED version mismatch - APP_VERSION={app} but sw.js CACHE_VERSION={cache}")
    print(f"  The commit would ship a stale service worker. Fix: bump CACHE_VERSION to {expected} and git add sw.js")
    sys.exit(1)
print(f"staged version pair OK: APP={app} CACHE={cache}")
