import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'

const base = import.meta.env.BASE_URL

// The live Shift app loads on demand; the dashboard screenshot stands in until it does.
const ShiftApp = lazy(() => import('@/shift-ui/prototypes/ShiftAppPrototype'))

const BUILT = [
  { name: 'A design system from zero', desc: 'Tokens, components and density rules for a data-heavy security product.' },
  { name: 'Onboarding', desc: 'From first login to connected data sources and a vendor inventory with real context.' },
  { name: 'The core surfaces', desc: 'Home, vendor inventory, access graph and assessments in one product a supervisor can navigate.' },
  { name: 'Human-agent supervision', desc: 'Where the agent acts, where it asks, and what a person sees before deciding.' },
]

/* The Shift work page in the case study's centered column, with the home page's type: the title, the live product,
   then the text. */
export default function ShiftPage() {
  const work = getWorkBySlug('shift')
  const corner = useRef<HTMLAnchorElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [screen, setScreen] = useState('Home')
  const [large, setLarge] = useState(false)

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

        {/* The real product, live: click the sidebar to move between Home, Inventory and Assessments. Enlarge opens it
            over the page; both views share the current screen. */}
        <div className="h01-app" role="group" aria-label="Shift product, interactive">
          <Suspense fallback={hero ? <img src={hero.src} width={hero.width} height={hero.height} alt="Shift home dashboard" /> : null}>
            {large ? (
              hero && <img src={hero.src} width={hero.width} height={hero.height} alt="" />
            ) : (
              <ShiftApp screen={screen} onScreen={setScreen} />
            )}
          </Suspense>
        </div>
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

        <p className="h01-text h01-intro">
          I joined Shift as its first designer. I helped define the human-agent operating model, then built the design
          system, onboarding, and core workflows connecting vendor evidence, access, exposure, and risk decisions.
        </p>

        <section className="h01-group">
          <div className="h01-label">What I built</div>
          <ul className="h01-cards">
            {BUILT.map((b) => (
              <li key={b.name}>
                <span className="h01-name">{b.name}</span>
                <span className="h01-desc">{b.desc}</span>
              </li>
            ))}
          </ul>
        </section>

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
