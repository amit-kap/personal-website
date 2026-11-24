import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react'
import './home01.css'
import ScreenWall from './ScreenWall'
import SiteFooter from './SiteFooter'

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

function Arrow() {
  return <ArrowUpRight size={16} strokeWidth={2} aria-hidden />
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
              My path took me from design school to the advertising industry, then into high-tech cybersecurity, where
              I've spent the <Link to="/cv">last twelve years</Link> helping companies ship complete product experiences
              to their users.
            </p>
            <p className="h01-para">
              I've designed security products from <Link to="/work/checkpoint">Check Point</Link> to AI-native startups, including as founding designer
              at <Link to="/work/shift">Shift</Link> and <Link to="/work/veriti">Veriti</Link>.
            </p>
          </div>
        </section>

        <section className="h01-group">
          <div className="h01-label">Latest case study</div>
          <ul className="h01-items">
            <li>
              <Link className="h01-link" to="/case-studies/designing-for-the-supervisor">
                <span>Designing for the supervisor</span> <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </Link>
              <span className="h01-desc">How risk analysts oversee AI agents at Shift</span>
            </li>
          </ul>
        </section>

        <section className="h01-group">
          <div className="h01-label">Side projects</div>
          {/* TODO: real links for Glaze and Monocle. */}
          <ul className="h01-items">
            <li>
              <a className="h01-link" href="#">
                <span>Glaze</span> <Arrow />
              </a>
              <span className="h01-desc">Component library</span>
            </li>
            <li>
              <a className="h01-link" href="#">
                <span>Monocle</span> <Arrow />
              </a>
              <span className="h01-desc">Markdown editor</span>
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

        <nav className="h01-icons" aria-label="Links">
          <a href="mailto:amitka111@gmail.com" aria-label="Email">
            <Send size={16} strokeWidth={1.8} aria-hidden />
          </a>
          <a href="https://www.linkedin.com/in/amitkaplinsky" aria-label="LinkedIn">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18.945 18.945L15.68 18.945 15.68 13.384C15.68 11.86 15.101 11.007 13.894 11.007 12.581 11.007 11.895 11.895 11.895 13.384L11.895 18.945 8.749 18.945 8.749 8.352 11.895 8.352 11.895 9.779C11.895 9.779 12.842 8.028 15.09 8.028 17.336 8.028 18.945 9.4 18.945 12.238L18.945 18.945ZM4.996 6.965C3.924 6.965 3.056 6.09 3.056 5.01 3.056 3.931 3.924 3.056 4.996 3.056 6.067 3.056 6.935 3.931 6.935 5.01 6.935 6.09 6.067 6.965 4.996 6.965ZM3.371 18.945L6.651 18.945 6.651 8.352 3.371 8.352 3.371 18.945Z" />
            </svg>
          </a>
          <a href="https://github.com/amit-kap" aria-label="GitHub">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 14.667v-2.667a3.2 3.2 0 0 0-0.667-2.333c2 0 4-1.333 4-3.667 0.053-0.833-0.18-1.653-0.666-2.333 0.187-0.767 0.187-1.567 0-2.334 0 0-0.667 0-2 1-1.760-0.333-3.573-0.333-5.334 0C4 1.333 3.333 1.333 3.333 1.333c-0.2 0.767-0.2 1.567 0 2.334A3.602 3.602 0 0 0 2.667 6c0 2.333 2 3.667 4 3.667-0.26 0.327-0.453 0.7-0.567 1.1-0.113 0.4-0.147 0.82-0.1 1.233v2.667" />
              <path d="M6 12c-3.007 1.333-3.333-1.333-4.667-1.333" />
            </svg>
          </a>
        </nav>

        <SiteFooter />
      </main>

      <aside className="h01-wall" aria-hidden="true">
        <ScreenWall columns={3} />
      </aside>
    </div>
  )
}
