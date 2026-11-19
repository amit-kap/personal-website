"""Block-out v16: the intro runs on into the point, with a moving cape and a masked face.

Amit (18 Nov): animate the point and the cape in Blender, add the mask to the stand-in's face so it
is clear he looks at the camera, same timing as the point clips (A: 1 s still, 1 s move, 2 s hold).

- Clip runs 312 frames (13 s at 24 fps). Frames 1-144: the camera move, unchanged. The camera holds
  from 144 on (follow-path, fixed position).
- 145-168: AS still, looking left. 169-192: his right arm raises to point at the upper left of the
  frame and his head turns to the camera, together. 193-240: he holds.
  241-264: arm down and head back to the left, together. 265-312: still, looking left: the pose
  the idle loop starts from (Amit: "hand down back to the hold pos - ready for a loop").
- Mask: a curved blue band with two white eye slits on the front of the head, parented to it.
- Cape: the stiff box is replaced by a hanging cloth sheet on a pivot at his shoulders: a slow,
  noisy backward lift and a sideways flare (out to his left, screen right in the end frame) on the
  pivot, plus a Wave modifier rippling down its length, all 240 frames.
- Head: looks 25 deg further left than his body before the turn, so the turn to camera reads.

Run live on ref-v15-white.blend, then save as ref-v16-white.blend.
"""
import math

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Quaternion, Vector

F_END, F_MOVE0, F_MOVE1 = 312, 168, 192
F_BACK0, F_BACK1 = 240, 264          # clip B timing: hold, then arm down and head back
POINT_SCREEN = (0.30, 0.97)       # where the arm aims, in the end frame (x right, y up)
POINT_DEPTH = 5.0                 # metres from the camera along that ray
CAPE_W, CAPE_H = 0.5, 1.05
CAPE_LIFT, CAPE_NOISE = math.radians(-22), math.radians(22)
CAPE_FLARE, CAPE_FLARE_NOISE = math.radians(26), math.radians(24)   # out to his left (screen right)
HEAD_LOOK_LEFT = math.radians(-25)   # before the turn he looks further left, so the turn reads

O = bpy.data.objects
scene = bpy.context.scene
scene.frame_end = F_END
fig = O["AS_fig"]
head = O["AS_fig_head"]
arm = O["AS_fig_arm_R"]
cam = scene.camera


def link(ob):
    scene.collection.objects.link(ob)
    return ob


def child_of(ob, parent, loc=(0, 0, 0)):
    ob.parent = parent
    ob.matrix_parent_inverse = Matrix.Identity(4)
    ob.location = loc
    return ob


def material(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*rgb, 1)
    return m


# ---------------------------------------------------------------- arm: pivot at the shoulder
scene.frame_set(F_MOVE1)
sh_local = Vector((arm.location.x, arm.location.y, arm.location.z + arm.scale.z / 2))
pivot = link(bpy.data.objects.new("AS_shoulder_R", None))
child_of(pivot, fig, sh_local)
pivot.rotation_mode = "QUATERNION"
arm.parent = pivot
arm.matrix_parent_inverse = Matrix.Identity(4)
arm.location = (0, 0, -arm.scale.z / 2)

# Aim: unproject POINT_SCREEN in the held end frame.
frame = cam.data.view_frame(scene=scene)            # tr, br, bl, tl in camera space
tr, br, bl, tl = frame
sx, sy = POINT_SCREEN
p_cam = bl + (br - bl) * sx + (tl - bl) * sy
ray = (cam.matrix_world.to_3x3() @ p_cam).normalized()
target = cam.matrix_world.translation + ray * POINT_DEPTH
scene.frame_set(1)
fig_inv = fig.matrix_world.inverted()
d_local = (fig_inv @ target - sh_local).normalized()
q_point = Vector((0, 0, -1)).rotation_difference(d_local)

for f, q in ((1, Quaternion()), (F_MOVE0, Quaternion()), (F_MOVE1, q_point), (F_BACK0, q_point),
             (F_BACK1, Quaternion()), (F_END, Quaternion())):
    pivot.rotation_quaternion = q
    pivot.keyframe_insert("rotation_quaternion", frame=f)

# ---------------------------------------------------------------- head turn to the camera
scene.frame_set(F_MOVE1)
cam_local = fig_inv @ cam.matrix_world.translation
to_cam = Vector((cam_local.x - head.location.x, cam_local.y - head.location.y))
yaw = math.atan2(-to_cam.x, to_cam.y)               # angle that turns local +Y (front) to the camera
head.rotation_mode = "XYZ"
for f, z in ((1, HEAD_LOOK_LEFT), (F_MOVE0, HEAD_LOOK_LEFT), (F_MOVE1, yaw), (F_BACK0, yaw),
             (F_BACK1, HEAD_LOOK_LEFT), (F_END, HEAD_LOOK_LEFT)):
    head.rotation_euler = (0, 0, z)
    head.keyframe_insert("rotation_euler", frame=f)

# ---------------------------------------------------------------- mask on the head
def sphere_part(name, keep, grow):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=40, radius=0.5)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not keep(f.calc_center_median())], context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    for v in bm.verts:
        v.co *= grow
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


band = sphere_part("AS_fig_mask", lambda c: c.y > 0.12 and 0.0 < c.z < 0.14, 1.03)
band.data.materials.append(bpy.data.materials["as_cape"])
eyes = sphere_part("AS_fig_mask_eyes",
                   lambda c: c.y > 0.2 and 0.07 < abs(c.x) < 0.2 and 0.05 < c.z < 0.095, 1.045)
eyes.data.materials.append(material("as_mask_eye", (0.95, 0.95, 0.93)))
for ob in (band, eyes):
    child_of(ob, head)

# ---------------------------------------------------------------- cape: cloth sheet on a pivot
old = O["AS_fig_cape"]
old.hide_render = old.hide_viewport = True
top = Vector((old.location.x, old.location.y, old.location.z + old.scale.z / 2))
cpiv = link(bpy.data.objects.new("AS_cape_pivot", None))
child_of(cpiv, fig, top)

bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=12, y_segments=28, size=0.5)
for v in bm.verts:                                   # grid -0.5..0.5 -> width CAPE_W, length down -Y
    v.co.x *= CAPE_W
    v.co.y = (v.co.y - 0.5) * CAPE_H
me = bpy.data.meshes.new("AS_cape_cloth")
bm.to_mesh(me)
bm.free()
cloth = link(bpy.data.objects.new("AS_fig_cape_cloth", me))
child_of(cloth, cpiv)
cloth.rotation_euler = (math.radians(90), 0, 0)     # local -Y hangs down, local +Z points behind him
me.materials.append(bpy.data.materials["as_cape"])
vg = cloth.vertex_groups.new(name="free")
for v in me.vertices:
    vg.add([v.index], (abs(v.co.y) / CAPE_H) ** 1.3, "REPLACE")
wave = cloth.modifiers.new("wind", "WAVE")
wave.use_x, wave.use_y, wave.use_normal = False, True, False
wave.height, wave.width, wave.narrowness, wave.speed = 0.14, 0.45, 1.0, -0.02
wave.time_offset, wave.lifetime, wave.damping_time = -400, 0, 0
wave.vertex_group = "free"
solid = cloth.modifiers.new("thick", "SOLIDIFY")
solid.thickness = 0.02

cpiv.rotation_euler = (CAPE_LIFT, CAPE_FLARE, 0)
cpiv.keyframe_insert("rotation_euler", index=0, frame=1)
cpiv.keyframe_insert("rotation_euler", index=1, frame=1)


def fcurves(ob):
    act = ob.animation_data.action
    if getattr(act, "fcurves", None):
        return list(act.fcurves)
    return [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
            for c in bag.fcurves]


for c in fcurves(cpiv):
    if c.data_path == "rotation_euler":
        n = c.modifiers.new("NOISE")
        if c.array_index == 0:
            n.scale, n.strength, n.phase = 16.0, CAPE_NOISE * 2, 3.0
        else:
            n.scale, n.strength, n.phase = 20.0, CAPE_FLARE_NOISE * 2, 11.0

scene.frame_set(F_END)
if bpy.app.background:
    bpy.ops.wm.save_mainfile()
print("V16 point q", [round(x, 3) for x in q_point], "head yaw deg", round(math.degrees(yaw), 1),
      "target", [round(x, 2) for x in target])
