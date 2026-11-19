"""Still file v21: lower the tall tower left of the headline.

Amit (18 Nov): "lower that building in blender". In ref-v20-endframe-still.blend (option 1 position,
two towers removed) T_1_2_00 (152 m) still stands behind the first headline line. It is lowered so
its top sits at screen y = FLOOR in the held end frame (below the CTA, as v19 did for the copy area).
The camera is level, so the height is exact: z = camera z + y' * depth. Rooftop box and rim follow.

Lowering it alone revealed taller towers behind it, so afterwards section 2 of v19_endframe.py
(cap every tower behind the copy, varied heights) was run on the same still file: 10 more capped.

Run live in the open still file, or: Blender -b ref-v20-endframe-still.blend -P v21_lower_tower.py
"""
import bpy
from mathutils import Vector

NAME, FLOOR, F_HOLD = "1_2_00", 0.34, 240

s = bpy.context.scene
O = bpy.data.objects
s.frame_set(F_HOLD)
cam = s.camera
fr = [Vector((v.x / -v.z, v.y / -v.z, -1)) for v in cam.data.view_frame(scene=s)]
y0, y1 = min(v.y for v in fr), max(v.y for v in fr)
y_floor = y0 + FLOOR * (y1 - y0)
inv = cam.matrix_world.inverted()

t = O["T_" + NAME]
bb = [t.matrix_world @ Vector(c) for c in t.bound_box]
base, top = min(v.z for v in bb), max(v.z for v in bb)
depth = min(-(inv @ v).z for v in bb if v.z > top - 1e-4)
z_new = cam.matrix_world.translation.z + y_floor * depth
f = (z_new - base) / (top - base)
t.scale.z *= f
t.location.z = base + (t.location.z - base) * f
for part in ("B_", "R_"):
    p = O.get(part + NAME)
    if p:
        p.location.z += z_new - top
bpy.ops.wm.save_mainfile()
print("V21 lowered", t.name, round(top, 1), "->", round(z_new, 1))
