"""Block-out v19: end-frame position option 1 and towers lowered behind the copy.

Amit (18 Nov): "option 1, lower the towers behind the copy".
1. The camera's END point moves 2.5 m back, 0.28 m to its left and 0.3 m down (the last point
   of CamPath and its handles). That gives option 1's framing: AS smaller, on the right, his
   raised hand level with the headline. AS himself does not move, so the over-the-shoulder beat
   earlier in the move is unchanged (a first try moved AS instead and lost him at 4-5 s). His
   point is re-aimed at the headline centre and the head turn at the camera. The finger then
   ends just after "superhero.", level with that line.
2. Every tower whose top shows inside the copy area of the held end frame (layout A: copy block
   x 0-900, y 0-520 of the 1440 x 860 hero, i.e. screen x < 0.62 and y > 0.40) is capped so its top
   sits at screen y between FLOOR_LOW and COPY_FLOOR (varied per tower, so no flat wall). The camera is level, so the needed height is exact:
   z = camera z + y' * depth. Its rooftop box (B_) and rim (R_) move down with it. Far towers in
   H_horizon_towers are capped the same way, per tower. Towers right of the copy keep their height.

Run on a copy of v18: Blender -b ref-v19-white.blend -P scripts/as-hero/blender/v19_endframe.py
"""
import math

import bmesh
import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

BACK, RIGHT, UP = 2.5, 0.28, 0.3
F_MOVE1, F_BACK0, F_HOLD = 192, 240, 240
HEADLINE_SCREEN = (0.327, 0.692)
COPY_X_MAX, COPY_Y_MIN, COPY_FLOOR = 0.62, 0.40, 0.385
FLOOR_LOW = 0.30     # capped near towers get a top between FLOOR_LOW and COPY_FLOOR, so no flat wall
MIN_H = 6.0

s = bpy.context.scene
O = bpy.data.objects
fig, head, pivot, cam = O["AS_fig"], O["AS_fig_head"], O["AS_shoulder_R"], s.camera


def curves_of(ob):
    act = ob.animation_data.action
    return list(getattr(act, "fcurves", None) or
                [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
                 for c in bag.fcurves])


# ---------------------------------------------------------------- 1. camera end point, re-aim
s.frame_set(F_HOLD)
fwd = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
fwd.z = 0
fwd.normalize()
right = fwd.cross(Vector((0, 0, 1)))
delta = -(fwd * BACK + right * RIGHT + Vector((0, 0, UP)))
path = O["CamPath"]
end_pt = path.data.splines[0].bezier_points[-1]
for attr in ("co", "handle_left", "handle_right"):
    setattr(end_pt, attr, getattr(end_pt, attr) + delta)
s.frame_set(F_HOLD)

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

# ---------------------------------------------------------------- 2. lower towers behind the copy
s.frame_set(F_HOLD)
cm = cam.matrix_world
cm_inv = np.array(cm.inverted())
cam_z = cm.translation.z
# Normalised view frame at depth 1 (camera space x', y').
fr = [Vector((v.x / -v.z, v.y / -v.z, -1)) for v in cam.data.view_frame(scene=s)]
x0, x1 = min(v.x for v in fr), max(v.x for v in fr)
y0, y1 = min(v.y for v in fr), max(v.y for v in fr)
y_floor = y0 + COPY_FLOOR * (y1 - y0)


def project(pts):
    """pts (N,3) world -> screen x, y (0-1), depth."""
    h = np.c_[pts, np.ones(len(pts))] @ cm_inv.T
    depth = -h[:, 2]
    with np.errstate(divide="ignore", invalid="ignore"):
        sx = (h[:, 0] / depth - x0) / (x1 - x0)
        sy = (h[:, 1] / depth - y0) / (y1 - y0)
    return sx, sy, depth


def needed_top(pts, floor=None):
    """Top z for this tower so no top corner rises into the copy area, or None if clear."""
    sx, sy, depth = project(pts)
    hit = (depth > 1) & (sx > -0.05) & (sx < COPY_X_MAX) & (sy > COPY_Y_MIN)
    if not hit.any():
        return None
    yf = y_floor if floor is None else y0 + floor * (y1 - y0)
    return cam_z + yf * depth[hit].min()


lowered, far_lowered = [], 0
for o in list(O):
    kind = o.name[:2]
    if kind not in ("T_", "F_", "S_") or o.type != "MESH":
        continue
    bb = np.array([list(o.matrix_world @ Vector(c)) for c in o.bound_box])
    base, top = bb[:, 2].min(), bb[:, 2].max()
    tops = bb[bb[:, 2] > top - 1e-4]
    rnd = (sum(map(ord, o.name)) * 7919 % 1000) / 999
    z_new = needed_top(tops, FLOOR_LOW + (COPY_FLOOR - FLOOR_LOW) * rnd)
    if z_new is None or z_new >= top:
        continue
    z_new = max(z_new, base + MIN_H)
    f = (z_new - base) / (top - base)
    o.scale.z *= f
    o.location.z = base + (o.location.z - base) * f
    dz = z_new - top
    sfx = o.name[2:]
    for part in ("B_", "R_"):
        p = O.get(part + sfx)
        if p:
            p.location.z += dz
    lowered.append((o.name, round(top, 1), round(z_new, 1)))

far = O.get("H_horizon_towers")
if far:
    co = np.empty(len(far.data.vertices) * 3)
    far.data.vertices.foreach_get("co", co)
    co = co.reshape(-1, 8, 3)
    world = co @ np.array(far.matrix_world.to_3x3()).T + np.array(far.matrix_world.translation)
    top = world[:, :, 2].max(axis=1)
    is_top = world[:, :, 2] > top[:, None] - 1e-3
    flat = world.reshape(-1, 3)
    sx, sy, depth = project(flat)
    sx, sy, depth = sx.reshape(-1, 8), sy.reshape(-1, 8), depth.reshape(-1, 8)
    hit = is_top & (depth > 1) & (sx > -0.05) & (sx < COPY_X_MAX) & (sy > COPY_Y_MIN)
    rows = hit.any(axis=1)
    dmin = np.where(hit, depth, np.inf).min(axis=1)
    z_new = cam_z + y_floor * dmin
    base = world[:, :, 2].min(axis=1)
    z_new = np.maximum(z_new, base + MIN_H)
    rows &= z_new < top
    world[rows] = np.where(is_top[rows][:, :, None],
                           np.concatenate([world[rows][:, :, :2], np.broadcast_to(
                               z_new[rows][:, None, None], (rows.sum(), 8, 1))], axis=2),
                           world[rows])
    local = (world.reshape(-1, 3) - np.array(far.matrix_world.translation)) @ \
        np.array(far.matrix_world.to_3x3().inverted()).T
    far.data.vertices.foreach_set("co", local.ravel())
    far.data.update()
    far_lowered = int(rows.sum())

if bpy.app.background:
    bpy.ops.wm.save_mainfile()
s.frame_set(F_HOLD)
t = world_to_camera_view(s, cam, O["AS_fig_arm_R"].matrix_world @ Vector((0, 0, -0.5)))
print("V19 cam end", [round(v, 2) for v in cam.matrix_world.translation], "tip", round(t.x, 3), round(t.y, 3), "near towers lowered", len(lowered),
      "far towers lowered", far_lowered)
for row in sorted(lowered, key=lambda r: r[1] - r[2], reverse=True)[:8]:
    print("V19 lowered", row)
