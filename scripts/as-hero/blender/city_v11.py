"""Block-out v11: a lighter city, the curve centred on the road, and city on every side.

Amit's review of v10 in Blender (17 Nov):
- "the city is way too much dense" -> thin out towers (empty plots stay as open pavement).
- "make the road in front of the camera the center of the curve" -> dome centred on the street.
- "what about the city on the sides??" -> fill every direction around AS out to SIDE_RADIUS, low
  and mid heights (the sides of the curve).

Towers within KEEP_NEAR of AS are not touched. Towers beside the camera's path stay under it.

Run on a copy of v10:
  cp docs/AS_hero/blockout/ref-v10-white.blend docs/AS_hero/blockout/ref-v11-white.blend
  Blender -b docs/AS_hero/blockout/ref-v11-white.blend -P scripts/as-hero/blender/city_v11.py
"""
import math
import random

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

KEEP_NEAR = 40.0
CAM_START = (-75.9, -6.2)
PATH_HALF, PATH_AHEAD, PATH_CAP = 45.0, 400.0, 112.0
KEEP_PATH = 0.80        # share of towers kept along the camera's road (rooftops must read)
KEEP_NEARBY = 0.50      # share kept elsewhere within 800 m
KEEP_FAR = 0.40         # share kept further out
SIDE_RADIUS = 2000.0
H_SIDE, H_NEAR, H_DOWNTOWN = 45.0, 108.0, 260.0
DOWNTOWN_FROM, DOWNTOWN_TO = 600.0, 2600.0
SIGMA = 0.28
SEED = 53

BLOCK_NX, BLOCK_NY, LANE, WALK, ROAD = 2, 2, 7.0, 5.0, 22.0

objs = bpy.data.objects
scene = bpy.context.scene
bb = [objs["AS_tower"].matrix_world @ Vector(c) for c in objs["AS_tower"].bound_box]
x0, x1 = min(v.x for v in bb), max(v.x for v in bb)
y0, y1 = min(v.y for v in bb), max(v.y for v in bb)
SIZE_X, SIZE_Y = x1 - x0, y1 - y0
CX, CY = (x0 + x1) / 2, (y0 + y1) / 2
BLOCK_X = BLOCK_NX * SIZE_X + (BLOCK_NX - 1) * LANE
BLOCK_Y = BLOCK_NY * SIZE_Y + (BLOCK_NY - 1) * LANE
PITCH_X, PITCH_Y = BLOCK_X + 2 * WALK + ROAD, BLOCK_Y + 2 * WALK + ROAD
PATCH = 4 * PITCH_X
rng = random.Random(SEED)


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def district_factor(x, y):
    k = (int(math.floor(x / PATCH)), int(math.floor(y / PATCH)))
    return random.Random(k[0] * 7919 + k[1] * 104729).choice((0.55, 0.7, 0.85, 1.0, 1.0, 1.15))


def height(x, y):
    """Dome centred on the street ahead of the start camera; low all round elsewhere."""
    d = CAM_START[0] - x
    lat = y - CAM_START[1]
    if d > 1.0:
        theta = abs(math.atan2(lat, d))
    else:
        theta = math.pi / 2                     # beside or behind the start camera: the sides
    peak = H_NEAR + (H_DOWNTOWN - H_NEAR) * smooth(DOWNTOWN_FROM, DOWNTOWN_TO, d)
    core = math.exp(-(theta / (SIGMA * 0.45)) ** 2)
    shoulder = math.exp(-(theta / SIGMA) ** 2)
    dome = H_SIDE + (peak - H_SIDE) * (0.55 * shoulder + 0.45 * core)
    r = rng.random()
    if r < 0.05:
        v = rng.uniform(1.2, 1.45)
    elif r < 0.50:
        v = rng.uniform(0.35, 0.7)
    else:
        v = rng.uniform(0.7, 1.0)
    h = max(14.0, dome * v * district_factor(x, y))
    if abs(lat) < PATH_HALF and -KEEP_NEAR - 40 < d < PATH_AHEAD:
        h = min(h, PATH_CAP - rng.uniform(0, 14))
    return h


def near_path(x, y):
    d = CAM_START[0] - x
    return abs(y - CAM_START[1]) < PATH_HALF and -KEEP_NEAR - 40 < d < PATH_AHEAD


def set_height(o, h):
    old = o.scale.z
    o.scale.z = h
    if o.name.startswith("T_"):
        for pre in ("R_", "B_"):
            p = objs.get(pre + o.name[2:])
            if p:
                p.location.z += h - old


def remove_tower(o):
    if o.name.startswith("T_"):
        for pre in ("R_", "B_"):
            p = objs.get(pre + o.name[2:])
            if p:
                objs.remove(p, do_unlink=True)
    objs.remove(o, do_unlink=True)


# Towers seen in the approved end frame (frame 144) stay exactly as they are.
scene.frame_set(144)
cam = objs["Cam"]


def in_end_frame(o):
    for c in o.bound_box:
        co = world_to_camera_view(scene, cam, o.matrix_world @ Vector(c))
        if co.z > 0 and -0.05 <= co.x <= 1.05 and -0.05 <= co.y <= 1.05:
            return True
    return False


protected = {o.name for o in objs if o.name.startswith(("T_", "F_")) and in_end_frame(o)}
scene.frame_set(1)

# 1 + 2. Thin the existing city and re-shape its heights around the street.
kept = removed = 0
for o in sorted([o for o in objs if o.name.startswith(("T_", "F_"))], key=lambda o: o.name):
    x, y = o.location.x, o.location.y
    if math.hypot(x - CX, y - CY) < KEEP_NEAR or o.name in protected:
        continue
    dist = math.hypot(x - CX, y - CY)
    keep = KEEP_PATH if near_path(x, y) else (KEEP_NEARBY if dist < 800 else KEEP_FAR)
    if rng.random() > keep:
        remove_tower(o)
        removed += 1
        continue
    set_height(o, height(x, y))
    kept += 1

# 3. City on every side: fill grid blocks that have no pavement yet, out to SIDE_RADIUS.
taken = {(round(o.location.x, 1), round(o.location.y, 1)) for o in objs if o.name.startswith("G_pave")}
box = bpy.data.meshes["grid_tower"]
block_pave = bpy.data.meshes["G_pave_block"]
n = int(SIDE_RADIUS // PITCH_X) + 2
added = 0
for i in range(-n, n + 1):
    for j in range(-n, n + 1):
        bx, by = CX + i * PITCH_X, CY + (j + 0.5) * PITCH_Y
        if math.hypot(bx - CX, by - CY) > SIDE_RADIUS:
            continue
        if (round(bx, 1), round(by, 1)) in taken:
            continue
        if abs(bx - CX) < PITCH_X and abs(by - CY) < PITCH_Y:      # AS's plaza
            continue
        if bx < CX - 700 and abs(by - CY) < 300 + 0.45 * (CX - bx - 700):   # ahead: already city
            continue
        p = bpy.data.objects.new("G_pave_side_%d_%d" % (i, j), block_pave)
        p.location = (bx, by, 0.0)
        scene.collection.objects.link(p)
        dist = math.hypot(bx - CX, by - CY)
        keep = KEEP_NEARBY if dist < 800 else KEEP_FAR
        for a in range(BLOCK_NX):
            for b in range(BLOCK_NY):
                if rng.random() > keep:
                    continue
                tx = bx - BLOCK_X / 2 + SIZE_X / 2 + a * (SIZE_X + LANE)
                ty = by - BLOCK_Y / 2 + SIZE_Y / 2 + b * (SIZE_Y + LANE)
                t = bpy.data.objects.new("S_%d_%d_%d%d" % (i, j, a, b), box)
                t.location = (tx, ty, 0)
                t.scale = (SIZE_X, SIZE_Y, height(tx, ty))
                scene.collection.objects.link(t)
                added += 1

scene.camera = objs["Cam"]
bpy.ops.wm.save_mainfile()
print("V11 protected", len(protected), "kept", kept, "removed", removed, "side towers", added)
