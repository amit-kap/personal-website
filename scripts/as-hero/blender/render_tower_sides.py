"""Render each kit tower from all four sides (close, above the roof line),
for checking every face before showing the kit.

blender -b --factory-startup -P scripts/as-hero/blender/render_tower_sides.py -- <out_dir>
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tower_kit as kit  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_dir = argv[0] if argv else "/tmp/tower_sides"
os.makedirs(out_dir, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
towers = [
    kit.tower_window("A_window", loc=(-300, 0)),
    kit.tower_tab("B_tab", loc=(0, 0)),
    kit.tower_slim("C_slim", loc=(300, 0)),
]
bpy.ops.mesh.primitive_plane_add(size=8000, location=(0, 0, 0))
bpy.context.active_object.data.materials.append(
    kit.toon_material("Ground", (0.93, 0.86, 0.76), (0.72, 0.66, 0.58)))
kit.setup_look(scene, sun_dir=(0.85, -0.25, -0.42))

cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 35
cam_data.clip_end = 8000
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
scene.render.resolution_x = 960
scene.render.resolution_y = 540

report = []
for t in towers:
    bpy.context.view_layer.update()
    corners = [t.matrix_world @ Vector(c) for c in t.bound_box]
    top = max(c.z for c in corners)
    size = max(max(c.x for c in corners) - min(c.x for c in corners),
               max(c.y for c in corners) - min(c.y for c in corners))
    cx = sum(c.x for c in corners) / 8
    cy = sum(c.y for c in corners) / 8
    report.append(f"{t.name}: top {top:.1f} m, footprint {size:.1f} m")
    # four views, each looking at one face corner-on from above the roof
    for k, az in enumerate((-135, -45, 45, 135)):
        a = math.radians(az)
        dist = size * 1.9
        cam.location = (cx + dist * math.cos(a), cy + dist * math.sin(a), top + size * 0.55)
        target = Vector((cx, cy, top - size * 0.35))
        cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(out_dir, f"{t.name}_{k}.png")
        bpy.ops.render.render(write_still=True)
print("REPORT", " | ".join(report))
