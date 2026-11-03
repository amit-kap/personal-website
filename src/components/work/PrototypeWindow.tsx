/* A live Shift screen in the same browser-window chrome as WindowCard. The
   screen code loads on demand; until then (and in the prerender) the
   screenshot stands in. */
import { lazy, Suspense, useState } from 'react'
import type { ContentImage } from '@/lib/content'
import { WindowCard } from '@/components/work/WindowCard'
import Lightbox from '@/components/work/Lightbox'

const ShiftDashboard = lazy(() => import('@/shift-ui/prototypes/DashboardPrototype'))

const ShiftVendors = lazy(() => import('@/shift-ui/prototypes/VendorsPrototype'))

const ShiftAssessments = lazy(() => import('@/shift-ui/prototypes/AssessmentsPrototype'))

const screens = { dashboard: ShiftDashboard, vendors: ShiftVendors, assessments: ShiftAssessments } as const
export type PrototypeName = keyof typeof screens

export function PrototypeWindow({ name, image, alt }: { name: PrototypeName; image?: ContentImage; alt: string }) {
  const Screen = screens[name]
  const [open, setOpen] = useState(false)
  return (
    <Suspense fallback={<WindowCard image={image} alt={alt} />}>
      <div className="window proto-window" role="group" aria-label={alt}>
        <span className="winbar">
          <span className="windot windot-r" />
          <span className="windot windot-y" />
          <span className="windot windot-g" />
        </span>
        <Screen />
        <button type="button" className="proto-enlarge" onClick={() => setOpen(true)} aria-label={`Enlarge: ${alt}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M7.5 1.5h3v3M4.5 10.5h-3v-3M10.5 1.5 7 5M1.5 10.5 5 7" />
          </svg>
          Click to enlarge
        </button>
      </div>
      {open && (
        <Lightbox src="" alt={alt} onClose={() => setOpen(false)}>
          <div className="window lightbox-window proto-large" role="group" aria-label={alt}>
            <span className="winbar winbar-lg">
              <span className="windot windot-r" />
              <span className="windot windot-y" />
              <span className="windot windot-g" />
            </span>
            <Screen />
          </div>
        </Lightbox>
      )}
    </Suspense>
  )
}
