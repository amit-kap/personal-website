import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import '../shift-ui.css'

/* A Shift screen laid out at the width of a real laptop and scaled down to fit
   the frame, so it reads like the screenshots beside it. The frame keeps their
   2880:1452 ratio; the screen scrolls inside itself, like the product does.
   With `fill`, the frame takes its parent's whole box instead: at 1440px wide or
   more the screen is real size and lays itself out at that width; below that it
   is scaled down from 1440, as before. */
const WIDTH = 1440
const HEIGHT = Math.round((WIDTH * 1452) / 2880)

export function ScaledScreen({ children, fill = false }: { children: ReactNode; fill?: boolean }) {
  const frame = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: WIDTH, h: HEIGHT })

  useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const fit = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = fill ? Math.min(1, box.w / WIDTH) : box.w / WIDTH
  const width = fill ? Math.max(WIDTH, box.w) : WIDTH
  const height = fill ? box.h / scale : HEIGHT

  return (
    <div ref={frame} style={{ position: 'relative', overflow: 'hidden', ...(fill ? { width: '100%', height: '100%' } : { aspectRatio: '2880 / 1452' }) }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width, height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <div className="shift-ui">{children}</div>
      </div>
    </div>
  )
}
