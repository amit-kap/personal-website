import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './home01.css'

const base = import.meta.env.BASE_URL

/* What the 20% adds, typed in and deleted with a cursor line. "enjoyable" is last and stays longest. */
const WORDS = ['clear', 'simple', 'precise', 'fast', 'enjoyable']
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

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export default function Home() {
  const { text, word, holding } = useTypedWord()

  return (
    <div className="h01">
      <div className="h01-rail" aria-hidden="true" />

      <main className="h01-col">
        <Link className="h01-logo" to="/" aria-label="Amit Kaplinsky, home">
          <img src={`${base}home01/ak-logo.svg`} alt="" width={80} height={45} />
        </Link>

        <h1 className="h01-title">
          <span className="h01-line">AI gets you 80% of the way.</span>
          <b className="h01-line">
            My 20% makes it{' '}
            <span className="h01-word">
              <span className="sr-only">{word}</span>
              <span aria-hidden="true">{text}</span>
              <span className={`h01-caret${holding ? ' blink' : ''}`} aria-hidden="true" />
            </span>
          </b>
        </h1>

        {/* Bio from the Paper "home" frame. The links go to placeholder pages for now. */}
        <div className="h01-bio">
          <p className="h01-name">Amit Kaplinsky</p>
          <p className="h01-role">A designer and a builder, based in Tel Aviv.</p>
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

        <section className="h01-group">
          <div className="h01-label">Case Study</div>
          <Link className="h01-link" to="/case-studies/designing-for-the-supervisor">
            <span>Designing for the supervisor</span> <Arrow />
          </Link>
        </section>

        <section className="h01-group">
          <div className="h01-label">Projects</div>
          {/* TODO: real links for Glaze and Monocle. */}
          <a className="h01-link" href="#">
            <span>Glaze - Components Library</span> <Arrow />
          </a>
          <a className="h01-link" href="#">
            <span>Monocle - md file editor</span> <Arrow />
          </a>
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9.69 14.458a0.334 0.334 0 0 0 0.625-0.016l4.334-12.668a0.33 0.33 90 0 0-0.423-0.423l-12.668 4.334a0.334 0.334 0 0 0-0.016 0.625l5.288 2.12a1.334 1.334 0 0 1 0.74 0.74z" />
              <path d="M14.57 1.431l-7.294 7.293" />
            </svg>
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
      </main>

    </div>
  )
}
