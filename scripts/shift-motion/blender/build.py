"""Shift motion video — Blender build.

The UI animation itself comes from scene.html: blender/export.mjs renders the card's screen content per frame
(cache/face/NNNN.jpg) and the card's motion (cache/states.json). This script rebuilds the card as a real glass
slab in a limbo studio and drives it with that motion, so the 3D (thickness, reflections, shadow, DOF, motion
blur) is real while the UI builds stay identical to the web version.

  blender -b -P blender/build.py                         build + save cache/shift.blend
  blender -b -P blender/build.py -- --stills 60,330,700  build + render those frames to cache/stills/
Env: SHIFT_CACHE=<dir> reads another export (e.g. cache-still from export-offline.mjs);
     SHIFT_LOOK=plate renders for a background plate instead of the limbo studio: Cycles, transparent film and a
     shadow-catcher floor (contact shadow only, no reflection) — composite the PNG over <cache>/bg.png.
     SHIFT_LOOK=plate-eevee is the fast version for whole films: EEVEE, <cache>/bg.png as the camera backplate and a
     soft contact-shadow plane under the card (driven like final.html's floor shadow). SHIFT_RES=960x540 for low res.
  blender -b -P blender/build.py -- --render [a b]       build + render frames [a, b] to cache/render/
Units: 1 Blender unit = 100 CSS px. Z is up, the camera looks down +Y, the floor is z = 0 (the CSS reflection line).
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Matrix, Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.environ.get('SHIFT_CACHE') or os.path.join(HERE, 'cache')
LOOK = os.environ.get('SHIFT_LOOK', 'limbo')
U = 100.0                 # CSS px per unit
PERSP = 2600              # CSS perspective distance
T = 0.18                  # glass thickness (18px)
RAD, SRAD = 0.26, 0.16    # card / screen corner radius
GLOW = float(os.environ.get('SHIFT_GLOW', '0.9'))   # screen emission

data = json.load(open(os.path.join(CACHE, 'states.json')))
FPS, N = data['fps'], data['frames']
SW, SH = data['screen']
PAD, BOTTOM = data['pad'], data['bottom']
FLOOR_CSS = data.get('floor', 932)    # CSS y of the floor line → z = 0 (scene.html: its reflection line)
ORIGIN_Y = data.get('origin', 466)    # CSS perspective-origin y (scene.html's 932px stage: 466; final.html: 540)
W0, H0 = SW + 2 * PAD, SH + 2 * PAD


# ---------------------------------------------------------------- scene reset
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 1, N
    sc.render.resolution_x, sc.render.resolution_y = map(int, os.environ.get('SHIFT_RES', '1920x1080').split('x'))
    engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in engines else 'BLENDER_EEVEE'
    ee = sc.eevee
    ee.taa_render_samples = int(os.environ.get('SHIFT_SAMPLES', '64'))   # final renders: 128
    for k, v in dict(use_raytracing=True, use_shadows=True, use_gtao=True, use_fast_gi=True).items():
        if hasattr(ee, k): setattr(ee, k, v)
    if hasattr(ee, 'ray_tracing_options'):
        ee.ray_tracing_options.resolution_scale = '1'
        ee.ray_tracing_options.use_denoise = True
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.35
    sc.render.motion_blur_position = 'START'   # image-sequence faces must not sample the previous frame
    if hasattr(ee, 'motion_blur_steps'): ee.motion_blur_steps = 2
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = 0
    sc.render.film_transparent = False
    if LOOK == 'plate':
        sc.render.engine = 'CYCLES'
        sc.render.film_transparent = True
        cy = sc.cycles
        cy.samples, cy.use_denoising = 160, True
        try:
            prefs = bpy.context.preferences.addons['cycles'].preferences
            prefs.compute_device_type = 'METAL'
            prefs.get_devices()
            for d in prefs.devices: d.use = True
            cy.device = 'GPU'
        except Exception:
            pass
    sc.render.image_settings.file_format = 'PNG'
    return sc


def css_pt(x, y, z=0.0):
    return Vector(((x - 960) / U, -z / U, (FLOOR_CSS - y) / U))


# ---------------------------------------------------------------- geometry
def rrect(w, h, r, seg=10):
    pts = []
    for cx, cz, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    return pts


def slab(name, w, h, r, t):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    pts = rrect(w, h, r)
    front = bm.faces.new([bm.verts.new((x, -t / 2, z)) for x, z in pts])
    back = bm.faces.new([bm.verts.new((x, t / 2, z)) for x, z in reversed(pts)])
    n = len(pts)
    fv, bv = front.verts, list(reversed(back.verts))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((fv[j], fv[i], bv[i], bv[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    bev = ob.modifiers.new('bevel', 'BEVEL')
    bev.width, bev.segments, bev.limit_method, bev.angle_limit = 0.035, 5, 'ANGLE', math.radians(60)
    ob.modifiers.new('wn', 'WEIGHTED_NORMAL')
    for p in me.polygons: p.use_smooth = True
    return ob


def plate(name, w, h, r, y, facing):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    pts = rrect(w, h, r)
    if facing > 0: pts = list(reversed(pts))
    bm.faces.new([bm.verts.new((x, y, z)) for x, z in pts])
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def cyc():
    """Limbo sweep: floor curving up into a back wall."""
    me = bpy.data.meshes.new('Cyc')
    bm = bmesh.new()
    prof = [(y, 0.0) for y in (-60, -20, 0, 14)]
    R, Y0 = 16, 14
    prof += [(Y0 + R * math.sin(a), R - R * math.cos(a)) for a in [math.radians(90 * i / 16) for i in range(1, 17)]]
    prof += [(Y0 + R, 60)]
    X = 90
    rows = [[bm.verts.new((x, y, z)) for x in (-X, X)] for y, z in prof]
    for a, b in zip(rows, rows[1:]):
        bm.faces.new((a[0], a[1], b[1], b[0]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new('Cyc', me)
    bpy.context.collection.objects.link(ob)
    return ob


# ---------------------------------------------------------------- materials
def nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    return nt, out


def mat_glass():
    m = bpy.data.materials.new('Glass')
    nt, out = nodes(m)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.96, 0.97, 0.98, 1)
    b.inputs['Roughness'].default_value = 0.015
    b.inputs['IOR'].default_value = 1.5
    b.inputs['Transmission Weight'].default_value = 1.0
    nt.links.new(b.outputs[0], out.inputs[0])
    for k, v in dict(use_raytrace_refraction=True, surface_render_method='DITHERED').items():
        if hasattr(m, k): setattr(m, k, v)
    if hasattr(m, 'thickness_mode'): m.thickness_mode = 'SLAB'
    return m


def mat_screen():
    """Face texture (image sequence) as emission under a glossy coat. UVs come from object space so the
    texture can be mirrored per flip state: bx/by (object custom props) = the card's accumulated 180° flips."""
    m = bpy.data.materials.new('Screen')
    nt, out = nodes(m)
    L = nt.links
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    L.new(tc.outputs['Object'], sep.inputs[0])
    bx = nt.nodes.new('ShaderNodeAttribute'); bx.attribute_type = 'OBJECT'; bx.attribute_name = 'bx'
    by = nt.nodes.new('ShaderNodeAttribute'); by.attribute_type = 'OBJECT'; by.attribute_name = 'by'

    def mad(a, b, mul, add):
        m1 = nt.nodes.new('ShaderNodeMath'); m1.operation = 'MULTIPLY'
        L.new(a, m1.inputs[0]); L.new(b, m1.inputs[1])
        m2 = nt.nodes.new('ShaderNodeMath'); m2.operation = 'MULTIPLY_ADD'
        L.new(m1.outputs[0], m2.inputs[0]); m2.inputs[1].default_value = mul; m2.inputs[2].default_value = add
        return m2.outputs[0]
    u = mad(sep.outputs['X'], bx.outputs['Fac'], U / SW, 0.5)
    v = mad(sep.outputs['Z'], by.outputs['Fac'], U / SH, 0.5)
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    L.new(u, comb.inputs['X']); L.new(v, comb.inputs['Y'])

    img = bpy.data.images.load(os.path.join(CACHE, 'face', '0001.jpg'))
    img.source = 'SEQUENCE'
    img.colorspace_settings.name = 'sRGB'
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    tex.extension = 'EXTEND'
    tex.interpolation = 'Cubic'
    iu = tex.image_user
    iu.frame_duration, iu.frame_start, iu.frame_offset = N, 1, 0
    iu.use_auto_refresh = True
    iu.use_cyclic = False
    L.new(comb.outputs[0], tex.inputs['Vector'])

    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0, 0, 0, 1)
    b.inputs['Roughness'].default_value = 0.4
    b.inputs['Specular IOR Level'].default_value = 0.0
    L.new(tex.outputs['Color'], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = GLOW       # < 1: whites keep headroom so the sheen reads
    b.inputs['Coat Weight'].default_value = 1.0
    b.inputs['Coat Roughness'].default_value = 0.012
    b.inputs['Coat IOR'].default_value = 1.6
    L.new(b.outputs[0], out.inputs[0])
    return m


def mat_floor():
    m = bpy.data.materials.new('Limbo')
    nt, out = nodes(m)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = (0.86, 0.865, 0.88, 1)
    b.inputs['Roughness'].default_value = 0.32
    b.inputs['Specular IOR Level'].default_value = 0.45
    nt.links.new(b.outputs[0], out.inputs[0])
    return m


def studio_env(nt):
    """What the glass reflects (never seen directly): a real HDRI room, slightly desaturated and warmed, so the
    coat and edges pick up windows and walls like a real pane. SHIFT_ENV picks blender/hdri/<name>_2k.exr or one of
    Blender's bundled studiolights (interior, studio, courtyard...), SHIFT_ENV_ROT turns it (degrees), SHIFT_ENV_K scales it."""
    L = nt.links
    name = os.environ.get('SHIFT_ENV', 'studio_small_09')
    path = os.path.join(HERE, 'hdri', name + '_2k.exr')    # Poly Haven (CC0) studio HDRIs
    if not os.path.exists(path):
        path = os.path.join(bpy.utils.system_resource('DATAFILES'), 'studiolights', 'world', name + '.exr')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (0, 0, math.radians(float(os.environ.get('SHIFT_ENV_ROT', '90'))))
    L.new(tc.outputs['Generated'], mp.inputs['Vector'])
    env = nt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(path)
    L.new(mp.outputs['Vector'], env.inputs['Vector'])
    hsv = nt.nodes.new('ShaderNodeHueSaturation'); hsv.inputs['Saturation'].default_value = 0.35
    hsv.inputs['Value'].default_value = float(os.environ.get('SHIFT_ENV_K', '1.0'))
    # compress HDR highlights (c / (c + k) · 1.6): windows read as bright shapes, not white-outs over the UI
    kk = nt.nodes.new('ShaderNodeVectorMath'); kk.operation = 'ADD'; kk.inputs[1].default_value = (0.6, 0.6, 0.6)
    L.new(env.outputs['Color'], kk.inputs[0])
    dv = nt.nodes.new('ShaderNodeVectorMath'); dv.operation = 'DIVIDE'
    L.new(env.outputs['Color'], dv.inputs[0]); L.new(kk.outputs[0], dv.inputs[1])
    sc = nt.nodes.new('ShaderNodeVectorMath'); sc.operation = 'SCALE'; sc.inputs['Scale'].default_value = 1.6
    L.new(dv.outputs[0], sc.inputs[0])
    L.new(sc.outputs[0], hsv.inputs['Color'])
    tint = nt.nodes.new('ShaderNodeMix'); tint.data_type = 'RGBA'; tint.blend_type = 'MULTIPLY'
    tint.inputs['Factor'].default_value = 1.0; tint.inputs['B'].default_value = (1.0, 0.975, 0.93, 1)
    L.new(hsv.outputs['Color'], tint.inputs['A'])
    return tint.outputs['Result']


# ---------------------------------------------------------------- build
def build():
    sc = reset()
    w = bpy.data.worlds.new('World'); sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.82, 0.82, 0.84, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55

    shadow = None
    if LOOK == 'plate-eevee':
        # camera rays see the background plate; everything else (glass reflections, ambient) sees warm grey
        nt = w.node_tree
        img = nt.nodes.new('ShaderNodeTexImage'); img.image = bpy.data.images.load(os.path.join(CACHE, 'bg.png')); img.extension = 'EXTEND'
        tc = nt.nodes.new('ShaderNodeTexCoord'); nt.links.new(tc.outputs['Window'], img.inputs['Vector'])
        lp = nt.nodes.new('ShaderNodeLightPath')
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
        nt.links.new(studio_env(nt), mix.inputs['A'])
        nt.links.new(lp.outputs['Is Camera Ray'], mix.inputs['Factor']); nt.links.new(img.outputs['Color'], mix.inputs['B'])
        nt.links.new(mix.outputs['Result'], nt.nodes['Background'].inputs['Color'])
        nt.nodes['Background'].inputs['Strength'].default_value = 1.0
        shadow = contact_shadow()
        if hasattr(w, 'probe_resolution'): w.probe_resolution = '2048'   # sharp softbox edges in reflections
    elif LOOK == 'plate':
        # warm-grey surroundings for the glass to reflect; the floor only catches the card's shadow
        w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.86, 0.85, 0.82, 1)
        w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
        bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
        floor = bpy.context.active_object; floor.name = 'ShadowCatcher'
        floor.is_shadow_catcher = True
    else:
        floor = cyc(); floor.data.materials.append(mat_floor())

    card = slab('Card', W0 / U, H0 / U, RAD, T)
    card.data.materials.append(mat_glass())
    scr = mat_screen()
    plates = []
    for nm, y, f in (('ScreenFront', -T / 2 - 0.0015, -1), ('ScreenBack', T / 2 + 0.0015, 1)):
        p = plate(nm, SW / U, SH / U, SRAD, y, f)
        p.data.materials.append(scr)
        p.parent = card
        p['bx'] = 1.0; p['by'] = 1.0
        plates.append(p)

    cam_d = bpy.data.cameras.new('Camera')
    cam_d.sensor_fit = 'HORIZONTAL'; cam_d.sensor_width = 36
    cam_d.lens = 36 * PERSP / 1920
    cam_d.shift_y = -(540 - ORIGIN_Y) / 1920
    cam_d.clip_start, cam_d.clip_end = 0.1, 400
    cam_d.dof.use_dof = True
    cam_d.dof.aperture_fstop = 2.8
    cam = bpy.data.objects.new('Camera', cam_d)
    sc.collection.objects.link(cam)
    cam.location = css_pt(960, ORIGIN_Y, PERSP)
    cam.rotation_euler = (math.radians(90), 0, 0)
    sc.camera = cam
    focus = bpy.data.objects.new('Focus', None); sc.collection.objects.link(focus)
    cam_d.dof.focus_object = focus

    def area(name, loc, rot, size, energy, sy=None):
        l = bpy.data.lights.new(name, 'AREA')
        l.shape = 'RECTANGLE'; l.size = size; l.size_y = sy or size; l.energy = energy
        o = bpy.data.objects.new(name, l); sc.collection.objects.link(o)
        o.location = loc; o.rotation_euler = [math.radians(a) for a in rot]
        return o
    area('Key', (0, -4, 22), (12, 0, 0), 30, 4500, 18)     # big soft top light: card shadow + cyc falloff
    area('Fill', (0, -40, 8), (82, 0, 0), 40, 2500, 14)    # from behind the camera: lifts the background
    area('Rim', (-26, 14, 14), (60, 0, -120), 10, 2500)    # catches the glass edges
    animate(card, plates, focus, shadow)
    return sc


# ---------------------------------------------------------------- motion
M = Matrix(((1, 0, 0), (0, 0, -1), (0, -1, 0)))   # CSS direction → Blender direction


def rx(a):
    a = math.radians(a); c, s = math.cos(a), math.sin(a)
    return Matrix(((1, 0, 0), (0, c, -s), (0, s, c)))


def ry(a):
    a = math.radians(a); c, s = math.cos(a), math.sin(a)
    return Matrix(((c, 0, s), (0, 1, 0), (-s, 0, c)))


def contact_shadow():
    """A soft dark ellipse on the floor under the card — the HTML version's floor shadow, as a plane."""
    me = bpy.data.meshes.new('ContactShadow')
    me.from_pydata([(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0)], [], [(0, 1, 2, 3)])
    ob = bpy.data.objects.new('ContactShadow', me); bpy.context.collection.objects.link(ob)
    m = bpy.data.materials.new('ContactShadow'); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear(); L = nt.links
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    tc = nt.nodes.new('ShaderNodeTexCoord'); g = nt.nodes.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    L.new(tc.outputs['Object'], g.inputs['Vector'])
    pw = nt.nodes.new('ShaderNodeMath'); pw.operation = 'POWER'; pw.inputs[1].default_value = 1.6; L.new(g.outputs['Fac'], pw.inputs[0])
    op = nt.nodes.new('ShaderNodeAttribute'); op.attribute_type = 'OBJECT'; op.attribute_name = 'op'
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; L.new(pw.outputs[0], mul.inputs[0]); L.new(op.outputs['Fac'], mul.inputs[1])
    k = nt.nodes.new('ShaderNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = 0.42; L.new(mul.outputs[0], k.inputs[0])
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.03, 0.025, 0.018, 1)
    mx = nt.nodes.new('ShaderNodeMixShader'); L.new(k.outputs[0], mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2])
    L.new(mx.outputs[0], out.inputs[0])
    if hasattr(m, 'surface_render_method'): m.surface_render_method = 'BLENDED'
    ob.data.materials.append(m)
    ob.visible_shadow = False
    ob['op'] = 0.0
    return ob


def animate(card, plates, focus, shadow=None):
    """Per-frame keys. CSS swaps faces at 90° (rotation jumps by 180°); here the slab really turns and the
    screen texture mapping is mirrored instead (bx/by), so rotation stays continuous for motion blur."""
    B = Matrix.Identity(3)          # accumulated 180° flips (CSS space, diagonal)
    pending = None
    prev = None
    jumps = []
    for f, s in enumerate(data['states'], start=1):
        RX, RY = s['RX'], s['RY']
        if 'ang' in s:
            ang, axis = s['ang'], s['axis']
            a = ang if ang < 90 else ang - 180
            RXp, RYp = (RX - a, RY) if axis == 'x' else (RX, RY - a)
            flip = rx if axis == 'x' else ry
            pending = flip(180) @ B
            Beff = pending if ang >= 90 else B
            Rvis = rx(RXp) @ ry(RYp) @ flip(a)
            Rphys = rx(RXp) @ ry(RYp) @ flip(ang) @ B
            if prev is not None and prev < 90 <= ang: jumps.append(f - 1)
            prev = ang
        else:
            if pending is not None: B, pending = pending, None
            prev = None
            Beff = B
            Rvis = rx(RX) @ ry(RY)
            Rphys = Rvis @ B
        p = Vector((s.get('px', 0), s.get('py', 0), 0))
        W, H, sc_ = s['W'], s['H'], s['s']
        C = Vector((960, s.get('cy', BOTTOM - H / 2), 0))
        L = C + Vector((s.get('dx', 0), s.get('dy', 0), s.get('z', 0))) + p - Rvis @ p
        loc = css_pt(L.x, L.y, L.z)
        rot = (M @ Rphys @ M.transposed()).to_euler('XYZ', card.rotation_euler)
        card.location = loc
        card.rotation_euler = rot
        card.scale = (sc_ * W / W0, sc_, sc_ * H / H0)
        for path in ('location', 'rotation_euler', 'scale'):
            card.keyframe_insert(path, frame=f)
        for pl in plates:   # read by the screen shader (Attribute node, object scope)
            pl['bx'], pl['by'] = Beff[0][0], Beff[1][1]
            pl.keyframe_insert('["bx"]', frame=f); pl.keyframe_insert('["by"]', frame=f)
        if shadow is not None:   # final.html's floor shadow: width tracks the card's turn, fades when pushed in / lifted
            wx = abs(math.cos(math.radians(RY)))
            shadow.location = (loc.x, loc.y, 0.004)
            shadow.scale = ((W / 1600) * min(sc_, 1.2) * max(wx, 0.06) * 8, 1.3 * (0.8 + 0.2 * abs(math.cos(math.radians(RX)))), 1)
            shadow['op'] = (1 - s.get('zk', 0)) * (0.6 + 0.4 * wx) * (1 - min(1, abs(s.get('z', 0)) / 1400) * 0.85)
            shadow.keyframe_insert('location', frame=f); shadow.keyframe_insert('scale', frame=f); shadow.keyframe_insert('["op"]', frame=f)
        # focus on the zoom target when pushing in, else the card centre
        focus.location = css_pt(L.x + p.x, L.y + p.y, L.z) if p.length > 1 else loc
        focus.keyframe_insert('location', frame=f)

    ad = card.animation_data.action
    for fc in fcurves(ad):
        for k in fc.keyframe_points:
            k.interpolation = 'LINEAR'
            if (fc.data_path == 'location' and int(k.co.x) in jumps):
                k.interpolation = 'CONSTANT'
    for pl in plates:
        for fc in fcurves(pl.animation_data.action):
            for k in fc.keyframe_points: k.interpolation = 'CONSTANT'
    for fc in fcurves(focus.animation_data.action):
        for k in fc.keyframe_points: k.interpolation = 'LINEAR'


def fcurves(action):
    if hasattr(action, 'fcurves') and len(action.fcurves): return list(action.fcurves)
    out = []   # Blender 4.4+ layered actions
    for layer in getattr(action, 'layers', []):
        for strip in layer.strips:
            for bag in strip.channelbags: out += list(bag.fcurves)
    return out


# ---------------------------------------------------------------- main
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
sc = build()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(CACHE, 'shift.blend'))
if argv[:1] == ['--stills']:
    os.makedirs(os.path.join(CACHE, 'stills'), exist_ok=True)
    for f in map(int, argv[1].split(',')):
        sc.frame_set(f)
        sc.render.filepath = os.path.join(CACHE, 'stills', f'f{f:04d}.png')
        bpy.ops.render.render(write_still=True)
elif argv[:1] == ['--render']:
    if len(argv) >= 3: sc.frame_start, sc.frame_end = int(argv[1]), int(argv[2])
    sc.render.filepath = os.path.join(CACHE, 'render', '')
    bpy.ops.render.render(animation=True)
