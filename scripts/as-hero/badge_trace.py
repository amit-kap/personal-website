"""Trace the AS chest badge from the approved close-up ref into a clean SVG.

Source: docs/AS_hero/current/style-ref/style-ref-amit-2.png (the badge is ~125 px wide there).
Method: crop, upscale 8x, classify each pixel (cream shield / orange A / navy S), take the shield silhouette
as everything the cream ring encloses, blur each mask a little, trace iso-0.5 contours (marching squares),
simplify them, and write three shapes: cream shield, orange A (with its counter as a hole), navy S.
No background is drawn, so the SVG is transparent.

Run with Blender's Python (it ships numpy):
/Applications/Blender.app/Contents/Resources/5.2/python/bin/python3.13 scripts/as-hero/badge_trace.py <out.svg>
"""

import collections
import subprocess
import sys

import numpy as np

SRC = "docs/AS_hero/current/style-ref/style-ref-amit-2.png"
X0, Y0, W, H, K = 1980, 525, 150, 170, 8          # crop box in the ref, upscale factor
OUT = sys.argv[1] if len(sys.argv) > 1 else "as-badge.svg"


def load():
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", SRC, "-vf", f"crop={W}:{H}:{X0}:{Y0},scale={W*K}:{H*K}:flags=lanczos",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H * K, W * K, 3).astype(float)


def sample(img, nx, ny, r=10):
    x, y = int((nx - X0) * K), int((ny - Y0) * K)
    return np.median(img[y - r:y + r, x - r:x + r].reshape(-1, 3), axis=0)


def blur(a, s):
    r = int(s * 3)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
    k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(v, k, mode="same"), 1, a)


def flood_outside(free):
    """True for `free` pixels connected to the image border."""
    h, w = free.shape
    seen = np.zeros_like(free)
    dq = collections.deque()
    for x in range(w):
        for y in (0, h - 1):
            if free[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if free[y, x] and not seen[y, x]:
                seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and free[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    return seen


def biggest(mask, keep=1, min_area=3000):
    """Keep the `keep` largest connected components of a mask."""
    h, w = mask.shape
    lab = np.zeros(mask.shape, int)
    sizes = {}
    n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1
                lab[y, x] = n
                dq = collections.deque([(y, x)])
                c = 0
                while dq:
                    cy, cx = dq.popleft(); c += 1
                    for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; dq.append((ny, nx))
                sizes[n] = c
    best = [k for k, v in sorted(sizes.items(), key=lambda kv: -kv[1]) if v >= min_area][:keep]
    return np.isin(lab, best)


def contours(field, iso=0.5):
    """Marching squares -> list of closed polylines [(x, y), ...] in pixel coordinates."""
    h, w = field.shape
    segs = collections.defaultdict(list)

    def pt(kind, y, x):
        if kind == "h":      # between (y,x) and (y,x+1)
            a, b = field[y, x], field[y, x + 1]
            t = (iso - a) / (b - a)
            return (x + t, float(y))
        a, b = field[y, x], field[y + 1, x]    # between (y,x) and (y+1,x)
        t = (iso - a) / (b - a)
        return (float(x), y + t)

    for y in range(h - 1):
        row0, row1 = field[y], field[y + 1]
        for x in range(w - 1):
            tl, tr, br, bl = row0[x] >= iso, row0[x + 1] >= iso, row1[x + 1] >= iso, row1[x] >= iso
            c = tl * 8 + tr * 4 + br * 2 + bl
            if c in (0, 15):
                continue
            top, right, bottom, left = ("h", y, x), ("v", y, x + 1), ("h", y + 1, x), ("v", y, x)
            table = {1: [(left, bottom)], 2: [(bottom, right)], 3: [(left, right)], 4: [(top, right)],
                     6: [(top, bottom)], 7: [(left, top)], 8: [(left, top)], 9: [(top, bottom)],
                     11: [(top, right)], 12: [(left, right)], 13: [(bottom, right)], 14: [(left, bottom)]}
            if c == 5:
                table[5] = [(left, top), (bottom, right)] if (row0[x] + row0[x + 1] + row1[x] + row1[x + 1]) / 4 >= iso \
                    else [(left, bottom), (top, right)]
            if c == 10:
                table[10] = [(left, bottom), (top, right)] if (row0[x] + row0[x + 1] + row1[x] + row1[x + 1]) / 4 >= iso \
                    else [(left, top), (bottom, right)]
            for a, b in table[c]:
                segs[a].append(b); segs[b].append(a)
    loops, used = [], set()
    for start in list(segs):
        if start in used:
            continue
        loop, prev, cur = [], None, start
        while True:
            used.add(cur)
            loop.append(pt(*cur))
            nxt = [n for n in segs[cur] if n != prev]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            if cur == start:
                break
        if len(loop) > 20:
            loops.append(loop)
    return loops


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0]), np.array(pts[-1])
    ab = b - a
    n = np.hypot(*ab)
    d = [abs(ab[0] * (p[1] - a[1]) - ab[1] * (p[0] - a[0])) / n if n else float(np.hypot(p[0] - a[0], p[1] - a[1]))
         for p in pts[1:-1]]
    i = int(np.argmax(d)) + 1
    if d[i - 1] > eps:
        return rdp(pts[:i + 1], eps)[:-1] + rdp(pts[i:], eps)
    return [pts[0], pts[-1]]


def simplify_closed(loop, eps):
    # split at the two farthest points so RDP has stable anchors
    p = np.array(loop)
    i = 0
    j = int(np.argmax(np.hypot(*(p - p[i]).T)))
    a = rdp([tuple(q) for q in p[i:j + 1]], eps)
    b = rdp([tuple(q) for q in p[j:].tolist() + [tuple(p[0])]], eps)
    return a[:-1] + b[:-1]


def shield_corners(loop):
    """Return the six corners of the shield: T, LS, RS, LB, RB, BP (top, left/right shoulder, left/right
    bottom-of-side, bottom point), found as the sharpest turns of the traced outline."""
    pts = np.array(loop)
    # resample evenly by arc length
    seg = np.hypot(*np.diff(np.vstack([pts, pts[:1]]), axis=0).T)
    cum = np.concatenate([[0], np.cumsum(seg)])
    N = 400
    t = np.linspace(0, cum[-1], N, endpoint=False)
    R = np.stack([np.interp(t, cum, np.append(pts[:, 0], pts[0, 0])), np.interp(t, cum, np.append(pts[:, 1], pts[0, 1]))], 1)
    w = 10
    ang = np.zeros(N)
    for i in range(N):
        p0, p1, p2 = R[(i - w) % N], R[i], R[(i + w) % N]
        a1 = np.arctan2(*(p1 - p0)[::-1]); a2 = np.arctan2(*(p2 - p1)[::-1])
        ang[i] = abs(np.degrees((a2 - a1 + np.pi) % (2 * np.pi) - np.pi))
    peaks = [i for i in range(N) if ang[i] == max(ang[(i + k) % N] for k in range(-w, w + 1)) and ang[i] > 12]
    peaks = sorted(peaks, key=lambda i: -ang[i])[:6]
    c = R[peaks]
    assert len(c) == 6, "expected 6 shield corners, found %d" % len(c)
    T = c[np.argmin(c[:, 1])]; BP = c[np.argmax(c[:, 1])]
    rest = [p for p in c if not (np.allclose(p, T) or np.allclose(p, BP))]
    rest.sort(key=lambda p: p[1])
    top2, bot2 = sorted(rest[:2], key=lambda p: p[0]), sorted(rest[2:], key=lambda p: p[0])
    out = {"T": T, "LS": top2[0], "RS": top2[1], "LB": bot2[0], "RB": bot2[1], "BP": BP}
    print({k: tuple(round(float(v), 1) for v in p) for k, p in out.items()})
    return out


def fit_homography(c):
    """Homography taking the six measured corners to a symmetric shield (vertical sides, level shoulders)."""
    wd = ((c["RS"][0] - c["LS"][0]) + (c["RB"][0] - c["LB"][0])) / 2
    a = (c["LS"][1] + c["RS"][1]) / 2
    b = (c["LB"][1] + c["RB"][1]) / 2
    dst = {"T": (wd / 2, c["T"][1]), "LS": (0, a), "RS": (wd, a), "LB": (0, b), "RB": (wd, b), "BP": (wd / 2, c["BP"][1])}
    rows = []
    for k, (x, y) in ((k, c[k]) for k in dst):
        u, v = dst[k]
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y, -u])
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y, -v])
    _, _, vt = np.linalg.svd(np.array(rows))
    Hm = vt[-1].reshape(3, 3)
    return Hm / Hm[2, 2]


def warp(Hm, p):
    v = Hm @ np.array([p[0], p[1], 1.0])
    return (float(v[0] / v[2]), float(v[1] / v[2]))


def sharpen(loop, eps=0.9, min_len=3.0, snap_deg=3.0):
    """Turn a traced outline into a sharp polygon of straight edges.

    Simplify to find the corners, fit a straight line to the traced points of every edge, snap near-vertical and
    near-horizontal edges to exactly vertical/horizontal, drop edges shorter than min_len (rounded-corner
    leftovers) and put each new corner where its two neighbouring lines cross."""
    pts = np.array(loop)
    n = len(pts)
    verts = simplify_closed([tuple(p) for p in loop], eps)
    idx = sorted({int(np.argmin(np.hypot(*(pts - np.array(v)).T))) for v in verts})
    lines = []
    for k, i in enumerate(idx):
        j = idx[(k + 1) % len(idx)]
        seg = pts[i:j + 1] if j > i else np.vstack([pts[i:], pts[:j + 1]])
        length = float(np.hypot(*(seg[-1] - seg[0])))
        if length < min_len or len(seg) < 3:
            continue
        cut = max(1, int(len(seg) * 0.15))
        core = seg[cut:len(seg) - cut] if len(seg) > 2 * cut + 2 else seg
        c = core.mean(axis=0)
        _, _, vt = np.linalg.svd(core - c)
        dvec = vt[0]
        ang = np.degrees(np.arctan2(dvec[1], dvec[0])) % 180
        if abs(ang - 90) < snap_deg:
            dvec = np.array([0.0, 1.0]); c = np.array([core[:, 0].mean(), c[1]])
        elif min(ang, 180 - ang) < snap_deg:
            dvec = np.array([1.0, 0.0]); c = np.array([c[0], core[:, 1].mean()])
        lines.append((c, dvec))
    out = []
    for k in range(len(lines)):
        (p1, d1), (p2, d2) = lines[k], lines[(k + 1) % len(lines)]
        m = np.array([[d1[0], -d2[0]], [d1[1], -d2[1]]])
        if abs(np.linalg.det(m)) < 1e-6:
            out.append(tuple(p2)); continue
        t = np.linalg.solve(m, p2 - p1)
        out.append(tuple(p1 + t[0] * d1))
    return out


def symmetrize(loop, cx, n=140):
    """Average the left half of the outline with the mirrored right half so the shield is exactly symmetric."""
    pts = np.array(loop)
    iT, iB = int(np.argmin(pts[:, 1])), int(np.argmax(pts[:, 1]))
    m = len(pts)
    def chain(i, j):                      # indices i..j going forward around the loop
        idx = [i]
        while idx[-1] != j:
            idx.append((idx[-1] + 1) % m)
        return pts[idx]
    ch1, ch2 = chain(iT, iB), chain(iB, iT)[::-1]      # both run top -> bottom
    left, right = (ch1, ch2) if ch1[:, 0].mean() < ch2[:, 0].mean() else (ch2, ch1)
    def resample(ch):
        seg = np.hypot(*np.diff(ch, axis=0).T)
        cum = np.concatenate([[0], np.cumsum(seg)])
        t = np.linspace(0, cum[-1], n)
        return np.stack([np.interp(t, cum, ch[:, 0]), np.interp(t, cum, ch[:, 1])], 1)
    L, Rr = resample(left), resample(right)
    Rm = np.stack([2 * cx - Rr[:, 0], Rr[:, 1]], 1)
    avg = (L + Rm) / 2
    mirrored = np.stack([2 * cx - avg[:, 0], avg[:, 1]], 1)[::-1]
    full = np.vstack([avg, mirrored[1:-1]])
    return [tuple(p) for p in full]


def main():
    img = load()
    pal = {"cream": sample(img, 1995, 595), "orange": sample(img, 2008, 608), "navy": sample(img, 2080, 600)}
    print({k: "#%02x%02x%02x" % tuple(int(c) for c in v) for k, v in pal.items()})
    d = np.stack([np.linalg.norm(img - pal[k], axis=2) for k in ("cream", "orange", "navy")])
    cls = d.argmin(axis=0)
    cream = cls == 0
    outside = flood_outside(~cream)
    inside = ~outside
    sil = biggest(inside | cream, 1, 20000)
    a_mask = (cls == 1) & inside
    s_mask = (cls == 2) & inside
    # drop anti-alias fringes: open the masks a little, keep the big pieces
    def opened(m, n=4):
        m = m.copy()
        for _ in range(n):
            m = m & np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1)
        for _ in range(n):
            m = m | np.roll(m, 1, 0) | np.roll(m, -1, 0) | np.roll(m, 1, 1) | np.roll(m, -1, 1)
        return m
    a_mask = biggest(opened(a_mask), 1, 8000)
    s_mask = biggest(opened(s_mask), 1, 8000)

    ys, xs = np.where(sil)
    bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max(), ys.max()
    print("badge size in ref px:", (bx1 - bx0) / K, (by1 - by0) / K)

    def trace(mask, sigma, eps):
        f = blur(mask.astype(float), sigma)
        paths = []
        for lp in contours(f):
            sp = simplify_closed(lp, eps)
            paths.append([((x - bx0) / K, (y - by0) / K) for x, y in sp])
        return paths

    def d_attr(paths):
        return " ".join("M" + " L".join("%.2f %.2f" % p for p in path) + " Z" for path in paths)

    sil_p = trace(sil, 3, 0.5)
    a_p = trace(a_mask, 2.5, 0.45)
    s_p = trace(s_mask, 2.5, 0.45)

    # --- make it flat and frontal -------------------------------------------------------------
    # The badge sits on a turned chest, so the shield is skewed. Find its six corners, map them to a
    # symmetric shield with a homography, then average the left half with the mirrored right half.
    corners = shield_corners(sil_p[0])
    H = fit_homography(corners)
    sil_p = [[warp(H, p) for p in path] for path in sil_p]
    a_p = [[warp(H, p) for p in path] for path in a_p]
    s_p = [[warp(H, p) for p in path] for path in s_p]
    allp = np.array([p for path in sil_p for p in path])
    x0, y0, x1, y1 = allp[:, 0].min(), allp[:, 1].min(), allp[:, 0].max(), allp[:, 1].max()
    cx = (x0 + x1) / 2
    sil_p = [symmetrize(sil_p[0], cx)]
    # normalise: width 100 units, origin at the top-left of the shield
    u = 100.0 / (x1 - x0)
    norm = lambda paths: [[((x - x0) * u, (y - y0) * u) for x, y in path] for path in paths]
    sil_p, a_p, s_p = norm(sil_p), norm(a_p), norm(s_p)
    a_p = [sharpen(path) for path in a_p]       # letters: sharp, straight edges
    s_p = [sharpen(path) for path in s_p]
    h = (y1 - y0) * u
    print("frontal badge: width 100, height %.1f (ratio %.3f); divider/A/S check below" % (h, h / 100))
    for name, paths in (("A", a_p), ("S", s_p)):
        xs_ = [p[0] for path in paths for p in path]
        print(name, "x range %.1f..%.1f" % (min(xs_), max(xs_)))

    def d1(paths):
        return " ".join("M" + " ".join("%.1f %.1f" % p for p in path) + "Z" for path in paths)

    hexc = {k: "#%02x%02x%02x" % tuple(int(round(c)) for c in v) for k, v in pal.items()}
    hexc["cream"] = "#ffffff"                    # shield colour: white (Amit, 19 Nov)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 {h:.1f}" width="100" height="{h:.0f}" role="img" aria-label="AS badge">
<path fill="{hexc['cream']}" d="{d1(sil_p)}"/>
<path fill="{hexc['orange']}" fill-rule="evenodd" d="{d1(a_p)}"/>
<path fill="{hexc['navy']}" fill-rule="evenodd" d="{d1(s_p)}"/>
</svg>
"""
    open(OUT, "w").write(svg)
    print("wrote", OUT, "shapes:", len(sil_p), len(a_p), len(s_p), "bytes:", len(svg))


main()
