/* The Work with me route, as geometry: one continuous path built from straight
   runs and quarter-circle turns, tracking its own length so the pieces that
   are drawn (and the ones the disc skips over) can be told apart. Pure, so the
   DOM only has to supply the measured positions. */
export type Pt = { x: number; y: number }
/* A stretch of the path, as [from, to] distances from its start. */
export type Span = [number, number]

/* How a straight run behaves: "draw" is a visible rail; "gap" is a short
   stretch left undrawn (beside a dot) that the disc still crosses; "hop" is
   where the route passes behind a label or through a card, undrawn, with the
   disc hidden. */
type Mode = 'draw' | 'gap' | 'hop'

export class RouteBuilder {
  private commands: string[]
  private current: Pt
  /* Distance travelled so far. */
  length = 0
  readonly visible: Span[] = []
  readonly hops: Span[] = []

  constructor(start: Pt) {
    this.current = start
    this.commands = [`M${round(start.x)} ${round(start.y)}`]
  }

  get at(): Pt {
    return this.current
  }

  line(to: Pt, mode: Mode = 'draw') {
    const run = Math.hypot(to.x - this.current.x, to.y - this.current.y)
    if (run === 0) return this
    this.span(run, mode)
    this.commands.push(`L${round(to.x)} ${round(to.y)}`)
    this.current = to
    return this
  }

  /* A quarter circle to `to` (its radius is the horizontal distance, and the
     vertical distance must match). sweep 1 turns clockwise on screen. */
  arc(to: Pt, sweep: 0 | 1) {
    const r = Math.abs(to.x - this.current.x)
    this.span((Math.PI * r) / 2, 'draw')
    this.commands.push(`A${round(r)} ${round(r)} 0 0 ${sweep} ${round(to.x)} ${round(to.y)}`)
    this.current = to
    return this
  }

  d() {
    return this.commands.join(' ')
  }

  private span(run: number, mode: Mode) {
    const from = this.length
    this.length += run
    const list = mode === 'draw' ? this.visible : mode === 'hop' ? this.hops : undefined
    if (!list) return
    const last = list[list.length - 1]
    if (last && Math.abs(last[1] - from) < 1e-6) last[1] = this.length
    else list.push([from, this.length])
  }
}

const round = (n: number) => Math.round(n * 100) / 100

/* A stroke-dasharray that draws only the visible spans, and only up to
   `upTo` along the path: the full rail with `upTo` at the end, the lit trail
   behind the disc with it at the disc. Spans are sorted; the pattern ends in a
   gap longer than the path so it never repeats. */
export function dashPattern(visible: Span[], total: number, upTo = total) {
  const pattern: number[] = [0]
  let at = 0
  for (const [from, to] of visible) {
    const end = Math.min(to, upTo)
    if (end <= from) break
    pattern.push(from - at, end - from)
    at = end
  }
  pattern.push(total + 1)
  return pattern.map((n) => Math.round(n * 100) / 100).join(' ')
}

export const inSpan = (spans: Span[], distance: number) => spans.some(([from, to]) => distance > from && distance < to)
