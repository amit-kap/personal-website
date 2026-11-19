"""Block-out v13: AS inside the roof rim, more tall towers by the existing tall cluster.

Amit's review of v12 at frame 124 (18 Nov):
1. "place the AS inside the roof rim": the rim is 1 m wide (x -6.91..-5.91) and AS's feet sat on
   its inner edge, half sunk into it. AS and the camera path move together by AS_DX along +X, so
   AS stands just behind the rim and every frame keeps the same framing of him.
2. "add some tall build near the ones already there": the tall cluster right of AS in the arc
   (x 58..218, y 85..245, 100..164 m). Raise lower plots beside it to tall heights.

Run:
  cp docs/AS_hero/blockout/ref-v12-white.blend docs/AS_hero/blockout/ref-v13-white.blend
  Blender -b docs/AS_hero/blockout/ref-v13-white.blend -P scripts/as-hero/blender/v13_roof_and_tall.py
"""
import math
import random

import bpy

AS_DX = 0.30
REGION = (0.0, 320.0, 40.0, 340.0)      # x0, x1, y0, y1 around the tall cluster
N_RAISE = 9
H_RANGE = (120.0, 185.0)
TALL_FROM = 95.0
SEED = 7

objs = bpy.data.objects
scene = bpy.context.scene
rng = random.Random(SEED)

# 1. AS behind the rim; the camera path moves with him.
objs["AS_fig"].location.x += AS_DX
objs["CamPath"].location.x += AS_DX

# 2. Tall towers beside the cluster: lower plots nearest to existing tall ones.
x0, x1, y0, y1 = REGION
towers = [o for o in objs if o.name.startswith("T_") and x0 <= o.location.x <= x1
          and y0 <= o.location.y <= y1]
tall = [o for o in towers if o.scale.z >= TALL_FROM]
low = [o for o in towers if o.scale.z < TALL_FROM]


def gap(o):
    return min(math.hypot(o.location.x - t.location.x, o.location.y - t.location.y) for t in tall)


low.sort(key=gap)
raised = []
for o in low[:N_RAISE + 4]:
    if len(raised) == N_RAISE:
        break
    if rng.random() < 0.25:          # skip a few so the cluster edge stays uneven
        continue
    h = rng.uniform(*H_RANGE)
    old = o.scale.z
    o.scale.z = h
    for pre in ("R_", "B_"):
        p = objs.get(pre + o.name[2:])
        if p:
            p.location.z += h - old
    raised.append((o.name, round(old), round(h)))

bpy.ops.wm.save_mainfile()
print("V13 AS x", round(objs["AS_fig"].location.x, 2), "raised", raised)
