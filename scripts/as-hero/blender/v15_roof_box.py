"""Block-out v15: move AS's rooftop box out of the camera's view.

Amit (18 Nov): in the end frame the rooftop box on AS's roof (B_AS, 4 x 3 x 2.2 m, ~10 m from the
camera) fills the right edge and every image model painted it as a browser tower. Checked every
second frame 1-144: at (3.95, -9.5) the box is never in view. Same x, moved 6.6 m toward the back
of the roof, still inside the rim.

Run on a copy of v14, or live in the open file (then save as v15).
"""
import bpy

NEW_XY = (3.95, -9.5)

box = bpy.data.objects["B_AS"]
box.location.x, box.location.y = NEW_XY
if bpy.app.background:
    bpy.ops.wm.save_mainfile()
print("V15 B_AS at", tuple(round(v, 2) for v in box.location))
