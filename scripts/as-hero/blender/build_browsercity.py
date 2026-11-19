"""Browsercity block-out for the AS hero intro.

Grey layout scene only: real-scale browser-window towers, an AS stand-in on a
rooftop, and the three key cameras of the agreed shot. The look is painted on
top later by the image/video models; this scene only fixes geometry, scale and
camera.

Run inside Blender (MCP or `blender -b -P build_browsercity.py`).
Units: metres. AS stands at the origin of his roof, facing -Y.
"""

import math
import random

import bmesh
import bpy
from mathutils import Vector

SEED = 7
AS_HEIGHT = 1.85
AS_ROOF = 170.0          # roof height of AS's tower
BLOCK = 62.0             # street grid pitch
STREET = 16.0            # street width
CITY_RADIUS = 900.0      # towers placed within this radius
CHROME_RADIUS = 450.0    # towers closer than this get browser chrome

random.seed(SEED)


# ---------------------------------------------------------------- reset
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    return scene


# ---------------------------------------------------------------- materials
def facade_material():
    """Grey facade with a window grid at real scale (3 m bays, 3.8 m floors)."""
    mat = bpy.data.materials.new("Facade")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfDiffuse")
    geo = nodes.new("ShaderNodeNewGeometry")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    nsep = nodes.new("ShaderNodeSeparateXYZ")
    absx = nodes.new("ShaderNodeMath")
    absx.operation = "ABSOLUTE"
    comb_x = nodes.new("ShaderNodeCombineXYZ")   # facades facing +-X use (y, z)
    comb_y = nodes.new("ShaderNodeCombineXYZ")   # facades facing +-Y use (x, z)
    mix = nodes.new("ShaderNodeMix")
    mix.data_type = "VECTOR"
    brick = nodes.new("ShaderNodeTexBrick")
    brick.offset = 0.0
    brick.inputs["Scale"].default_value = 1.0
    brick.inputs["Brick Width"].default_value = 3.0
    brick.inputs["Row Height"].default_value = 3.8
    brick.inputs["Mortar Size"].default_value = 0.35
    brick.inputs["Color1"].default_value = (0.62, 0.66, 0.68, 1)
    brick.inputs["Color2"].default_value = (0.60, 0.64, 0.66, 1)
    brick.inputs["Mortar"].default_value = (0.82, 0.82, 0.80, 1)
    # roofs (normal z) should be flat light grey
    absz = nodes.new("ShaderNodeMath")
    absz.operation = "ABSOLUTE"
    roof_mix = nodes.new("ShaderNodeMix")
    roof_mix.data_type = "RGBA"
    roof_mix.inputs["B"].default_value = (0.80, 0.79, 0.76, 1)
    links.new(geo.outputs["Position"], sep.inputs[0])
    links.new(geo.outputs["Normal"], nsep.inputs[0])
    links.new(nsep.outputs["X"], absx.inputs[0])
    links.new(nsep.outputs["Z"], absz.inputs[0])
    links.new(sep.outputs["Y"], comb_x.inputs["X"])
    links.new(sep.outputs["Z"], comb_x.inputs["Y"])
    links.new(sep.outputs["X"], comb_y.inputs["X"])
    links.new(sep.outputs["Z"], comb_y.inputs["Y"])
    links.new(absx.outputs[0], mix.inputs["Factor"])
    links.new(comb_y.outputs[0], mix.inputs["A"])
    links.new(comb_x.outputs[0], mix.inputs["B"])
    links.new(mix.outputs["Result"], brick.inputs["Vector"])
    links.new(absz.outputs[0], roof_mix.inputs["Factor"])
    links.new(brick.outputs["Color"], roof_mix.inputs["A"])
    links.new(roof_mix.outputs["Result"], bsdf.inputs["Color"])
    links.new(bsdf.outputs[0], out.inputs[0])
    return mat


def flat_material(name, rgb):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 1.0
    return mat


# ---------------------------------------------------------------- bmesh helpers
def add_box(bm, cx, cy, z0, sx, sy, sz, mat_index=0):
    """Axis-aligned box: centre (cx, cy), bottom z0, size sx, sy, sz."""
    hx, hy = sx / 2, sy / 2
    v = [bm.verts.new(p) for p in (
        (cx - hx, cy - hy, z0), (cx + hx, cy - hy, z0),
        (cx + hx, cy + hy, z0), (cx - hx, cy + hy, z0),
        (cx - hx, cy - hy, z0 + sz), (cx + hx, cy - hy, z0 + sz),
        (cx + hx, cy + hy, z0 + sz), (cx - hx, cy + hy, z0 + sz))]
    for idx in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
        f = bm.faces.new([v[i] for i in idx])
        f.material_index = mat_index


def add_disc(bm, centre, normal_axis, sign, radius, depth, mat_index, segs=12):
    """Short cylinder sticking out of a facade (a window dot)."""
    cx, cy, cz = centre
    ring_in, ring_out = [], []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        u, w = radius * math.cos(a), radius * math.sin(a)
        if normal_axis == "y":
            p_in = (cx + u, cy, cz + w)
            p_out = (cx + u, cy + sign * depth, cz + w)
        else:
            p_in = (cx, cy + u, cz + w)
            p_out = (cx + sign * depth, cy + u, cz + w)
        ring_in.append(bm.verts.new(p_in))
        ring_out.append(bm.verts.new(p_out))
    cap = bm.faces.new(ring_out if sign > 0 else list(reversed(ring_out)))
    cap.material_index = mat_index
    for i in range(segs):
        j = (i + 1) % segs
        f = bm.faces.new((ring_in[i], ring_in[j], ring_out[j], ring_out[i]))
        f.material_index = mat_index


def add_chrome(bm, cx, cy, sx, sy, top):
    """Browser-window chrome on all four facades near the top of a tower.

    Scale is real: the title band is ~7 m tall and each window dot ~4.5 m
    across, so next to a 1.85 m figure they read as architecture.
    """
    band_h = 7.0
    band_z = top - band_h - 1.5
    depth = 0.6
    for axis, sign in (("y", -1), ("y", 1), ("x", -1), ("x", 1)):
        if axis == "y":
            face_c = cy + sign * sy / 2
            width = sx
            add_box(bm, cx, face_c + sign * depth / 2, band_z, width, depth, band_h, 1)
            # three dots on the left of the band
            for k in range(3):
                dx = -width / 2 + 5.0 + k * 5.5
                add_disc(bm, (cx + dx, face_c + sign * depth, band_z + band_h / 2),
                         "y", sign, 2.2, 0.4, 2)
            # address bar
            bar_w = width * 0.55
            add_box(bm, cx + width * 0.12, face_c + sign * (depth + 0.2),
                    band_z + 1.8, bar_w, 0.4, band_h - 3.6, 3)
        else:
            face_c = cx + sign * sx / 2
            width = sy
            add_box(bm, face_c + sign * depth / 2, cy, band_z, depth, width, band_h, 1)
            for k in range(3):
                dy = -width / 2 + 5.0 + k * 5.5
                add_disc(bm, (face_c + sign * depth, cy + dy, band_z + band_h / 2),
                         "x", sign, 2.2, 0.4, 2)
            bar_w = width * 0.55
            add_box(bm, face_c + sign * (depth + 0.2), cy + width * 0.12,
                    band_z + 1.8, 0.4, bar_w, band_h - 3.6, 3)


def add_roof(bm, cx, cy, sx, sy, top, units=True):
    """Parapet (1.1 m) and a few rooftop units at human scale."""
    t, h = 0.3, 0.45
    add_box(bm, cx, cy - sy / 2 + t / 2, top, sx, t, h, 0)
    add_box(bm, cx, cy + sy / 2 - t / 2, top, sx, t, h, 0)
    add_box(bm, cx - sx / 2 + t / 2, cy, top, t, sy, h, 0)
    add_box(bm, cx + sx / 2 - t / 2, cy, top, t, sy, h, 0)
    if units:
        for _ in range(random.randint(1, 3)):
            ux = cx + random.uniform(-sx / 3, sx / 3)
            uy = cy + random.uniform(-sy / 3, sy / 3)
            add_box(bm, ux, uy, top, random.uniform(3, 6), random.uniform(2, 4),
                    random.uniform(1.8, 3.2), 0)


# ---------------------------------------------------------------- city
def tower_height(dist, cx, cy):
    """AS's tower (170 m) is among the tallest nearby, so his neighbours sit
    below him and the sky stays open behind him; the city keeps going in
    every direction, and taller towers rise past his height further out."""
    r = random.random()
    # in front of him (-Y), where the opening fly-over happens, keep the
    # rooftops below the camera path until far out
    if cy < 0:
        # everything in front of him stays below the fly-over camera, so it
        # looks over the rooftops to the distant skyline (Amit's reference)
        return random.uniform(45, 150)
    # the end frame's left side (x < 0, y > 0) is the headline's sky: low
    # the end frame's text side (x < 0, y > 0): keep the skyline just under
    # his roof so only a low line of city shows and the sky stays open
    if cx < -60 and cy > 0 and dist >= 200:
        return random.uniform(155, 205)
    if dist < 200:
        # immediate neighbours sit below his roof, so no single wall fills
        # the frame behind him
        return random.uniform(90, 150)
    if dist < 450:
        # the skyline he's part of: around his height and above, a few
        # hundred metres out, so it reads as city all around, fading in haze
        return random.uniform(150, 250)
    # far city: mixed, with a skyline of tall towers
    if r < 0.25:
        return random.uniform(200, 320)
    return random.uniform(60, 180)


def build_city(mats):
    me = bpy.data.meshes.new("Browsercity")
    bm = bmesh.new()
    n = int(CITY_RADIUS // BLOCK)
    lot = BLOCK - STREET
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            cx, cy = i * BLOCK, j * BLOCK
            dist = math.hypot(cx, cy)
            if dist > CITY_RADIUS:
                continue
            if i == 0 and j == 0:
                continue  # AS's own tower is built separately
            # one or two towers per lot
            if random.random() < 0.35:
                parts = [(-lot / 4, 0, lot / 2 - 2, lot), (lot / 4, 0, lot / 2 - 2, lot)]
            else:
                parts = [(0, 0, lot, lot)]
            for ox, oy, sx, sy in parts:
                sx *= random.uniform(0.75, 1.0)
                sy *= random.uniform(0.75, 1.0)
                h = tower_height(dist, cx, cy)
                tx, ty = cx + ox, cy + oy
                add_box(bm, tx, ty, 0, sx, sy, h, 0)
                if dist < CHROME_RADIUS:
                    add_chrome(bm, tx, ty, sx, sy, h)
                    add_roof(bm, tx, ty, sx, sy, h)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("Browsercity", me)
    for m in mats:
        obj.data.materials.append(m)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def build_as_tower(mats):
    me = bpy.data.meshes.new("AS_Tower")
    bm = bmesh.new()
    sx = sy = BLOCK - STREET
    # AS stands at the origin, 2 m back from the -Y roof edge
    cx, cy = 0.0, sy / 2 - 2.0
    add_box(bm, cx, cy, 0, sx, sy, AS_ROOF, 0)
    add_chrome(bm, cx, cy, sx, sy, AS_ROOF)
    add_roof(bm, cx, cy, sx, sy, AS_ROOF, units=False)
    # a couple of rooftop units behind him, human scale
    add_box(bm, 9, 14, AS_ROOF, 5, 3, 2.4, 0)
    add_box(bm, -11, 20, AS_ROOF, 3, 3, 3.0, 0)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new("AS_Tower", me)
    for m in mats:
        obj.data.materials.append(m)
    bpy.context.scene.collection.objects.link(obj)
    return obj


# ---------------------------------------------------------------- AS stand-in
def build_as(suit, skin, cape):
    """Simple 1.85 m stand-in, ~7 heads, facing -Y."""
    parts = []
    z = AS_ROOF
    head_h = AS_HEIGHT / 7.0

    def prim(kind, loc, scale, mat, name):
        if kind == "cube":
            bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        elif kind == "sphere":
            bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.5, location=loc)
        else:
            bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.5, depth=1, location=loc)
        o = bpy.context.active_object
        o.scale = scale
        o.name = name
        o.data.materials.append(mat)
        parts.append(o)
        return o

    leg_len = AS_HEIGHT * 0.5
    for sx in (-0.1, 0.1):
        prim("cyl", (sx, 0, z + leg_len / 2), (0.15, 0.15, leg_len), suit, "AS_leg")
    torso_h = AS_HEIGHT * 0.32
    prim("cube", (0, 0, z + leg_len + torso_h / 2), (0.44, 0.24, torso_h), suit, "AS_torso")
    arm_len = AS_HEIGHT * 0.36
    shoulder_z = z + leg_len + torso_h - 0.04
    for sx in (-0.27, 0.27):
        prim("cyl", (sx, 0, shoulder_z - arm_len / 2), (0.1, 0.1, arm_len), suit, "AS_arm")
    prim("sphere", (0, 0, z + AS_HEIGHT - head_h / 2), (head_h * 0.8, head_h * 0.9, head_h), skin, "AS_head")
    # cape: a thin slab hanging behind (+Y) and lifting slightly in the wind
    cp = prim("cube", (0.05, 0.22, shoulder_z - 0.55), (0.55, 0.03, 1.15), cape, "AS_cape")
    cp.rotation_euler = (math.radians(-12), 0, math.radians(8))
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    as_obj = bpy.context.active_object
    as_obj.name = "AS_standin"
    return as_obj


# ---------------------------------------------------------------- cameras
def add_camera(name, loc, target, lens, shift_x=0.0, shift_y=0.0):
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens
    cam_data.sensor_width = 36
    cam_data.shift_x = shift_x
    cam_data.shift_y = shift_y
    cam_data.clip_end = 5000
    cam = bpy.data.objects.new(name, cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    direction = Vector(target) - Vector(loc)
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return cam


def build_cameras():
    z = AS_ROOF
    cams = {}
    # K1: out over the rooftops, looking away from AS toward the city (-Y);
    # the camera will travel backward (+Y) from here toward his shoulder.
    # It flies along the street at x = BLOCK/2 so its path never hits a tower,
    # above the low towers in front of AS, looking down across the rooftops.
    street_x = BLOCK / 2
    cams["K1_rooftops"] = add_camera(
        "K1_rooftops", (street_x, -330, z + 25), (street_x, -1100, z - 55), 32)
    # K2: just behind his right shoulder, at eye height, looking out and a
    # little down over the parapet so the city below him reads.
    cams["K2_over_shoulder"] = add_camera(
        "K2_over_shoulder", (0.6, 1.5, z + 1.95), (-6, -80, z - 9), 32)
    # K3: medium (cowboy) shot from his front-left, slightly low, AS on the
    # right third via lens shift; he faces screen-left toward the city.
    cams["K3_end_medium"] = add_camera(
        "K3_end_medium", (2.6, -3.6, z + 1.05), (0, 0, z + 1.25), 64, shift_x=-0.21, shift_y=0.04)
    return cams


# ---------------------------------------------------------------- world / render
def setup_render(scene):
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in {
        e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    } else "BLENDER_EEVEE"
    scene.render.resolution_x = 1376
    scene.render.resolution_y = 768
    scene.render.film_transparent = False
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.86, 0.88, 0.9, 1)
    bg.inputs["Strength"].default_value = 1.0
    # low sun from behind the city as seen in the end frame
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 3.0
    sun_data.angle = math.radians(2)
    sun = bpy.data.objects.new("Sun", sun_data)
    scene.collection.objects.link(sun)
    # low sun (10 deg) behind the city as seen from the end-frame camera, so
    # its rays come through the gaps between towers toward the camera
    toward = Vector((0.58, -0.81, -0.18)).normalized()
    sun.rotation_euler = toward.to_track_quat("-Z", "Y").to_euler()
    # Haze and light shafts are painted by the image/video models; a world
    # volume here blacks out EEVEE renders, so the block-out stays clear.
    # distance haze via mist pass is added later; Freestyle outlines for read
    scene.render.use_freestyle = True
    scene.render.line_thickness_mode = "ABSOLUTE"
    scene.render.line_thickness = 1.2
    view_layer = scene.view_layers[0]
    lineset = view_layer.freestyle_settings.linesets[0] if view_layer.freestyle_settings.linesets else view_layer.freestyle_settings.linesets.new("Lines")
    if lineset.linestyle is None:
        lineset.linestyle = bpy.data.linestyles.new("Outline")
    lineset.linestyle.color = (0.15, 0.2, 0.25)
    lineset.linestyle.thickness = 1.2


def build():
    scene = reset_scene()
    mats = [
        facade_material(),
        flat_material("ChromeBand", (0.42, 0.48, 0.52)),
        flat_material("WindowDot", (0.9, 0.9, 0.88)),
        flat_material("AddressBar", (0.92, 0.92, 0.9)),
    ]
    build_city(mats)
    build_as_tower(mats)
    build_as(flat_material("AS_suit", (0.85, 0.35, 0.12)),
             flat_material("AS_skin", (0.95, 0.9, 0.8)),
             flat_material("AS_cape", (0.3, 0.45, 0.7)))
    cams = build_cameras()
    setup_render(scene)
    scene.camera = cams["K3_end_medium"]
    return {"objects": len(bpy.data.objects), "cameras": list(cams)}


if __name__ == "__main__":
    build()
