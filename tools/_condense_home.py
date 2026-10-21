# One-off: condense Home - primary cards + 2-col tool tile grid
import io, re

p = 'index.html'
s = io.open(p, encoding='utf-8').read()

# CSS for the tile grid (goes with the home-card styles)
css_anchor = "  .home-card.soon .home-tile { background: transparent; border-style: dashed; }"
assert s.count(css_anchor) == 1
s = s.replace(css_anchor, css_anchor + """
  /* v51: secondary tools live in a compact tile grid - 9 tall cards became
     2 primary cards + 7 tiles; grouped with space, not more rows of cards */
  .tool-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
  .tool-tile {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    min-height: 60px; padding: 10px 12px; cursor: pointer; color: var(--text);
    display: flex; align-items: center; gap: 10px; text-align: left;
    transition: transform var(--dur-press) var(--ease-2);
  }
  .tool-tile:active { transform: scale(0.97); }
  .tool-tile svg { width: 20px; height: 20px; flex: none; color: var(--muted); }
  .tool-tile .tile-name { font: 800 12.5px var(--font-family, -apple-system, sans-serif); color: var(--slate-12); line-height: 1.2; }""", 1)

# find the home-cards block and rebuild: keep walkthrough + guide cards, grid the rest
start = s.find('<div class="home-cards">')
assert start > 0
end = s.find('</div>', s.find('Clean fiber'))  # the last card before the grid ends... locate block close instead
# safer: capture from start to the closing of the home-cards div by brace matching on divs
depth, i = 0, start
while True:
    m = re.search(r'</?div>', s[i:i+40000])
    opens = s.count('<div', i, i + m.end()) if m else 0
    break
# simple approach: the home-cards div closes right before the next top-level element; find by scanning
i = start
depth = 0
while i < len(s):
    if s.startswith('<div', i): depth += 1; i += 4; continue
    if s.startswith('</div>', i):
        depth -= 1
        if depth == 0:
            block_end = i + 6
            break
        i += 6; continue
    i += 1
block = s[start:block_end]

# pull every card: onclick + svg + name
cards = re.findall(
    r'<button class="home-card[^"]*" onclick="([^"]+)">\s*'
    r'<span class="home-tile">(.*?)</span>\s*'
    r'<span style="min-width:0;">\s*<span class="home-name">(.*?)</span>',
    block, re.S)
assert len(cards) == 9, 'expected 9 cards, got %d' % len(cards)

def tile(act, svg, name):
    return ('      <button class="tool-tile" onclick="%s">\n        %s\n'
            '        <span class="tile-name">%s</span>\n      </button>\n') % (act, svg.strip(), name)

primary = []
tiles = []
PRIMARY = {'Walkthrough &amp; Report', 'Cable Field Guide'}
for act, svg, name in cards:
    if name in PRIMARY:
        # keep whole original card markup for the two primaries
        m = re.search(r'(      <button class="home-card[^>]*onclick="' + re.escape(act) + r'">.*?</button>\n)', block, re.S)
        primary.append(m.group(1))
    else:
        tiles.append(tile(act, svg, name))

grid = '    <div class="tool-grid">\n' + ''.join(tiles) + '    </div>\n'
new_block = '<div class="home-cards">\n' + ''.join(primary) + grid + '    </div>'
s = s[:start] + new_block + s[block_end:]
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('home rebuilt: 2 primary cards + %d tiles' % len(tiles))
