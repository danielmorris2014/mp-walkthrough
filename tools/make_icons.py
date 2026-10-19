# Generates the PWA icons (no dependencies, pure Python).
# v14 design: graphite "job site" mark - two bold check marks
# (white + green) on a near-black rounded square, matching the
# Graphite Pro theme. "Ran and hung" reads as a double-check.
import zlib, struct, os

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
BG = (14, 15, 17)        # #0e0f11 graphite
WHITE = (237, 238, 240)  # slate-12
GREEN = (48, 164, 108)   # green-9 #30a46c

def clamp(x):
    return 0 if x < 0 else (255 if x > 255 else int(x))

# check mark strokes as polylines (in 512-space), [points, color, width]
STROKES = [
    ([(96, 268), (212, 384), (436, 150)], WHITE, 46),
    ([(296, 316), (382, 402), (540, 236)], GREEN, 46),
]

def seg_dist(px, py, ax, ay, bx, by):
    abx, aby = bx - ax, by - ay
    t = 0.0 if (abx == 0 and aby == 0) else max(0.0, min(1.0, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)))
    cx, cy = ax + t * abx, ay + t * aby
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5

def stroke_dist(px, py, pts):
    d = None
    for i in range(len(pts) - 1):
        s = seg_dist(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
        if d is None or s < d:
            d = s
    return d

def render(size):
    S = 4  # supersample
    W = size * S
    scale = W / 640.0  # strokes defined in 640-space for margin room
    px = bytearray(W * W * 3)
    for y in range(W):
        for x in range(W):
            r, g, b = BG
            # rounded-square silhouette: fill whole square; iOS masks corners itself.
            for (pts, color, width) in STROKES:
                scaled = [(p[0] * scale, p[1] * scale) for p in pts]
                w2 = width * scale / 2.0
                d = stroke_dist(x + 0.5, y + 0.5, scaled) - w2
                if d <= -S:
                    r, g, b = color
                    break
                if -S < d < S:
                    a = max(0.0, min(1.0, 0.5 - d / S))
                    r = clamp(r * (1 - a) + color[0] * a)
                    g = clamp(g * (1 - a) + color[1] * a)
                    b = clamp(b * (1 - a) + color[2] * a)
            i3 = (y * W + x) * 3
            px[i3], px[i3 + 1], px[i3 + 2] = r, g, b
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
