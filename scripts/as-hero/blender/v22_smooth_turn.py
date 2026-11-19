"""v22 change: a gradual climb in time, and no hook at the shoulder pass.

Amit (18 Nov): "make the pull up more gradual - just before the turn to over the shoulder there is some
small camera move that needs to be fixed". Applied in place to ref-v22-white.blend.

1. Hook: with the tightened arc, the path left the shoulder point straight along +x and then had to
   reverse, so at 132-136 the camera nudged forward ~0.6 m and came back. The shoulder point's handles
   now point along the start of the arc (TURN_IN degrees off the street, toward the loop side), so the
   path bends into one round curve as it passes the shoulder.
2. Climb: the camera's height is now set per frame, independent of the path's own z: street eye height
   for frames 1-F_GLIDE, then one smoothstep rise to roof height at the shoulder frame (gradual in time,
   no early surge), then the path's own height through the turn. Done as a keyed z offset on the camera
   object (its location adds to the Follow Path result).
3. Travel and yaw re-baked as one continuous motion (same as v22_street_extend.py step 3).
"""
import math

import bpy
from mathutils import Vector

TURN_IN = 30.0          # degrees the shoulder tangent turns toward the loop side (-y)
H_OUT = 4.0             # shoulder point outgoing handle length (m)
H_IN = 12.0             # shoulder point incoming handle length: short, so only the last metres bend
                        # (the original ~86 m handle at 30 deg pulled the street run 19 m sideways)
F0, F_GLIDE, F_SH, F_END = 1, 24, 132, 192
STREET_Z = 6.0
SHOULDER_X = -3.6
YAW_STREET, YAW_END = math.radians(90), math.radians(-45)

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
pts = path.data.splines[0].bezier_points
sh = pts[2]
a = math.radians(-TURN_IN)
d = Vector((math.cos(a), math.sin(a), 0.0))
sh.handle_left_type = sh.handle_right_type = "FREE"
sh.handle_left = sh.co - d * H_IN
sh.handle_right = sh.co + d * H_OUT


def curves_of(ob):
    act = ob.animation_data.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


# travel + yaw (arc length)
dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for p, q in zip(vs, vs[1:]):
    L.append(L[-1] + (q - p).length)
i_sh = next(i for i, v in enumerate(vs) if v.x >= SHOULDER_X)
frac = L[i_sh] / L[-1]
P = math.log(1 - frac) / math.log(1 - (F_SH - F0) / (F_END - F0))

cc = curves_of(cam)
off = [c for c in cc if c.data_path.endswith("offset_factor")][0]
yaw = [c for c in cc if c.data_path == "rotation_euler" and c.array_index == 2][0]
for c in (off, yaw):
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


EASE_IN = 0.12          # share of the climb spent leaving the street (short, smooth)


def climb(x):
    """Pull-up curve (Amit: 'start the pullup at frame 24 - curved'): a short smooth lift-off at 24,
    then an arc that rises at once and flattens gradually into roof height."""
    x = min(max(x, 0.0), 1.0)
    e = EASE_IN
    xe = x * x / (2 * e) if x < e else x - e / 2          # ease-in, then linear
    xe /= (1 - e / 2)
    return 1 - (1 - xe) ** 2                              # ease-out arc


offsets = {}
for f in range(F0, F_END + 1):
    o = 1 - (1 - (f - F0) / (F_END - F0)) ** P
    offsets[f] = o
    off.keyframe_points.insert(f, o).interpolation = "LINEAR"
    t = smooth((o - frac) / (1 - frac)) if o > frac else 0.0
    yaw.keyframe_points.insert(f, YAW_STREET + (YAW_END - YAW_STREET) * t).interpolation = "LINEAR"
off.update()
yaw.update()

# height: keyed z offset on top of the path, frames 1..F_SH
for c in [c for c in curves_of(cam) if c.data_path == "location" and c.array_index == 2]:
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)
roof_z = vs[i_sh].z
for f in range(F0, F_SH + 1):
    s.frame_set(f)
    cam.location.z = 0.0
    dg = bpy.context.evaluated_depsgraph_get()
    path_z = cam.evaluated_get(dg).matrix_world.translation.z
    want = STREET_Z if f <= F_GLIDE else STREET_Z + (roof_z - STREET_Z) * climb((f - F_GLIDE) / (F_SH - F_GLIDE))
    cam.location.z = want - path_z
    cam.keyframe_insert("location", index=2, frame=f)
cam.location.z = 0.0
cam.keyframe_insert("location", index=2, frame=F_SH + 1)
for c in [c for c in curves_of(cam) if c.data_path == "location" and c.array_index == 2]:
    for k in c.keyframe_points:
        k.interpolation = "LINEAR"
    c.update()

bpy.ops.wm.save_mainfile()
out = []
prev = None
for f in (1, 24, 30, 36, 48, 72, 96, 120, 132, 192):
    s.frame_set(f - 1 if f > 1 else 2)
    s.frame_set(f)
    p = cam.matrix_world.translation.copy()
    out.append((f, [round(v, 2) for v in p]))
print("V22 smooth turn: frac", round(frac, 4), "P", round(P, 3), out)
