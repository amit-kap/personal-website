"""Browsercity tower kit + toon look.

Three browser-window tower types modelled from Amit's city reference
(docs/AS_hero/browser-city-ref-1.jpeg):

- A "window": rounded vertical corners, framed roof rim, title band with a
  tab bump, three window dots and an address-bar pill, a few large panes.
- B "tab":    square tower whose title band has a raised browser tab on top.
- C "slim":   slim tower, dots and a short pill only.

Toon look: every surface is diffuse light quantised to two flat tones (lit
cream / shadow teal) and emitted flat, plus Freestyle monoline outlines.

Units: metres. A tower stands on z = 0 with its front facing -Y.
"""

import math
import random
import zlib

import bpy

# ---------------------------------------------------------------- palette
CREAM = (0.955, 0.885, 0.79)        # lit faces
TEAL = (0.33, 0.47, 0.49)           # shadow faces
CREAM_SHADE = (0.86, 0.76, 0.64)
TEAL_DARK = (0.24, 0.35, 0.38)
PILL = (0.80, 0.81, 0.80)
LINE = (0.13, 0.18, 0.24)
DOT_COLOURS = ((0.86, 0.33, 0.30), (0.90, 0.63, 0.30), (0.45, 0.66, 0.36))


def srgb(c):
    """Rough sRGB -> linear so the colours above read as authored."""
    return tuple(pow(v, 2.2) for v in c)


# ---------------------------------------------------------------- materials
_MAT_CACHE = {}


def toon_material(name, lit, shade, panes=None):
    """Two-tone cel material. panes=(w, h) adds thin pane lines on facades."""
    key = (name, lit, shade, panes)
    if key in _MAT_CACHE:
        return _MAT_CACHE[key]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    n, l = nt.nodes, nt.links
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    diff = n.new("ShaderNodeBsdfDiffuse")
    s2r = n.new("ShaderNodeShaderToRGB")
    bw = n.new("ShaderNodeRGBToBW")
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (*srgb(shade), 1)
    ramp.color_ramp.elements[1].position = 0.35
    ramp.color_ramp.elements[1].color = (*srgb(lit), 1)
    emit = n.new("ShaderNodeEmission")
    l.new(diff.outputs[0], s2r.inputs[0])
    l.new(s2r.outputs["Color"], bw.inputs[0])
    l.new(bw.outputs[0], ramp.inputs["Fac"])
    colour = ramp.outputs["Color"]
    if panes:
        # thin pane lines: brick mortar on facades, flat on roofs
        geo = n.new("ShaderNodeNewGeometry")
        sep = n.new("ShaderNodeSeparateXYZ")
        nsep = n.new("ShaderNodeSeparateXYZ")
        absx = n.new("ShaderNodeMath"); absx.operation = "ABSOLUTE"
        absz = n.new("ShaderNodeMath"); absz.operation = "ABSOLUTE"
        cx = n.new("ShaderNodeCombineXYZ")
        cy = n.new("ShaderNodeCombineXYZ")
        mixv = n.new("ShaderNodeMix"); mixv.data_type = "VECTOR"
        brick = n.new("ShaderNodeTexBrick")
        brick.offset = 0.0
        brick.inputs["Scale"].default_value = 1.0
        brick.inputs["Brick Width"].default_value = panes[0]
        brick.inputs["Row Height"].default_value = panes[1]
        brick.inputs["Mortar Size"].default_value = 0.1
        brick.inputs["Mortar Smooth"].default_value = 0.0
        brick.inputs["Color1"].default_value = (1, 1, 1, 1)
        brick.inputs["Color2"].default_value = (1, 1, 1, 1)
        brick.inputs["Mortar"].default_value = (0, 0, 0, 1)
        # use the colour (white bricks, black mortar) as the pane mask
        brick_mask = brick.outputs["Color"]
        roofmask = n.new("ShaderNodeMath"); roofmask.operation = "GREATER_THAN"
        roofmask.inputs[1].default_value = 0.5
        linefac = n.new("ShaderNodeMath"); linefac.operation = "SUBTRACT"
        linefac.inputs[0].default_value = 1.0
        nolines_on_roof = n.new("ShaderNodeMath"); nolines_on_roof.operation = "MINIMUM"
        invroof = n.new("ShaderNodeMath"); invroof.operation = "SUBTRACT"
        invroof.inputs[0].default_value = 1.0
        mixc = n.new("ShaderNodeMix"); mixc.data_type = "RGBA"
        # pane lines: a soft darker line, not the outline colour
        mixc.inputs["B"].default_value = (*srgb(TEAL_DARK), 1)
        mixc.inputs["Factor"].default_value = 0.0
        l.new(geo.outputs["Position"], sep.inputs[0])
        l.new(geo.outputs["Normal"], nsep.inputs[0])
        l.new(nsep.outputs["X"], absx.inputs[0])
        l.new(nsep.outputs["Z"], absz.inputs[0])
        l.new(sep.outputs["Y"], cx.inputs["X"]); l.new(sep.outputs["Z"], cx.inputs["Y"])
        l.new(sep.outputs["X"], cy.inputs["X"]); l.new(sep.outputs["Z"], cy.inputs["Y"])
        l.new(absx.outputs[0], mixv.inputs["Factor"])
        l.new(cy.outputs[0], mixv.inputs["A"]); l.new(cx.outputs[0], mixv.inputs["B"])
        l.new(mixv.outputs["Result"], brick.inputs["Vector"])
        # white on panes, black on lines -> 1 - mask = 1 on pane lines
        to_bw = n.new("ShaderNodeRGBToBW")
        l.new(brick_mask, to_bw.inputs[0])
        l.new(to_bw.outputs[0], linefac.inputs[1])
        l.new(absz.outputs[0], roofmask.inputs[0])
        l.new(roofmask.outputs[0], invroof.inputs[1])            # 0 on roofs
        l.new(linefac.outputs[0], nolines_on_roof.inputs[0])
        l.new(invroof.outputs[0], nolines_on_roof.inputs[1])
        soften = n.new("ShaderNodeMath"); soften.operation = "MULTIPLY"
        soften.inputs[1].default_value = 0.45
        l.new(nolines_on_roof.outputs[0], soften.inputs[0])
        l.new(soften.outputs[0], mixc.inputs["Factor"])
        l.new(colour, mixc.inputs["A"])
        colour = mixc.outputs["Result"]
    colour = _haze_and_grain(n, l, colour)
    l.new(colour, emit.inputs["Color"])
    l.new(emit.outputs[0], out.inputs["Surface"])
    _MAT_CACHE[key] = mat
    return mat


HAZE = (0.98, 0.92, 0.84)     # matches the sky near the horizon
HAZE_START, HAZE_END = 700.0, 2600.0


def _haze_and_grain(n, l, colour):
    """Distance haze (fade toward the horizon sky colour) and a fine screen
    grain, done in the material so no compositor setup is needed."""
    cam = n.new("ShaderNodeCameraData")
    rng = n.new("ShaderNodeMapRange")
    rng.inputs["From Min"].default_value = HAZE_START
    rng.inputs["From Max"].default_value = HAZE_END
    rng.inputs["To Min"].default_value = 0.0
    rng.inputs["To Max"].default_value = 0.82
    rng.clamp = True
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs["B"].default_value = (*srgb(HAZE), 1)
    l.new(cam.outputs["View Distance"], rng.inputs["Value"])
    l.new(rng.outputs["Result"], mix.inputs["Factor"])
    l.new(colour, mix.inputs["A"])
    # texture like the reference: visible fine grain (+-8%) plus soft
    # mottled variation across surfaces (+-5%)
    tc = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexWhiteNoise")
    noise.noise_dimensions = "2D"
    scale = n.new("ShaderNodeVectorMath"); scale.operation = "SCALE"
    scale.inputs["Scale"].default_value = 700.0
    l.new(tc.outputs["Window"], scale.inputs[0])
    l.new(scale.outputs[0], noise.inputs["Vector"])
    mottle = n.new("ShaderNodeTexNoise")
    mottle.inputs["Scale"].default_value = 0.08
    mottle.inputs["Detail"].default_value = 3.0
    l.new(tc.outputs["Object"], mottle.inputs["Vector"])
    fine = n.new("ShaderNodeMath"); fine.operation = "MULTIPLY_ADD"
    fine.inputs[1].default_value = 0.34
    fine.inputs[2].default_value = 0.83
    l.new(noise.outputs["Value"], fine.inputs[0])
    soft = n.new("ShaderNodeMath"); soft.operation = "MULTIPLY_ADD"
    soft.inputs[1].default_value = 0.10
    soft.inputs[2].default_value = 0.95
    l.new(mottle.outputs["Fac"], soft.inputs[0])
    centre = n.new("ShaderNodeMath"); centre.operation = "MULTIPLY"
    l.new(fine.outputs[0], centre.inputs[0])
    l.new(soft.outputs[0], centre.inputs[1])
    grain = n.new("ShaderNodeVectorMath"); grain.operation = "MULTIPLY"
    l.new(mix.outputs["Result"], grain.inputs[0])
    comb = n.new("ShaderNodeCombineXYZ")
    for k in ("X", "Y", "Z"):
        l.new(centre.outputs[0], comb.inputs[k])
    l.new(comb.outputs[0], grain.inputs[1])
    return grain.outputs[0]


def flat_material(name, rgb):
    """Unlit flat colour (window dots)."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    n = mat.node_tree.nodes
    n.clear()
    out = n.new("ShaderNodeOutputMaterial")
    emit = n.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (*srgb(rgb), 1)
    mat.node_tree.links.new(emit.outputs[0], out.inputs["Surface"])
    return mat


# ---------------------------------------------------------------- shape helpers
def rounded_rect_curve(name, w, h, r, extrude, holes=()):
    """Filled 2D rounded rectangle (optionally with rounded-rect holes),
    extruded symmetrically by `extrude` along local Z."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = extrude
    cu.resolution_u = 6

    def add(wi, hi, ri, cx=0.0, cy=0.0):
        ri = max(0.001, min(ri, wi / 2 - 0.001, hi / 2 - 0.001))
        sp = cu.splines.new("BEZIER")
        hw, hh = wi / 2, hi / 2
        # two points per corner, counter-clockwise from the top of the right edge
        P = [
            (cx + hw, cy + hh - ri), (cx + hw - ri, cy + hh),
            (cx - hw + ri, cy + hh), (cx - hw, cy + hh - ri),
            (cx - hw, cy - hh + ri), (cx - hw + ri, cy - hh),
            (cx + hw - ri, cy - hh), (cx + hw, cy - hh + ri),
        ]
        sp.bezier_points.add(len(P) - 1)
        k = 0.5523 * ri
        for i, (px, py) in enumerate(P):
            bp = sp.bezier_points[i]
            bp.co = (px, py, 0)
            bp.handle_left_type = bp.handle_right_type = "FREE"
            # handles: along the straight edge for edge points, toward corner for arc
            nxt = P[(i + 1) % len(P)]
            prv = P[i - 1]
            dx_n, dy_n = nxt[0] - px, nxt[1] - py
            dx_p, dy_p = prv[0] - px, prv[1] - py
            ln = math.hypot(dx_n, dy_n) or 1
            lp = math.hypot(dx_p, dy_p) or 1
            if i % 2 == 0:   # start of a corner arc (arc goes to next point)
                # tangent along the incoming straight edge direction
                tx, ty = -dx_p / lp, -dy_p / lp
                bp.handle_right = (px + tx * k, py + ty * k, 0)
                bp.handle_left = (px - tx * k, py - ty * k, 0)
            else:            # end of a corner arc
                tx, ty = dx_n / ln, dy_n / ln
                bp.handle_left = (px - tx * k, py - ty * k, 0)
                bp.handle_right = (px + tx * k, py + ty * k, 0)
        sp.use_cyclic_u = True

    add(w, h, r)
    for hw_, hh_, hr_ in holes:
        add(hw_, hh_, hr_)
    obj = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def to_mesh(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return bpy.context.active_object


def box(name, loc, size, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    return o


def disc_on_front(name, x, y_front, z, radius, mat, depth=0.35):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=radius, depth=depth,
                                        location=(x, y_front - depth / 2, z),
                                        rotation=(math.radians(90), 0, 0))
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(mat)
    return o


def pill_on_front(name, x, y_front, z, w, h, mat, depth=0.3, segs=16):
    """Address-bar pill: a stadium traced as a plain polygon (two sampled
    half-circles). The earlier Bezier version filled only its top half."""
    r = h / 2
    half = max(0.0, w / 2 - r)
    pts = []
    for i in range(segs + 1):                     # right half-circle, bottom -> top
        a = -math.pi / 2 + math.pi * i / segs
        pts.append((x + half + r * math.cos(a), z + r * math.sin(a)))
    for i in range(segs + 1):                     # left half-circle, top -> bottom
        a = math.pi / 2 + math.pi * i / segs
        pts.append((x - half + r * math.cos(a), z + r * math.sin(a)))
    o = _flush_poly(name, pts, y_front, mat, depth=depth)
    return o


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    j = bpy.context.active_object
    j.name = name
    return j


# ---------------------------------------------------------------- tower types
def _mats():
    return {
        # sparse divider lines (a vertical every 11 m, a horizontal every
        # 48 m) instead of a window grid, like the reference
        "body": toon_material("Body", CREAM, TEAL, panes=(11.0, 48.0)),
        "band": toon_material("Band", CREAM, TEAL),
        "tab": toon_material("Tab", CREAM_SHADE, TEAL_DARK),
        # title-bar strip: a darker tone of the facade on both lit and shadow sides
        "bar": toon_material("TitleBar", (0.86, 0.77, 0.66), (0.25, 0.37, 0.40)),
        "line": toon_material("Divider", (0.55, 0.52, 0.48), (0.17, 0.25, 0.30)),
        "rim": toon_material("Rim", CREAM, TEAL),
        # light grey pill on both lit and shadow faces, like the reference
        # address pill: light grey, a little darker on shadow faces
        "pill": toon_material("Pill", (0.84, 0.85, 0.84), (0.70, 0.74, 0.75)),
        "dots": [flat_material(f"Dot{i}", c) for i, c in enumerate(DOT_COLOURS)],
    }


def _roof_rim(name, w, d, r, top, mats, rim=3.0, height=5.0):
    """Thick chamfered frame around a recessed roof deck, like a window
    frame seen from above (the reference's rooftops). The frame starts a
    little below the roof line so its chamfer reads as the building's crown."""
    # flush with the facade (same footprint, no overhang), rising from the
    # roof line; the chamfer slopes its inner edge down into the deck
    if r > 0.5:
        o = rounded_rect_curve(name, w, d, r, height / 2,
                               holes=((w - 2 * rim, d - 2 * rim, max(0.01, r - rim)),))
    else:
        # square towers: plain polygon ring. A near-zero corner radius left
        # sliver faces that the chamfer turned into stray diagonal lines.
        cu = bpy.data.curves.new(name, "CURVE")
        cu.dimensions = "2D"
        cu.fill_mode = "BOTH"
        cu.extrude = height / 2
        for hw_, hd_ in ((w / 2, d / 2), (w / 2 - rim, d / 2 - rim)):
            sp = cu.splines.new("POLY")
            sp.points.add(3)
            for i, (px, py) in enumerate(((hw_, hd_), (-hw_, hd_), (-hw_, -hd_), (hw_, -hd_))):
                sp.points[i].co = (px, py, 0, 1)
            sp.use_cyclic_u = True
        o = bpy.data.objects.new(name, cu)
        bpy.context.scene.collection.objects.link(o)
    o = to_mesh(o)
    o.location = (0, 0, top + height / 2 - 0.01)
    bev = o.modifiers.new("Chamfer", "BEVEL")
    bev.width = 0.7
    bev.segments = 1
    bev.limit_method = "ANGLE"
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier=bev.name)
    # flat shading: smooth normals split flat faces into diagonal lit/shadow halves
    for p in o.data.polygons:
        p.use_smooth = False
    o.data.materials.append(mats["rim"])
    return o


def tab_on_front(name, x, y_front, z_base, w, h, mat, depth=0.5, r=1.2):
    """A browser tab: trapezoid with rounded top corners, standing on z_base."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = depth / 2
    slant = h * 0.55
    sp = cu.splines.new("POLY")
    pts = [(-w / 2, 0), (w / 2, 0), (w / 2 - slant, h - r * 0.3),
           (w / 2 - slant - r, h), (-w / 2 + slant + r, h), (-w / 2 + slant, h - r * 0.3)]
    sp.points.add(len(pts) - 1)
    for i, (px, py) in enumerate(pts):
        sp.points[i].co = (px, py, 0, 1)
    sp.use_cyclic_u = True
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o = to_mesh(o)
    # +90 deg about X maps the curve's +Y to world +Z (checked numerically):
    # the wide base sits on the title-bar line, the tab narrows toward the frame
    o.rotation_euler = (math.radians(90), 0, 0)
    o.location = (x, y_front - depth / 2, z_base)
    o.data.materials.append(mat)
    return o


def _flush_poly(name, pts, y_front, mat, depth=0.03):
    """A flat polygon (face-local x, z) laid flush on the -Y face."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = depth / 2
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, (px, pz) in enumerate(pts):
        sp.points[i].co = (px, pz, 0, 1)
    sp.use_cyclic_u = True
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    o = to_mesh(o)
    o.rotation_euler = (math.radians(90), 0, 0)
    o.location = (0, y_front - depth / 2, 0)
    o.data.materials.append(mat)
    return o


def _shoulder(x0, x1, z0, z1, n=10):
    """Smooth S-curve from (x0, z0) to (x1, z1): a browser-tab shoulder."""
    out = []
    for i in range(1, n + 1):
        t = i / n
        s = t * t * (3 - 2 * t)
        out.append((x0 + (x1 - x0) * t, z0 + (z1 - z0) * s))
    return out


def _corner_arcs(name, w, d, r, z0, z1, mat, off=0.04, segs=10):
    """Quarter-cylinder strips around the four rounded corners, so a band
    (title bar, divider) wraps the building without a break."""
    import bmesh
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    R = r + off
    for sx, sy, a0 in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        cx, cy = sx * (w / 2 - r), sy * (d / 2 - r)
        lo, hi = [], []
        for i in range(segs + 1):
            a = math.radians(a0 + 90 * i / segs)
            lo.append(bm.verts.new((cx + R * math.cos(a), cy + R * math.sin(a), z0)))
            hi.append(bm.verts.new((cx + R * math.cos(a), cy + R * math.sin(a), z1)))
        for i in range(segs):
            bm.faces.new((lo[i], lo[i + 1], hi[i + 1], hi[i]))
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def _chrome_face(prefix, w, top, mats, bar_h, tool_h, tab, pill_frac, y_front, tabs=1,
                 extend=0.0):
    """Browser chrome painted flat on one face (built facing -Y), as in the
    reference: a darker title-bar strip across the top, the active tab as a
    facade-coloured shape rising into it with S-curved shoulders, a toolbar
    zone with the light address pill, and one thin divider line under it.
    The title bar and divider run the full face width (+ extend past the
    corner on square towers) so they connect with the neighbouring faces."""
    parts = []
    hw = w / 2 + extend
    bar_top = top - 0.02
    bar_bot = bar_top - bar_h
    tab_top = bar_bot + bar_h * 0.68
    pts = [(-hw, bar_bot)]
    if tab:
        # 1 or 2 tabs, placed with a little randomness per face; the tabs
        # are cut out of the title bar left to right, like browser tabs
        rng = random.Random(zlib.crc32(prefix.encode()))
        sh = w * 0.05
        a = -w / 2 + w * rng.uniform(0.04, 0.12)
        if w < 30:
            tabs = 1                       # narrow faces only fit one tab
        widths = [w * rng.uniform(0.36, 0.46)] if tabs == 1 else \
                 [w * rng.uniform(0.30, 0.36), w * rng.uniform(0.26, 0.32)]
        # keep the tabs clear of the dots at the right end of the bar
        dots_left = w / 2 - 2.2 - 3 * min(0.8, bar_h * 0.13) * 2.8 - 1.0
        need = sum(widths) + w * 0.05 * (len(widths) - 1)
        room = dots_left - a
        if need > room:
            k = room / need
            widths = [x * k for x in widths]
        for i, tw in enumerate(widths):
            b = a + tw
            pts.append((a, bar_bot))
            pts += _shoulder(a, a + sh, bar_bot, tab_top)
            pts.append((b - sh, tab_top))
            pts += _shoulder(b - sh, b, tab_top, bar_bot)
            a = b + w * 0.05             # gap before the next tab: a short flat step, not a V
    pts += [(hw, bar_bot), (hw, bar_top), (-hw, bar_top)]
    parts.append(_flush_poly(f"{prefix}_titlebar", pts, y_front, mats["bar"]))
    # dots at the right of the title bar
    dot_r = min(0.8, bar_h * 0.13)
    for i, m in enumerate(mats["dots"]):
        parts.append(disc_on_front(f"{prefix}_dot{i}", w / 2 - 2.2 - i * dot_r * 2.8, y_front - 0.03,
                                   bar_bot + bar_h * 0.45, dot_r, m, depth=0.06))
    # toolbar: address pill, then a thin divider line under it
    pill_h = tool_h * 0.36
    pill_z = bar_bot - tool_h * 0.5
    # set slightly proud of the wall so it never z-fights with the facade
    parts.append(pill_on_front(f"{prefix}_pill", -w * 0.03, y_front - 0.08, pill_z,
                               w * pill_frac, pill_h, mats["pill"], depth=0.06))
    line_z = bar_bot - tool_h
    parts.append(_flush_poly(f"{prefix}_divider",
                             [(-hw, line_z - 0.18), (hw, line_z - 0.18), (hw, line_z + 0.18), (-hw, line_z + 0.18)],
                             y_front, mats["line"]))
    return parts


def _chrome_face_old(prefix, w, top, mats, band_h, tab, pill_frac, y_front, tabs=1):
    """Previous geometry-based chrome (kept for reference, unused)."""
    parts = []
    # The chrome is drawn INTO the facade, not stuck on: a near-zero-depth
    # panel whose outline is the title-bar line, with the tab as the same
    # line stepping up to the roof frame (the reference's tab notch).
    flush = 0.04
    tab_h = 2.8
    # the title-bar line runs tab_h below the frame; tabs rise from it up
    # to the frame, so the line steps up and over each tab
    band_top = top - tab_h
    # One flush panel covering the face, whose top edge IS the title-bar
    # line: straight, stepping up over each tab and back down. So the only
    # outline is that stepped line (no strip, no line across the tab base).
    hw = (w - 0.2) / 2
    top_edge = [(hw, band_top)]
    if tab:
        tab_w = w * 0.42
        slant = tab_h * 0.7
        x0 = -w / 2 + tab_w / 2 + 3.0
        bumps = []
        for k in range(tabs):
            cx = x0 + k * (tab_w + 1.0)
            bumps.append((cx - tab_w / 2, cx + tab_w / 2))
        for a, b in reversed(bumps):           # walk the top edge right -> left
            top_edge += [(b, band_top), (b - slant, top - 0.02), (a + slant, top - 0.02), (a, band_top)]
    top_edge.append((-hw, band_top))
    profile = [(-hw, 0.0), (hw, 0.0)] + top_edge
    cu = bpy.data.curves.new(f"{prefix}_band", "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = flush / 2
    sp = cu.splines.new("POLY")
    sp.points.add(len(profile) - 1)
    for i, (px, pz) in enumerate(profile):
        sp.points[i].co = (px, pz, 0, 1)
    sp.use_cyclic_u = True
    band = bpy.data.objects.new(f"{prefix}_band", cu)
    bpy.context.scene.collection.objects.link(band)
    band = to_mesh(band)
    band.rotation_euler = (math.radians(90), 0, 0)
    band.location = (0, y_front - flush / 2, 0)
    band.data.materials.append(mats["band"])
    parts.append(band)
    # dots and pill sit in the title-bar zone just under the stepped line
    bar_z = band_top - band_h / 2
    dot_r = min(0.9, band_h * 0.075)
    for i, m in enumerate(mats["dots"]):
        parts.append(disc_on_front(f"{prefix}_dot{i}", w / 2 - 3.0 - i * dot_r * 2.8, y_front - flush,
                                   bar_z + band_h * 0.18, dot_r, m, depth=0.08))
    parts.append(pill_on_front(f"{prefix}_pill", -w * 0.04, y_front - flush,
                               bar_z - band_h * 0.16, w * pill_frac, band_h * 0.2, mats["pill"], depth=0.08))
    return parts


def _chrome(prefix, w, d, r, top, mats, pill_frac=0.72):
    """Browser chrome on all four faces of a w x d tower (corner radius r).

    The title bar and the divider line wrap the whole building: flat strips
    on each face, joined by curved strips around rounded corners (or meeting
    at the edge on square towers). Each face gets its own 1 or 2 tabs, at
    random, so a building never repeats."""
    rng = random.Random(zlib.crc32(prefix.encode()) ^ 0x5A17)
    span = max(w, d)
    bar_h = max(4.5, span * 0.11)
    tool_h = max(4.0, span * 0.12)
    off = 0.04                       # chrome sits just proud of the wall
    rounded = r > 0.5
    extend = 0.0 if rounded else off
    parts = []
    # (name, rotation, flat face width, distance from centre)
    faces = (("f", 0, w - 2 * r, d / 2), ("r", 90, d - 2 * r, w / 2),
             ("b", 180, w - 2 * r, d / 2), ("l", 270, d - 2 * r, w / 2))
    for name, angle, width, dist in faces:
        face = _chrome_face(f"{prefix}_{name}", width, top, mats, bar_h, tool_h, True, pill_frac,
                            -(dist + off - 0.03), rng.choice((1, 2)), extend=extend)
        rot = math.radians(angle)
        for o in face:
            x, y, z = o.location
            o.location = (x * math.cos(rot) - y * math.sin(rot), x * math.sin(rot) + y * math.cos(rot), z)
            o.rotation_euler.z += rot
        parts += face
    if rounded:
        bar_top = top - 0.02
        bar_bot = bar_top - bar_h
        line_z = bar_bot - tool_h
        parts.append(_corner_arcs(f"{prefix}_bar_corners", w, d, r, bar_bot, bar_top, mats["bar"], off))
        parts.append(_corner_arcs(f"{prefix}_line_corners", w, d, r, line_z - 0.18, line_z + 0.18,
                                  mats["line"], off))
    return parts


def tower_window(name, w=44.0, d=34.0, h=120.0, r=6.0, loc=(0, 0)):
    m = _mats()
    body = to_mesh(rounded_rect_curve(f"{name}_body", w, d, r, h / 2))
    body.location = (0, 0, h / 2)
    body.data.materials.append(m["body"])
    parts = [body, _roof_rim(f"{name}_rim", w, d, r, h, m)]
    parts += _chrome(name, w, d, r, h, m)
    return _place(join(parts, name), loc)


def _place(t, loc):
    """Move a joined tower to loc on the ground. join() keeps the body's
    origin (at half height), so keep its z instead of zeroing it."""
    t.location = (loc[0], loc[1], t.location.z)
    return t


def tower_tab(name, w=38.0, d=30.0, h=150.0, loc=(0, 0), rim=3.0, rim_h=5.0):
    m = _mats()
    body = box(f"{name}_body", (0, 0, h / 2), (w, d, h), m["body"])
    parts = [body, _roof_rim(f"{name}_rim", w, d, 0.01, h, m, rim=rim, height=rim_h)]
    parts += _chrome(name, w, d, 0.0, h, m)
    return _place(join(parts, name), loc)


def tower_slim(name, w=22.0, d=22.0, h=175.0, loc=(0, 0)):
    m = _mats()
    body = box(f"{name}_body", (0, 0, h / 2), (w, d, h), m["body"])
    parts = [body, _roof_rim(f"{name}_rim", w, d, 0.01, h, m, rim=1.2)]
    parts += _chrome(name, w, d, 0.0, h, m, pill_frac=0.45)
    return _place(join(parts, name), loc)


# ---------------------------------------------------------------- look
def setup_look(scene, sun_dir=(0.55, 0.75, -0.36)):
    from mathutils import Vector
    engines = {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    scene.view_settings.view_transform = "Standard"
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes.get("Background")
    # vertical gradient: warm cream at the horizon -> pale blue at the top
    tex = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (*srgb((0.99, 0.93, 0.84)), 1)
    ramp.color_ramp.elements[1].position = 0.45
    ramp.color_ramp.elements[1].color = (*srgb((0.80, 0.88, 0.93)), 1)
    nt.links.new(tex.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    # the sky is seen by the camera but lights nothing, so the sun alone
    # decides lit vs shadow sides
    lp = nt.nodes.new("ShaderNodeLightPath")
    dark = nt.nodes.new("ShaderNodeBackground")
    dark.inputs["Strength"].default_value = 0.0
    mix = nt.nodes.new("ShaderNodeMixShader")
    wout = nt.nodes.get("World Output")
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(dark.outputs[0], mix.inputs[1])
    nt.links.new(bg.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], wout.inputs["Surface"])
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 4.0
    sun_data.angle = 0.0                   # hard-edged graphic shadows
    for attr, val in (("shadow_soft_size", 0.0), ("shadow_filter_radius", 0.0),
                      ("shadow_maximum_resolution", 0.001)):
        if hasattr(sun_data, attr):
            setattr(sun_data, attr, val)
    if hasattr(scene, "eevee") and hasattr(scene.eevee, "use_shadows"):
        scene.eevee.use_shadows = True
    sun = bpy.data.objects.new("Sun", sun_data)
    scene.collection.objects.link(sun)
    sun.rotation_euler = Vector(sun_dir).normalized().to_track_quat("-Z", "Y").to_euler()
    # monoline outlines
    scene.render.use_freestyle = True
    scene.render.line_thickness_mode = "ABSOLUTE"
    vl = scene.view_layers[0]
    fs = vl.freestyle_settings
    ls = fs.linesets[0] if fs.linesets else fs.linesets.new("Lines")
    ls.select_by_visibility = True
    ls.select_silhouette = ls.select_border = ls.select_crease = True
    if ls.linestyle is None:
        ls.linestyle = bpy.data.linestyles.new("Outline")
    ls.linestyle.color = srgb((0.12, 0.17, 0.27))   # dark navy, like the reference
    ls.linestyle.thickness = 2.6
    return sun
