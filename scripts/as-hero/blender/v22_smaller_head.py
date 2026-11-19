"""v22: shrink AS's stand-in head 20% (Amit, 19 Nov: head too big in the styled stills).

The image/video models copy proportions from the block-out. The head was 0.26 m on a 1.85 m body
(1:7.1 nominal, about 1:6 in the low-angle frame), so the styled stills came out big-headed.
Scale the head 0.8 about its base (keeps the neck join), so it reads about 1:7.5.
Scale is not keyed (only rotation is), so one change covers every frame. Mask parts are children.

Run in the live v22 session (ref-v22-white.blend), once.
"""
import bpy

head = bpy.data.objects["AS_fig_head"]
K = 0.8
base_z = head.location.z - head.scale.z / 2          # bottom of the head
head.scale = (head.scale.x * K, head.scale.y * K, head.scale.z * K)
head.location.z = base_z + head.scale.z / 2
