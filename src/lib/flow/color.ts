/* Colour helpers for the flow overlay's canvas drawing. */
export type Rgb = [number, number, number]

export const WHITE: Rgb = [255, 255, 255]
/* Linear blend from `from` to `to`; amount 0 is `from`, 1 is `to`. */
export const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
]
export const rgba = (c: Rgb, alpha: number) => `rgba(${c.map(Math.round).join(', ')}, ${Math.min(1, Math.max(0, alpha)).toFixed(3)})`

/* Any CSS colour to RGB, via a canvas context's colour parser. */
export function toRgb(ctx: CanvasRenderingContext2D, color: string): Rgb {
  // Reset first so an unparseable colour reads back as black, not the last value.
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  // Reads back as '#rrggbb' for opaque colours, otherwise 'rgba(r, g, b, a)'.
  const parsed = String(ctx.fillStyle)
  if (parsed.startsWith('#')) {
    const n = parseInt(parsed.slice(1, 7), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const parts = parsed.match(/[\d.]+/g)?.map(Number) ?? WHITE
  return [parts[0], parts[1], parts[2]]
}
