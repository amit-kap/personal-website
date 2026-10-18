import { packagePath, project, REST_TURN } from './packageGeometry'

/* Every "M x y L x y" segment of a path, rounded to 0.01. */
function segments(d: string) {
  return [...d.matchAll(/M([\d.-]+) ([\d.-]+)L([\d.-]+) ([\d.-]+)/g)].map((m) => m.slice(1).map((v) => Math.round(Number(v) * 100) / 100))
}

describe('package geometry', () => {
  it('projects the box at rest onto Lucide\'s package drawing', () => {
    const round = (p: [number, number]) => p.map((v) => Math.round(v * 100) / 100)
    const h = 5 / ((9 / Math.SQRT2) * Math.sqrt(1 - (5 / 9) ** 2))
    // The hexagon's corners and the front corner where the Y meets.
    expect(round(project([-1, h, -1], REST_TURN))).toEqual([12, 2])
    expect(round(project([1, h, -1], REST_TURN))).toEqual([21, 7])
    expect(round(project([1, -h, -1], REST_TURN))).toEqual([21, 17])
    expect(round(project([1, -h, 1], REST_TURN))).toEqual([12, 22])
    expect(round(project([-1, -h, 1], REST_TURN))).toEqual([3, 17])
    expect(round(project([-1, h, 1], REST_TURN))).toEqual([3, 7])
    expect(round(project([1, h, 1], REST_TURN))).toEqual([12, 12])
  })

  it('draws only the nine visible edges at rest, plus the tape', () => {
    const lines = segments(packagePath(REST_TURN))
    expect(lines).toHaveLength(10)
    expect(lines.at(-1)).toEqual([7.5, 4.5, 16.5, 9.5])
  })

  it('never draws hidden edges while turning', () => {
    for (let turn = 0; turn < 2 * Math.PI; turn += 0.1) {
      // A box shows two or three faces: 7 or 9 visible edges, then the tape.
      expect([8, 10]).toContain(segments(packagePath(turn)).length)
    }
  })
})
