import { addHolds, buildScrollMap, lengthAtScroll, type Sample } from './routeProgress'

/* Down 100, across 100, down 100, sampled every 10px. */
function zigzag(): Sample[] {
  const samples: Sample[] = []
  for (let len = 0; len <= 300; len += 10) {
    if (len <= 100) samples.push({ len, x: 0, y: len })
    else if (len <= 200) samples.push({ len, x: len - 100, y: 100 })
    else samples.push({ len, x: 100, y: len - 100 })
  }
  return samples
}

describe('lengthAtScroll', () => {
  it('is the identity on a straight vertical run', () => {
    const map = buildScrollMap(Array.from({ length: 11 }, (_, i) => ({ len: i * 10, x: 0, y: 50 + i * 10 })))
    expect(lengthAtScroll(map, 50)).toBe(0)
    expect(lengthAtScroll(map, 75)).toBeCloseTo(25)
    expect(lengthAtScroll(map, 150)).toBe(100)
  })

  it('clamps to the ends of the route', () => {
    const map = buildScrollMap(zigzag())
    expect(lengthAtScroll(map, -500)).toBe(0)
    expect(lengthAtScroll(map, 5000)).toBe(300)
  })

  it('is monotonic and spreads a sideways run over some scrolling', () => {
    const map = buildScrollMap(zigzag())
    let previous = -1
    for (let y = 0; y <= 200; y += 5) {
      const len = lengthAtScroll(map, y)
      expect(len).toBeGreaterThanOrEqual(previous)
      previous = len
    }
    // The sideways run (lengths 100 to 200) takes scrolling, not one step.
    const before = lengthAtScroll(map, 60)
    const after = lengthAtScroll(map, 110)
    expect(after - before).toBeGreaterThan(40)
    expect(lengthAtScroll(map, 100)).toBeGreaterThan(100)
    expect(lengthAtScroll(map, 100)).toBeLessThan(200)
  })

  it('reaches the end of the route exactly at its last y', () => {
    const map = buildScrollMap(zigzag())
    expect(lengthAtScroll(map, 200)).toBe(300)
  })

  it('handles a route with no samples or a single point', () => {
    expect(lengthAtScroll(buildScrollMap([]), 10)).toBe(0)
    expect(lengthAtScroll(buildScrollMap([{ len: 0, x: 0, y: 0 }]), 10)).toBe(0)
  })
})

describe('addHolds', () => {
  /* Straight down 400px, sampled every 10px: distance equals y. */
  const straight = () => buildScrollMap(Array.from({ length: 41 }, (_, i) => ({ len: i * 10, x: 0, y: i * 10 })))

  it('rests on each stop for the hold, then moves on', () => {
    const map = addHolds(straight(), [100, 300], 50)
    // Somewhere the disc sits on 100 across a stretch of scrolling.
    const resting = [0, 1, 2, 3, 4].map((d) => lengthAtScroll(map, 95 + d * 10))
    expect(resting.filter((len) => len === 100).length).toBeGreaterThanOrEqual(4)
    // Monotonic throughout.
    let previous = -1
    for (let y = 0; y <= 400; y += 5) {
      const len = lengthAtScroll(map, y)
      expect(len).toBeGreaterThanOrEqual(previous)
      previous = len
    }
  })

  it('keeps the whole route on the same scroll span', () => {
    const map = addHolds(straight(), [100, 300], 50)
    expect(lengthAtScroll(map, 0)).toBe(0)
    expect(lengthAtScroll(map, 400)).toBe(400)
  })

  it('leaves the map alone without stops or a hold', () => {
    const map = straight()
    expect(addHolds(map, [], 50)).toBe(map)
    expect(addHolds(map, [100], 0)).toBe(map)
  })
})
