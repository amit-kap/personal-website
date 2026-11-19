"""v22 change: start the camera further down the street, so the pullback reads.

Amit (18 Nov): "where is the pullback?" / "start the camera down the street". With the start 72 m
from AS and a 116 m climb, the move read as a crane up. The start moves to START_X (local x on
CamPath), still at street eye height, and the two handles keep the camera low for the first part,
so frames 1 to about 40 are a clear backward glide along the street; the climb comes after.
The frame-84 offset key is re-solved by arc length so the shoulder pass stays at frame 84.
Applied in place to ref-v22-white.blend.
"""
import bpy
from mathutils import Vector

START_X, START_Z = -160.0, 6.0
H0_X = -70.0       # outgoing handle of the start: long and level -> a low glide first
H1_X = -55.0       # incoming handle of the shoulder point: the climb finishes well before the roof
SHOULDER_X, F_SHOULDER = -3.6, 84

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
p0, p1 = path.data.splines[0].bezier_points[0], path.data.splines[0].bezier_points[1]
y = p0.co.y
p0.co = Vector((START_X, y, START_Z))
p0.handle_left = Vector((START_X - 1, y, START_Z))
p0.handle_right = Vector((H0_X, y, START_Z))
p1.handle_left = Vector((H1_X, p1.co.y, p1.co.z))

dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
idx = next(i for i, v in enumerate(vs) if v.x >= SHOULDER_X)
frac = L[idx] / L[-1]

act = cam.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
off = [c for c in curves if c.data_path.endswith("offset_factor")][0]
k = [k for k in off.keyframe_points if round(k.co[0]) == F_SHOULDER][0]
k.co[1] = k.handle_left[1] = k.handle_right[1] = frac
off.update()

bpy.ops.wm.save_mainfile()
rows = []
for f in (1, 12, 24, 36, 48, 60, 72, 84, 144):
    s.frame_set(1 if f != 1 else 2)
    s.frame_set(f)
    rows.append((f, [round(v, 1) for v in cam.matrix_world.translation]))
print("V22 far start: path", round(L[-1], 1), "m, offset84", round(frac, 4), rows)
