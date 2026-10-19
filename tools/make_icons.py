# Generates the PWA icons (no dependencies, pure Python).
# Design: dark navy square with three rounded "cable tray tier" bars
# (green = ran & hung, amber = in progress, sky = staged).
import zlib, struct, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')

BG    = (13, 20, 34)     # #0d1422
BARS  = [(16, 185, 129), (245, 158, 11), (56, 189, 248)]  # green, amber, sky

def clamp(x):
    return 0 if x < 0 else (255 if x > 255 else int(x))

def rounded_rect_sdf(px, py, x0, y0, x1, y1, r):
    # distance from (px,py) to rounded rectangle (negative inside)
    cx = max(x0 + r, min(px, x1 - r))
    cy = max(y0 + r, min(py, y1 - r))
    dx, dy = px - cx, py - cy
    return (dx * dx + dy * dy) ** 0.5 - r

def render(size):
    S = 4  # supersample
    W = size * S
    px = bytearray(W * W * 3)
    # bar geometry (in fraction of canvas)
    mx = 0.18            # side margin
    bar_h = 0.135        # bar height
    gap = 0.075
    top0 = 0.5 - (3 * bar_h + 2 * gap) / 2
    rows = []
    for i in range(3):
        y0 = top0 + i * (bar_h + gap)
        rows.append((mx * W, y0 * W, (1 - mx) * W, (y0 + bar_h) * W, 0.32 * bar_h * W))
    r2 = 9  # corner radius of whole icon (mostly cosmetic; iOS masks its own)
    for y in range(W):
        for x in range(W):
            r, g, b = BG
            # icon corner rounding (transparent-ish -> just keep bg, iOS masks)
            for (bx0, by0, bx1, by1, br) in rows:
                d = rounded_rect_sdf(x + 0.5, y + 0.5, bx0, by0, bx1, by1, br)
                if d <= -S:  # fully inside bar
                    r, g, b = BARS[rows.index((bx0, by0, bx1, by1, br))]
                    break
                if -S < d < S:  # edge -> antialias
                    a = max(0.0, min(1.0, 0.5 - d / S))
                    br_, bg_, bb_ = BARS[rows.index((bx0, by0, bx1, by1, br))]
                    r = clamp(r * (1 - a) + br_ * a)
                    g = clamp(g * (1 - a) + bg_ * a)
                    b = clamp(b * (1 - a) + bb_ * a)
            i3 = (y * W + x) * 3
            px[i3], px[i3 + 1], px[i3 + 2] = r, g, b
    # downsample
    out = bytearray(size * size * 3)
    for y in range(size):
        for x in range(size):
            rs = gs = bs = 0
            for sy in range(S):
                for sx in range(S):
                    i3 = ((y * S + sy) * W + (x * S + sx)) * 3
                    rs += px[i3]; gs += px[i3 + 1]; bs += px[i3 + 2]
            n = S * S
            o3 = (y * size + x) * 3
            out[o3] = rs // n; out[o3 + 1] = gs // n; out[o3 + 2] = bs // n
    return out

def write_png(path, size, rgb):
    raw = b''.join(b'\x00' + bytes(rgb[y * size * 3:(y + 1) * size * 3]) for y in range(size))
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

os.makedirs(OUT, exist_ok=True)
for name, size in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)]:
    write_png(os.path.join(OUT, name), size, render(size))
    print('wrote', name, size, 'x', size)
