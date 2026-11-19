"""Small Browsercity block: approved orange-chrome towers, same projection as tower_gen.py."""
import random, sys
PANE_W, MUL, PANE_H, BAND = 30, 3, 62, 8
CELL_W, CELL_H = PANE_W+MUL, PANE_H+BAND
TB, TOOL = 24, 34
L = (0.86, 0.20); R = (0.66, -0.26)
LIT = dict(glass="#5979A7", frame="#F1DCC4", title="#D15E2B", tool="#FFF4E2", pill="#E2C3A0", div="#334B6A", dots=["#FFF4E2","#FAC68B","#334B6A"])
SHD = dict(glass="#334B6A", frame="#4A605E", title="#A4481F", tool="#D7BFA3", pill="#B89878", div="#263A52", dots=["#F1DCC4","#FAC68B","#263A52"])
def f(x): return f"{x:.1f}".rstrip('0').rstrip('.')
def face(n, floors, c):
    W = n*CELL_W + MUL; top = TB+TOOL; H = top + floors*CELL_H + BAND
    d = [f'M{i*CELL_W} {top}h{MUL}v{H-top}h-{MUL}z' for i in range(n+1)]
    d += [f'M0 {top+k*CELL_H}h{W}v{BAND}h-{W}z' for k in range(floors+1)]
    tx, tw = 52, min(110, W*0.38)
    s = [f'<rect y="{top}" width="{W}" height="{H-top}" fill="{c["glass"]}"/>',
         f'<path d="{"".join(d)}" fill="{c["frame"]}"/>',
         f'<rect width="{W}" height="{TB}" fill="{c["title"]}"/>',
         f'<rect y="{TB-1}" width="{W}" height="{TOOL+1}" fill="{c["tool"]}"/>',
         f'<path d="M{tx-8} {TB+1}v-1q8 0 8-8v-4q0-6 6-6h{f(tw-12)}q6 0 6 6v4q0 8 8 8v1z" fill="{c["tool"]}"/>']
    s += [f'<circle cx="{12+k*12}" cy="12" r="3.6" fill="{col}"/>' for k,col in enumerate(c["dots"])]
    s += [f'<rect y="{TB+TOOL-3}" width="{W}" height="3" fill="{c["div"]}"/>',
          f'<rect x="14" y="{TB+8}" width="{W-28}" height="{TOOL-16}" rx="{(TOOL-16)/2}" fill="{c["pill"]}"/>']
    return W, H, "".join(s)
def tower(F, n1, n2, floors):
    W1,H,g1 = face(n1, floors, LIT); W2,_,g2 = face(n2, floors, SHD)
    fx, fy = F
    lx, ly = fx-L[0]*W1, fy-L[1]*W1-H          # left face top-left
    cx, cy = fx, fy-H                           # front corner top
    rx, ry = fx+R[0]*W2, fy+R[1]*W2-H           # right face top-right
    bx, by = lx+R[0]*W2, ly+R[1]*W2             # back corner top
    out = [f'<path d="M{f(cx+7)} {f(cy+5)}L{f(rx+7)} {f(ry+5)}V{f(ry+H+5)}L{f(cx+7)} {f(cy+H+5)}z" fill="#30616F" opacity="0.55"/>',
           f'<g transform="matrix({L[0]} {L[1]} 0 1 {f(lx)} {f(ly)})">{g1}</g>',
           f'<g transform="matrix({R[0]} {R[1]} 0 1 {f(cx)} {f(cy)})">{g2}</g>',
           f'<path d="M{f(lx)} {f(ly)}L{f(cx)} {f(cy)}L{f(rx)} {f(ry)}L{f(bx)} {f(by)}z" fill="#F1DCC4"/>',
           f'<path d="M{f(lx-4)} {f(ly)}h4v{H}h-4z" fill="#FAC68B"/>']
    pts = [(lx,ly),(cx,cy),(rx,ry),(bx,by),(lx,ly+H),(fx,fy),(rx,ry+H)]
    return "".join(out), pts
random.seed(int(sys.argv[1]) if len(sys.argv)>1 else 7)
STREET = 110
lots = []
for p in range(3):          # p: steps back along -L (up-left)
    for q in range(2):      # q: steps back along +R (up-right)
        n1 = random.choice([6,7,8,9,10]); n2 = random.choice([5,6,7])
        floors = random.choice([9,11,13]) + 3*(p+q)       # further back = taller
        lots.append((p, q, n1, n2, floors))
parts, allpts = [], []
# draw back to front
for p,q,n1,n2,fl in sorted(lots, key=lambda t: -(t[0]+t[1])):
    off1, off2 = p*(10*CELL_W+STREET), q*(7*CELL_W+STREET)
    F = (-L[0]*off1 + R[0]*off2, -L[1]*off1 + R[1]*off2)
    svg, pts = tower(F, n1, n2, fl); parts.append(svg); allpts += pts
xs=[x for x,_ in allpts]; ys=[y for _,y in allpts]; pad=60
x0,y0=min(xs)-pad,min(ys)-pad; w=max(xs)-x0+pad; h=max(ys)-y0+pad
print(f'<svg layer-name="City block" xmlns="http://www.w3.org/2000/svg" width="{f(w*0.6)}" height="{f(h*0.6)}" viewBox="{f(x0)} {f(y0)} {f(w)} {f(h)}">{"".join(parts)}</svg>')
