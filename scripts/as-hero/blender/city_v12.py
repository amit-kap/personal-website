"""Block-out v12: Browsercity reaches the horizon in every direction the camera looks.

Amit's review of v11 in Blender (18 Nov), frame 104: "don't we need the city to stretch out to the
horizon in the side view?" In v11 the side city stopped at 2 km, so during the arc (frames 89-144,
view yaw 180 -> 45 deg) the camera saw empty ground behind the towers.

Nothing that exists is moved or re-shaped. Two new rings are added as two joined meshes:
- Ring A, 2-10 km: the same street grid and plot size as the near city, lower with distance.
- Ring B, 10-28 km (the road plane ends at 30 km): coarse cells of a few fat low boxes. At that
  distance the grid is sub-pixel; the boxes only build the skyline down to the horizon.
- Uneven skyline: 2.5 km patches vary 0-2.3x in height (some are open land) and 12 far districts
  rise taller, so the horizon doesn't read as one band (Amit's v10 note).
- Pavements only to 4 km, so the far street keeps v9's fade to light grey in the opening.
Rings cover view yaw ANG_FROM..ANG_TO around AS (the arc plus a margin), not the unseen back.

Run:
  cp docs/AS_hero/blockout/ref-v11-white.blend docs/AS_hero/blockout/ref-v12-white.blend
  Blender -b docs/AS_hero/blockout/ref-v12-white.blend -P scripts/as-hero/blender/city_v12.py
"""
import math
import random

import bpy
from mathutils import Vector

R_A0, R_A1, R_B1 = 2000.0, 10000.0, 28000.0
ANG_FROM, ANG_TO = -20.0, 250.0          # degrees, atan2 around AS; camera sees ~25..215
KEEP_A = 0.45                            # share of plots built in ring A
KERB_H = 0.25
SEED = 61

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
CELL_B = 4 * PITCH_X


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def in_arc(x, y):
    a = math.degrees(math.atan2(y - CY, x - CX))
    if a < ANG_FROM:
        a += 360.0
    return ANG_FROM <= a <= ANG_TO


PAVE_TO = 4000.0          # far pavements stop here; beyond, the road's distance fade shows
FACTORS_A = (0.5, 0.65, 0.8, 1.0, 1.0, 1.3, 1.6)
FACTORS_B = (0.0, 0.0, 0.3, 0.5, 0.8, 1.0, 1.3, 1.7, 2.3)   # 0 = open land: breaks the band


def district_factor(x, y, patch, factors):
    k = (int(math.floor(x / patch)), int(math.floor(y / patch)))
    return random.Random(k[0] * 7919 + k[1] * 104729 + SEED).choice(factors)


# Far districts: (x, y, radius, peak height). Placed in the seen arc at random.
districts = []
for _ in range(12):
    a = math.radians(rng.uniform(ANG_FROM + 15, ANG_TO - 15))
    r = rng.uniform(3500, 22000)
    districts.append((CX + r * math.cos(a), CY + r * math.sin(a),
                      rng.uniform(0.04, 0.07) * r, rng.uniform(110, 230)))


def height(x, y, base_near, base_far, r0, r1, patch, factors):
    r = math.hypot(x - CX, y - CY)
    base = base_near + (base_far - base_near) * smooth(r0, r1, r)
    v = rng.random()
    v = rng.uniform(1.2, 1.5) if v < 0.04 else (rng.uniform(0.35, 0.7) if v < 0.5
                                                else rng.uniform(0.7, 1.0))
    h = base * v * district_factor(x, y, patch, factors)
    for dx, dy, dr, peak in districts:
        g = math.exp(-((x - dx) ** 2 + (y - dy) ** 2) / (dr * dr))
        if g > 0.02:
            h = max(h, peak * g * rng.uniform(0.45, 1.0))
    return h


verts, faces = [], []          # towers (clay_white)
pverts, pfaces = [], []        # pavements (clay_walk)


def add_box(cx, cy, sx, sy, h):
    i = len(verts)
    for z in (0.0, h):
        for ox, oy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            verts.append((cx + ox * sx / 2, cy + oy * sy / 2, z))
    faces.extend([(i + 4, i + 5, i + 6, i + 7), (i, i + 1, i + 5, i + 4),
                  (i + 1, i + 2, i + 6, i + 5), (i + 2, i + 3, i + 7, i + 6),
                  (i + 3, i, i + 4, i + 7)])


def add_pave(cx, cy):
    i = len(pverts)
    for ox, oy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        pverts.append((cx + ox * PAVE_X / 2, cy + oy * PAVE_Y / 2, KERB_H))
    pfaces.append((i, i + 1, i + 2, i + 3))


taken = {(round(o.location.x, 1), round(o.location.y, 1)) for o in objs
         if o.name.startswith("G_pave")}

# Ring A: same grid as the near city.
n = int(R_A1 // PITCH_X) + 2
a_blocks = a_towers = 0
for i in range(-n, n + 1):
    for j in range(-n, n + 1):
        bx, by = CX + i * PITCH_X, CY + (j + 0.5) * PITCH_Y
        r = math.hypot(bx - CX, by - CY)
        if r <= R_A0 or r > R_A1 or not in_arc(bx, by):
            continue
        if (round(bx, 1), round(by, 1)) in taken:
            continue
        if r < PAVE_TO:
            add_pave(bx, by)
        a_blocks += 1
        for a in range(BLOCK_NX):
            for b in range(BLOCK_NY):
                if rng.random() > KEEP_A:
                    continue
                tx = bx - BLOCK_X / 2 + SIZE_X / 2 + a * (SIZE_X + LANE)
                ty = by - BLOCK_Y / 2 + SIZE_Y / 2 + b * (SIZE_Y + LANE)
                h = height(tx, ty, 42.0, 26.0, R_A0, R_A1, 8 * PITCH_X, FACTORS_A)
                add_box(tx, ty, SIZE_X, SIZE_Y, max(10.0, h))
                a_towers += 1

# Ring B: coarse cells, 1-3 fat boxes each.
m = int(R_B1 // CELL_B) + 2
b_towers = 0
for i in range(-m, m + 1):
    for j in range(-m, m + 1):
        cx, cy = CX + (i + 0.5) * CELL_B, CY + (j + 0.5) * CELL_B
        r = math.hypot(cx - CX, cy - CY)
        if r <= R_A1 or r > R_B1 or not in_arc(cx, cy):
            continue
        for _ in range(rng.choice((1, 2, 2, 3))):
            sx, sy = rng.uniform(30, 80), rng.uniform(30, 80)
            tx = cx + rng.uniform(-0.5, 0.5) * (CELL_B - sx)
            ty = cy + rng.uniform(-0.5, 0.5) * (CELL_B - sy)
            h = height(tx, ty, 34.0, 40.0, R_A1, R_B1, 2500.0, FACTORS_B)
            if h >= 8.0:
                add_box(tx, ty, sx, sy, h)
                b_towers += 1


def make(name, v, f, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata(v, [], f)
    me.materials.append(bpy.data.materials[mat])
    me.update()
    ob = bpy.data.objects.new(name, me)
    ob.visible_shadow = False      # far towers must not shade the street's distance fade
    scene.collection.objects.link(ob)
    return ob


make("H_horizon_towers", verts, faces, "clay_white")
make("H_horizon_paves", pverts, pfaces, "clay_walk")

bpy.ops.wm.save_mainfile()
print("V12 ringA blocks", a_blocks, "towers", a_towers, "ringB towers", b_towers,
      "verts", len(verts), "districts", [(round(d[0]), round(d[1]), round(d[3])) for d in districts])
