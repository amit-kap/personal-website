"""Block-out v14: pavements. Empty plots go, some become roundabouts; some squares join into blocks.

Amit's review of v13 (18 Nov):
1. "remove the ones with no tower in them or change in to a circ like shape roundabout"
   -> an empty pavement square is removed (plain road), or ROUND_SHARE of them become a round
      island (a roundabout) in the middle of the crossing space.
2. "connect a few sqrs along a road to become a block"
   -> runs of 2-3 neighbouring squares with towers join into one long pavement block, covering the
      side street between them. Mostly along X (the direction of the camera's street), some along Y.
      Nothing ever closes the central street the camera glides down (the road at y = CY).

Towers are not moved. All pavements (near-city objects and v12's ring) are rebuilt as one mesh,
G_paves, with the same rounded-corner kerb (0.25 m) and material clay_walk. AS's plaza stays.

Run headless on a copy:
  cp docs/AS_hero/blockout/ref-v13-white.blend docs/AS_hero/blockout/ref-v14-white.blend
  Blender -b docs/AS_hero/blockout/ref-v14-white.blend -P scripts/as-hero/blender/paves_v14.py
or live in the open file (then File > Save As v14).
"""
import math
import random

import bpy
from mathutils import Vector

ROUND_SHARE = 0.35       # share of empty squares that become roundabouts; the rest are removed
ROUND_R = 15.0           # roundabout island radius (m); a square's half-width is 23.35
MERGE_X, MERGE_Y = 0.30, 0.12   # chance an occupied square starts a joined run along X / Y
CORNER_R, CORNER_SEG, CIRCLE_SEG = 5.0, 4, 24
KERB_H = 0.25
SEED = 14

BLOCK_NX, BLOCK_NY, LANE, WALK, ROAD = 2, 2, 7.0, 5.0, 22.0

objs = bpy.data.objects
scene = bpy.context.scene
rng = random.Random(SEED)

bb = [objs["AS_tower"].matrix_world @ Vector(c) for c in objs["AS_tower"].bound_box]
x0, x1 = min(v.x for v in bb), max(v.x for v in bb)
y0, y1 = min(v.y for v in bb), max(v.y for v in bb)
SIZE_X, SIZE_Y = x1 - x0, y1 - y0
CX, CY = (x0 + x1) / 2, (y0 + y1) / 2
BLOCK_X = BLOCK_NX * SIZE_X + (BLOCK_NX - 1) * LANE
BLOCK_Y = BLOCK_NY * SIZE_Y + (BLOCK_NY - 1) * LANE
PAVE_X, PAVE_Y = BLOCK_X + 2 * WALK, BLOCK_Y + 2 * WALK
PITCH_X, PITCH_Y = PAVE_X + ROAD, PAVE_Y + ROAD


def cell(x, y):
    return round((x - CX) / PITCH_X), math.floor((y - CY) / PITCH_Y)


def centre(i, j):
    return CX + i * PITCH_X, CY + (j + 0.5) * PITCH_Y


# 1. Every pavement square, from objects and from v12's ring mesh.
squares = set()
off = 0
old_objs = [o for o in objs if o.name.startswith("G_pave") and o.name != "G_pave_AS"]
for o in old_objs:
    i, j = cell(o.location.x, o.location.y)
    cx, cy = centre(i, j)
    if abs(cx - o.location.x) > 0.5 or abs(cy - o.location.y) > 0.5:
        off += 1
    squares.add((i, j))
ring = objs.get("H_horizon_paves")
if ring:
    v = ring.data.vertices
    for p in ring.data.polygons:
        x = sum(v[k].co.x for k in p.vertices) / len(p.vertices)
        y = sum(v[k].co.y for k in p.vertices) / len(p.vertices)
        squares.add(cell(x, y))
squares.discard(cell(CX, CY))           # AS's own plaza keeps its mesh

# 2. Which squares hold a tower.
occupied = set()
for o in objs:
    if o.name[:2] in ("T_", "F_", "S_") and o.type == "MESH":
        occupied.add(cell(o.location.x, o.location.y))
far = objs.get("H_horizon_towers")
if far:
    v = far.data.vertices
    for k in range(0, len(v), 8):
        x = sum(v[k + n].co.x for n in range(4)) / 4
        y = sum(v[k + n].co.y for n in range(4)) / 4
        if math.hypot(x - CX, y - CY) < 10500:
            occupied.add(cell(x, y))

# 3. Joined runs along a road.
assigned = {}
runs = []


def crosses_centre(cells):
    js = {c[1] for c in cells}
    return -1 in js and 0 in js


for sq in sorted(squares & occupied):
    if sq in assigned:
        continue
    r = rng.random()
    axis = "x" if r < MERGE_X else ("y" if r < MERGE_X + MERGE_Y else None)
    run = [sq]
    if axis:
        n = rng.choice((2, 2, 3))
        for k in range(1, n):
            nxt = (sq[0] + k, sq[1]) if axis == "x" else (sq[0], sq[1] + k)
            if nxt not in squares or nxt not in occupied or nxt in assigned:
                break
            if crosses_centre(run + [nxt]):
                break
            run.append(nxt)
    for c in run:
        assigned[c] = len(runs)
    runs.append(run)

# 4. Geometry.
verts, faces = [], []


def add_prism(outline):
    """outline: list of (x, y), counter-clockwise. Top face plus kerb sides."""
    b = len(verts)
    n = len(outline)
    verts.extend((x, y, 0.0) for x, y in outline)
    verts.extend((x, y, KERB_H) for x, y in outline)
    faces.append(tuple(b + n + k for k in range(n)))
    for k in range(n):
        k2 = (k + 1) % n
        faces.append((b + k, b + k2, b + n + k2, b + n + k))


def rounded_rect(cx, cy, hx, hy):
    pts = []
    for qx, qy, a0 in ((1, -1, -90), (1, 1, 0), (-1, 1, 90), (-1, -1, 180)):
        ox, oy = cx + qx * (hx - CORNER_R), cy + qy * (hy - CORNER_R)
        for s in range(CORNER_SEG + 1):
            a = math.radians(a0 + 90 * s / CORNER_SEG)
            pts.append((ox + CORNER_R * math.cos(a), oy + CORNER_R * math.sin(a)))
    return pts


def circle(cx, cy, r):
    return [(cx + r * math.cos(2 * math.pi * s / CIRCLE_SEG),
             cy + r * math.sin(2 * math.pi * s / CIRCLE_SEG)) for s in range(CIRCLE_SEG)]


joined = 0
for run in runs:
    xs = [centre(*c)[0] for c in run]
    ys = [centre(*c)[1] for c in run]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    hx = (max(xs) - min(xs) + PAVE_X) / 2
    hy = (max(ys) - min(ys) + PAVE_Y) / 2
    add_prism(rounded_rect(cx, cy, hx, hy))
    joined += len(run) > 1

empty = sorted(squares - occupied)
rounds = 0
for sq in empty:
    if rng.random() < ROUND_SHARE:
        add_prism(circle(*centre(*sq), ROUND_R))
        rounds += 1

# 5. Swap the old pavements for the new mesh.
for o in old_objs:
    objs.remove(o, do_unlink=True)
if ring:
    objs.remove(ring, do_unlink=True)
me = bpy.data.meshes.new("G_paves")
me.from_pydata(verts, [], faces)
me.materials.append(bpy.data.materials["clay_walk"])
me.update()
ob = bpy.data.objects.new("G_paves", me)
scene.collection.objects.link(ob)

if bpy.app.background:
    bpy.ops.wm.save_mainfile()
print("V14 squares", len(squares), "occupied", len(squares & occupied), "joined runs", joined,
      "empty", len(empty), "roundabouts", rounds, "off-grid", off)
