"""Browsercity built from the tower kit (tower_kit.py), with AS's stand-in
and the three key cameras of the agreed shot.

The layout, tower heights and cameras come from build_browsercity.py (the
grey block-out Amit reviewed); only the buildings change, to kit towers.
Kit towers are expensive to build, so a few prototypes per type are built
once and placed as linked duplicates, each turned a random quarter-turn so
the random tabs on every face vary across the city.

blender -b --factory-startup -P scripts/as-hero/blender/build_city_kit.py -- <out_dir>
"""

import math
import os
import random
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_browsercity as layout  # noqa: E402  (grid, heights, cameras)
import tower_kit as kit  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_dir = argv[0] if argv else os.path.join(HERE, "out_city")
os.makedirs(out_dir, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
random.seed(layout.SEED)

# ---------------------------------------------------------------- prototypes
protos_col = bpy.data.collections.new("Prototypes")
scene.collection.children.link(protos_col)
HEIGHTS = (55, 80, 105, 130, 150, 165, 185, 210, 240, 275, 310)
protos = []          # (height, footprint, object)
for i, h in enumerate(HEIGHTS):
    for kind in ("A", "B", "C"):
        name = f"P_{kind}_{h}"
        if kind == "A":
            o = kit.tower_window(name, h=h - 5, loc=(0, 0))
            fp = 44.0
        elif kind == "B":
            o = kit.tower_tab(name, h=h - 5, loc=(0, 0))
            fp = 38.0
        else:
            if h < 120:
                continue            # slim towers only come tall
            o = kit.tower_slim(name, h=h - 5, loc=(0, 0))
            fp = 22.0
        for c in o.users_collection:
            c.objects.unlink(o)
        protos_col.objects.link(o)
        protos.append((h, kind, o))
protos_col.hide_render = True


def place(proto, x, y, rot_quarters):
    inst = proto.copy()                     # linked duplicate: shares the mesh
    inst.location = (x, y, proto.location.z)
    inst.rotation_euler = (0, 0, rot_quarters * math.pi / 2)
    scene.collection.objects.link(inst)
    return inst


def nearest(h, kinds):
    cands = [p for p in protos if p[1] in kinds]
    return min(cands, key=lambda p: abs(p[0] - h))[2]


# ---------------------------------------------------------------- city
n = int(layout.CITY_RADIUS // layout.BLOCK)
count = 0
for i in range(-n, n + 1):
    for j in range(-n, n + 1):
        cx, cy = i * layout.BLOCK, j * layout.BLOCK
        dist = math.hypot(cx, cy)
        if dist > layout.CITY_RADIUS or (i == 0 and j == 0):
            continue
        h = layout.tower_height(dist, cx, cy)
        r = random.random()
        if r < 0.3:
            # two slim towers sharing the lot
            p = nearest(max(h, 120), ("C",))
            place(p, cx - 12, cy, random.randint(0, 3))
            place(nearest(max(h * 0.8, 120), ("C",)), cx + 12, cy, random.randint(0, 3))
            count += 2
        else:
            kinds = ("A",) if r < 0.55 else ("B",)
            place(nearest(h, kinds), cx, cy, random.randint(0, 3))
            count += 1

# distant skyline: tall towers 1.3-2.3 km out in front of AS (-Y), where
# the low sun sits; the haze fades them to pale silhouettes and their gaps
# break the sunlight into rays, like Amit's reference
for _ in range(140):
    ang = math.radians(-90 + random.uniform(-48, 48))
    rr = random.uniform(1300, 2300)
    x, y = rr * math.cos(ang), rr * math.sin(ang)
    h = random.uniform(170, 400)
    place(nearest(h, ("C", "B")), x, y, random.randint(0, 3))
    count += 1

# ground: streets and plazas at z = 0, in the toon palette (warm stone lit,
# grey-teal in the towers' shadows), so the streets read between towers
bpy.ops.mesh.primitive_plane_add(size=6000, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"
ground.data.materials.append(kit.toon_material("Street", (0.86, 0.80, 0.71), (0.42, 0.50, 0.52)))

# AS's tower: a tab tower whose roof is AS_ROOF, with a low parapet instead
# of the tall frame so he can stand at its edge and see out.
lot = layout.BLOCK - layout.STREET
as_tower = kit.tower_tab("AS_Tower", w=lot, d=lot, h=layout.AS_ROOF,
                         loc=(0, lot / 2 - 2.0), rim=1.0, rim_h=0.45)

# ---------------------------------------------------------------- AS stand-in
suit = kit.toon_material("AS_suit", (0.94, 0.42, 0.16), (0.62, 0.24, 0.10))
skin = kit.toon_material("AS_skin", (0.97, 0.92, 0.84), (0.78, 0.72, 0.66))
cape = kit.toon_material("AS_cape", (0.36, 0.52, 0.76), (0.20, 0.32, 0.52))
layout.build_as(suit, skin, cape)

cams = layout.build_cameras()
# Low side sun: in every key frame each tower shows one lit-cream side and
# one shadow-teal side, like the reference (a backlit sun turned K1/K2 all
# teal; a sun behind the end-frame city turned K3 all teal).
kit.setup_look(scene, sun_dir=(0.75, 0.45, -0.45))
scene.render.resolution_x = 1376
scene.render.resolution_y = 768

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, "browsercity_kit.blend"))
for name in ("K1_rooftops", "K2_over_shoulder", "K3_end_medium"):
    scene.camera = cams[name]
    scene.render.filepath = os.path.join(out_dir, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)
print("CITY towers", count)
