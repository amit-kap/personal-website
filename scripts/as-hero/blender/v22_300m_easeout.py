"""v22 change: start 300 m down the street, a gradual climb, fast start slowing to a full stop.

Amit (18 Nov): "start even further down the street, the climb up is gradual during the pull back,
the movement starts fast and slows down until complete stop" -> "yes 300m, go ahead".
Applied in place to ref-v22-white.blend.

Path: the first point moves to 300 m from AS at street eye height. Its outgoing handle points up
the ramp (so the camera climbs from the first frame), and the shoulder point's incoming handle is
level, so the climb flattens out smoothly at roof height before the shoulder pass. The turn segment
(shoulder -> end frame) is untouched.

Speed: the Follow Path offset is baked per frame as one ease-out curve, offset = 1 - (1 - u)^P with
u = (f - 1) / 143, so the camera is fastest at frame 1 and decelerates continuously to zero speed at
144. P is solved so the curve passes the shoulder (x = -3.6 m) exactly at frame 84.
"""
import math

import bpy
from mathutils import Vector

START_X, START_Z = -300.0, 6.0     # local x on CamPath (object x offset 0.3 m)
H0 = Vector((100.0, 0.0, 45.0))    # outgoing handle of the start: up the ramp
H1_X = -90.0                       # shoulder point's incoming handle: level, long
SHOULDER_X, F0, F_SH, F_END = -3.6, 1, 84, 144

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
pts = path.data.splines[0].bezier_points
p0, p1 = pts[0], pts[1]
y = p0.co.y
p0.co = Vector((START_X, y, START_Z))
p0.handle_left = p0.co - H0 * 0.01
p0.handle_right = p0.co + H0
p1.handle_left = Vector((H1_X, p1.co.y, p1.co.z))

# arc-length fraction of the shoulder pass
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
u_sh = (F_SH - F0) / (F_END - F0)
P = math.log(1 - frac) / math.log(1 - u_sh)

act = cam.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
off = [c for c in curves if c.data_path.endswith("offset_factor")][0]
for k in list(off.keyframe_points)[::-1]:
    off.keyframe_points.remove(k)
for f in range(F0, F_END + 1):
    u = (f - F0) / (F_END - F0)
    k = off.keyframe_points.insert(f, 1 - (1 - u) ** P)
    k.interpolation = "LINEAR"
off.update()

bpy.ops.wm.save_mainfile()
rows = []
prev = None
for f in (1, 2, 24, 48, 72, 84, 85, 120, 143, 144):
    s.frame_set(1 if f != 1 else 2)
    s.frame_set(f)
    rows.append((f, [round(v, 1) for v in cam.matrix_world.translation]))
print("V22 300m: path", round(L[-1], 1), "m, shoulder frac", round(frac, 4), "P", round(P, 3), rows)
