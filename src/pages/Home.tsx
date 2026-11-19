import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CV_PDF_URL } from '@/lib/cvPdf'
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
    art.addEventListener('ended', onEnded)
    art.addEventListener('error', reveal)
    const safety = setTimeout(reveal, 20000) // never leave the text hidden
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
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
} as CSSProperties

function useTitleNudge(waiting: boolean) {
  const [nudged, setNudged] = useState(false)
  useEffect(() => {
    if (waiting || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const out = setTimeout(() => setNudged(true), anim.nudgeAfter * 1000)
    const back = setTimeout(() => setNudged(false), (anim.nudgeAfter + anim.nudgeLength + anim.nudgeHold) * 1000)
    return () => { clearTimeout(out); clearTimeout(back) }
  }, [waiting])
  return nudged
}

export default function Home() {
  const { intro, loop, waiting, looping } = useHeroReveal()
  const nudged = useTitleNudge(waiting)
  const heroClass = ['hero', waiting ? 'wait' : '', looping ? 'is-looping' : ''].filter(Boolean).join(' ')

  return (
    <>
      <section className={heroClass} style={heroStyle}>
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
            <h1 className={nudged ? 'nudged' : undefined}>
              <span className="soft rv" style={{ '--i': 0 } as CSSProperties}>AI slop is everywhere.</span>
              <span className="line rv" style={{ '--i': 0 } as CSSProperties}>I'm the anti‑slop superhero.</span>
            </h1>
            <p className="sub rv" style={{ '--i': 1 } as CSSProperties}>I take what your AI shipped and turn it into a polished experience humans can enjoy.</p>
            <div className="cta rv" style={{ '--i': 2 } as CSSProperties}>
              <a className="btn" href="mailto:amitka111@gmail.com">Let's talk <span aria-hidden="true">→</span></a>
              <span className="meta">Freelance and fractional</span>
            </div>
          </div>
        </div>
      </section>

      <main>
        <section className="case column" id="work">
          <div className="eyebrow">Case study</div>
          <div className="cover"><img src={asset('cover.webp')} alt="Designing for the supervisor cover" /></div>
          <div className="case-row">
            <div>
              <h2>Designing for the supervisor</h2>
              <p>How people oversee AI agents, understand their reasoning and step in when it matters.</p>
            </div>
            <Link className="pill" to="/case-studies/designing-for-the-supervisor">Read <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="bio column" id="about">
          <img src={`${base}profile.jpg`} alt="Amit Kaplinsky" />
          <p>
            <b>Amit Kaplinsky</b>, a designer and a builder in Tel Aviv. 12 years designing complex B2B and cyber products.
            Founding designer twice, at <Link to="/work/shift">Shift</Link> and <Link to="/work/veriti">Veriti</Link>.
          </p>
        </section>

        <section className="closing column">
          <div>
            <h2>Building something that doesn't feel right yet?</h2>
            <p>Available for freelance and fractional work.</p>
          </div>
          <a className="btn" href="mailto:amitka111@gmail.com">Let's talk <span aria-hidden="true">→</span></a>
        </section>

        <footer className="column">
          <div className="links" aria-label="Links">
            <a href="mailto:amitka111@gmail.com" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg></a>
            <a href="https://www.linkedin.com/in/amitkaplinsky" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" /></svg></a>
            <a href="https://github.com/amit-kap" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-6.9a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.7s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.3 1.8 5.1 2.2 5.1 2.2a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.5 9.6c0 5.4 3.3 6.5 6.4 6.9a3.4 3.4 0 0 0-.9 2.6V22" /></svg></a>
            <a href={CV_PDF_URL} aria-label="CV"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg></a>
          </div>
          <div className="city">Tel Aviv</div>
        </footer>
      </main>
    </>
  )
}
