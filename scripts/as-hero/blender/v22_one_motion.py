"""v22 change: one continuous motion - the turn rides on the travel, and the arc hugs AS.

Amit (18 Nov): "not working - tighten the curve around the AS - remove the extra camera tilt to the
figure - all is one continuous motion". With separate yaw keys (1, 84, 144) and an ease-out on the
travel, the camera had almost stopped by ~120 and then kept panning on the spot to find AS.

1. Tighter arc: the shoulder point's outgoing handle and the end point's incoming handle are
   shortened to ARC_SCALE of their length, so the curve wraps closely round AS.
2. The camera yaw is no longer keyed on its own. It is baked per frame from the path progress:
   yaw stays down the street until the shoulder fraction, then turns with the same ease as the travel
   (smoothstep over the remaining path), so rotation and travel finish together at 144.
3. The frame-84 shoulder pass and the ease-out travel are re-solved for the new path length.
Applied in place to ref-v22-white.blend.
"""
import math

import bpy

ARC_SCALE = 1.0           # already tightened to 0.5 in the first run of this script
SHOULDER_X, F0, F_SH, F_END = -3.6, 1, 84, 144
F_TURN0 = 84              # the turn starts at the shoulder pass (66 lost AS from frame at 84)
YAW_STREET, YAW_END = math.radians(90), math.radians(-45)

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
pts = path.data.splines[0].bezier_points
p1, p2 = pts[1], pts[2]
for pt, side in ((p1, "handle_right"), (p2, "handle_left")):
    pt.handle_left_type = pt.handle_right_type = "FREE"
    h = getattr(pt, side)
    setattr(pt, side, pt.co + (h - pt.co) * ARC_SCALE)

# arc length and shoulder fraction
dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
frac = L[next(i for i, v in enumerate(vs) if v.x >= SHOULDER_X)] / L[-1]
u_sh = (F_SH - F0) / (F_END - F0)
P = math.log(1 - frac) / math.log(1 - u_sh)

act = cam.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
off = [c for c in curves if c.data_path.endswith("offset_factor")][0]
yaw = [c for c in curves if c.data_path == "rotation_euler" and c.array_index == 2][0]
for c in (off, yaw):
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


o_turn0 = 1 - (1 - (F_TURN0 - F0) / (F_END - F0)) ** P
for f in range(F0, F_END + 1):
    u = (f - F0) / (F_END - F0)
    o = 1 - (1 - u) ** P
    off.keyframe_points.insert(f, o).interpolation = "LINEAR"
    turn = smooth((o - o_turn0) / (1 - o_turn0)) if o > o_turn0 else 0.0
    yaw.keyframe_points.insert(f, YAW_STREET + (YAW_END - YAW_STREET) * turn).interpolation = "LINEAR"
off.update()
yaw.update()

bpy.ops.wm.save_mainfile()
rows = []
for f in (60, 66, 72, 78, 84, 96, 108, 120, 132, 144):
    s.frame_set(1)
    s.frame_set(f)
    rows.append((f, [round(v, 1) for v in cam.matrix_world.translation], round(math.degrees(cam.rotation_euler.z), 1)))
print("V22 one motion: path", round(L[-1], 1), "frac", round(frac, 4), "P", round(P, 3), rows)
