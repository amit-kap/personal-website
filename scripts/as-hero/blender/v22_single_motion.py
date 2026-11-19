"""v22 change: one single camera motion, street level -> over the shoulder -> end frame, no extra beat.

Amit (18 Nov): "the pull back start at street level - during the pull back going up above the
rooftops to over the shoulder turning to the end frame - one single motion". Applied in place to
ref-v22-white.blend.

1. The 144-168 "breath back" (keyed camera location) is removed.
2. Instead the path's LAST point moves by the same offset (2.5 m back, 0.28 m left, 0.3 m down), with
   its handles, so the turn itself lands on the option 1 end frame at 144.
3. The frame-84 offset key is re-solved by arc length so the camera still passes AS's shoulder at
   x = -3.6 m at frame 84 (v19 failed because this key was left as it was).
Yaw and lens-shift keys are unchanged.
"""
import bpy
from mathutils import Vector

BACK, RIGHT, DOWN = 2.5, 0.28, 0.3
F_SHOULDER, F_END = 84, 144
SHOULDER_X = -3.6

s = bpy.context.scene
cam = s.camera
path = bpy.data.objects["CamPath"]
act = cam.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])

# 1. remove the breath back
for f in (144, 168):
    try:
        cam.keyframe_delete("location", frame=f)
    except RuntimeError:
        pass
cam.location = (0, 0, 0)

# 2. move the path's end point
s.frame_set(F_END - 1)
s.frame_set(F_END)
fwd = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
fwd.z = 0
fwd.normalize()
right = fwd.cross(Vector((0, 0, 1)))
delta = -(fwd * BACK + right * RIGHT + Vector((0, 0, DOWN)))
end_pt = path.data.splines[0].bezier_points[-1]
for attr in ("co", "handle_left", "handle_right"):
    setattr(end_pt, attr, getattr(end_pt, attr) + delta)

# 3. re-solve the shoulder pass by arc length
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
off = [c for c in curves if c.data_path.endswith("offset_factor")][0]
k84 = [k for k in off.keyframe_points if round(k.co[0]) == F_SHOULDER][0]
k84.co[1] = k84.handle_left[1] = k84.handle_right[1] = frac
off.update()

bpy.ops.wm.save_mainfile()
rows = []
for f in (1, 48, 84, 108, 132, 144, 168, 240):
    s.frame_set(1)
    s.frame_set(f)
    rows.append((f, [round(v, 2) for v in cam.matrix_world.translation]))
print("V22 single motion: delta", [round(v, 2) for v in delta], "offset84", round(frac, 4), rows)
