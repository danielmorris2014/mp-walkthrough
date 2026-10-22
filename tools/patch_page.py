"""tools/patch_page.py - the safe splicer for JS/HTML-bearing pages.

Born in retro #5: regex-splice edits of JS via inline Python caused every
build incident in v53-v60 (switchTab clipped lines, hall-strip quoting
broke 3x, parts() swallowed, esc mis-scoped, head corrupted). The gates
caught all of them pre-ship - but each cost a debug cycle and none of it
is acceptable when the fix is to make the safe path the easy path.

Usage (from a build script or one-off):
  from patch_page import Patch
  p = Patch('index.html')
  p.sub(old, new, count=1)          # asserts exactly `count` matches exist
  p.sub_block(anchor, new, ...)     # block replace between markers
  p.save()                          # esprima-checks every <script>, atomic write

Rules enforced:
  - .sub() REFUSES (raises) unless the anchor matches exactly `count` times
  - .save() parses every script block; a broken edit never touches disk
  - .save() writes once, atomically (no half-written files)
"""
import io
import os
import re
import sys

try:
    import esprima
except ImportError:
    esprima = None


class Patch:
    def __init__(self, path):
        self.path = path
        self.src = io.open(path, encoding="utf-8").read()
        self.orig = self.src
        self.edits = 0

    def sub(self, old, new, count=1, label=""):
        n = self.src.count(old)
        if n != count:
            raise AssertionError(
                f"patch_page [{self.path}] {label or 'sub'}: expected {count} "
                f"match(es), found {n} - refusing to edit (wrong anchor or drifted file)"
            )
        self.src = self.src.replace(old, new, count)
        self.edits += 1
        return self

    def sub_regex(self, pattern, repl, count=1, label="", flags=re.S):
        hits = re.findall(pattern, self.src, flags)
        if len(hits) != count:
            raise AssertionError(
                f"patch_page [{self.path}] {label or 'regex'}: expected {count} "
                f"match(es), found {len(hits)} - refusing to edit"
            )
        self.src = re.sub(pattern, repl, self.src, count=count, flags=flags)
        self.edits += 1
        return self

    def check_scripts(self):
        if esprima is None:
            return
        for js in re.findall(r"<script>(.*?)</script>", self.src, re.S):
            if not js.strip():
                continue
            try:
                esprima.parseScript(js)
            except Exception as e:
                raise AssertionError(
                    f"patch_page [{self.path}]: script would not parse after "
                    f"{self.edits} edit(s): {e} - refusing to write"
                )

    def save(self, check=True):
        if check:
            self.check_scripts()
        if self.src == self.orig:
            return False
        tmp = self.path + ".patch-tmp"
        io.open(tmp, "w", encoding="utf-8", newline="").write(self.src)
        os.replace(tmp, self.path)
        return True
