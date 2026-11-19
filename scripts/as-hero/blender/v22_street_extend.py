"""v22 change: 2 s more of street-level pullback before the climb.

Amit (18 Nov): "better - extend the initial pullback on the street level, add 2s more".
Applied in place to ref-v22-white.blend.

1. A new first point is added EXTRA m further down the street at street eye height. The old start
   becomes an interior point with level handles, so the camera glides back at street level first and
   the climb begins after it, smoothly.
2. Everything after the move shifts SHIFT frames later (shoulder 84 -> 132, end frame 144 -> 192,
   point 168 -> 216 ...): AS's keys after frame 1, the lens-shift keys, and the scene end.
3. Travel and turn are re-baked as one continuous motion (see v22_one_motion.py): one ease-out over
   frames 1-192 passing the shoulder at 132, the yaw tied to the travel after the shoulder.
"""
import math

import bpy
from mathutils import Vector

EXTRA, SHIFT = 150.0, 48
STREET_Z = 6.0
SHOULDER_X = -3.6
F0, F_SH, F_END = 1, 84 + SHIFT, 144 + SHIFT
YAW_STREET, YAW_END = math.radians(90), math.radians(-45)

s = bpy.context.scene
O = bpy.data.objects
cam = s.camera
path = O["CamPath"]
sp = path.data.splines[0]


def curves_of(ob, data=False):
    ad = (ob.data if data else ob).animation_data
    if not ad or not ad.action:
        return []
    act = ad.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


# 1. new first point
old = [(b.co.copy(), b.handle_left.copy(), b.handle_right.copy(), b.handle_left_type, b.handle_right_type)
       for b in sp.bezier_points]
sp.bezier_points.add(1)
start = old[0][0]
new_start = Vector((start.x - EXTRA, start.y, STREET_Z))
ramp = (old[0][2] - start).length          # keep the old start handle's length, now level
rows = [(new_start, new_start - Vector((1, 0, 0)), new_start + Vector((EXTRA / 3, 0, 0)), "FREE", "FREE"),
        (start, start - Vector((EXTRA / 3, 0, 0)), start + Vector((ramp, 0, 0)), "ALIGNED", "ALIGNED")] \
    + old[1:]
for b, (co, hl, hr, tl, tr) in zip(sp.bezier_points, rows):
    b.handle_left_type, b.handle_right_type = "FREE", "FREE"
    b.co, b.handle_left, b.handle_right = co, hl, hr
    b.handle_left_type, b.handle_right_type = tl, tr

# 2. shift everything after the move
for ob in [O[n] for n in ("AS_shoulder_R", "AS_fig_head") if n in O]:
    for c in curves_of(ob):
        for k in sorted(c.keyframe_points, key=lambda k: -k.co[0]):
            if k.co[0] > 1.5:
                k.co[0] += SHIFT
                k.handle_left[0] += SHIFT
                k.handle_right[0] += SHIFT
        c.update()
for c in curves_of(cam):     # object and camera data share one slotted action: list it once
    if c.data_path in ("shift_x", "shift_y"):
        for k in sorted(c.keyframe_points, key=lambda k: -k.co[0]):
            if k.co[0] > 1.5:
                k.co[0] += SHIFT
                k.handle_left[0] += SHIFT
                k.handle_right[0] += SHIFT
        c.update()
s.frame_end += SHIFT

# 3. re-bake travel and turn
dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
frac = L[next(i for i, v in enumerate(vs) if v.x >= SHOULDER_X)] / L[-1]
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


for f in range(F0, F_END + 1):
    o = 1 - (1 - (f - F0) / (F_END - F0)) ** P
    off.keyframe_points.insert(f, o).interpolation = "LINEAR"
    t = smooth((o - frac) / (1 - frac)) if o > frac else 0.0
    yaw.keyframe_points.insert(f, YAW_STREET + (YAW_END - YAW_STREET) * t).interpolation = "LINEAR"
off.update()
yaw.update()

bpy.ops.wm.save_mainfile()
out = []
for f in (1, 24, 48, 72, 96, 120, 132, 160, 192):
    s.frame_set(1 if f != 1 else 2)
    s.frame_set(f)
    out.append((f, [round(v, 1) for v in cam.matrix_world.translation]))
print("V22 street extend: path", round(L[-1], 1), "frac", round(frac, 4), "P", round(P, 3),
      "end", s.frame_end, out)
