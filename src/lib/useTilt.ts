import { useCallback, type PointerEvent as ReactPointerEvent } from 'react'

/* 3D tilt toward the cursor with a cursor-tracked glare. The handlers only
   write CSS custom properties (--tilt-x, --tilt-y, --glare-x, --glare-y,
   --glare), and the .tilt rules in portfolio-theme.css turn them into a
   transform and a gradient, so the motion stays on the compositor.
   Mouse and pen only: touch has no hover, and reduced motion opts out in CSS. */
export function useTilt(max = 12) {
  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return
      const el = event.currentTarget
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      el.style.setProperty('--tilt-x', `${(0.5 - py) * 2 * max}deg`)
      el.style.setProperty('--tilt-y', `${(px - 0.5) * 2 * max}deg`)
      el.style.setProperty('--glare-x', `${px * 100}%`)
      el.style.setProperty('--glare-y', `${py * 100}%`)
      el.style.setProperty('--glare', '1')
    },
    [max],
  )

  const onPointerLeave = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const el = event.currentTarget
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--glare', '0')
  }, [])

  return { onPointerMove, onPointerLeave }
}
