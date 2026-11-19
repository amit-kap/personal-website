"""Block-out v20: remove the tall tower behind the headline.

Amit (18 Nov): "remove that building from blender". In the end frame (option 1 framing) the tower
T_1_1_01 (154 m, about 128 m from the camera) fills the area behind the headline; a ray cast through
the headline area hits it first. It goes, with its rooftop box (B_) and rim (R_). Its pavement stays.

Run on a copy of v18: Blender -b ref-v20-white.blend -P scripts/as-hero/blender/v20_remove_tower.py
"""
import bpy

GONE = ("1_1_01", "1_2_11")   # 1_2_11 (164 m, the tallest) added after Amit's v20 check
O = bpy.data.objects
removed = []
for sfx in GONE:
    for part in ("T_", "B_", "R_"):
        ob = O.get(part + sfx)
        if ob:
            removed.append(ob.name)
            O.remove(ob, do_unlink=True)
if bpy.app.background:
    bpy.ops.wm.save_mainfile()
print("V20 removed", removed)
