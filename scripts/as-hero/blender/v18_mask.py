"""Block-out v18: an eye mask on the face only, no band around the head.

Amit (18 Nov): "must fix the mask with no band behind his head". v16's mask kept every face of the
head sphere in front of y = 0.12, so it wrapped about 150 degrees round the head and read as a
headband, also in the back views. v18 rebuilds it as a domino mask on the front of the face:
- only faces within about 35 degrees of the face's forward axis (|x| < 0.29 of a 0.5 sphere);
- the top edge lifts toward the outer corners, the bottom edge dips at the cheeks and rises at the
  nose bridge, like the mask on the approved stills;
- the white eye slits are kept, just in front of the mask.

Run on a copy of v17: Blender -b ref-v18-white.blend -P scripts/as-hero/blender/v18_mask.py
"""
import bmesh
import bpy

O = bpy.data.objects
head = O["AS_fig_head"]
HALF_W = 0.29


def top(ax):
    return 0.17 + 0.05 * (ax / HALF_W) ** 2


def bottom(ax):
    return 0.02 - 0.02 * (ax / HALF_W) + 0.035 * max(0.0, 1 - ax / 0.07)


def keep_mask(c):
    ax = abs(c.x)
    return c.y > 0.25 and ax < HALF_W and bottom(ax) < c.z < top(ax)


def keep_eyes(c):
    return c.y > 0.25 and 0.075 < abs(c.x) < 0.21 and 0.07 < c.z < 0.125


def sphere_part(name, keep, grow, mat):
    old = O.get(name)
    if old:
        O.remove(old, do_unlink=True)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=192, v_segments=128, radius=0.5)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not keep(f.calc_center_median())], context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")
    for v in bm.verts:
        v.co *= grow
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = head
    return ob


mask = sphere_part("AS_fig_mask", keep_mask, 1.03, bpy.data.materials["as_cape"])
eyes = sphere_part("AS_fig_mask_eyes", keep_eyes, 1.045, bpy.data.materials["as_mask_eye"])
if bpy.app.background:
    bpy.ops.wm.save_mainfile()
xs = [v.co.x for v in mask.data.vertices]
print("V18 mask verts", len(mask.data.vertices), "width", round(max(xs) - min(xs), 3))
