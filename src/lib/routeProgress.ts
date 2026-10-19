/* Scroll to distance along the route. The page scrolls vertically, but the
   route also runs sideways (the turns into and out of the rail and the steps
   row), where a plain "which point is at this y" lookup would make the disc
   jump the whole run at one scroll position. So each stretch of the route is
   given a scroll cost of its vertical run plus its sideways run,
   scaled so the whole route still spans exactly the route's own height: the
   disc then crosses a sideways run over a steady stretch of scrolling
   and settles back onto the viewport line afterwards. */
export type Sample = { len: number; x: number; y: number }
export type ScrollMap = { lens: number[]; keys: number[] }

/* How much of a sideways pixel counts as scrolling, against a vertical one:
   the same, so the disc never moves faster than the page scrolls. */
export const SIDEWAYS_COST = 1

export function buildScrollMap(samples: Sample[], sideways = SIDEWAYS_COST): ScrollMap {
  const lens = samples.map((s) => s.len)
  if (samples.length < 2) return { lens, keys: samples.map((s) => s.y) }
  const cost = [0]
  for (let i = 1; i < samples.length; i++) {
    const dy = Math.abs(samples[i].y - samples[i - 1].y)
    const dx = Math.abs(samples[i].x - samples[i - 1].x)
    cost.push(cost[i - 1] + dy + sideways * dx)
  }
  const first = samples[0].y
  const span = samples[samples.length - 1].y - first
  const total = cost[cost.length - 1]
  return { lens, keys: cost.map((c) => (total > 0 ? first + (span * c) / total : first)) }
}

/* Holds: the disc rests on each of `stops` (distances along the route) for
   `hold` px of scrolling, centred on the stop's own y (`stopYs`, in the same
   order as `stops`; where one is missing, where the map would pass it), so a
   stop stays lit and still while it is read at the viewport line.
   Each stop gets two map points at the same distance, `hold` apart; only the
   runs on either side of a stop are squeezed to make room, so every stop stays
   in step with the viewport line and the disc moves a little quicker between
   stops. */
export function addHolds(map: ScrollMap, stops: number[], hold: number, stopYs?: (number | undefined)[]): ScrollMap {
  const { lens, keys } = map
  const last = keys.length - 1
  if (last < 1 || !stops.length || hold <= 0) return map
  // The scroll key at which the disc would pass each stop.
  const keyAt = (len: number) => lengthKey(map, len)
  // Each stop with where its hold is centred; a stop that would land on or
  // before the previous one (two stops at the same height) is skipped.
  const order: { s: number; k: number }[] = []
  stops
    .map((s, i) => ({ s, k: stopYs?.[i] ?? keyAt(s) }))
    .filter(({ s }) => s > lens[0] && s < lens[last])
    .sort((a, b) => a.s - b.s)
    .forEach((stop) => {
      const previous = order.length ? order[order.length - 1].k : keys[0]
      if (stop.k > previous + 1 && stop.k < keys[last] - 1) order.push(stop)
    })
  if (!order.length) return map
  const sorted = order.map(({ s }) => s)
  // Where each stop sits now, and where its hold is centred.
  const from = [keys[0], ...sorted.map(keyAt), keys[last]]
  const stopKeys = order.map(({ k }) => k)
  // A hold never takes more than half of the run on either side of its stop.
  const bounds = [keys[0], ...stopKeys, keys[last]]
  const gaps = bounds.slice(1).map((k, i) => k - bounds[i])
  const h = Math.min(hold, ...gaps.map((g, i) => (i === 0 || i === gaps.length - 1 ? g : g / 2)))
  if (h <= 0) return map
  // Runs between stops map onto the same span minus half a hold at each stop end.
  const runs = bounds.slice(1).map((to, i) => ({
    from: from[i],
    to: from[i + 1],
    newFrom: bounds[i] + (i > 0 ? h / 2 : 0),
    newTo: to - (i < gaps.length - 1 ? h / 2 : 0),
  }))
  const remap = (k: number, run: (typeof runs)[number]) =>
    run.to > run.from ? run.newFrom + ((k - run.from) * (run.newTo - run.newFrom)) / (run.to - run.from) : run.newFrom
  const out: ScrollMap = { lens: [], keys: [] }
  let next = 0
  for (let i = 0; i <= last; i++) {
    while (next < sorted.length && sorted[next] <= lens[i]) {
      out.lens.push(sorted[next], sorted[next])
      out.keys.push(stopKeys[next] - h / 2, stopKeys[next] + h / 2)
      next++
    }
    out.lens.push(lens[i])
    out.keys.push(remap(keys[i], runs[next]))
  }
  return out
}

/* The scroll key at which the map reaches distance `len` (the inverse of
   lengthAtScroll), clamped to the route. */
export function lengthKey(map: ScrollMap, len: number) {
  const { lens, keys } = map
  const last = lens.length - 1
  if (last < 0) return 0
  if (len <= lens[0]) return keys[0]
  if (len >= lens[last]) return keys[last]
  let i = 1
  while (i < last && lens[i] < len) i++
  const run = lens[i] - lens[i - 1]
  return run > 0 ? keys[i - 1] + ((keys[i] - keys[i - 1]) * (len - lens[i - 1])) / run : keys[i]
}

/* The distance along the route whose scroll key is `y` (a y on the route's own
   coordinates, here the viewport line), clamped to the route. */
export function lengthAtScroll(map: ScrollMap, y: number) {
  const { lens, keys } = map
  const last = keys.length - 1
  if (last < 0) return 0
  if (y <= keys[0]) return lens[0]
  if (y >= keys[last]) return lens[last]
  let lo = 0
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (keys[mid] <= y) lo = mid
    else hi = mid
  }
  const run = keys[hi] - keys[lo]
  return run > 0 ? lens[lo] + ((y - keys[lo]) / run) * (lens[hi] - lens[lo]) : lens[hi]
}
