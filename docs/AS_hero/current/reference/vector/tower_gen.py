import sys
PANE_W, MUL, PANE_H, BAND = 30, 3, 62, 8   # pane 30x62 (~1:2), mullion 3, floor band 8
CELL_W, CELL_H = PANE_W+MUL, PANE_H+BAND
TB, TOOL = 24, 34                           # title bar, toolbar heights
FLOORS = 12
def face(n, c):
    W = n*CELL_W + MUL
    top = TB+TOOL
    H = top + FLOORS*CELL_H + BAND
    s = []
    # glass
    s.append(f'<rect x="0" y="{top}" width="{W}" height="{H-top}" fill="{c["glass"]}"/>')
    # mullions + bands in one path
    d = []
    for i in range(n+1):
        x = i*CELL_W
        d.append(f'M{x} {top}h{MUL}v{H-top}h-{MUL}z')
    for f in range(FLOORS+1):
        y = top + f*CELL_H
        d.append(f'M0 {y}h{W}v{BAND}h-{W}z')
    s.append(f'<path d="{"".join(d)}" fill="{c["frame"]}"/>')
    # chrome: title bar, toolbar, tab, dots, pill
    s.append(f'<rect x="0" y="0" width="{W}" height="{TB}" fill="{c["title"]}"/>')
    s.append(f'<rect x="0" y="{TB-1}" width="{W}" height="{TOOL+1}" fill="{c["tool"]}"/>')
    tx = 52; tw = min(110, W*0.38)
    s.append(f'<path d="M{tx-8} {TB+1}v-1q8 0 8-8v-4q0-6 6-6h{tw-12}q6 0 6 6v4q0 8 8 8v1z" fill="{c["tool"]}"/>')
    for k,col in enumerate(c["dots"]):
        s.append(f'<circle cx="{12+k*12}" cy="{TB/2}" r="3.6" fill="{col}"/>')
    s.append(f'<rect x="0" y="{TB+TOOL-3}" width="{W}" height="3" fill="{c.get("div", c["title"])}"/>')
    px = 14; pw = W-28
    s.append(f'<rect x="{px}" y="{TB+8}" width="{pw}" height="{TOOL-16}" rx="{(TOOL-16)/2}" fill="{c["pill"]}"/>')
    return W, H, "".join(s)
LIT = dict(glass="#5979A7", frame="#F1DCC4", title="#334B6A", tool="#4A6E9C", pill="#F1DCC4", dots=["#D15E2B","#F1DCC4","#FAC68B"])
SHD = dict(glass="#334B6A", frame="#4A605E", title="#263A52", tool="#30616F", pill="#5979A7", dots=["#D15E2B","#5979A7","#4A605E"])
VAR = sys.argv[2] if len(sys.argv)>2 else "v1"
if VAR == "cream":
    LIT.update(title="#E2C3A0", tool="#FFF4E2", pill="#E2C3A0", div="#334B6A", dots=["#D15E2B","#FAC68B","#5979A7"])
    SHD.update(title="#B89878", tool="#D7BFA3", pill="#B89878", div="#263A52", dots=["#D15E2B","#E2C3A0","#5979A7"])
elif VAR == "orange":
    LIT.update(title="#D15E2B", tool="#FFF4E2", pill="#E2C3A0", div="#334B6A", dots=["#FFF4E2","#FAC68B","#334B6A"])
    SHD.update(title="#A4481F", tool="#D7BFA3", pill="#B89878", div="#263A52", dots=["#F1DCC4","#FAC68B","#263A52"])
mode = sys.argv[1]
if mode == "elev":
    W,H,g = face(10, LIT)
    pad=60
    print(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W+2*pad}" height="{H+2*pad}" viewBox="0 0 {W+2*pad} {H+2*pad}"><rect width="100%" height="100%" fill="#FFF4E2"/><g transform="translate({pad} {pad})">{g}</g></svg>')
else:
    W1,H,g1 = face(10, LIT)
    W2,_,g2 = face(7, SHD)
    a1,b1 = 0.86, 0.20   # left face: x scale, drop per unit
    a2,b2 = 0.66, -0.26  # right face
    ox, oy = 80, 120
    # left face starts at (ox, oy); corner at (ox+a1*W1, oy+b1*W1)
    cx, cy = ox+a1*W1, oy+b1*W1
    ex, ey = cx+a2*W2, cy+b2*W2
    # roof: left-top, corner, right-top, back
    bx, by = ox + (ex-cx), oy + (ey-cy)
    roof = f'<path d="M{ox} {oy}L{cx} {cy}L{ex} {ey}L{bx} {by}z" fill="#F1DCC4"/>'
    rim = f'<path d="M{ox-4} {oy}h4v{H}h-4z" fill="#FAC68B"/>'
    off = f'<path d="M{cx+7} {cy+5}L{ex+7} {ey+5}V{ey+H+5}L{cx+7} {cy+H+5}z" fill="#30616F" opacity="0.55"/>'
    Wt = int(ex+80); Ht = int(cy+H+120)
    print(f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wt}" height="{Ht}" viewBox="0 0 {Wt} {Ht}"><rect width="100%" height="100%" fill="#FFF4E2"/>{off}<g transform="matrix({a1} {b1} 0 1 {ox} {oy})">{g1}</g><g transform="matrix({a2} {b2} 0 1 {cx} {cy})">{g2}</g>{roof}{rim}</svg>')
