# One-command local gate: static verify + report diff test (Playwright),
# optionally all screenshots. Self-contained: starts its own dev server.
#   python tools/gate.py           -> verify + report diff
#   python tools/gate.py --shots   -> also regenerate every screenshot
import subprocess, sys, os, socket, threading, time

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = sys.executable

def port_busy(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def start_server(port):
    os.chdir(APP)
    import http.server
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), http.server.SimpleHTTPRequestHandler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def run(label, args, env=None):
    print(f"\n=== {label} ===")
    r = subprocess.run(args, cwd=APP, env=env)
    return r.returncode == 0

fails = []

if not run("static verify", [PY, os.path.join("tools", "verify.py")]):
    fails.append("verify")

started = None
try:
    import playwright  # noqa: F401
    have_pw = True
except ImportError:
    have_pw = False

if have_pw:
    if not port_busy(8123):
        started = start_server(8123)
        time.sleep(0.5)
    if not run("report diff test", [PY, os.path.join("tools", "test_report.py")]):
        fails.append("report-diff")
    if not run("probe suite (nav/fonts/copy/route)", [PY, os.path.join("tools", "probes.py")]):
        fails.append("probes")
    if "--shots" in sys.argv:
        if not run("screenshots", [PY, os.path.join("tools", "shoot.py")]):
            fails.append("shots")
else:
    print("\n(playwright not installed - skipped report diff + screenshots; pip install playwright)")

if started:
    started.shutdown()

print("\n" + ("GATE: ALL PASS" if not fails else "GATE FAILED: " + ", ".join(fails)))
sys.exit(1 if fails else 0)
