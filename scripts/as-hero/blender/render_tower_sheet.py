"""Render the Browsercity tower-kit sheet: the three tower types side by side
in the toon look, for approval before the city is rebuilt from them.

blender -b --factory-startup -P scripts/as-hero/blender/render_tower_sheet.py -- <out.png>
"""

import math
import os
import sys

import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tower_kit as kit  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out = argv[0] if argv else "/tmp/tower_sheet.png"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

kit.tower_window("A_window", loc=(-75, 0))
kit.tower_tab("B_tab", loc=(0, 0))
kit.tower_slim("C_slim", loc=(62, 0))

# ground: cream, same toon material without panes
bpy.ops.mesh.primitive_plane_add(size=6000, location=(0, 0, 0))
ground = bpy.context.active_object
ground.data.materials.append(kit.toon_material("Ground", (0.93, 0.86, 0.76), (0.72, 0.66, 0.58)))

# sun from the left: left faces lit cream, front faces in teal shadow
kit.setup_look(scene, sun_dir=(0.85, -0.25, -0.42))

cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 58
cam_data.clip_end = 5000
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
mode = argv[1] if len(argv) > 1 else "sheet"
if mode == "closeup":
    # like the reference crop: slightly above the roof of the tab tower,
    # looking down across its top from the front-left
    cam_data.lens = 40
    cam.location = (-48, -70, 172)
    target = Vector((0, 0, 140))
elif mode == "closeup_a":
    # the small rounded tower (A), same kind of view
    cam_data.lens = 40
    # (towers sit h/2 lower than modelled: the join keeps the body's origin;
    # the kit fixes that before the city is built)
    cam.location = (-75 - 50, -66, 82)
    target = Vector((-75, 0, 52))
else:
    cam.location = (-230, -560, 260)
    target = Vector((-5, 0, 85))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

scene.render.resolution_x = 1376
scene.render.resolution_y = 768
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("SHEET", out)
