"""Final-quality render of one key frame from the kit city.

Opens the saved city (.blend from build_city_kit.py) and renders one camera
at 2752x1536 with: more samples, haze that reads at city distances, light
shafts from a volume box around the city (a world volume blacks EEVEE out),
and line weight scaled to the resolution.

blender -b <city.blend> -P scripts/as-hero/blender/render_final.py -- <camera> <out.png>
"""

import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
cam_name, out = argv[0], argv[1]
preview = len(argv) > 2 and argv[2] == "preview"
scene = bpy.context.scene
scene.camera = bpy.data.objects[cam_name]

scene.render.resolution_x = 1376 if preview else 2752
scene.render.resolution_y = 768 if preview else 1536
scene.render.resolution_percentage = 100
if hasattr(scene, "eevee"):
    ee = scene.eevee
    if hasattr(ee, "taa_render_samples"):
        ee.taa_render_samples = 96
    for attr, val in (("use_volumetric_shadows", True), ("volumetric_tile_size", "2"),
                      ("volumetric_samples", 96), ("volumetric_end", 3000.0),
                      ("volumetric_shadow_samples", 32)):
        if hasattr(ee, attr):
            try:
                setattr(ee, attr, val)
            except (TypeError, ValueError):
                pass

# lines: same look at double resolution
scene.render.line_thickness = 1.0
for ls in scene.view_layers[0].freestyle_settings.linesets:
    if ls.linestyle:
        ls.linestyle.thickness = 1.0   # 1 px lines, as Amit asked (at final size)

# haze that reads at city distances: retune every material's haze range
for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    for node in mat.node_tree.nodes:
        if node.type == "MAP_RANGE" and abs(node.inputs["From Min"].default_value - 700.0) < 1:
            node.inputs["From Min"].default_value = 260.0
            node.inputs["From Max"].default_value = 1900.0
            node.inputs["To Max"].default_value = 0.78

# Volumetric backlight: the sun sits low, straight ahead down the street
# (behind the towers as K1/K2 see it), and a forward-scattering haze volume
# around the city turns the gaps between towers into light shafts. The sun's
# volume contribution is boosted on its own, so surfaces keep their toon look.
from mathutils import Vector  # noqa: E402

sun = bpy.data.objects["Sun"]
# Like Amit's reference: the sun sits right on the horizon at the far end
# of the street (the vanishing point), so its rays fan out from the centre.
toward_camera = Vector((0.0, 0.998, -0.06)).normalized()   # ~3.5 deg up, light travels +Y
sun.rotation_euler = toward_camera.to_track_quat("-Z", "Y").to_euler()
if hasattr(sun.data, "volume_factor"):
    sun.data.volume_factor = 2.2

# sun glow in the sky around the sun's position
world = scene.world
wnt = world.node_tree
bg = next(n for n in wnt.nodes if n.type == "BACKGROUND" and n.inputs["Strength"].default_value > 0)
sky_link = bg.inputs["Color"].links[0]
sky_src = sky_link.from_socket
wnt.links.remove(sky_link)
tc = wnt.nodes.new("ShaderNodeTexCoord")
dot = wnt.nodes.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
dot.inputs[1].default_value = tuple(-toward_camera)          # direction toward the sun
clamp = wnt.nodes.new("ShaderNodeMath"); clamp.operation = "MAXIMUM"
clamp.inputs[1].default_value = 0.0
core = wnt.nodes.new("ShaderNodeMath"); core.operation = "POWER"
core.inputs[1].default_value = 400.0
halo = wnt.nodes.new("ShaderNodeMath"); halo.operation = "POWER"
halo.inputs[1].default_value = 14.0
halo_k = wnt.nodes.new("ShaderNodeMath"); halo_k.operation = "MULTIPLY"
halo_k.inputs[1].default_value = 0.22
glow = wnt.nodes.new("ShaderNodeMath"); glow.operation = "ADD"
add = wnt.nodes.new("ShaderNodeMix"); add.data_type = "RGBA"; add.blend_type = "ADD"
add.inputs["B"].default_value = (1.0, 0.92, 0.78, 1)
wnt.links.new(tc.outputs["Generated"], dot.inputs[0])
wnt.links.new(dot.outputs["Value"], clamp.inputs[0])
wnt.links.new(clamp.outputs[0], core.inputs[0])
wnt.links.new(clamp.outputs[0], halo.inputs[0])
wnt.links.new(halo.outputs[0], halo_k.inputs[0])
wnt.links.new(core.outputs[0], glow.inputs[0])
wnt.links.new(halo_k.outputs[0], glow.inputs[1])
wnt.links.new(glow.outputs[0], add.inputs["Factor"])
wnt.links.new(sky_src, add.inputs["A"])
wnt.links.new(add.outputs["Result"], bg.inputs["Color"])

# pale warm ground: the street floor reads as light at the bottom of the canyons
street = bpy.data.materials.get("Street")
if street:
    for n in street.node_tree.nodes:
        if n.type == "VALTORGB":
            n.color_ramp.elements[0].color = (*[pow(v, 2.2) for v in (0.80, 0.78, 0.72)], 1)
            n.color_ramp.elements[1].color = (*[pow(v, 2.2) for v in (0.98, 0.92, 0.82)], 1)

# haze volume: forward-scattering, denser near the ground so the streets
# fill with pale light and the skyline fades to cream toward the horizon
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -900, 240))
vol = bpy.context.active_object
vol.name = "BacklightVolume"
vol.scale = (5200, 5200, 480)
vmat = bpy.data.materials.new("Backlight")
vmat.use_nodes = True
vnt = vmat.node_tree
vnt.nodes.clear()
vout = vnt.nodes.new("ShaderNodeOutputMaterial")
vsc = vnt.nodes.new("ShaderNodeVolumeScatter")
vsc.inputs["Color"].default_value = (1.0, 0.90, 0.74, 1)
if "Anisotropy" in vsc.inputs:
    vsc.inputs["Anisotropy"].default_value = 0.85          # forward scatter: rays toward the camera
vtc = vnt.nodes.new("ShaderNodeTexCoord")
vsep = vnt.nodes.new("ShaderNodeSeparateXYZ")
inv = vnt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"
inv.inputs[0].default_value = 1.0
sq = vnt.nodes.new("ShaderNodeMath"); sq.operation = "POWER"
sq.inputs[1].default_value = 3.0
dens = vnt.nodes.new("ShaderNodeMath"); dens.operation = "MULTIPLY_ADD"
dens.inputs[1].default_value = 0.0016                       # extra density at street level
dens.inputs[2].default_value = 0.00032                      # base density everywhere
vnt.links.new(vtc.outputs["Generated"], vsep.inputs[0])
vnt.links.new(vsep.outputs["Z"], inv.inputs[1])
vnt.links.new(inv.outputs[0], sq.inputs[0])
vnt.links.new(sq.outputs[0], dens.inputs[0])
vnt.links.new(dens.outputs[0], vsc.inputs["Density"])
vnt.links.new(vsc.outputs[0], vout.inputs["Volume"])
vol.data.materials.append(vmat)
if hasattr(vol, "visible_shadow"):
    vol.visible_shadow = False

scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("FINAL", out)
