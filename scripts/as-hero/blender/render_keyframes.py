"""Build Browsercity, save the .blend, and render the three key stills.

blender -b -P scripts/as-hero/blender/render_keyframes.py -- <out_dir>
"""

import os
import sys

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_browsercity  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_dir = argv[0] if argv else os.path.join(HERE, "out")
os.makedirs(out_dir, exist_ok=True)

info = build_browsercity.build()
scene = bpy.context.scene
scene.eevee.taa_render_samples = 32 if hasattr(scene, "eevee") else 32

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, "browsercity.blend"))

for name in ("K1_rooftops", "K2_over_shoulder", "K3_end_medium"):
    scene.camera = bpy.data.objects[name]
    scene.render.filepath = os.path.join(out_dir, f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("RENDERED", name)

print("DONE", info)
