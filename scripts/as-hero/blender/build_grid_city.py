"""Grid Browsercity for the motion reference, laid out around the camera path.

Replaces every tower (T_*) and ground piece (G_*) in ref-v8-white.blend with a city of blocks on
a perfect grid aligned to the world axes and to the glide (which runs along -X):
- each block holds BLOCK_NX x BLOCK_NY box towers the size of AS's tower, with narrow lanes
  between them, on one flat pavement with rounded corners (no kerb: a raised edge could read as
  geometry the video model has to keep);
- roads run between the blocks, all the same width; one runs straight down AS's gaze line and
  ends at his tower, which stands alone on its own pavement (a small plaza);
- the sun sits low on the horizon straight ahead down his gaze, as in the city reference.
From the top every edge is a straight horizontal or vertical line.

Run, then re-key the camera:
  blender -b docs/AS_hero/blockout/ref-v8-white.blend -P scripts/as-hero/blender/build_grid_city.py
  blender -b docs/AS_hero/blockout/ref-v8-white.blend -P scripts/as-hero/blender/key_ref_camera.py
"""
import math
import random

import bpy
from mathutils import Vector

BLOCK_NX, BLOCK_NY = 2, 2   # towers per block
LANE = 7.0                  # gap between towers inside a block (m)
WALK = 5.0                  # pavement margin around the towers of a block (m)
CORNER = 5.0                # pavement corner radius (m)
ROAD = 22.0                 # road width between pavements (m)
DROP = 0.15                 # chance a plot in a block is left empty (opens the grid up)
RADIUS = 300.0              # town extent around AS (m)
FRONT_EXTENT = 760.0        # town extent ahead of AS along his gaze (m)
WALK_Z = 0.03               # pavement sits just above the road (flat, no kerb)
RIM_W = 1.0                 # roof rim (parapet) width (m)
RIM_H = 1.0                 # roof rim height (m)
AS_RIM_H = 0.35             # lower rim on his roof: he stands 1 m from its edge
ROOFBOX = (4.0, 3.0, 2.2)   # rooftop box size (m)
SEED = 11

objs = bpy.data.objects
scene = bpy.context.scene

for o in [o for o in objs if o.name.startswith(("T_", "G_", "R_", "B_"))]:
    objs.remove(o, do_unlink=True)
for m in [m for m in bpy.data.meshes if m.users == 0]:
    bpy.data.meshes.remove(m)

# AS's tower sets the plot size and the grid alignment.
bb = [objs["AS_tower"].matrix_world @ Vector(c) for c in objs["AS_tower"].bound_box]
x0, x1 = min(v.x for v in bb), max(v.x for v in bb)
y0, y1 = min(v.y for v in bb), max(v.y for v in bb)
SIZE_X, SIZE_Y = x1 - x0, y1 - y0
CX, CY = (x0 + x1) / 2, (y0 + y1) / 2

BLOCK_X = BLOCK_NX * SIZE_X + (BLOCK_NX - 1) * LANE   # towers part of a block
BLOCK_Y = BLOCK_NY * SIZE_Y + (BLOCK_NY - 1) * LANE
PAVE_X, PAVE_Y = BLOCK_X + 2 * WALK, BLOCK_Y + 2 * WALK
PITCH_X, PITCH_Y = PAVE_X + ROAD, PAVE_Y + ROAD


def clay(name, v):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (v, v, v, 1)
    b.inputs["Roughness"].default_value = 0.9
    return m


white = bpy.data.materials.get("clay_white")
road_mat = clay("clay_road", 0.08)   # near-black asphalt
walk_mat = clay("clay_walk", 0.85)   # light pavement

# Unit box (base at z=0) for towers.
box = bpy.data.meshes.new("grid_tower")
box.from_pydata(
    [(-0.5, -0.5, 0), (0.5, -0.5, 0), (0.5, 0.5, 0), (-0.5, 0.5, 0),
     (-0.5, -0.5, 1), (0.5, -0.5, 1), (0.5, 0.5, 1), (-0.5, 0.5, 1)], [],
    [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
box.materials.append(white)

# Road: one flat surface under the town.
R = FRONT_EXTENT * 2
road = bpy.data.meshes.new("G_road")
road.from_pydata([(-R, -R, 0), (R, -R, 0), (R, R, 0), (-R, R, 0)], [], [(0, 1, 2, 3)])
road.materials.append(road_mat)
road_obj = bpy.data.objects.new("G_road", road)
road_obj.location = (CX, CY, 0)
scene.collection.objects.link(road_obj)


def rounded_rect(name, w, d, r, seg=8):
    """Flat rounded rectangle mesh, centred on the origin."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90),
                       (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), 0))
    m = bpy.data.meshes.new(name)
    m.from_pydata(pts, [], [list(range(len(pts)))])
    m.materials.append(walk_mat)
    return m


block_pave = rounded_rect("G_pave_block", PAVE_X, PAVE_Y, CORNER)
as_pave = rounded_rect("G_pave_AS", SIZE_X + 2 * WALK, SIZE_Y + 2 * WALK, CORNER)


def rim_mesh(name, w, d, t):
    """Hollow square frame (parapet), 1 m tall, outer size w x d, wall thickness t."""
    ow, od, iw, id_ = w / 2, d / 2, w / 2 - t, d / 2 - t
    ring = [(-ow, -od), (ow, -od), (ow, od), (-ow, od), (-iw, -id_), (iw, -id_), (iw, id_), (-iw, id_)]
    v = [(x, y, 0) for x, y in ring] + [(x, y, 1) for x, y in ring]
    f = []
    for k in range(4):
        k2 = (k + 1) % 4
        f.append((k, k2, 8 + k2, 8 + k))              # outer wall
        f.append((4 + k2, 4 + k, 12 + k, 12 + k2))    # inner wall
        f.append((8 + k, 8 + k2, 12 + k2, 12 + k))    # top
    m = bpy.data.meshes.new(name)
    m.from_pydata(v, [], f)
    m.materials.append(white)
    return m


rim = rim_mesh("R_rim", SIZE_X, SIZE_Y, RIM_W)


def roof_details(tx, ty, top, name, rim_h=RIM_H, box_at=None):
    """Rim around the roof edge and one rooftop box, as in the city reference."""
    place(rim, "R_" + name, tx, ty, top, (1, 1, rim_h))
    bx, by, bz = ROOFBOX
    if box_at is None:   # random spot inside the rim
        mx = SIZE_X / 2 - RIM_W - bx / 2 - 0.5
        my = SIZE_Y / 2 - RIM_W - by / 2 - 0.5
        box_at = (tx + rng_roof.uniform(-mx, mx), ty + rng_roof.uniform(-my, my))
    place(box, "B_" + name, box_at[0], box_at[1], top, (bx, by, bz))


def place(mesh, name, x, y, z=0.0, scale=(1, 1, 1)):
    o = bpy.data.objects.new(name, mesh)
    o.location = (x, y, z)
    o.scale = scale
    scene.collection.objects.link(o)
    return o


place(as_pave, "G_pave_AS", CX, CY, WALK_Z)
rng = random.Random(SEED)
rng_roof = random.Random(SEED + 1)   # separate stream: roof details don't reshuffle the town
# His roof: a lower rim, and the box in the back corner, far from him and the camera's pass.
roof_details(CX, CY, z1_as := max(v.z for v in bb), "AS", rim_h=AS_RIM_H,
             box_at=(x1 - RIM_W - ROOFBOX[0] / 2 - 1.0, y1 - RIM_W - ROOFBOX[1] / 2 - 1.0))

# His pavement's half size: blocks must keep a full road width from it.
AS_HALF_X, AS_HALF_Y = SIZE_X / 2 + WALK, SIZE_Y / 2 + WALK

n = int(FRONT_EXTENT // min(PITCH_X, PITCH_Y)) + 2
towers = 0
for i in range(-n, n + 1):          # i: along X (i < 0 is ahead of AS, along his gaze)
    for j in range(-n, n + 1):      # j: along Y
        # Blocks sit half a pitch off his centre line, so a road runs straight down his gaze.
        bx, by = CX + i * PITCH_X, CY + (j + 0.5) * PITCH_Y
        if i < 0:
            if -(bx - CX) > FRONT_EXTENT or abs(by - CY) > RADIUS:
                continue
        elif math.hypot(bx - CX, by - CY) > RADIUS:
            continue
        # Keep a full road between any block and his plaza.
        gap_x = abs(bx - CX) - PAVE_X / 2 - AS_HALF_X
        gap_y = abs(by - CY) - PAVE_Y / 2 - AS_HALF_Y
        if max(gap_x, gap_y) < ROAD:
            continue
        place(block_pave, "G_pave_%d_%d" % (i, j), bx, by, WALK_Z)
        lining = i < 0 and j in (0, -1)     # the blocks along the camera's road
        for a in range(BLOCK_NX):
            for b in range(BLOCK_NY):
                if rng.random() < DROP:
                    continue
                tx = bx - BLOCK_X / 2 + SIZE_X / 2 + a * (SIZE_X + LANE)
                ty = by - BLOCK_Y / 2 + SIZE_Y / 2 + b * (SIZE_Y + LANE)
                d = math.hypot(tx - CX, ty - CY)
                if lining:
                    h = rng.uniform(96, 116)         # under the camera: rooftops read
                elif d < 80:
                    h = rng.uniform(95, 125)
                else:
                    h = rng.uniform(100, 165)
                place(box, "T_%d_%d_%d%d" % (i, j, a, b), tx, ty, 0, (SIZE_X, SIZE_Y, h))
                roof_details(tx, ty, h, "%d_%d_%d%d" % (i, j, a, b))
                towers += 1

# Sun low on the horizon straight ahead down his gaze (-X), as in the city reference.
SUN_ELEVATION = math.radians(8)
sun = objs.get("KeySun")
if sun:
    light_dir = Vector((1.0, 0.0, -math.tan(SUN_ELEVATION))).normalized()  # travels -X to +X
    sun.rotation_euler = light_dir.to_track_quat("-Z", "Y").to_euler()
    sun.data.energy = 4.0

bpy.ops.wm.save_mainfile()
print("GRID_TOWERS", towers, "block pitch", round(PITCH_X, 2), round(PITCH_Y, 2))
