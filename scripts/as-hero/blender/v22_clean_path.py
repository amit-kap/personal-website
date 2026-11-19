"""v22 change: a clean camera path from scratch, few points, one smooth motion.

Amit (18 Nov): "this curve is not good - the motion is not smooth - there is all sort of unclear curves.
From start - pull back street level, after 2s start to curve up gradually straight up with a small
ease in, like we are looking at the city through AS's eyes - then a quick turn around the hero until
end frame". Applied in place to ref-v22-white.blend.

Plan view: one straight line along the street (y = AS.y + EYE_SIDE, just beside his head) for the
glide and the climb, then a spiral round AS: north (beside his head) -> east (behind him) -> south ->
the approved end frame (south-west, ~5.8 m). Side view: level at street height to frame 48, then one
climb arc that leaves the street level (ease in) and arrives level at his eye height.

Points (explicit handles, nothing AUTO):
  P0 street start, P1 end of the 2 s glide, P2 beside his head at eye height (end of the climb),
  then orbit points E (east), S (south) and the end frame.
Timing: arc-length knots (1, 0) (48, s1) (150, s2) (192, S) joined by a monotone cubic, starting at
the glide speed and ending at zero speed. Yaw: street yaw (90 deg) until the camera is behind him,
then the look-at angle to AS, corrected smoothly to the approved end yaw (-45 deg).
"""
import math

import bpy
from mathutils import Vector

GLIDE_LEN = 170.0          # metres covered in the 2 s street glide
START_DIST = 450.0         # start distance from AS along the street
STREET_Z = 6.0
EYE_SIDE = 1.2             # metres beside his head at the end of the climb (head out of frame)
EYE_Z_OVER = 1.7           # eye height above his feet
F0, F_GLIDE, F_EYE, F_END = 1, 48, 168, 192   # quick 1 s turn after the climb
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


s.frame_set(F_END - 1)
s.frame_set(F_END)
END = cam.matrix_world.translation.copy()           # approved end-frame camera position

y_line = C.y + EYE_SIDE
eye_z = C.z + EYE_Z_OVER
P0 = Vector((C.x - START_DIST, y_line, STREET_Z))
P1 = Vector((P0.x + GLIDE_LEN, y_line, STREET_Z))
P2 = Vector((C.x, y_line, eye_z))
climb_dx = P2.x - P1.x
r_e, r_s = 2.6, 4.4
E = Vector((C.x + r_e, C.y, eye_z - 0.2))
S = Vector((C.x, C.y - r_s, eye_z - 0.5))

k = 0.5523                                            # circle handle factor
pts = [
    (P0, P0 - Vector((1, 0, 0)), P0 + Vector((GLIDE_LEN / 3, 0, 0))),
    (P1, P1 - Vector((GLIDE_LEN / 3, 0, 0)), P1 + Vector((climb_dx * 0.45, 0, 0))),     # leaves level
    (P2, P2 - Vector((climb_dx * 0.45, 0, 0)), P2 + Vector((EYE_SIDE * 1.4, 0, 0))),    # arrives level
    (E, E + Vector((0, (y_line - C.y) * 0.9, 0)), E - Vector((0, r_e * k * 1.6, 0))),
    (S, S + Vector((r_s * k, 0, 0)), S - Vector((r_s * k, 0, 0))),
]
d_end = END - C
t_end = Vector((-d_end.y, d_end.x, 0)).normalized()  # clockwise tangent at the end point
pts.append((END, END - t_end * (-1.5), END + t_end * (-0.5)))
inv = path.matrix_world.inverted()
cu = path.data
for sp in list(cu.splines):
    cu.splines.remove(sp)
sp = cu.splines.new("BEZIER")
sp.bezier_points.add(len(pts) - 1)
for b, (co, hl, hr) in zip(sp.bezier_points, pts):
    b.handle_left_type = b.handle_right_type = "FREE"
    b.co, b.handle_left, b.handle_right = inv @ co, inv @ hl, inv @ hr
cu.resolution_u = 64

# arc length
dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
total = L[-1]


def arc_to(pt):
    i = min(range(len(vs)), key=lambda i: (vs[i] - pt).length)
    return L[i]


s1, s2 = arc_to(P1), arc_to(P2)

# monotone cubic through (f, s) knots
xs = [F0, F_GLIDE, F_EYE, F_END]
ys = [0.0, s1, s2, total]
d = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(3)]
m = [d[0], 0.0, 0.0, 0.0]
for i in (1, 2):
    m[i] = 0.0 if d[i - 1] * d[i] <= 0 else 2 / (1 / d[i - 1] + 1 / d[i])
m[3] = 0.0
for i in range(3):                                    # Fritsch-Carlson limiter
    if d[i] == 0:
        m[i] = m[i + 1] = 0
    else:
        a, b = m[i] / d[i], m[i + 1] / d[i]
        h = a * a + b * b
        if h > 9:
            t = 3 / math.sqrt(h)
            m[i], m[i + 1] = t * a * d[i], t * b * d[i]


def s_at(f):
    for i in range(3):
        if f <= xs[i + 1]:
            h = xs[i + 1] - xs[i]
            t = (f - xs[i]) / h
            h00, h10 = 2 * t ** 3 - 3 * t ** 2 + 1, t ** 3 - 2 * t ** 2 + t
            h01, h11 = -2 * t ** 3 + 3 * t ** 2, t ** 3 - t ** 2
            return h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1]
    return total


def point_at(dist):
    for i in range(len(L) - 1):
        if L[i + 1] >= dist:
            t = 0 if L[i + 1] == L[i] else (dist - L[i]) / (L[i + 1] - L[i])
            return vs[i] + (vs[i + 1] - vs[i]) * t
    return vs[-1]


def look_yaw(p):
    dd = C - p
    return math.degrees(math.atan2(-dd.x, dd.y))


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


cc = curves_of(cam)
off = [c for c in cc if c.data_path.endswith("offset_factor")][0]
yaw = [c for c in cc if c.data_path == "rotation_euler" and c.array_index == 2][0]
for c in [off, yaw] + [c for c in cc if c.data_path == "location"]:
    for kk in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(kk)
cam.location = (0, 0, 0)

corr = YAW_END - look_yaw(END)
BLEND = 12                  # frames over which the view hands over from the street to AS
prev = None
last_y = YAW_STREET
rows = []
for f in range(F0, F_END + 1):
    dist = s_at(f)
    p = point_at(dist)
    if f < F_EYE:
        y = YAW_STREET
    else:
        ly = look_yaw(p)
        if prev is None:
            ly = ly % 360                              # start from the north side: ~180
        else:
            while ly - prev > 180:
                ly -= 360
            while ly - prev < -180:
                ly += 360
        prev = ly
        target = ly + corr * smooth((f - F_EYE) / (F_END - F_EYE))
        w = smooth((f - F_EYE) / BLEND)
        y = YAW_STREET + (target - YAW_STREET) * w
        y = min(y, last_y)                             # the turn only ever turns one way
    last_y = y
    off.keyframe_points.insert(f, dist / total).interpolation = "LINEAR"
    yaw.keyframe_points.insert(f, math.radians(y)).interpolation = "LINEAR"
    if f % 12 == 0 or f in (1, F_GLIDE, F_EYE, F_END):
        rows.append((f, [round(v, 1) for v in p], round(y, 1)))
off.update()
yaw.update()

# lens shift: start framing for the end frame when the turn starts
for c in cc:
    if c.data_path in ("shift_x", "shift_y"):
        for kk in c.keyframe_points:
            if 1.5 < kk.co[0] < F_END - 0.5:
                dx = F_EYE - kk.co[0]
                kk.co[0] += dx
                kk.handle_left[0] += dx
                kk.handle_right[0] += dx
        c.update()

bpy.ops.wm.save_mainfile()
print("V22 clean path: length", round(total, 1), "s1", round(s1, 1), "s2", round(s2, 1), rows)
