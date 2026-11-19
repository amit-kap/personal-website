"""v22 change: open the turn into an orbit round AS instead of skimming over his shoulder.

Amit (18 Nov): "open up the curve turn around the AS not over the shoulder". Applied in place to
ref-v22-white.blend.

Path: the street run and the climb are kept (the rebuilt path's points up to frame KEEP_F). Then the
camera eases out to the far side of AS (north, radius R0), and orbits him clockwise - north, behind him
(east), south - spiralling in to the approved end-frame position (south-west of him, radius ~5.8 m),
about 230 degrees of arc on one AUTO-handle Bezier.

Yaw: the camera keeps looking back down the street (90 deg) until it is behind AS (east side), where
the look-at angle to AS is also 90 deg, so he comes into view ahead with no jump. From there the yaw
follows the look-at angle to AS, plus a small correction blended in, so the last frame is exactly the
approved end-frame yaw (-45 deg).

Travel: one ease-out over frames 1-192 by arc length (fast start, full stop at 192).
"""
import math

import bpy
from mathutils import Vector

KEEP_F = 96                 # keep the street run and climb up to this frame
R0, R_END = 6.5, None       # orbit radius at the start of the arc; end radius from the end frame
P_EASE = 3.0
F0, F_END = 1, 192
YAW_STREET, YAW_END = 90.0, -45.0

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
C = bpy.data.objects["AS_fig"].matrix_world.translation.copy()


def curves_of(ob):
    act = ob.animation_data.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


def at(f):
    s.frame_set(f - 1 if f > F0 else F0 + 1)
    s.frame_set(f)
    return cam.matrix_world.translation.copy()


keep = [at(f) for f in (1, 12, 18, 24, 30, 36, 48, 60, 72, 84, KEEP_F)]
end = at(F_END)
roof_z = keep[-1].z

# orbit points
ae = math.atan2(end.y - C.y, end.x - C.x)            # end angle (south-west, about -138 deg)
re = math.hypot(end.x - C.x, end.y - C.y)
angles = [90, 60, 30, 0, -30, -60, -90, -115, math.degrees(ae)]
orbit = []
for i, a in enumerate(angles):
    t = i / (len(angles) - 1)
    r = R0 + (re - R0) * t
    z = 122.0 + (end.z - 122.0) * t
    if i == len(angles) - 1:
        orbit.append(end.copy())
    else:
        orbit.append(Vector((C.x + r * math.cos(math.radians(a)), C.y + r * math.sin(math.radians(a)), z)))
lead_in = Vector((C.x - 14.0, C.y + R0, 121.8))       # ease out to the far side before the arc

pts_world = keep + [lead_in] + orbit
inv = path.matrix_world.inverted()
cu = path.data
for sp in list(cu.splines):
    cu.splines.remove(sp)
sp = cu.splines.new("BEZIER")
sp.bezier_points.add(len(pts_world) - 1)
for b, p in zip(sp.bezier_points, pts_world):
    b.co = inv @ p
    b.handle_left_type = b.handle_right_type = "AUTO"
cu.resolution_u = 48

# arc length table
dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
total = L[-1]


def point_at(o):
    d = o * total
    for i in range(len(L) - 1):
        if L[i + 1] >= d:
            t = 0 if L[i + 1] == L[i] else (d - L[i]) / (L[i + 1] - L[i])
            return vs[i] + (vs[i + 1] - vs[i]) * t
    return vs[-1]


def look_yaw(p):
    d = C - p
    return math.degrees(math.atan2(-d.x, d.y))


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


cc = curves_of(cam)
off = [c for c in cc if c.data_path.endswith("offset_factor")][0]
yaw = [c for c in cc if c.data_path == "rotation_euler" and c.array_index == 2][0]
for c in (off, yaw):
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)
for c in [c for c in cc if c.data_path == "location"]:
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)
cam.location = (0, 0, 0)

# frame where the camera is behind AS (east side): look-at == street yaw
east_o = None
prev_lookyaw = None
corr = YAW_END - look_yaw(end)
behind_f = None
rows = []
for f in range(F0, F_END + 1):
    o = 1 - (1 - (f - F0) / (F_END - F0)) ** P_EASE
    p = point_at(o)
    ly = look_yaw(p)
    if behind_f is None and p.x > C.x and abs(((ly - YAW_STREET + 180) % 360) - 180) < 3:
        behind_f = f
    if behind_f is None:
        y = YAW_STREET
    else:
        if prev_lookyaw is not None:                     # unwrap
            while ly - prev_lookyaw > 180:
                ly -= 360
            while ly - prev_lookyaw < -180:
                ly += 360
        w = smooth((f - behind_f) / max(1, F_END - behind_f))
        y = ly + corr * w
    prev_lookyaw = ly if behind_f is not None else None
    off.keyframe_points.insert(f, o).interpolation = "LINEAR"
    yaw.keyframe_points.insert(f, math.radians(y)).interpolation = "LINEAR"
    if f % 12 == 0 or f in (1, F_END):
        rows.append((f, [round(v, 1) for v in p], round(y, 1)))
off.update()
yaw.update()

bpy.ops.wm.save_mainfile()
print("V22 orbit: path", round(total, 1), "m, behind AS at frame", behind_f, rows)
