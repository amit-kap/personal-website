"""AS hero still: layout block-out from the approved tower design and shot spec.

Approved inputs:
- docs/AS_hero/style.md (palette, tower v2 orange chrome)
- docs/AS_hero/shot-spec.md (still framing, camera, light)

Flat emission shading: every surface shows its exact palette colour (lit or shadow
set by the face's direction to the sun), like the Paper tower drawings.

blender -b --factory-startup -P scripts/as-hero/blender/build_hero_still.py -- <out.png> [seed]
"""

import math
import os
import random
import sys

import bpy
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/hero_still.png"
SEED = int(argv[1]) if len(argv) > 1 else 7
random.seed(SEED)

# ------------------------------------------------------------- units (design -> metres)
U = 0.05                              # 1 design unit = 5 cm (floor 70u = 3.5 m)
CELL_W, CELL_H = 33 * U, 70 * U       # 1.65 m bay, 3.5 m floor
CHROME_H = 58 * U                     # 2.9 m browser chrome band
PX = 2                                # texture pixels per design unit

def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

def lin(h):
    """sRGB hex -> linear RGB for node colour values."""
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in hexrgb(h))

LIT = dict(glass="#5979A7", frame="#F1DCC4", title="#D15E2B", tool="#FFF4E2", pill="#E2C3A0",
           div="#334B6A", dots=["#FFF4E2", "#FAC68B", "#334B6A"])
SHD = dict(glass="#334B6A", frame="#4A605E", title="#A4481F", tool="#D7BFA3", pill="#B89878",
           div="#263A52", dots=["#F1DCC4", "#FAC68B", "#263A52"])
ROOF = "#F1DCC4"
if os.environ.get("PALETTE", "mono") == "mono":
    # Amit 2026-11-16: monotone towers, windows barely visible, chrome in the same shades (no orange)
    LIT = dict(glass="#D5DDE1", frame="#E4E3DC", title="#C3CDD3", tool="#ECEAE3", pill="#D3D8D9",
               div="#BAC5CC", dots=["#AFBAC1", "#AFBAC1", "#AFBAC1"])
    SHD = dict(glass="#9DAEBB", frame="#A8B5BE", title="#8B9DAB", tool="#B2BEC6", pill="#A0AEB8",
               div="#8496A4", dots=["#8E9FAC", "#8E9FAC", "#8E9FAC"])
    ROOF = "#E9E4DA"
SKY_TOP, SKY_HORIZON, HAZE = "#BFD3E2", "#FFF4E2", "#FBEBD6"
HAZE_START, HAZE_END, HAZE_MAX = 70.0, 1100.0, 0.92

# ------------------------------------------------------------- texture drawing (numpy)
def canvas(w, h, col):
    a = np.ones((h, w, 4), dtype=np.float32)
    a[..., :3] = hexrgb(col)
    return a

def rect(a, x, y, w, h, col, r=0):
    """Design units, origin top-left. r = corner radius."""
    H = a.shape[0]
    x0, y0, x1, y1 = x * PX, y * PX, (x + w) * PX, (y + h) * PX
    ys, xs = np.mgrid[0:H, 0:a.shape[1]] + 0.5
    m = (xs >= x0) & (xs < x1) & (ys >= y0) & (ys < y1)
    if r:
        rp = r * PX
        cx = np.clip(xs, x0 + rp, x1 - rp)
        cy = np.clip(ys, y0 + rp, y1 - rp)
        m &= (xs - cx) ** 2 + (ys - cy) ** 2 <= rp * rp
    a[m, :3] = hexrgb(col)

def circle(a, cx, cy, r, col):
    ys, xs = np.mgrid[0:a.shape[0], 0:a.shape[1]] + 0.5
    m = (xs - cx * PX) ** 2 + (ys - cy * PX) ** 2 <= (r * PX) ** 2
    a[m, :3] = hexrgb(col)

def to_image(name, a):
    h, w = a.shape[:2]
    img = bpy.data.images.new(name, w, h, alpha=False)
    img.colorspace_settings.name = "sRGB"
    img.pixels.foreach_set(np.flipud(a).ravel())   # Blender rows go bottom-up
    img.pack()
    return img

def cell_texture(c):
    """One bay x one floor: floor band on top, mullion on the left, glass pane."""
    a = canvas(33 * PX, 70 * PX, c["glass"])
    rect(a, 0, 0, 33, 8, c["frame"])
    rect(a, 0, 0, 3, 70, c["frame"])
    return a

def chrome_texture(n, c):
    W = n * 33
    a = canvas(W * PX, 58 * PX, c["tool"])
    rect(a, 0, 0, W, 24, c["title"])
    tw = min(110, W * 0.38)
    rect(a, 52, 6, tw, 30, c["tool"], r=6)          # tab rising into the title bar
    for k, col in enumerate(c["dots"]):
        circle(a, 12 + k * 12, 12, 3.6, col)
    rect(a, 14, 32, W - 28, 18, c["pill"], r=9)
    rect(a, 0, 55, W, 3, c["div"])
    return a

# ------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"

def emission_mat(name, image=None, color=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(em.outputs[0], out.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    ins = {sk.identifier: sk for sk in mix.inputs}
    ins["B_Color"].default_value = (*lin(HAZE), 1)
    camd = nt.nodes.new("ShaderNodeCameraData")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = HAZE_START
    mr.inputs["From Max"].default_value = HAZE_END
    mr.inputs["To Max"].default_value = HAZE_MAX
    nt.links.new(camd.outputs["View Distance"], mr.inputs["Value"])
    nt.links.new(mr.outputs[0], ins["Factor_Float"])
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.interpolation = "Linear"
        nt.links.new(tex.outputs[0], ins["A_Color"])
    else:
        ins["A_Color"].default_value = (*lin(color), 1)
    nt.links.new({sk.identifier: sk for sk in mix.outputs}["Result_Color"], em.inputs[0])
    return m

MATS = {}
for side, c in (("lit", LIT), ("shd", SHD)):
    MATS[("cell", side)] = emission_mat(f"cell_{side}", to_image(f"cell_{side}", cell_texture(c)))
MATS["roof"] = emission_mat("roof", color=ROOF)

def chrome_mat(n, side):
    key = ("chrome", n, side)
    if key not in MATS:
        c = LIT if side == "lit" else SHD
        MATS[key] = emission_mat(f"chrome_{n}_{side}", to_image(f"chrome_{n}_{side}", chrome_texture(n, c)))
    return MATS[key]

# Sun: low, behind the city on the right (spec). Horizontal direction toward the sun.
SUN = Vector((0.85, 0.55, 0)).normalized()

def tower(name, cx, cy, n1, n2, height, yaw):
    """Box tower: n1 bays along local X, n2 along local Y, real height in metres."""
    w1, w2 = n1 * CELL_W, n2 * CELL_W
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(lx, ly, z):
        return Vector((cx + lx * ca - ly * sa, cy + lx * sa + ly * ca, z))
    corners = [(-w1 / 2, -w2 / 2), (w1 / 2, -w2 / 2), (w1 / 2, w2 / 2), (-w1 / 2, w2 / 2)]
    bays = [n1, n2, n1, n2]
    verts, faces, uvs, mats = [], [], [], []
    mat_list = []
    def mat_index(m):
        if m not in mat_list:
            mat_list.append(m)
        return mat_list.index(m)
    zc = height - CHROME_H
    floors = zc / CELL_H
    for i in range(4):
        a, b = corners[i], corners[(i + 1) % 4]
        pa, pb = P(*a, 0), P(*b, 0)
        normal = (pb - pa).cross(Vector((0, 0, 1))).normalized()
        side = "lit" if normal.dot(SUN) > 0 else "shd"
        n = bays[i]
        # wall below the chrome: UV in bays/floors, counted down from the chrome
        k = len(verts)
        verts += [P(*a, 0), P(*b, 0), P(*b, zc), P(*a, zc)]
        faces.append((k, k + 1, k + 2, k + 3))
        uvs.append([(0, -floors), (n, -floors), (n, 0), (0, 0)])
        mats.append(mat_index(MATS[("cell", side)]))
        # chrome band on top
        k = len(verts)
        verts += [P(*a, zc), P(*b, zc), P(*b, height), P(*a, height)]
        faces.append((k, k + 1, k + 2, k + 3))
        uvs.append([(0, 0), (1, 0), (1, 1), (0, 1)])
        mats.append(mat_index(chrome_mat(n, side)))
    k = len(verts)
    verts += [P(*c, height) for c in corners]
    faces.append((k, k + 1, k + 2, k + 3))
    uvs.append([(0, 0)] * 4)
    mats.append(mat_index(MATS["roof"]))

    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    uvl = me.uv_layers.new()
    for poly, puv in zip(me.polygons, uvs):
        for li, uv in zip(poly.loop_indices, puv):
            uvl.data[li].uv = uv
    for m in mat_list:
        me.materials.append(m)
    for poly, mi in zip(me.polygons, mats):
        poly.material_index = mi
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob

# ------------------------------------------------------------- layout
H0 = 120.0                      # AS's roof height
GRID_YAW = math.radians(35)     # street grid turned so two faces of each tower show
PITCH = 30.0
THIN = random.Random(SEED + 1)
COPY_LINE_TAN = 0.0787   # 60% frame line = 4.5 deg above the horizon at this camera
AS_POS = Vector((0.52, 0.0, H0))

def grid_to_world(i, j):
    x, y = i * PITCH, j * PITCH
    ca, sa = math.cos(GRID_YAW), math.sin(GRID_YAW)
    return x * ca - y * sa, x * sa + y * ca

# AS's own tower
tower("AS_tower", AS_POS.x, AS_POS.y + 0.6 - 9 * CELL_W / 2, 9, 9, H0, 0.0)

for i in range(-40, 41):
    for j in range(-40, 41):
        if i == 0 and j == 0:
            continue
        x, y = grid_to_world(i, j)
        if y < 12 or math.hypot(x, y) > 1600:        # nothing behind the camera
            continue
        dist = math.hypot(x, y)
        if dist < 160:
            # near: tops a few floors below his roof, some on the right rise above him
            h = H0 - random.uniform(6, 30)
            if x > 25 and random.random() < 0.35:
                h = H0 + random.uniform(15, 60)
        else:
            h = random.uniform(50, 175)
        if math.degrees(math.atan2(x, y)) < 6:          # left 55% of the frame (+ margin)
            h = min(h, H0 + 1.0 + (y + 2.5) * COPY_LINE_TAN - 4)
        n1, n2 = random.choice([6, 7, 8, 9, 10]), random.choice([5, 6, 7, 8])
        if dist > 350 and THIN.random() < 0.45:          # more air in the far skyline
            continue
        tower(f"T_{i}_{j}", x, y, n1, n2, h, GRID_YAW)

# ------------------------------------------------------------- AS stand-in (1.85 m)
def prim(kind, loc, scale, color, rot=(0, 0, 0)):
    if kind == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(location=loc, rotation=rot)
    elif kind == "sph":
        bpy.ops.mesh.primitive_uv_sphere_add(location=loc)
    else:
        bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    ob = bpy.context.object
    ob.scale = scale
    ob.data.materials.append(emission_mat(f"as_{color}", color=color))
    return ob

SHOW_AS = os.environ.get("NO_AS") is None
face_yaw = math.atan2(-0.6, -0.8) + math.pi / 2       # facing left-front, toward the copy
b = AS_POS
if SHOW_AS:
    for dx in (-0.11, 0.11):
        off = Vector((dx * math.cos(face_yaw), dx * math.sin(face_yaw), 0))
        prim("cyl", b + off + Vector((0, 0, 0.45)), (0.075, 0.075, 0.45), "#D15E2B")
    prim("cube", b + Vector((0, 0, 1.22)), (0.2, 0.12, 0.33), "#D15E2B", rot=(0, 0, face_yaw))
    prim("sph", b + Vector((0, 0, 1.73)), (0.1, 0.1, 0.12), "#F1DCC4")
    back = Vector((-math.sin(face_yaw), math.cos(face_yaw), 0)) * 0.16
    prim("cube", b + back + Vector((0, 0, 1.0)), (0.26, 0.02, 0.5), "#5979A7", rot=(0, 0, face_yaw))

# ------------------------------------------------------------- sun disc
def flat_mat(name, color):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    em = m.node_tree.nodes["Principled BSDF"] if False else None
    nt = m.node_tree
    nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial")
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = (*lin(color), 1)
    nt.links.new(e.outputs[0], o.inputs[0])
    return m

SUN_DIST = 4000.0
def sun_disc(name, bearing, elev, radius_deg, color):
    b, e = math.radians(bearing), math.radians(elev)
    loc = Vector((math.sin(b) * math.cos(e), math.cos(b) * math.cos(e), math.sin(e))) * SUN_DIST
    loc += Vector((0, -2.3, H0 + 1.0))
    bpy.ops.mesh.primitive_circle_add(vertices=96, radius=SUN_DIST * math.tan(math.radians(radius_deg)),
                                      fill_type="NGON", location=loc)
    ob = bpy.context.object
    ob.name = name
    ob.rotation_euler = (math.radians(90) - e, 0, -b)
    ob.data.materials.append(flat_mat(name, color))
    return ob

sun_disc("Sun", 20.0, 6.0, 4.5, "#FBEBD6")

# ------------------------------------------------------------- camera (spec)
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 35
cam_data.sensor_fit = "HORIZONTAL"
cam_data.sensor_width = 36
cam_data.clip_end = 6000
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
cam.location = (0, -2.3, H0 + 1.0)
cam.rotation_euler = (math.radians(90 + 8), 0, 0)   # looking +Y, tilted up 8 degrees
scene.camera = cam

# ------------------------------------------------------------- world: sky gradient
world = bpy.data.worlds.new("Sky")
scene.world = world
world.use_nodes = True
nt = world.node_tree
nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputWorld")
bg = nt.nodes.new("ShaderNodeBackground")
tc = nt.nodes.new("ShaderNodeTexCoord")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
ramp = nt.nodes.new("ShaderNodeValToRGB")
nt.links.new(tc.outputs["Generated"], sep.inputs[0])
nt.links.new(sep.outputs["Z"], ramp.inputs[0])
ramp.color_ramp.elements[0].position = 0.0
ramp.color_ramp.elements[0].color = (*lin(SKY_HORIZON), 1)
ramp.color_ramp.elements[1].position = 0.45
ramp.color_ramp.elements[1].color = (*lin(SKY_TOP), 1)
nt.links.new(ramp.outputs[0], bg.inputs[0])
nt.links.new(bg.outputs[0], out.inputs[0])

world.mist_settings.start = 150
world.mist_settings.depth = 1300
world.mist_settings.falloff = "LINEAR"

# ------------------------------------------------------------- render + haze composite
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x, scene.render.resolution_y = 1440, 860
scene.render.resolution_percentage = 200
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = OUT

bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(OUT)[0] + ".blend")
bpy.ops.render.render(write_still=True)
print("RENDERED", OUT)
