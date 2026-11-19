"""Block-out v17: give the cape the real silhouette.

Amit (18 Nov): "shape the cape in blender". In the fal test Wan painted v16's flat rectangular
cloth sheet as a flat square cape. The stand-in must look like the cape in the approved stills:
- narrow where it hangs from the shoulders, flaring wider toward the hem;
- bowed around his back (centre further behind than the edges), not a flat plane;
- vertical folds that grow toward the hem, and a softly curved hem (edges a little shorter).

The square look came mostly from the motion: v16 swung the whole sheet out as one stiff board
(lift -22 deg +-22, flare 26 deg +-24 on the pivot). v17 tilts the board much less and lets the
cloth billow instead: a Displace modifier with a scrolling cloud texture, weighted by the "free"
group so the shoulders stay put and the hem moves most. Wave, material and timing are kept.

Run headless on a copy:
  cp docs/AS_hero/blockout/ref-v16-white.blend docs/AS_hero/blockout/ref-v17-white.blend
  Blender -b docs/AS_hero/blockout/ref-v17-white.blend -P scripts/as-hero/blender/v17_cape_shape.py
"""
import math

import bmesh
import bpy

CAPE_H = 1.05                   # same length as v16
TOP_HALF, HEM_HALF = 0.21, 0.37  # half-width at the shoulders (torso is 0.44 wide) and the hem; v16 was 0.25 flat
BOW_TOP, BOW_HEM = 0.07, 0.13    # how far the centre sits behind the edges
FOLDS, FOLD_DEPTH = 3, 0.035     # vertical folds across the width, depth at the hem
HEM_CURVE = 0.07                 # edges this much shorter than the centre (fraction of length)
X_SEG, Y_SEG = 32, 28

cloth = bpy.data.objects["AS_fig_cape_cloth"]
me = cloth.data

bm = bmesh.new()
bmesh.ops.create_grid(bm, x_segments=X_SEG, y_segments=Y_SEG, size=0.5)   # -0.5..0.5 in x and y
for v in bm.verts:
    u = v.co.x * 2                      # -1 (his right) .. 1 (his left)
    t = 0.5 - v.co.y                    # 0 at the shoulders .. 1 at the hem
    half = TOP_HALF + (HEM_HALF - TOP_HALF) * t ** 0.85
    length = CAPE_H * (1 - HEM_CURVE * u * u)
    bow = (BOW_TOP + (BOW_HEM - BOW_TOP) * t) * (1 - u * u)
    fold = FOLD_DEPTH * t ** 1.2 * math.cos(u * math.pi * FOLDS)
    v.co.x = u * half
    v.co.y = -t * length                # local -Y hangs down (object is rotated 90 deg on X)
    v.co.z = bow + fold                 # local +Z points behind him
bm.to_mesh(me)
bm.free()
me.update()

vg = cloth.vertex_groups["free"]
for v in me.vertices:
    vg.add([v.index], (abs(v.co.y) / CAPE_H) ** 1.3, "REPLACE")

# Less stiff-board swing on the pivot.
LIFT, LIFT_NOISE = math.radians(-12), math.radians(8)
FLARE, FLARE_NOISE = math.radians(10), math.radians(10)
piv = bpy.data.objects["AS_cape_pivot"]
act = piv.animation_data.action
curves = list(getattr(act, "fcurves", None) or
              [c for layer in act.layers for strip in layer.strips for bag in strip.channelbags
               for c in bag.fcurves])
for c in curves:
    if c.data_path == "rotation_euler" and c.array_index in (0, 1):
        base, noise = (LIFT, LIFT_NOISE) if c.array_index == 0 else (FLARE, FLARE_NOISE)
        for k in c.keyframe_points:
            k.co[1] = k.handle_left[1] = k.handle_right[1] = base
        for m in c.modifiers:
            if m.type == "NOISE":
                m.strength = noise * 2

# Billow: scrolling clouds push the cloth behind him, most at the hem.
wind = bpy.data.objects.get("AS_wind") or bpy.data.objects.new("AS_wind", None)
if wind.name not in bpy.context.scene.collection.objects:
    bpy.context.scene.collection.objects.link(wind)
wind.location = (0, 0, 0)
wind.keyframe_insert("location", frame=1)
wind.location = (3.0, 0, 1.2)
wind.keyframe_insert("location", frame=312)
for c in wind.animation_data.action.fcurves if getattr(wind.animation_data.action, "fcurves", None) else []:
    for k in c.keyframe_points:
        k.interpolation = "LINEAR"
tex = bpy.data.textures.get("as_wind_clouds") or bpy.data.textures.new("as_wind_clouds", "CLOUDS")
tex.noise_scale, tex.noise_depth = 0.45, 1
disp = cloth.modifiers.get("billow") or cloth.modifiers.new("billow", "DISPLACE")
disp.texture, disp.texture_coords, disp.texture_coords_object = tex, "OBJECT", wind
disp.direction, disp.strength, disp.mid_level = "Z", 0.22, 0.35
disp.vertex_group = "free"
if cloth.modifiers.find("billow") > cloth.modifiers.find("thick"):
    cloth.modifiers.move(cloth.modifiers.find("billow"), cloth.modifiers.find("thick"))

if bpy.app.background:
    bpy.ops.wm.save_mainfile()
xs = [v.co.x for v in me.vertices]
print("V17 cape verts", len(me.vertices), "width top/hem",
      round(2 * TOP_HALF, 2), round(max(xs) - min(xs), 2))
