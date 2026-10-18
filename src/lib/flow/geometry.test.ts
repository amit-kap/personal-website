import { length, pointAt, polyline } from './geometry'

describe('flow geometry', () => {
  it('measures a polyline as the sum of its segments', () => {
    expect(length([])).toBe(0)
    expect(length([[3, 4]])).toBe(0)
    expect(length([[0, 0], [3, 4]])).toBe(5)
    expect(length([[0, 0], [10, 0], [10, 5]])).toBe(15)
  })

  it('records cumulative length at every vertex, plus total and phase', () => {
    const line = polyline([[0, 0], [10, 0], [10, 5]], 7)

    expect(line.cumulative).toEqual([0, 10, 15])
    expect(line.len).toBe(15)
    expect(line.phase).toBe(7)
    expect(polyline([[0, 0], [1, 0]]).phase).toBe(0)
  })

  it('interpolates points along the path, including both ends', () => {
    const line = polyline([[0, 0], [10, 0], [10, 10]])

    expect(pointAt(line, 0)).toEqual([0, 0])
    expect(pointAt(line, 5)).toEqual([5, 0])
    expect(pointAt(line, 10)).toEqual([10, 0])
    expect(pointAt(line, 15)).toEqual([10, 5])
    expect(pointAt(line, 20)).toEqual([10, 10])
  })

  it('skips zero-length segments without producing NaN', () => {
    const line = polyline([[0, 0], [0, 0], [10, 0], [10, 0], [10, 10]])

    expect(pointAt(line, 0)).toEqual([0, 0])
    expect(pointAt(line, 5)).toEqual([5, 0])
    expect(pointAt(line, 15)).toEqual([10, 5])
    for (const d of [0, 3, 10, 12, 20]) {
      const [x, y] = pointAt(line, d)
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
    }
  })
})
