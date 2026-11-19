"""Block-out v9: Browsercity reaches the horizon, and pavements read in the render.

Amit's review of the opening still (17 Nov): the horizon felt cut off (the floor ended before the
horizon) and the pavements were missing. Runs on a copy of ref-v8-white.blend as it was when the
camera clip ref-v8-camera-16x9.mp4 was rendered (14:18 save). Camera, AS and the near city are
not touched.

1. Ground: the road plane grows to ~60 km across and the camera sees to 40 km, so the floor runs
   to the horizon with no edge.
2. Far city: plain box towers (no roof details) on the same grid, from where the town ended
   (760 m ahead) out to FAR_EXTENT, widening with distance so the skyline fills the horizon.
   The central road down AS's gaze stays open all the way.
3. Pavements: raised kerbs (KERB_H) in a mid grey, so they separate from the white towers and the
   near-black road, as in the city reference.

Run:
  cp docs/AS_hero/blockout/ref-v8-white.blend1 docs/AS_hero/blockout/ref-v9-white.blend
  Blender -b docs/AS_hero/blockout/ref-v9-white.blend -P scripts/as-hero/blender/extend_city_v9.py
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector

FAR_EXTENT = 3200.0     # far city reaches this far ahead of AS (m)
NEAR_EXTENT = 760.0     # where build_grid_city.py stopped (FRONT_EXTENT)
NEAR_RADIUS = 300.0     # build_grid_city.py RADIUS
SPREAD = 0.45           # far city half-width grows by this per metre ahead
GROUND_SCALE = 20.0     # road plane was +-1520 m; becomes +-30 km
CLIP_END = 40000.0
KERB_H = 0.25           # raised pavement (m)
WALK_GREY = 0.22        # pavement tone: reads between white towers and black road
SEED = 29

# Same grid constants as build_grid_city.py.
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
PAVE_X, PAVE_Y = BLOCK_X + 2 * WALK, BLOCK_Y + 2 * WALK
PITCH_X, PITCH_Y = PAVE_X + ROAD, PAVE_Y + ROAD

# 1. Ground to the horizon.
road = objs["G_road"]
road.scale = (GROUND_SCALE, GROUND_SCALE, 1)
scene.camera.data.clip_end = CLIP_END

# 3. Raised kerbs: extrude the shared pavement meshes once, sit them on the road.
walk_mat = bpy.data.materials["clay_walk"]
walk_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (
    WALK_GREY, WALK_GREY, WALK_GREY, 1)
done = set()
for o in objs:
    if not o.name.startswith("G_pave"):
        continue
    o.location.z = 0.0
    if o.data.name in done:
        continue
    bm = bmesh.new()
    bm.from_mesh(o.data)
    geom = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])["geom"]
    bmesh.ops.translate(bm, vec=(0, 0, KERB_H),
                        verts=[v for v in geom if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(o.data)
    bm.free()
    done.add(o.data.name)

# 2. Far city: plain boxes, same grid, central road kept open.
box = bpy.data.meshes["grid_tower"]
block_pave = bpy.data.meshes["G_pave_block"]
rng = random.Random(SEED)
far = 0
n_i = int(FAR_EXTENT // PITCH_X) + 2
n_j = int((NEAR_RADIUS + SPREAD * FAR_EXTENT) // PITCH_Y) + 2
for i in range(-n_i, 0):                 # ahead of AS only (along his gaze, -X)
    ahead = -(i * PITCH_X)
    if ahead <= NEAR_EXTENT or ahead > FAR_EXTENT:
        continue
    half_w = NEAR_RADIUS + SPREAD * (ahead - NEAR_EXTENT)
    for j in range(-n_j, n_j + 1):
        bx, by = CX + i * PITCH_X, CY + (j + 0.5) * PITCH_Y
        if abs(by - CY) > half_w:
            continue
        p = bpy.data.objects.new("G_pave_far_%d_%d" % (i, j), block_pave)
        p.location = (bx, by, 0.0)
        scene.collection.objects.link(p)
        for a in range(BLOCK_NX):
            for b in range(BLOCK_NY):
                if rng.random() < 0.15:
                    continue
                tx = bx - BLOCK_X / 2 + SIZE_X / 2 + a * (SIZE_X + LANE)
                ty = by - BLOCK_Y / 2 + SIZE_Y / 2 + b * (SIZE_Y + LANE)
                h = rng.uniform(100, 165)
                t = bpy.data.objects.new("F_%d_%d_%d%d" % (i, j, a, b), box)
                t.location = (tx, ty, 0)
                t.scale = (SIZE_X, SIZE_Y, h)
                scene.collection.objects.link(t)
                far += 1

scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
bpy.ops.wm.save_mainfile()
print("V9 far towers", far, "pitch", round(PITCH_X, 1), round(PITCH_Y, 1),
      "plot", round(SIZE_X, 1), round(SIZE_Y, 1))
