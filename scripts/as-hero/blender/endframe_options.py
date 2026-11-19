"""End-frame position options: where AS stands so his point lands on the headline.

Amit (18 Nov): "the end frame perfect pos so when he raises his hand it will really be to the text".
Layout A (Paper, hero 1440 x 860): headline at x 120-790, y 200-330; copy block down to y 508.
The 16:9 video is shown with object-fit: cover, so site x = vx * 0.796 - 44.5, site y = vy * 0.796.

Each option moves AS (camera unchanged) BACK metres away from the camera and RIGHT metres to
screen-right, then re-aims his point at the headline centre and re-aims the head turn.
Usage (headless, on a copy; saves only with <save_as>, for STILLS: the camera move is not fixed):
  Blender -b ref-v17-white.blend -P endframe_options.py -- <out.png> <back_m> <right_m> [<up_m> [<save_as.blend>]]
UP lifts him (standing on a low ledge) so the raised hand reaches headline height.
"""
import math
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Quaternion, Vector

args = sys.argv[sys.argv.index("--") + 1:]
out, BACK, RIGHT = args[0], float(args[1]), float(args[2])
UP = float(args[3]) if len(args) > 3 else 0.0
SAVE_AS = args[4] if len(args) > 4 else None   # optional: save the moved scene (stills only)
F_MOVE1, F_BACK0, F_SHOT = 192, 240, 240
HEADLINE_SCREEN = (0.327, 0.692)     # headline centre in camera view (x right, y up)

s = bpy.context.scene
O = bpy.data.objects
fig, head, pivot, cam = O["AS_fig"], O["AS_fig_head"], O["AS_shoulder_R"], s.camera

s.frame_set(F_SHOT)
fwd = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
fwd.z = 0
fwd.normalize()
right = fwd.cross(Vector((0, 0, 1)))
fig.location += fwd * BACK + right * RIGHT + Vector((0, 0, UP))
s.frame_set(F_SHOT)

# Re-aim the point at the headline, in the plane of AS's distance from the camera.
tr, br, bl, tl = cam.data.view_frame(scene=s)
p_cam = bl + (br - bl) * HEADLINE_SCREEN[0] + (tl - bl) * HEADLINE_SCREEN[1]
ray = (cam.matrix_world.to_3x3() @ p_cam).normalized()
dist = (fig.matrix_world.translation - cam.matrix_world.translation).length
target = cam.matrix_world.translation + ray * dist
fig_inv = fig.matrix_world.inverted()
d_local = (fig_inv @ target - pivot.location).normalized()
q_point = Vector((0, 0, -1)).rotation_difference(d_local)

act = pivot.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
for c in curves:
    if c.data_path == "rotation_quaternion":
        for k in c.keyframe_points:
            if round(k.co[0]) in (F_MOVE1, F_BACK0):
                k.co[1] = q_point[c.array_index]
                k.handle_left[1] = k.handle_right[1] = k.co[1]

# Re-aim the head turn at the camera.
cam_local = fig_inv @ cam.matrix_world.translation
yaw = math.atan2(-(cam_local.x - head.location.x), cam_local.y - head.location.y)
hact = head.animation_data.action
hcurves = list(getattr(hact, "fcurves", None) or
               [c for layer in hact.layers for strip in layer.strips for bag in strip.channelbags
                for c in bag.fcurves])
for c in hcurves:
    if c.data_path == "rotation_euler" and c.array_index == 2:
        for k in c.keyframe_points:
            if round(k.co[0]) in (F_MOVE1, F_BACK0):
                k.co[1] = k.handle_left[1] = k.handle_right[1] = yaw

s.frame_set(F_SHOT)
tip = O["AS_fig_arm_R"].matrix_world @ Vector((0, 0, -0.5))
t = world_to_camera_view(s, cam, tip)
h = world_to_camera_view(s, cam, head.matrix_world.translation)
print("OPTION back", BACK, "right", RIGHT, "up", UP, "dist", round(dist, 2),
      "tip", round(t.x, 3), round(t.y, 3), "head", round(h.x, 3), round(h.y, 3))
s.render.resolution_percentage = 100
s.render.filepath = out
bpy.ops.render.render(write_still=True)
if SAVE_AS:
    bpy.ops.wm.save_as_mainfile(filepath=SAVE_AS, copy=True)
