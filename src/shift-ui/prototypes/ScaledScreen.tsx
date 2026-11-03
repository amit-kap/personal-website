import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import '../shift-ui.css'

/* A Shift screen laid out at the width of a real laptop and scaled down to fit
   the frame, so it reads like the screenshots beside it. The frame keeps their
   2880:1452 ratio; the screen scrolls inside itself, like the product does. */
const WIDTH = 1440
const HEIGHT = Math.round((WIDTH * 1452) / 2880)

export function ScaledScreen({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const fit = () => setScale(el.clientWidth / WIDTH)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={frame} style={{ position: 'relative', aspectRatio: '2880 / 1452', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <div className="shift-ui">{children}</div>
      </div>
    </div>
  )
}
