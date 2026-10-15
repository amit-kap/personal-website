import { WHITE, mix, rgba, toRgb } from './color'

/* jsdom has no canvas colour parser, so toRgb is checked against a stand-in
   context that reads fillStyle back the way a browser does. */
function fakeCtx(readBack: (value: string) => string) {
  let style = '#000000'
  return {
    get fillStyle() {
      return style
    },
    set fillStyle(value: string) {
      style = readBack(value)
    },
  } as unknown as CanvasRenderingContext2D
}

describe('flow colour helpers', () => {
  it('mixes linearly between two colours', () => {
    expect(mix([0, 0, 0], [100, 200, 50], 0)).toEqual([0, 0, 0])
    expect(mix([0, 0, 0], [100, 200, 50], 1)).toEqual([100, 200, 50])
    expect(mix([0, 100, 200], WHITE, 0.5)).toEqual([127.5, 177.5, 227.5])
  })

  it('formats rgba with rounded channels and alpha clamped to 0..1', () => {
    expect(rgba([10.4, 10.5, 254.6], 0.5)).toBe('rgba(10, 11, 255, 0.500)')
    expect(rgba([0, 0, 0], 2)).toBe('rgba(0, 0, 0, 1.000)')
    expect(rgba([0, 0, 0], -1)).toBe('rgba(0, 0, 0, 0.000)')
  })

  it('reads opaque colours back from #rrggbb', () => {
    expect(toRgb(fakeCtx((v) => v), '#f04a00')).toEqual([240, 74, 0])
  })

  it('reads translucent colours back from rgba()', () => {
    expect(toRgb(fakeCtx(() => 'rgba(1, 2, 3, 0.5)'), 'whatever')).toEqual([1, 2, 3])
  })

  it('falls back to white when the parsed value has no numbers', () => {
    expect(toRgb(fakeCtx(() => 'transparent'), 'x')).toEqual(WHITE)
  })
})
