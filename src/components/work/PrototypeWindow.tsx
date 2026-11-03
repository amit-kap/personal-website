/* A live Shift screen in the same browser-window chrome as WindowCard. The
   screen code loads on demand; until then (and in the prerender) the
   screenshot stands in. */
import { lazy, Suspense, useState } from 'react'
import type { ContentImage } from '@/lib/content'
import { WindowCard } from '@/components/work/WindowCard'
import Lightbox from '@/components/work/Lightbox'
import { MediaCaption } from '@/components/work/MediaCaption'

const ShiftDashboard = lazy(() => import('@/shift-ui/prototypes/DashboardPrototype'))

const ShiftVendors = lazy(() => import('@/shift-ui/prototypes/VendorsPrototype'))

const ShiftAssessments = lazy(() => import('@/shift-ui/prototypes/AssessmentsPrototype'))

const screens = { dashboard: ShiftDashboard, vendors: ShiftVendors, assessments: ShiftAssessments } as const
export type PrototypeName = keyof typeof screens

export function PrototypeWindow({ name, image, alt, caption }: { name: PrototypeName; image?: ContentImage; alt: string; caption: string }) {
  const Screen = screens[name]
  const [open, setOpen] = useState(false)
  return (
    <Suspense fallback={<WindowCard image={image} alt={alt} caption={caption} />}>
      <div className="window proto-window" role="group" aria-label={alt}>
        <span className="winbar">
          <span className="windot windot-r" />
          <span className="windot windot-y" />
          <span className="windot windot-g" />
        </span>
        <Screen />
      </div>
      <MediaCaption label={caption} onEnlarge={() => setOpen(true)} />
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
