"""White-model block-out for the Seedance motion reference (v8).

Starts from hero-layout-v6.blend (AS stand-in on his tower at the origin) and:
- keeps only towers within RADIUS of the hero, then mirrors them so the town surrounds him
- replaces every material with plain clay (no textures), hero stand-in a darker grey
- removes the painted sun disc and halo, lights the scene with one sun lamp

Run: blender -b docs/AS_hero/blockout/hero-layout-v6.blend -P scripts/as-hero/blender/build_ref_white.py
"""
import math
import os

import bpy
import mathutils

RADIUS = 300.0  # metres from the hero; v6 had 1832 towers out to ~1.6 km
KEEP_ALL = 70.0  # keep every tower this close (the ones the camera passes)
MIN_GAP = 5.0  # metres of street between AS's tower and any other tower
OUT = os.path.join(os.path.dirname(bpy.data.filepath), "ref-v8-white.blend")

scene = bpy.context.scene
objs = bpy.data.objects


def centre(o):
    bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    return sum(bb, mathutils.Vector()) / 8


# 1. Thin the town: drop towers beyond RADIUS, and every other tower beyond KEEP_ALL
#    so the streets read as gaps.
towers = sorted((o for o in objs if o.name.startswith("T_")), key=lambda o: o.name)
for i, o in enumerate(towers):
    c = centre(o)
    d = math.hypot(c.x, c.y)
    if d > RADIUS or (d > KEEP_ALL and i % 2):
        objs.remove(o, do_unlink=True)

# 2. Surround the hero: v6 only had towers in front of the camera (+Y).
#    Copy the kept towers rotated 180 degrees around him.
rot = mathutils.Matrix.Rotation(math.pi, 4, "Z")
for o in [o for o in objs if o.name.startswith("T_")]:
    dup = o.copy()  # linked mesh data, cheap
    dup.name = o.name + "_back"
    dup.matrix_world = rot @ o.matrix_world
    scene.collection.objects.link(dup)

# 2b. Keep a street around AS's tower: drop towers closer than MIN_GAP to it
#     (one mirrored tower stood 0.9 m away and read as part of his building).
def footprint(o):
    bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
    return min(v.x for v in bb), max(v.x for v in bb), min(v.y for v in bb), max(v.y for v in bb)


ax0, ax1, ay0, ay1 = footprint(objs["AS_tower"])
for o in [o for o in objs if o.name.startswith("T_")]:
    x0, x1, y0, y1 = footprint(o)
    gx = max(x0 - ax1, ax0 - x1, 0)
    gy = max(y0 - ay1, ay0 - y1, 0)
    if math.hypot(gx, gy) < MIN_GAP:
        print("REMOVED near AS tower:", o.name)
        objs.remove(o, do_unlink=True)

# 3. Remove the painted sun.
for name in ("Sun", "SunHalo"):
    if name in objs:
        objs.remove(objs[name], do_unlink=True)

# 4. Clay materials, no textures.
def clay(name, rgb, rough=0.8):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = rough
    return m


white = clay("clay_white", (0.70, 0.70, 0.70))
hero = clay("clay_hero", (0.25, 0.25, 0.27))
hero_parts = ("Cube", "Cylinder", "Sphere")
for o in objs:
    if o.type != "MESH":
        continue
    m = hero if o.name.startswith(hero_parts) else white
    o.data.materials.clear()
    o.data.materials.append(m)
for m in list(bpy.data.materials):
    if m.users == 0:
        bpy.data.materials.remove(m)
for img in list(bpy.data.images):
    if img.users == 0:
        bpy.data.images.remove(img)

# 5. Simple light: one sun, grey world.
sun = bpy.data.lights.new("KeySun", "SUN")
sun.energy = 3.0
sun.angle = math.radians(3)
sun_obj = bpy.data.objects.new("KeySun", sun)
sun_obj.rotation_euler = (math.radians(55), 0, math.radians(-35))
scene.collection.objects.link(sun_obj)

world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
nodes = world.node_tree.nodes
for n in list(nodes):  # drop the painted sky gradient
    if n.type not in ("BACKGROUND", "OUTPUT_WORLD"):
        nodes.remove(n)
bg = nodes["Background"]
bg.inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
bg.inputs["Strength"].default_value = 1.0

scene.view_settings.view_transform = "Standard"

bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("SAVED", OUT, "towers:", sum(1 for o in objs if o.name.startswith("T_")))
