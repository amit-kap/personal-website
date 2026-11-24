import { lazy, Suspense, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, WorkTabs, type Tab, type Tile } from './WorkParts'
import { useViewer } from './useViewer'

const base = import.meta.env.BASE_URL

// The live Shift app loads on demand; the dashboard screenshot stands in until it does.
const ShiftApp = lazy(() => import('@/shift-ui/prototypes/ShiftAppPrototype'))

/* One tab per screen of the live app, with the decision behind it; picking one switches the app to that screen. */
const TABS: Tab[] = [
  { name: 'Home', desc: 'Starts from one question: what needs me today? Counts and urgent work come first, details one click away.' },
  { name: 'Inventory', desc: "Every vendor is a living record of evidence, access and exposure, so an assessment starts from what's already known." },
  { name: 'Assessments', desc: 'The agent works in one thread per vendor. People question its verdicts and make the final call.' },
]

/* The bento: the product film as the large tile, then screenshots. Each tile zooms into one readable detail (focus
   point x/y in % of the image, zoom z); clicking a tile opens the whole thing. */
const TILES: Tile[] = [
  { video: 'shift-motion-v2.mp4', poster: 'shift-motion-poster.webp', alt: 'Shift product film', size: 'lg' },
  { brand: 'shift', color: '#111111', alt: 'Shift logo' },
  { file: '03-inventory-vendors-card.webp', alt: 'Vendor card: security score', x: 37.2, y: 30, z: 4.9 },
  { file: '07-assessment-flow-1.webp', alt: "Assessment: the agent's recommendation", x: 19.6, y: 70.4, z: 5, size: 'wide' },
  { file: '04-vendor-access-graph.webp', alt: 'Access graph: a resource and the sensitive data it holds', x: 52.4, y: 25.8, z: 3.6, size: 'wide' },
  { file: '05-threat-center.webp', alt: 'Threat center: an alert', x: 0, y: 33.7, z: 8.5 },
  { file: '06-integrations-grid.webp', alt: 'Integrations', x: 59.8, y: 97.5, z: 3.5 },
  { file: '00-login.webp', alt: 'Login', x: 0, y: 20.3, z: 2.4 },
]

/* The Shift work page in the case study's centered column, with the home page's type: the title, the live product,
   then the text. */
export default function ShiftPage() {
  const work = getWorkBySlug('shift')
  const dialog = useRef<HTMLDialogElement>(null)
  const [screen, setScreen] = useState('Home')
  const [large, setLarge] = useState(false)
  const viewer = useViewer()

  const hero = work?.heroImage

  return (
    <div className="h01 h01-center h01-case h01-work">
      <main className="h01-col">
        <CornerMark />

        <h1 className="h01-title">{work?.productTitle}</h1>
        <Byline company="Shift" role="Founding Designer" years="2024-2026" />

        <p className="h01-text h01-intro">
          I joined Shift as its first designer when the team was five people, and stayed as it grew past twenty. Vendor
          security reviews ran on spreadsheets and long email threads. We replaced them with one workflow: an AI agent runs
          the assessment, and the security team reviews its findings and makes the call. Design partners and early customers
          used it to cut manual review hours and raise vendor onboarding completion.
        </p>

        {/* The real product, live: click the sidebar to move between Home, Inventory and Assessments. Enlarge opens it
            over the page; both views share the current screen. */}
        <button
          type="button"
          className="h01-enlarge"
          onClick={() => {
            setLarge(true)
            dialog.current?.showModal()
          }}
        >
          <Maximize2 size={16} strokeWidth={1.5} aria-hidden /> Enlarge
        </button>
        <div className="h01-app" role="group" aria-label="Shift product, interactive">
          <Suspense fallback={hero ? <img src={hero.src} width={hero.width} height={hero.height} alt="Shift home dashboard" /> : null}>
            {large ? (
              hero && <img src={hero.src} width={hero.width} height={hero.height} alt="" />
            ) : (
              <ShiftApp screen={screen} onScreen={setScreen} />
            )}
          </Suspense>
        </div>
        <dialog
          ref={dialog}
          className="h01-lightbox"
          aria-label="Shift product, enlarged"
          onClose={() => setLarge(false)}
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        >
          <button type="button" className="h01-lightbox-close" aria-label="Close" onClick={() => dialog.current?.close()}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </button>
          {large && (
            <div className="h01-app h01-app-large">
              <Suspense fallback={null}>
                <ShiftApp screen={screen} onScreen={setScreen} fill />
              </Suspense>
            </div>
          )}
        </dialog>

        <WorkTabs tabs={TABS} active={screen} onPick={setScreen} label="Shift screens" />

        <Bento
          tiles={TILES}
          images={work?.bodyImages ?? {}}
          onOpen={viewer.show}
        />
        {viewer.dialog}

        <StoryPreview slug="designing-for-the-supervisor" />

        <SiteFooter />
      </main>
    </div>
  )
}
