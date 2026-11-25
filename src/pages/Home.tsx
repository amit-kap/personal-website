import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Download, Send } from 'lucide-react'
import './home01.css'
import ScreenWall from './ScreenWall'
import SiteFooter from './SiteFooter'
import { CV_PDF_URL } from '@/lib/cvPdf'

const base = import.meta.env.BASE_URL

/* What the 20% adds, typed in and deleted with a cursor line. "enjoyable" is last and stays longest. */
// Design words, then the business ones: each finishes "My 20% makes it …".
const WORDS = ['clear', 'simple', 'precise', 'fast', 'trusted', 'sell', 'stick', 'scale', 'enjoyable']
const TYPE = 90 // ms per letter typed
const DELETE = 45 // ms per letter deleted
const HOLD = 1800
const HOLD_LAST = 3600
const PAUSE = 300 // empty, before the next word

function useTypedWord() {
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(WORDS[0].length)
  const [deleting, setDeleting] = useState(false)
  const word = WORDS[index]
  const holding = !deleting && length === word.length

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let wait: number
    let next: () => void
    if (holding) {
      wait = index === WORDS.length - 1 ? HOLD_LAST : HOLD
      next = () => setDeleting(true)
    } else if (deleting && length > 0) {
      wait = DELETE
      next = () => setLength((l) => l - 1)
    } else if (deleting) {
      wait = PAUSE
      next = () => {
        setDeleting(false)
        setIndex((i) => (i + 1) % WORDS.length)
      }
    } else {
      wait = TYPE
      next = () => setLength((l) => l + 1)
    }
    const timer = setTimeout(next, wait)
    return () => clearTimeout(timer)
  }, [index, length, deleting, holding])

  return { text: word.slice(0, length), word, holding }
}

/* The block cursor with a trail, after a terminal smear cursor: the inline block only holds the cursor's place;
   the visible block is drawn over it and, on each move, stretches from where it was to where it is and then snaps
   shut on the new spot. Each move also leaves a soft afterglow that fades and blurs away. All of it sits behind
   the letters, so the text stays readable as the cursor runs over it. */
const BLOCK = 16
function Caret({ text, holding }: { text: string; holding: boolean }) {
  const slot = useRef<HTMLSpanElement>(null)
  const block = useRef<HTMLSpanElement>(null)
  const last = useRef<number | null>(null)
  const id = useRef(0)
  const [ghosts, setGhosts] = useState<{ id: number; x: number; y: number; w: number }[]>([])

  useLayoutEffect(() => {
    const el = slot.current
    const b = block.current
    if (!el || !b) return
    const x = el.offsetLeft
    b.style.left = `${x}px`
    b.style.top = `${el.offsetTop}px`
    const from = last.current
    last.current = x
    if (from === null || from === x || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const left = Math.min(from, x)
    const w = Math.abs(x - from) + BLOCK
    b.animate(
      [
        { left: `${left}px`, width: `${w}px` },
        { left: `${x}px`, width: `${BLOCK}px` },
      ],
      { duration: 160, easing: 'cubic-bezier(.2, .8, .2, 1)' },
    )
    setGhosts((g) => [...g.slice(-10), { id: ++id.current, x: left, y: el.offsetTop, w }])
  }, [text])

  return (
    <>
      {ghosts.map((g) => (
        <span
          key={g.id}
          className="h01-caret-glow"
          style={{ left: g.x, top: g.y, width: g.w }}
          aria-hidden="true"
          onAnimationEnd={() => setGhosts((all) => all.filter((t) => t.id !== g.id))}
        />
      ))}
      <span ref={block} className={`h01-caret-block${holding ? ' blink' : ''}`} aria-hidden="true" />
      <span ref={slot} className="h01-caret" aria-hidden="true" />
    </>
  )
}

/* A small picture of a side project's site, shown above its link on hover or keyboard focus (240x120). */
function Peek({ to, children }: { to: string; children: ReactNode }) {
  return (
    <span className="h01-peek">
      {children}
      <span className="h01-peek-box" aria-hidden="true">
        <img src={`${base}previews/${to}.jpg`} alt="" width={240} height={120} loading="lazy" />
      </span>
    </span>
  )
}

function Arrow() {
  return <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden />
}

export default function Home() {
  const { text, word, holding } = useTypedWord()

  return (
    <div className="h01 h01-center">
      <main className="h01-col">
        {/* The AK mark and the name sit together at the top, above the headline. */}
        <header className="h01-head">
          <img src={`${base}home01/ak-logo.svg`} alt="" width={72} height={40} />
          <div>
            <p className="h01-name">Amit Kaplinsky</p>
            <p className="h01-role">A designer and a builder, based in Tel Aviv.</p>
          </div>
        </header>

        <h1 className="h01-title">
          <span className="h01-line">AI gets you 80% of the way.</span>
          <b className="h01-line">
            My 20% makes it{' '}
            <span className="h01-word">
              <span className="sr-only">{word}</span>
              <span aria-hidden="true">{text}</span>
              <Caret text={text} holding={holding} />
            </span>
          </b>
        </h1>

        {/* About, as the first section (Paper "home" frame): the companies are linked in the sentence. */}
        <section className="h01-group">
          <div className="h01-label">About</div>
          <div className="h01-bio">
            <p className="h01-para">
              I went from design school to advertising, then into cybersecurity, where I've spent the{' '}
              <Link to="/cv">last twelve years</Link> designing products end to end, from the first idea to what ships.
            </p>
            <p className="h01-para">
              I've designed security products from <Link to="/work/checkpoint">Check Point</Link> to AI-native startups, including as founding designer
              at <Link to="/work/veriti">Veriti</Link> and <Link to="/work/shift">Shift</Link>.
            </p>
          </div>
        </section>

        <section className="h01-group">
          <div className="h01-label">Latest case study</div>
          <ul className="h01-items">
            <li>
              <Link className="h01-link" to="/case-studies/designing-for-the-supervisor">
                <span>Designing for the supervisor</span> <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
              </Link>
              <span className="h01-desc">How risk analysts oversee AI agents at Shift</span>
            </li>
          </ul>
        </section>

        <section className="h01-group">
          <div className="h01-label">Side projects</div>
          {/* Each side project links to its live site. */}
          <ul className="h01-items">
            <li>
              <Peek to="glaze"><a className="h01-link" href="https://glaze-studio.amitkap.com" target="_blank" rel="noreferrer" data-umami-event="side-project-glaze">
                <span>Glaze</span> <Arrow />
              </a></Peek>
              <span className="h01-desc">Component library</span>
            </li>
            <li>
              <Peek to="monocle"><a className="h01-link" href="https://monocle.amitkap.com" target="_blank" rel="noreferrer" data-umami-event="side-project-monocle">
                <span>Monocle</span> <Arrow />
              </a></Peek>
              <span className="h01-desc">Markdown editor</span>
            </li>
            {/* Not live yet: the name is plain text, with no link or arrow, until it ships. */}
            <li>
              <span className="h01-soon">Turntable</span>
              <span className="h01-desc">Record player for your Apple Music library · Coming soon</span>
            </li>
          </ul>
        </section>

        <p className="h01-status">
          <span className="h01-dot" aria-hidden="true" />
          Available for new projects
        </p>

        <p className="h01-closing">
          Building something that doesn't feel right yet? <a href="mailto:amitka111@gmail.com">Let's talk.</a>
        </p>

        <div className="h01-actions">
          <a className="h01-link h01-pill" href="mailto:amitka111@gmail.com">
            <span>Contact me</span> <Send size={16} strokeWidth={1.5} aria-hidden />
          </a>
          <a className="h01-link h01-pill" href={CV_PDF_URL} download>
            <span>Resume</span> <Download size={16} strokeWidth={1.5} aria-hidden />
          </a>
        </div>

        <nav className="h01-social" aria-label="Links">
          <a href="https://www.linkedin.com/in/amitkaplinsky" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <span aria-hidden="true">·</span>
          <a href="https://x.com/Amitka111" target="_blank" rel="noopener noreferrer">X</a>
          <span aria-hidden="true">·</span>
          <a href="https://github.com/amit-kap" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <SiteFooter />
      </main>

      <aside className="h01-wall" aria-hidden="true">
        <ScreenWall columns={4} />
      </aside>
    </div>
  )
}
