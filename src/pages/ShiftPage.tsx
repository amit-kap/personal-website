import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'

const base = import.meta.env.BASE_URL

// The live Shift app loads on demand; the dashboard screenshot stands in until it does.
const ShiftApp = lazy(() => import('@/shift-ui/prototypes/ShiftAppPrototype'))

/* One card per screen of the live app, with the decision behind it; clicking one switches the app to that screen. */
const BUILT = [
  { name: 'Home', screen: 'Home', desc: 'Starts from one question: what needs me today? Counts and urgent work come first, details one click away.' },
  { name: 'Inventory', screen: 'Inventory', desc: "Every vendor is a living record of evidence, access and exposure, so an assessment starts from what's already known." },
  { name: 'Assessments', screen: 'Assessments', desc: 'The agent works in one thread per vendor. People question its verdicts and make the final call.' },
]

/* The bento: the product film as the large tile, then screenshots. Each tile zooms into one readable detail (focus
   point x/y in % of the image, zoom z); clicking a tile opens the whole thing. */
const FILM = { src: `${base}shift-motion-v2.mp4`, poster: `${base}shift-motion-poster.webp` }
const SCREENS = [
  { file: '03-inventory-vendors-card.webp', alt: 'Vendor card: security score', x: 38, y: 30.5, z: 6.5 },
  { file: '07-assessment-flow-1.webp', alt: "Assessment: the agent's recommendation", x: 19.5, y: 75.75, z: 5 },
  { file: '04-vendor-access-graph.webp', alt: 'Access graph: a resource and the sensitive data it holds', x: 52.4, y: 25.8, z: 3.6 },
  { file: '05-threat-center.webp', alt: 'Threat center: an alert', x: 0.6, y: 34.7, z: 4.4 },
  { file: '06-integrations-grid.webp', alt: 'Integrations', x: 60.7, y: 96.6, z: 3.1 },
  { file: '00-login.webp', alt: 'Login', x: 5, y: 39.5, z: 2 },
]

/* The Shift work page in the case study's centered column, with the home page's type: the title, the live product,
   then the text. */
export default function ShiftPage() {
  const work = getWorkBySlug('shift')
  const corner = useRef<HTMLAnchorElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [screen, setScreen] = useState('Home')
  const [large, setLarge] = useState(false)
  const viewer = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState<{ src: string; alt: string; video?: boolean } | null>(null)
  const show = (item: { src: string; alt: string; video?: boolean }) => {
    setShown(item)
    viewer.current?.showModal()
  }

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      corner.current?.style.setProperty('--read', String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const hero = work?.heroImage

  return (
    <div className="h01 h01-center h01-case h01-work">
      <main className="h01-col">
        <Link className="h01-corner" to="/" aria-label="Back to home" ref={corner}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle className="h01-ring-track" cx="32" cy="32" r="30" />
            <circle className="h01-ring" cx="32" cy="32" r="30" />
          </svg>
          <img src={`${base}home01/ak-logo.svg`} alt="" width={36} height={20} />
          <ArrowLeft className="h01-corner-arrow" size={20} strokeWidth={2} aria-hidden />
        </Link>

        <h1 className="h01-title">{work?.productTitle}</h1>
        <p className="h01-byline">
          <span className="h01-name">Shift</span>
          <span className="h01-role">·</span>
          <span className="h01-role">Founding Designer</span>
          <span className="h01-role">·</span>
          <span className="h01-role">2024-2026</span>
        </p>

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

        {/* Tabs for the live app: each names a screen and the decision behind it; the active one has an accent line. */}
        <ul className="h01-tabs" aria-label="Shift screens">
          {BUILT.map((b) => (
            <li key={b.name}>
              <button
                type="button"
                className="h01-tab"
                aria-pressed={screen === b.screen}
                onClick={() => {
                  setScreen(b.screen)
                  const app = document.querySelector('.h01-app')
                  if (app && app.getBoundingClientRect().top < 0) app.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
              >
                <span className="h01-name">{b.name}</span>
                <span className="h01-desc">{b.desc}</span>
              </button>
            </li>
          ))}
        </ul>

        <section className="h01-group">
          <div className="h01-label">Screens</div>
          <ul className="h01-bento">
            <li>
              <button type="button" aria-label="Play the Shift product film" onClick={() => show({ src: FILM.src, alt: 'Shift product film', video: true })}>
                <video src={FILM.src} poster={FILM.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
              </button>
            </li>
            {SCREENS.map((sc) => {
              const img = work?.bodyImages[sc.file]
              return img ? (
                <li key={sc.file}>
                  <button type="button" aria-label={`${sc.alt}, open full screen`} onClick={() => show({ src: img.src, alt: sc.alt })}>
                    <img
                      src={img.src}
                      width={img.width}
                      height={img.height}
                      alt=""
                      loading="lazy"
                      style={{ '--x': `${sc.x}%`, '--y': `${sc.y}%`, '--z': sc.z } as CSSProperties}
                    />
                  </button>
                </li>
              ) : null
            })}
          </ul>
        </section>

        <dialog ref={viewer} className="h01-lightbox" aria-label={shown?.alt} onClose={() => setShown(null)} onClick={(e) => e.target === e.currentTarget && viewer.current?.close()}>
          <button type="button" className="h01-lightbox-close" aria-label="Close" onClick={() => viewer.current?.close()}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </button>
          {shown?.video ? (
            <video className="h01-shown" src={shown.src} autoPlay muted loop playsInline controls />
          ) : shown ? (
            <img className="h01-shown" src={shown.src} alt={shown.alt} />
          ) : null}
        </dialog>

        <section className="h01-group">
          <div className="h01-label">Case study</div>
          <ul className="h01-items">
            <li>
              <Link className="h01-link" to="/case-studies/designing-for-the-supervisor">
                <span>Designing for the supervisor</span> <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <span className="h01-desc">How risk analysts oversee AI agents at Shift</span>
            </li>
          </ul>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
