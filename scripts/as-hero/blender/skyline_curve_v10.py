"""Block-out v10: a real skyline, tallest at the centre, lower toward the sides.

Amit (17 Nov): the towers look AI-placed, the horizon is one band of equal heights. Make the
skyline a curve: sides lower than the centre. Centre = the street and the sun, downtown behind the
sun (Amit: yes). Applies to the near towers too (Amit: "apply too").

Only towers ahead of AS (x < CX - AHEAD_MIN) change, so the approved end frame (which looks back
past AS) keeps its background. Positions stay; only heights change, and each tower's roof rim and
rooftop box move with its roof.

Height = dome(angle off the street as seen from the start camera, distance ahead) x variation.
Near the camera's path towers stay below the camera (it flies at 121-123.5 m).

Run on a copy of v9:
  cp docs/AS_hero/blockout/ref-v9-white.blend docs/AS_hero/blockout/ref-v10-white.blend
  Blender -b docs/AS_hero/blockout/ref-v10-white.blend -P scripts/as-hero/blender/skyline_curve_v10.py
"""
import math
import random

import bpy
from mathutils import Vector

AHEAD_MIN = 40.0        # leave towers within 40 m of AS (end-frame background) as they are
CAM_START = (-75.9, -6.2)
PATH_HALF = 45.0        # towers within this of the path's line stay under the camera...
PATH_AHEAD = 400.0      # ...for this far ahead of the start camera
PATH_CAP = 112.0        # camera flies at 121.2-123.5 m
H_SIDE = 48.0           # low edge of the skyline (m)
H_NEAR = 108.0          # dome centre close to the camera
H_DOWNTOWN = 270.0      # dome centre far ahead, behind the sun
DOWNTOWN_FROM, DOWNTOWN_TO = 600.0, 2600.0
SIGMA = 0.30            # dome width (radians off the street; frame half-width is ~0.35)
SEED = 41

objs = bpy.data.objects
bb = [objs["AS_tower"].matrix_world @ Vector(c) for c in objs["AS_tower"].bound_box]
CX = (min(v.x for v in bb) + max(v.x for v in bb)) / 2
CY = (min(v.y for v in bb) + max(v.y for v in bb)) / 2


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


rng = random.Random(SEED)
# Districts: each 4x4-block patch gets its own height factor, so heights come in clusters.
PATCH = 4 * 68.7
district = {}


def district_factor(x, y):
    k = (int(math.floor(x / PATCH)), int(math.floor(y / PATCH)))
    if k not in district:
        district[k] = random.Random(hash(k) & 0xFFFF).choice((0.55, 0.7, 0.85, 1.0, 1.0, 1.15))
    return district[k]


CENTRE_OFFSET = 0.05    # downtown sits slightly right of the street, not on a mirror axis
towers = sorted([o for o in objs if o.name.startswith(("T_", "F_"))], key=lambda o: o.name)
changed = 0
hmax = 0.0
for o in towers:
    x, y = o.location.x, o.location.y
    if x > CX - AHEAD_MIN:
        continue
    d = CAM_START[0] - x                      # distance ahead of the start camera
    lat = y - CAM_START[1]
    theta = math.atan2(lat, max(d, 1.0)) - CENTRE_OFFSET
    # Uneven falloff: the left side drops faster than the right.
    sig = SIGMA * (0.85 if theta < 0 else 1.15)
    peak = H_NEAR + (H_DOWNTOWN - H_NEAR) * smooth(DOWNTOWN_FROM, DOWNTOWN_TO, d)
    # Downtown is a cluster, not a ridge: only the core reaches the peak.
    core = math.exp(-(theta / (sig * 0.45)) ** 2)
    shoulder = math.exp(-(theta / sig) ** 2)
    dome = H_SIDE + (peak - H_SIDE) * (0.55 * shoulder + 0.45 * core)
    r = rng.random()
    if r < 0.05:
        v = rng.uniform(1.2, 1.45)            # rare accents
    elif r < 0.50:
        v = rng.uniform(0.35, 0.7)            # most buildings low or mid
    else:
        v = rng.uniform(0.7, 1.0)
    h = max(16.0, dome * v * district_factor(x, y))
    if abs(lat) < PATH_HALF and -AHEAD_MIN - 40 < d < PATH_AHEAD:
        h = min(h, PATH_CAP - rng.uniform(0, 14))
    old = o.scale.z
    o.scale.z = h
    hmax = max(hmax, h)
    if o.name.startswith("T_"):               # move its roof rim and rooftop box with the roof
        key = o.name[2:]
        for pre in ("R_", "B_"):
            p = objs.get(pre + key)
            if p:
                p.location.z += h - old
    changed += 1

# The road fades to a light ground with distance, so no dark band shows at the horizon.
m = bpy.data.materials["clay_road"]
nt = m.node_tree
bsdf = nt.nodes["Principled BSDF"]
cam = nt.nodes.new("ShaderNodeCameraData")
rmap = nt.nodes.new("ShaderNodeMapRange")
rmap.inputs["From Min"].default_value = 1500.0
rmap.inputs["From Max"].default_value = 4500.0
mix = nt.nodes.new("ShaderNodeMix")
mix.data_type = "RGBA"
mix.inputs[6].default_value = (0.08, 0.08, 0.08, 1)
mix.inputs[7].default_value = (0.62, 0.62, 0.62, 1)
nt.links.new(cam.outputs["View Distance"], rmap.inputs["Value"])
nt.links.new(rmap.outputs["Result"], mix.inputs["Factor"])
nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])

bpy.ops.wm.save_mainfile()
print("V10 changed", changed, "tallest", round(hmax, 1))
