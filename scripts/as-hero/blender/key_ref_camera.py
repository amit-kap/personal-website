"""AS stand-in + camera move for the Seedance motion reference (docs/AS_hero/motion-spec.md).

Run on the white block-out:
  blender -b docs/AS_hero/blockout/ref-v8-white.blend -P scripts/as-hero/blender/key_ref_camera.py

1. Replaces the old box stand-in with a solid-colour AS (blue suit, orange cape, skin head,
   orange chest badge on the front so his facing reads at a glance).
2. Stands him 1 m from the front edge of his roof, looking out over the city (FACING).
3. Keys the camera, 6 s at 24 fps (frames 1-144), one continuous shot:
     1-84    backward glide low over the rooftops toward him, looking where he looks;
             clears his roof edge and passes over his right shoulder
     84-138  pulls back while arcing left (clockwise from above) to the end frame
     138-144 hold: medium closed frame (waist up), AS on the right, three-quarter front
   The camera rides one Bezier curve ("CamPath", auto handles = rounded corners) with a Follow
   Path constraint. Its turn is keyed directly on Z rotation (Bezier), with no aim target, so the
   view turns on one smooth curve. It stays level: no tilt, towers stay vertical.
"""
import math
import os

import bpy
import mathutils
from mathutils import Vector

FPS = 24
F_END = 144      # Amit, 17 Nov: end key at 144 (6 s at 24 fps)
F_ROOF = 48
F_SHOULDER = 84
F_LAND = 144     # end key (three keys: start, turn, end)

ROOF_Z = 120.0
FACING = math.radians(180)    # AS looks along -X, straight out over his roof edge
EDGE_IN = 1.0                 # metres in from the roof edge he faces (set from the tower below)
START_OUT = 70.0  # metres out along his gaze at frame 1 (was 50; Amit wanted more pull-back early)
END_ANGLE = FACING + math.radians(45)  # end camera: three-quarter front, he turns toward screen-left
END_DIST = float(os.environ.get("END_DIST", 3.2))  # at 50 mm, 16:9: cut just below the waist (Amit 17 Nov)
LENS = 50
END_CAM_Z = 121.2             # about his waist
SHIFT_END = (-0.22, float(os.environ.get("SHIFT_END_Y", 0.07)))  # AS at ~72% width; head ~12% from the top
SHIFT_START_Y = 0.0           # no look-down shift: Amit saw it as jitter at the start

scene = bpy.context.scene
objs = bpy.data.objects


def unit(a):
    return Vector((math.cos(a), math.sin(a), 0))


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 2


def lerp(a, b, t):
    return a + (b - a) * t


# Stand him centred on the roof's -X edge (the edge he faces), EDGE_IN metres back from it.
_bb = [objs["AS_tower"].matrix_world @ Vector(c) for c in objs["AS_tower"].bound_box]
P = Vector((min(v.x for v in _bb) + EDGE_IN, (min(v.y for v in _bb) + max(v.y for v in _bb)) / 2, 0))

# ---------- 1. Solid-colour stand-in ----------
for o in list(objs):
    if o.name.startswith(("Cube", "Cylinder", "Sphere", "AS_fig")):
        objs.remove(o, do_unlink=True)


def solid(name, hex_):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    rgb = [int(hex_[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [c ** 2.2 for c in rgb]  # sRGB to linear
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = 0.7
    return m


SUIT = solid("as_suit", "D15E2B")   # red body (Amit, 17 Nov)
CAPE = solid("as_cape", "5979A7")   # blue cape
SKIN = solid("as_skin", "F1DCC4")

root = bpy.data.objects.new("AS_fig", None)
scene.collection.objects.link(root)


def part(name, mat, loc, size, prim="cube"):
    """loc/size in his local frame: +Y = where he looks, +X = his right, Z up from the roof."""
    if prim == "cube":
        bpy.ops.mesh.primitive_cube_add(size=1)
    elif prim == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.5, depth=1)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.5)
    o = bpy.context.active_object
    o.name = "AS_fig_" + name
    o.scale = size
    o.location = loc
    o.data.materials.append(mat)
    o.parent = root
    return o


# 1.85 m tall, about 7.5 heads.
part("leg_L", SUIT, (-0.11, 0, 0.45), (0.16, 0.16, 0.9), "cyl")
part("leg_R", SUIT, (0.11, 0, 0.45), (0.16, 0.16, 0.9), "cyl")
part("torso", SUIT, (0, 0, 1.22), (0.44, 0.24, 0.66))
part("arm_L", SUIT, (-0.29, 0, 1.18), (0.1, 0.12, 0.66))
part("arm_R", SUIT, (0.29, 0, 1.18), (0.1, 0.12, 0.66))
part("head", SKIN, (0, 0, 1.72), (0.21, 0.24, 0.26), "sph")
part("cape", CAPE, (0, -0.16, 1.0), (0.5, 0.03, 1.05))             # behind him

# Local +Y is his gaze; rotate so +Y points along FACING, and stand him on the roof.
root.rotation_euler = (0, 0, FACING - math.pi / 2)
root.location = (P.x, P.y, ROOF_Z)
bpy.context.view_layer.update()
fig_parts = [o for o in objs if o.name.startswith("AS_fig_")]

# (Towers come from build_grid_city.py: a grid laid out around this camera path.)

# ---------- 2. Camera path: one Bezier curve, smooth corners ----------
u = unit(FACING)
right = unit(FACING - math.pi / 2)
OS = -2.0 * u + 0.6 * right       # over the right shoulder, 2 m behind him
OS_Z = 122.1
SHIFT_OS_Y = 0.0                  # no vertical shift until the end framing
os_angle = math.atan2(OS.y, OS.x)
sweep = (os_angle - END_ANGLE) % (2 * math.pi)  # clockwise = camera moves to its left


def at(dist_along_gaze, side, z):
    v = P + dist_along_gaze * u + side * right
    v.z = z
    return v


def around(angle, r, z):
    v = P + r * unit(angle)
    v.z = z
    return v


# Three control points, matching the three keys: start (out over the city), turn (over his
# right shoulder), end (the end-frame camera). AUTO handles round the curve between them.
points = [
    at(START_OUT, 0.6, 123.5),   # same side offset as the shoulder pass: the glide is a straight line
    around(os_angle, OS.length, OS_Z),
    around(END_ANGLE, END_DIST, END_CAM_Z),
]
SHOULDER_INDEX = 1

for name in ("CamPath",):
    if name in objs:
        objs.remove(objs[name], do_unlink=True)
curve = bpy.data.curves.new("CamPath", "CURVE")
curve.dimensions = "3D"
curve.resolution_u = 64
curve.use_path = True
spline = curve.splines.new("BEZIER")
spline.bezier_points.add(len(points) - 1)
for bp, co in zip(spline.bezier_points, points):
    bp.co = co
    bp.handle_left_type = bp.handle_right_type = "AUTO"

# Shape the turn: the handles at "turn" and "end" follow the circle around AS (clockwise), made
# longer than a true circle by TURN_BULGE so the arc swings wide around him instead of cutting in.
TURN_BULGE = float(os.environ.get("TURN_BULGE", 2.0))
IN_HANDLE = float(os.environ.get("IN_HANDLE", 20.0))   # glide-side handle at the turn: long = gentle entry
TURN_W = float(os.environ.get("TURN_W", 0.0))          # 0 = keep glide heading at the turn, 1 = orbit heading
arc_r = (OS.length + END_DIST) / 2
circle_handle = 4 / 3 * math.tan(sweep / 4) * arc_r * TURN_BULGE
turn_bp, end_bp = spline.bezier_points[1], spline.bezier_points[2]
glide_dir = -u                                          # direction of travel on the glide
orbit_dir = unit(os_angle - math.pi / 2)                # clockwise tangent at the turn point
turn_dir = glide_dir.lerp(orbit_dir, TURN_W).normalized()  # blend: rounds the glide into the orbit
turn_dir.z = 0
end_dir = unit(END_ANGLE - math.pi / 2)                 # clockwise tangent at the end point
for bp in (turn_bp, end_bp):
    bp.handle_left_type = bp.handle_right_type = "ALIGNED"
turn_bp.handle_left = turn_bp.co - turn_dir * IN_HANDLE
turn_bp.handle_right = turn_bp.co + turn_dir * circle_handle
end_bp.handle_left = end_bp.co - end_dir * circle_handle
end_bp.handle_right = end_bp.co + end_dir * 0.5
# Keep the glide perfectly straight along his gaze (no sideways drift, so the view doesn't slide).
start_bp = spline.bezier_points[0]
start_bp.handle_left_type = start_bp.handle_right_type = "ALIGNED"
start_bp.handle_right = start_bp.co + glide_dir * IN_HANDLE
start_bp.handle_left = start_bp.co - glide_dir * 1.0
path_obj = bpy.data.objects.new("CamPath", curve)
path_obj.hide_render = True  # visible in the viewport as the trajectory, never in renders
scene.collection.objects.link(path_obj)
bpy.context.view_layer.update()

# Arc-length fraction of each control point, measured on the evaluated curve.
deg = path_obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
samples = [v.co.copy() for v in deg.to_mesh().vertices]
deg.to_mesh_clear()
cum = [0.0]
for a_, b_ in zip(samples, samples[1:]):
    cum.append(cum[-1] + (b_ - a_).length)
total = cum[-1]


def fraction_at(point):
    i = min(range(len(samples)), key=lambda k: (samples[k] - point).length)
    return cum[i] / total


shoulder_frac = fraction_at(points[SHOULDER_INDEX])

cam = scene.camera
cam.animation_data_clear()
cam.data.animation_data_clear()
for c in list(cam.constraints):
    cam.constraints.remove(c)
cam.data.lens = LENS
cam.location = (0, 0, 0)
cam.rotation_euler = (math.pi / 2, 0, 0)  # level; only Z (the turn) is keyed below

follow = cam.constraints.new("FOLLOW_PATH")
follow.target = path_obj
follow.use_fixed_location = True
follow.use_curve_follow = False
follow.forward_axis = "TRACK_NEGATIVE_Z"
follow.up_axis = "UP_Y"

# ---------- 3. Aim: no target. The camera's turn is keyed directly on its Z rotation ----------
# (keys further down), so the view turns on one smooth Bezier curve you can edit in the Graph
# Editor. An aim target that slid from the city onto AS made the view swing mid-move.
if "CamTarget" in objs:
    objs.remove(objs["CamTarget"], do_unlink=True)

scene.frame_start, scene.frame_end = 1, F_END
scene.render.resolution_x, scene.render.resolution_y = 1920, 1080  # 16:9: Seedance ratio, full-bleed web hero
scene.render.fps = FPS
prefs = bpy.context.preferences.edit
prefs.keyframe_new_interpolation_type = "BEZIER"
prefs.keyframe_new_handle_type = "AUTO_CLAMPED"


def key(obj, path, frame, value, index=-1):
    if index < 0:
        setattr(obj, path, value)
    else:
        getattr(obj, path)[index] = value
    obj.keyframe_insert(path, index=index, frame=frame)


# Progress along the path: glide to the shoulder by F_SHOULDER, land by F_LAND, hold.
for f, v in ((1, 0.0), (F_SHOULDER, shoulder_frac), (F_LAND, 1.0)):
    follow.offset_factor = v
    follow.keyframe_insert("offset_factor", frame=f)

# Lens shift: look down on the rooftops, frame him low over the shoulder, then the end framing.
for f, (sx, sy) in ((1, (0.0, SHIFT_START_Y)), (F_SHOULDER, (0.0, SHIFT_OS_Y)),
                    (F_LAND, SHIFT_END)):
    cam.data.shift_x, cam.data.shift_y = sx, sy
    cam.data.keyframe_insert("shift_x", frame=f)
    cam.data.keyframe_insert("shift_y", frame=f)

# Middle keys get AUTO (not clamped) handles so the camera doesn't stop at the shoulder.
def soften(action_owner):
    ad = action_owner.animation_data
    if not ad or not ad.action:
        return
    for layer in getattr(ad.action, "layers", []):
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for kp in fc.keyframe_points:
                        if 1 < kp.co.x < F_LAND:
                            kp.handle_left_type = kp.handle_right_type = "AUTO"


# The camera's own progress keeps clamped handles: it eases into the shoulder pass and out
# again, so the orbit starts slowly. At full glide speed the orbit turned it ~10 degrees a frame.
for owner in (cam.data,):
    soften(owner)


# Flat tangent on the camera's progress at the shoulder key: it settles into the pass over his
# shoulder, then the orbit starts from slow. (Monotonic keys get no flat tangent by default.)
SHOULDER_PACE = float(os.environ.get("SHOULDER_PACE", 0.3))


def fcurves(owner):
    ad = owner.animation_data
    for layer in getattr(ad.action, "layers", []) if ad and ad.action else []:
        for strip in layer.strips:
            for bag in strip.channelbags:
                yield from bag.fcurves


for fc in fcurves(cam):
    if "offset_factor" in fc.data_path:
        for kp in fc.keyframe_points:
            if int(round(kp.co.x)) == 1:
                kp.handle_right_type = "VECTOR"  # already moving at frame 1: no slow ease-in
            if int(round(kp.co.x)) == F_SHOULDER:
                # Smooth through the shoulder without stopping, but slowed (SHOULDER_PACE of
                # the average glide speed) so the orbit doesn't outrun the turn.
                pace = SHOULDER_PACE * kp.co.y / (F_SHOULDER - 1)
                kp.handle_left_type = kp.handle_right_type = "ALIGNED"
                kp.handle_left = (kp.co.x - 10, kp.co.y - pace * 10)
                kp.handle_right = (kp.co.x + 10, kp.co.y + pace * 10)
        fc.update()


# The turn. Z rotation = view heading - 90 deg (with X at 90 the camera looks along +Y).
# Three keys: start and turn look out along his gaze, end looks at him. Bezier handles make the
# turn one smooth curve.
def heading_to_z(h):
    return h - math.pi / 2


def bearing_to_as(frame):
    scene.frame_set(frame)
    c = cam.matrix_world.translation
    return math.atan2(P.y - c.y, P.x - c.x)


z_out = heading_to_z(FACING)
yaw_keys = [(1, z_out), (F_SHOULDER, z_out)]
z_end = heading_to_z(END_ANGLE + math.pi)
while z_end > yaw_keys[-1][1] + math.pi:
    z_end -= 2 * math.pi
yaw_keys += [(F_LAND, z_end)]
for f, z in yaw_keys:
    cam.rotation_euler[2] = z
    cam.keyframe_insert("rotation_euler", index=2, frame=f)
print("YAW_KEYS", [(f, round(math.degrees(z), 1)) for f, z in yaw_keys])

# The orbit starts while the camera is still moving fast, so the turn must start right at the
# shoulder key: flat on the glide side (the camera holds its heading while gliding), steep on the
# orbit side so AS stays in frame while the camera swings around him.
YAW_HANDLE = float(os.environ.get("YAW_HANDLE", 24))              # orbit-side handle length (frames)
YAW_LEFT = float(os.environ.get("YAW_LEFT", 12))                  # glide-side handle length (frames)
for fc in fcurves(cam):
    if fc.data_path == "rotation_euler" and fc.array_index == 2:
        for kp in fc.keyframe_points:
            if int(round(kp.co.x)) == F_SHOULDER:
                # Flat through the turn key (no kink): the camera holds its heading over his
                # shoulder, then turns on one long smooth curve. Long handles spread the turn out.
                kp.co.y = z_out
                kp.handle_left_type = kp.handle_right_type = "ALIGNED"
                kp.handle_left = (kp.co.x - YAW_LEFT, kp.co.y)
                kp.handle_right = (kp.co.x + YAW_HANDLE, kp.co.y)
        fc.update()

# ---------- 4. Collision check (sampled every frame) ----------
path = []
for f in range(1, F_END + 1):
    scene.frame_set(f)
    path.append((f, cam.matrix_world.translation.copy()))
hits = []
for o in objs:
    if o.type != "MESH" or not (o.name.startswith(("T_", "R_", "B_")) or o.name == "AS_tower" or o in fig_parts):
        continue
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    # Roof rims are hollow: their box is the whole roof, so use a smaller margin (0.5 m above).
    m = 0.25 if o in fig_parts else (0.5 if o.name.startswith("R_") else 1.0)
    lo = Vector([min(v[i] for v in bb) - m for i in range(3)])
    hi = Vector([max(v[i] for v in bb) + m for i in range(3)])
    for f, c in path:
        if all(lo[i] < c[i] < hi[i] for i in range(3)):
            hits.append((o.name, f))
            break
_dg = path_obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
_pts = [v.co.copy() for v in _dg.to_mesh().vertices]
_dg.to_mesh_clear()
_k = []
for i in range(1, len(_pts) - 1):
    a_, b_, c_ = _pts[i - 1], _pts[i], _pts[i + 1]
    ab, bc, ac = (b_ - a_).length, (c_ - b_).length, (c_ - a_).length
    area2 = (b_ - a_).cross(c_ - a_).length
    _k.append(area2 / max(ab * bc * ac, 1e-9))
print("CURV max", round(max(_k), 3), "jump", round(max(abs(_k[i + 1] - _k[i]) for i in range(len(_k) - 1)), 4))
print("SWEEP_DEG", round(math.degrees(sweep)), "HITS", hits)

scene.frame_set(F_END)
bpy.ops.wm.save_mainfile()
print("SAVED", bpy.data.filepath)
