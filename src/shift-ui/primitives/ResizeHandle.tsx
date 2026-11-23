import type { KeyboardEvent, PointerEvent } from 'react'

/* A drag handle on the edge of a column. `edge` is the side of the column it
   sits on: 'right' for a column at the left of the screen, 'left' for one at
   the right. The width follows the pointer from the column's own anchored
   edge, in the screen's own pixels, so it also works when the screen is scaled
   down and when other columns sit beside it. Arrow keys nudge it and a double
   click resets it. */
export function ResizeHandle({
  edge,
  width,
  initial,
  clamp,
  onWidth,
  onDragging,
  label,
}: {
  edge: 'left' | 'right'
  width: number
  initial: number
  clamp: (w: number) => number
  onWidth: (w: number) => void
  onDragging: (dragging: boolean) => void
  label: string
}) {
  const start = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const column = handle.parentElement!
    const rect = column.getBoundingClientRect()
    const k = rect.width / column.offsetWidth || 1
    onDragging(true)
    /* One update per frame: the whole screen re-renders on each. */
    let frame = 0
    let latest = 0
    const move = (ev: globalThis.PointerEvent) => {
      latest = Math.round(edge === 'right' ? (ev.clientX - rect.left) / k : (rect.right - ev.clientX) / k)
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0
          onWidth(clamp(latest))
        })
    }
    const end = () => {
      cancelAnimationFrame(frame)
      onDragging(false)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }
  const nudge = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16
    const grow = edge === 'right' ? 'ArrowRight' : 'ArrowLeft'
    const shrink = edge === 'right' ? 'ArrowLeft' : 'ArrowRight'
    if (e.key === grow) onWidth(clamp(width + step))
    else if (e.key === shrink) onWidth(clamp(width - step))
    else return
    e.preventDefault()
  }
  return (
    <div
      className="s-ac-resize"
      data-edge={edge}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={clamp(0)}
      aria-valuemax={clamp(100000)}
      tabIndex={0}
      onPointerDown={start}
      onKeyDown={nudge}
      onDoubleClick={() => onWidth(clamp(initial))}
    />
  )
}
