import { lazy, Suspense, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, useViewer, WorkTabs, type Tab, type Tile } from './WorkParts'

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
const FILM = { src: `${base}shift-motion-v2.mp4`, poster: `${base}shift-motion-poster.webp` }
const TILES: Tile[] = [
  { file: '03-inventory-vendors-card.webp', alt: 'Vendor card: security score', x: 38, y: 30.5, z: 6.5 },
  { file: '07-assessment-flow-1.webp', alt: "Assessment: the agent's recommendation", x: 19.5, y: 75.75, z: 5 },
  { file: '04-vendor-access-graph.webp', alt: 'Access graph: a resource and the sensitive data it holds', x: 52.4, y: 25.8, z: 3.6 },
  { file: '05-threat-center.webp', alt: 'Threat center: an alert', x: 0.6, y: 34.7, z: 4.4 },
  { file: '06-integrations-grid.webp', alt: 'Integrations', x: 60.7, y: 96.6, z: 3.1 },
  { file: '00-login.webp', alt: 'Login', x: 88.9, y: 46.3, z: 2.9 },
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
          I joined Shift as its first designer, when the team was five people, and stayed as it grew past twenty. Together
          we turned a pile of Excel sheets and long email correspondence into a workflow that saves security teams time and improves their security,
          used by our design partners and early customers.
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
          lead={
            <button type="button" aria-label="Play the Shift product film" onClick={() => viewer.show({ src: FILM.src, alt: 'Shift product film', video: true })}>
              <video src={FILM.src} poster={FILM.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
            </button>
          }
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
