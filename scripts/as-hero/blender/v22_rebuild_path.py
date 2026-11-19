"""v22 change: rebuild CamPath from the camera's actual positions, so the curve IS the trajectory.

Amit (18 Nov): "why the camera is not on its trajectory path" -> "yes rebuild the path". The gradual
climb was a keyed z offset on top of the path, so the drawn curve no longer matched the camera.

1. Sample the camera's world position on every frame 1..F_END (the current, approved motion).
2. Replace CamPath's spline with one Bezier through the samples at every STEP frames (plus the
   street lift-off, the shoulder pass and the end frame), AUTO handles, no offset tricks.
3. Remove the camera's location keys (the z offset) and re-bake the Follow Path offset per frame:
   each frame's offset is the arc-length position on the new curve nearest to that frame's sample,
   so the motion (speed, climb, turn, end frame) is unchanged.
Yaw and lens-shift keys are untouched. Applied in place to ref-v22-white.blend.
"""
import bpy
from mathutils import Vector

F0, F_END, STEP = 1, 192, 12
EXTRA_KEYS = (18, 24, 30, 36) + tuple(range(120, 193, 4))   # denser at lift-off and in the tight turn

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]


def curves_of(ob):
    act = ob.animation_data.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


# 1. samples
samples = {}
for f in range(F0, F_END + 1):
    s.frame_set(f - 1 if f > F0 else F0 + 1)
    s.frame_set(f)
    samples[f] = cam.matrix_world.translation.copy()

# 2. new spline through key samples
keys = sorted(set(list(range(F0, F_END + 1, STEP)) + list(EXTRA_KEYS) + [F_END]))
inv = path.matrix_world.inverted()
cu = path.data
for sp in list(cu.splines):
    cu.splines.remove(sp)
sp = cu.splines.new("BEZIER")
sp.bezier_points.add(len(keys) - 1)
for b, f in zip(sp.bezier_points, keys):
    b.co = inv @ samples[f]
    b.handle_left_type = b.handle_right_type = "AUTO"
cu.resolution_u = 48

# 3. drop the z offset, re-bake offset by nearest arc length
for c in [c for c in curves_of(cam) if c.data_path == "location"]:
    for k in list(c.keyframe_points)[::-1]:
        c.keyframe_points.remove(k)
cam.location = (0, 0, 0)

dg = bpy.context.evaluated_depsgraph_get()
pe = path.evaluated_get(dg)
me = pe.to_mesh()
vs = [path.matrix_world @ v.co for v in me.vertices]
pe.to_mesh_clear()
L = [0.0]
for a, b in zip(vs, vs[1:]):
    L.append(L[-1] + (b - a).length)
total = L[-1]

off = [c for c in curves_of(cam) if c.data_path.endswith("offset_factor")][0]
for k in list(off.keyframe_points)[::-1]:
    off.keyframe_points.remove(k)
j = 0
worst = 0.0
for f in range(F0, F_END + 1):
    p = samples[f]
    best, bi = 1e9, j
    for i in range(j, len(vs) - 1):                    # monotonic search along the curve
        a, b = vs[i], vs[i + 1]
        ab = b - a
        t = 0.0 if ab.length_squared == 0 else max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
        d = (a + ab * t - p).length
        if d < best:
            best, bi, bt = d, i, t
        elif d > best + 5:
            break
    j = bi
    worst = max(worst, best)
    o = (L[bi] + (L[bi + 1] - L[bi]) * bt) / total
    off.keyframe_points.insert(f, o).interpolation = "LINEAR"
off.update()

bpy.ops.wm.save_mainfile()
check = 0.0
for f in range(F0, F_END + 1, 3):
    s.frame_set(f - 1 if f > F0 else F0 + 1)
    s.frame_set(f)
    check = max(check, (cam.matrix_world.translation - samples[f]).length)
print("V22 rebuilt path:", len(keys), "points, length", round(total, 1), "m, nearest-sample worst",
      round(worst, 3), "m, camera vs old motion worst", round(check, 3), "m")
