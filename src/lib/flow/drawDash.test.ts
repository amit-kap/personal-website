import { vi } from 'vitest'
import { DASH, drawDash } from './drawDash'
import { polyline } from './geometry'

function mockCtx() {
  const gradient = { addColorStop: vi.fn() }
  const ctx = {
    lineWidth: 0,
    strokeStyle: '',
    fillStyle: '' as unknown,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
  }
  return { ctx, gradient, asCtx: ctx as unknown as CanvasRenderingContext2D }
}

const color: [number, number, number] = [240, 74, 0]
const line = polyline([[0, 0], [100, 0]])

describe('drawDash', () => {
  it('draws nothing while the head has not entered the line', () => {
    const { ctx, asCtx } = mockCtx()
    drawDash(asCtx, line, 0, color)
    drawDash(asCtx, line, -5, color)

    expect(ctx.stroke).not.toHaveBeenCalled()
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
  })

  it('draws nothing once the whole dash has left the line', () => {
    const { ctx, asCtx } = mockCtx()
    drawDash(asCtx, line, line.len + DASH + 1, color)

    expect(ctx.stroke).not.toHaveBeenCalled()
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it('draws a glow and a core stroke per step, plus the bloom, mid-line', () => {
    const { ctx, gradient, asCtx } = mockCtx()
    drawDash(asCtx, line, 50, color)

    const steps = Math.ceil(DASH / 2)
    expect(ctx.stroke).toHaveBeenCalledTimes(steps * 2)
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1)
    // The bloom is centred on the head.
    expect(ctx.createRadialGradient.mock.calls[0].slice(0, 2)).toEqual([50, 0])
    expect(gradient.addColorStop).toHaveBeenCalledTimes(4)
    expect(ctx.fillRect).toHaveBeenCalledTimes(1)
  })

  it('keeps every trail segment within the path', () => {
    const { ctx, asCtx } = mockCtx()
    drawDash(asCtx, line, 10, color)

    const xs = [...ctx.moveTo.mock.calls, ...ctx.lineTo.mock.calls].map(([x]) => x as number)
    expect(xs.length).toBeGreaterThan(0)
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(line.len)
    }
  })

  it('only draws the part of the trail still on the line when the dash slides off the end', () => {
    const { ctx, asCtx } = mockCtx()
    drawDash(asCtx, line, line.len + 6, color)

    // Head is off the end: strokes remain for the tail, but no bloom.
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.stroke.mock.calls.length).toBeLessThan(Math.ceil(DASH / 2) * 2)
    expect(ctx.createRadialGradient).not.toHaveBeenCalled()
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it('draws the bloom with the head exactly at the line end', () => {
    const { ctx, asCtx } = mockCtx()
    drawDash(asCtx, line, line.len, color)

    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1)
  })
})
