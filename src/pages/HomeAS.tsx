import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import anim from '@/lib/titlesAnimation.json'

const base = import.meta.env.BASE_URL
const asset = (name: string) => `${base}home/${name}`

/* In the intro AS points at about 10.5 s. The first title starts fading in at 8 s,
   per Amit, and the rest follow 0.45 s apart. */
const REVEAL_AT = 8

function useHeroReveal() {
  const intro = useRef<HTMLVideoElement>(null)
  const loop = useRef<HTMLVideoElement>(null)
  const [waiting, setWaiting] = useState(true)
  const [looping, setLooping] = useState(false)

  useEffect(() => {
    const art = intro.current
    const loopEl = loop.current
    if (!art || !loopEl) return
    const reveal = () => setWaiting(false)

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      art.removeAttribute('autoplay')
      art.pause()
      loopEl.removeAttribute('loop')
      art.poster = asset('last-frame.webp')
      reveal()
      return
    }

    let raf = 0
    const check = () => {
      if (art.currentTime >= REVEAL_AT) reveal()
      else raf = requestAnimationFrame(check)
    }
    raf = requestAnimationFrame(check)
    const onEnded = () => {
      reveal()
      loopEl.currentTime = 0
      loopEl.play().catch(() => {})
      setLooping(true)
    }
    // timeupdate fires only about 4 times a second but also in a background tab, where requestAnimationFrame stops.
    const onTime = () => { if (art.currentTime >= REVEAL_AT) reveal() }
    art.addEventListener('timeupdate', onTime)
    art.addEventListener('ended', onEnded)
    art.addEventListener('error', reveal)
    const safety = setTimeout(reveal, 20000) // never leave the text hidden
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
      art.removeEventListener('timeupdate', onTime)
      art.removeEventListener('ended', onEnded)
      art.removeEventListener('error', reveal)
    }
  }, [])

  return { intro, loop, waiting, looping }
}

/* The numbers for the titles' entrance and nudge live in src/lib/titlesAnimation.json, shared with the
   titles preview (dev only: /__titles/preview). Times are seconds from the moment the first title starts to
   fade in. */
const heroStyle = {
  '--gap': `${anim.gap}s`,
  '--fade': `${anim.fade}s`,
  '--move': `${anim.move}s`,
  '--push-d': `${anim.push}cqw`,
  '--line-offset': `${anim.lineOffset}s`,
  '--nudge': `${anim.nudgeDistance}cqw`,
  '--nudge-time': `${anim.nudgeLength}s`,
  '--nudge-line-delay': `${anim.nudgeLineDelay}s`,
  '--nudge-back-time': `${anim.nudgeBackLength}s`,
  '--disco-in': `${anim.discoIn}s`,
  '--disco-out': `${anim.discoOut}s`,
} as CSSProperties

/* Letters disco: from the nudge start until the nudge stops, `discoCount` random letters at a time light
   up in the primary colour, then jump to others. Toggles a class directly, with no React re-render. */
function startDisco(h1: HTMLElement, seconds: number) {
  const letters = Array.from(h1.querySelectorAll<HTMLElement>('.ch'))
  let lit: HTMLElement[] = []
  const tick = () => {
    lit.forEach((el) => el.classList.remove('on'))
    const pool = letters.filter((el) => !lit.includes(el))
    lit = []
    for (let i = 0; i < anim.discoCount && pool.length; i++) lit.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    lit.forEach((el) => el.classList.add('on'))
  }
  tick()
  const interval = setInterval(tick, anim.discoStep * 1000)
  const stop = setTimeout(() => { clearInterval(interval); lit.forEach((el) => el.classList.remove('on')); lit = [] }, seconds * 1000)
  return () => { clearInterval(interval); clearTimeout(stop); lit.forEach((el) => el.classList.remove('on')) }
}

function useTitleNudge(waiting: boolean, h1: RefObject<HTMLHeadingElement | null>) {
  const [nudged, setNudged] = useState(false)
  useEffect(() => {
    if (waiting || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let stopDisco = () => {}
    const out = setTimeout(() => {
      setNudged(true)
      if (h1.current) stopDisco = startDisco(h1.current, anim.nudgeLength + anim.nudgeHold + anim.nudgeBackLength + anim.nudgeLineDelay)
    }, anim.nudgeAfter * 1000)
    const back = setTimeout(() => setNudged(false), (anim.nudgeAfter + anim.nudgeLength + anim.nudgeHold) * 1000)
    return () => { clearTimeout(out); clearTimeout(back); stopDisco() }
  }, [waiting, h1])
  return nudged
}

/* Scroll shrink: the first stretch of scrolling (one screen high) shrinks the whole hero, as one block, from
   full width down to the 800px editorial column while it stays pinned at the top. The page below only starts
   to move once that is done. Desktop only, and not with reduced motion. */
const COLUMN = 800
const COLUMN_RADIUS = 14

function useHeroShrink(track: RefObject<HTMLDivElement | null>, hero: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrap = track.current
    const el = hero.current
    if (!wrap || !el) return
    const desktop = matchMedia('(min-width: 861px)')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let distance = 1
    let endScale = 1
    const reset = () => {
      wrap.style.height = ''
      wrap.style.marginBottom = ''
      el.style.transform = ''
      el.style.borderRadius = ''
    }
    // Scroll events already arrive once per frame, so paint straight from the handler (no rAF needed).
    const paint = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / distance))
      const s = 1 - p * (1 - endScale)
      el.style.transform = `scale(${s})`
      el.style.borderRadius = `${(COLUMN_RADIUS / s) * p}px`
    }
    const measure = () => {
      if (!desktop.matches || reduced.matches) { reset(); return }
      const heroH = el.offsetHeight
      distance = window.innerHeight
      endScale = Math.min(1, COLUMN / document.documentElement.clientWidth)
      wrap.style.height = `${distance + heroH}px`
      // A scale does not shrink the box, so pull what follows up by the space the card no longer fills.
      wrap.style.marginBottom = `${-(1 - endScale) * heroH}px`
      paint()
    }

    measure()
    window.addEventListener('scroll', paint, { passive: true })
    window.addEventListener('resize', measure)
    desktop.addEventListener('change', measure)
    reduced.addEventListener('change', measure)
    return () => {
      window.removeEventListener('scroll', paint)
      window.removeEventListener('resize', measure)
      desktop.removeEventListener('change', measure)
      reduced.removeEventListener('change', measure)
      reset()
    }
  }, [track, hero])
}

/* Local time in Tel Aviv, 24-hour, refreshed on the minute. */
const telAvivTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())

function useTelAvivTime() {
  const [time, setTime] = useState(telAvivTime)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setTime(telAvivTime())
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50) // next minute change
    }
    timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    return () => clearTimeout(timer)
  }, [])
  return time
}

/* A title line, split into one span per letter so the disco can light them. Spaces and punctuation stay plain. */
function Letters({ text }: { text: string }) {
  return <>{Array.from(text).map((c, i) => (/[A-Za-z]/.test(c) ? <span key={i} className="ch">{c}</span> : c))}</>
}

export default function HomeAS() {
  const { intro, loop, waiting, looping } = useHeroReveal()
  const h1 = useRef<HTMLHeadingElement>(null)
  const time = useTelAvivTime()
  const track = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  useHeroShrink(track, hero)
  const nudged = useTitleNudge(waiting, h1)
  const heroClass = ['hero', waiting ? 'wait' : '', looping ? 'is-looping' : ''].filter(Boolean).join(' ')

  return (
    <>
      <div className="hero-track" ref={track}>
      <section className={heroClass} style={heroStyle} ref={hero}>
        <div className="stage">
        {/* The idle loop sits underneath on its first frame (= the intro's last frame). */}
        <video className="art loop" ref={loop} src={asset('loop.mp4')} muted playsInline loop preload="auto" aria-hidden="true" />
        <video
          className="art intro"
          ref={intro}
          src={asset('intro.mp4')}
          poster={asset('poster.webp')}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-label="AS points at the headline from a Browsercity rooftop"
        />
        <div className="grain" aria-hidden="true" />
        </div>
        <div className="inner">
          <header className="rv" style={{ '--i': 3 } as CSSProperties}>
            <Link className="logo" to="/" aria-label="AS home"><img src={asset('as-badge.svg')} alt="AS" /></Link>
            <nav><a href="#work">Work</a><a href="#about">About</a></nav>
          </header>
          <div className="copy">
            <h1 ref={h1} className={nudged ? 'nudged' : undefined}>
              <span className="soft rv" style={{ '--i': 0 } as CSSProperties}><Letters text="AI slop is everywhere." /></span>
              <span className="line rv" style={{ '--i': 0 } as CSSProperties}><Letters text="I'm the anti‑slop superhero." /></span>
            </h1>
            <p className="sub rv" style={{ '--i': 1 } as CSSProperties}>I take what your AI shipped and turn it into a polished experience humans can enjoy.</p>
            <div className="cta rv" style={{ '--i': 2 } as CSSProperties}>
              <a className="btn" href="mailto:amitka111@gmail.com">Let's talk <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </section>
      </div>

      <main>
        <section className="case column" id="work">
          <div className="eyebrow">Case study</div>
          <div className="cover" role="img" aria-label="Cover image placeholder" />
          <div className="case-row">
            <div>
              <h2>Designing for the supervisor</h2>
              <p>How people oversee AI agents, understand their reasoning and step in when it matters.</p>
            </div>
            <Link className="pill" to="/case-studies/designing-for-the-supervisor">Read <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="bio column" id="about">
          <img src={asset('profile.webp')} alt="Amit Kaplinsky" />
          <div className="bio-text">
            <p>
              <b>Amit Kaplinsky</b>, a designer and a builder in Tel Aviv.
            </p>
            <p>
              I came to product design through advertising, then into
              high-tech cybersecurity, where I have spent the last twelve years designing complex B2B and cyber products and helping
              companies ship complete product experiences.
            </p>
            <p>
              I've designed security products from Check Point to AI-native startups, including as founding designer at{' '}
              <Link to="/work/shift">Shift</Link> and <Link to="/work/veriti">Veriti</Link>.
            </p>
          </div>
        </section>

        <section className="closing column">
          <div>
            <h2>Send me what your AI shipped.</h2>
            <p className="status"><span className="dot" aria-hidden="true" />Available for new projects</p>
          </div>
          <div className="closing-actions">
            <a className="btn" href="mailto:amitka111@gmail.com">Let's talk <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <footer className="column">
          <div className="footer-inner">
          <div className="links" aria-label="Links">
            <a href="https://www.linkedin.com/in/amitkaplinsky" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" /></svg></a>
            <a href="https://github.com/amit-kap" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-6.9a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.3 1.8 5.1 2.2 5.1 2.2a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.5 9.6c0 5.4 3.3 6.5 6.4 6.9a3.4 3.4 0 0 0-.9 2.6V22" /></svg></a>
            <a href="mailto:amitka111@gmail.com" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></a>
          </div>
          <div className="city">Tel Aviv, <time>{time}</time></div>
          </div>
        </footer>
      </main>
    </>
  )
}
