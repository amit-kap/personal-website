import { useEffect, useRef } from 'react'
import { JOURNEY_MEDIA_QUERY } from '@/lib/journeyMotion'

/* Render readable content immediately. Phones and reduced-motion visitors
   never need to download or initialize the desktop scroll controller. */
export function JourneyMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = window.matchMedia(JOURNEY_MEDIA_QUERY)
    let disposed = false
    let loading = false
    let cleanup: (() => void) | undefined
    const enhance = () => {
      if (!query.matches || loading) return
      loading = true
      void import('./journey/createJourneyMotion').then(({ createJourneyMotion }) => {
        if (disposed) return
        cleanup = createJourneyMotion(rootRef.current!, stageRef.current!, innerRef.current!)
      }).catch(() => {
        // A failed optional chunk leaves the full static journey usable.
        loading = false
      })
    }
    enhance()
    query.addEventListener('change', enhance)
    return () => {
      disposed = true
      query.removeEventListener('change', enhance)
      cleanup?.()
    }
  }, [])

  return (
    <div ref={rootRef}>
      <div ref={stageRef} className="relative">
        <div ref={innerRef}>{children}</div>
      </div>
    </div>
  )
}
