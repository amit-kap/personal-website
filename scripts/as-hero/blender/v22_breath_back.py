"""Block-out v22: the camera move lands on the approved end-frame position with a "breath back".

Amit (18 Nov): "lets edit the camera in blender". The approved style-v2 end still uses option 1:
AS smaller on the right, his raised finger stopping just after the headline. v19 got there by moving
the camera path's end point, which changed the whole arc and lost AS at 4-5 s. v22 leaves the path
and frames 1-144 exactly as in v20 and adds one beat:

1. 144-168 (the 1 s hold before the point): the camera eases back 2.5 m, 0.28 m to its left and
   0.3 m down, by keying the camera object's own location (an offset on top of its Follow Path
   constraint). That lands on option 1's framing just as he starts to raise his arm at 168.
2. His point (frames 192 and 240 keys) is re-aimed at the headline centre and his head turn at the
   camera, for the new camera.
3. Every tower whose top shows behind the copy in the held end frame is capped at varied heights
   (section 2 of v19_endframe.py, run here as is).

Run on a copy of v20:
  cp ref-v20-white.blend ref-v22-white.blend
  Blender -b ref-v22-white.blend -P scripts/as-hero/blender/v22_breath_back.py
"""
import math
import os

import bpy
from mathutils import Vector

BACK, RIGHT, DOWN = 2.5, 0.28, 0.3
F_HOLD0, F_HOLD1 = 144, 168
F_MOVE1, F_BACK0 = 192, 240
HEADLINE_SCREEN = (0.327, 0.692)

s = bpy.context.scene
O = bpy.data.objects
cam, fig, head, pivot = s.camera, O["AS_fig"], O["AS_fig_head"], O["AS_shoulder_R"]


def curves_of(ob):
    act = ob.animation_data.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


# 1. Breath back: keyed offset on the camera's own location.
s.frame_set(F_HOLD0)
fwd = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
fwd.z = 0
fwd.normalize()
right = fwd.cross(Vector((0, 0, 1)))
delta = -(fwd * BACK + right * RIGHT + Vector((0, 0, DOWN)))
base = cam.location.copy()
cam.location = base
cam.keyframe_insert("location", frame=F_HOLD0)
cam.location = base + delta
cam.keyframe_insert("location", frame=F_HOLD1)
cam.location = base
for c in curves_of(cam):
    if c.data_path == "location":
        for k in c.keyframe_points:
            k.interpolation = "BEZIER"
            k.easing = "AUTO"
            k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"
        c.update()

# 2. Re-aim the point and the head turn for the new held camera.
s.frame_set(F_BACK0)
tr, br, bl, tl = cam.data.view_frame(scene=s)
p_cam = bl + (br - bl) * HEADLINE_SCREEN[0] + (tl - bl) * HEADLINE_SCREEN[1]
ray = (cam.matrix_world.to_3x3() @ p_cam).normalized()
dist = (fig.matrix_world.translation - cam.matrix_world.translation).length
target = cam.matrix_world.translation + ray * dist
fig_inv = fig.matrix_world.inverted()
q_point = Vector((0, 0, -1)).rotation_difference((fig_inv @ target - pivot.location).normalized())
for c in curves_of(pivot):
    if c.data_path == "rotation_quaternion":
        for k in c.keyframe_points:
            if round(k.co[0]) in (F_MOVE1, F_BACK0):
                k.co[1] = k.handle_left[1] = k.handle_right[1] = q_point[c.array_index]
cam_local = fig_inv @ cam.matrix_world.translation
yaw = math.atan2(-(cam_local.x - head.location.x), cam_local.y - head.location.y)
for c in curves_of(head):
    if c.data_path == "rotation_euler" and c.array_index == 2:
        for k in c.keyframe_points:
            if round(k.co[0]) in (F_MOVE1, F_BACK0):
                k.co[1] = k.handle_left[1] = k.handle_right[1] = yaw

# 3. Cap the towers behind the copy (v19 section 2).
here = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else \
    "/Users/amitka/Personal/Projects/personal-website/scripts/as-hero/blender"
src = open(os.path.join(here, "v19_endframe.py")).read()
head_src = src[:src.index("# ---------------------------------------------------------------- 1.")]
cap_src = src[src.index("# ---------------------------------------------------------------- 2."):
              src.index("if bpy.app.background:")]
ns = {}
exec(head_src + cap_src, ns)

if bpy.app.background:
    bpy.ops.wm.save_mainfile()
s.frame_set(F_BACK0)
from bpy_extras.object_utils import world_to_camera_view
t = world_to_camera_view(s, cam, O["AS_fig_arm_R"].matrix_world @ Vector((0, 0, -0.5)))
print("V22 delta", [round(v, 2) for v in delta], "tip", round(t.x, 3), round(t.y, 3),
      "towers capped", len(ns["lowered"]))
