/* A live Shift screen in the same browser-window chrome as WindowCard. The
   screen code loads on demand; until then (and in the prerender) the
   screenshot stands in. */
import { lazy, Suspense } from 'react'
import type { ContentImage } from '@/lib/content'
import { WindowCard } from '@/components/work/WindowCard'

const ShiftDashboard = lazy(() => import('@/shift-ui/prototypes/DashboardPrototype'))

const screens = { dashboard: ShiftDashboard } as const
export type PrototypeName = keyof typeof screens

export function PrototypeWindow({ name, image, alt }: { name: PrototypeName; image?: ContentImage; alt: string }) {
  const Screen = screens[name]
  return (
    <Suspense fallback={<WindowCard image={image} alt={alt} />}>
      <div className="window" role="group" aria-label={alt}>
        <span className="winbar">
          <span className="windot windot-r" />
          <span className="windot windot-y" />
          <span className="windot windot-g" />
        </span>
        <Screen />
      </div>
    </Suspense>
  )
}
