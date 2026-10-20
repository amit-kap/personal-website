import { RouteBuilder, dashPattern, inSpan } from './route'

describe('RouteBuilder', () => {
  it('tracks length through lines and quarter-circle turns', () => {
    const b = new RouteBuilder({ x: 100, y: 0 })
    b.line({ x: 100, y: 20 }).arc({ x: 60, y: 60 }, 1).line({ x: 20, y: 60 })
    expect(b.length).toBeCloseTo(20 + (Math.PI * 40) / 2 + 40)
    expect(b.d()).toBe('M100 0 L100 20 A40 40 0 0 1 60 60 L20 60')
    expect(b.visible).toHaveLength(1)
  })

  it('keeps gaps and hops out of the visible spans but still counts them', () => {
    const b = new RouteBuilder({ x: 0, y: 0 })
    b.line({ x: 0, y: 10 }).line({ x: 0, y: 20 }, 'hop').line({ x: 0, y: 25 }, 'gap').line({ x: 0, y: 40 })
    expect(b.length).toBe(40)
    expect(b.visible).toEqual([[0, 10], [25, 40]])
    expect(b.hops).toEqual([[10, 20]])
    expect(inSpan(b.hops, 15)).toBe(true)
    expect(inSpan(b.hops, 25)).toBe(false)
  })
})

describe('dashPattern', () => {
  const visible: [number, number][] = [[10, 30], [50, 80]]

  it('draws only the visible spans, ending in a gap past the path', () => {
    expect(dashPattern(visible, 100)).toBe('0 10 20 20 30 101')
  })

  it('clips the trail at the disc', () => {
    expect(dashPattern(visible, 100, 60)).toBe('0 10 20 20 10 101')
    expect(dashPattern(visible, 100, 20)).toBe('0 10 10 101')
    expect(dashPattern(visible, 100, 5)).toBe('0 101')
  })
})
