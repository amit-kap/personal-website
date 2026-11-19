"""v22 change: the camera starts low in the street and climbs while it pulls back.

Amit (18 Nov): "ONE single flowing curved motion trajectory - start low in the street and pullback -
climb up and do a turn around until stop at the end frame"; "keep over the shoulder - keep same
timing". Applied in place to ref-v22-white.blend (Amit: keep to v22 only).

Only the first point of CamPath and its outgoing handle change: the path starts at street eye height
(START_Z) and its first handle stays low, so the camera leaves the street level, then rises in one
smooth S-curve to rooftop height before AS's roof edge. Point 2 (over the shoulder) and point 3 (the
turn onto AS) are untouched, as are the camera's yaw keys and the 144-168 breath back.
The frame-84 offset key is re-solved so the camera passes AS's shoulder at frame 84, as before.

Run live in the open v22, or: Blender -b ref-v22-white.blend -P v22_street_start.py
"""
import bpy
from mathutils import Vector

START_Z = 6.0              # street eye height (m); roads are at z = 0
H0_X = -60.9               # first point's outgoing handle: stays low, points along the street
H1_X = -38.9               # second point's incoming handle: long flat run at rooftop height
F_SHOULDER = 84

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
pts = path.data.splines[0].bezier_points

SHOULDER_X = -3.6         # where the camera passes AS's shoulder at frame 84 (v20/v22 before this change)

p0, p1 = pts[0], pts[1]
p0.co.z = START_Z
p0.handle_left.z = START_Z
p0.handle_right = Vector((H0_X, p0.co.y, START_Z))
p1.handle_left = Vector((H1_X, p1.co.y, p1.co.z))


def follow():
    for c in cam.constraints:
        if c.type == "FOLLOW_PATH":
            return c


con = follow()
act = cam.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
off = [c for c in curves if c.data_path.endswith("offset_factor")][0]
key = [k for k in off.keyframe_points if round(k.co[0]) == F_SHOULDER][0]

lo, hi = 0.5, 0.999
for _ in range(40):                                  # solve the offset that passes the shoulder
    mid = (lo + hi) / 2
    key.co[1] = mid
    off.update()
    s.frame_set(F_SHOULDER - 1)                      # force a re-evaluation of the frame
    s.frame_set(F_SHOULDER)
    if cam.matrix_world.translation.x < SHOULDER_X:
        lo = mid
    else:
        hi = mid
key.handle_left[1] = key.handle_right[1] = key.co[1]
off.update()

bpy.ops.wm.save_mainfile()
rows = []
for f in (1, 24, 48, 60, 72, 78, 84, 96, 120, 144):
    s.frame_set(f - 1)
    s.frame_set(f)
    rows.append((f, [round(v, 2) for v in cam.matrix_world.translation]))
print("V22 street start, offset84", round(key.co[1], 4), rows)
