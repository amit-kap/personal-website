import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getAllWorks, type Work } from '@/lib/content'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { revealPill } from '@/components/pillButton'
import { useTilt } from '@/lib/useTilt'
import { logoFor } from '@/lib/workLogos'
import StarBorder from '@/components/react-bits/StarBorder'
import Seo from '@/components/Seo'
import FlowOverlay from '@/components/FlowOverlay'

/* Every section is a full-width band of the 960px centre column; the 800px
   content column sits inside it (Paper: padding-inline 16px, width 800px). */
const innerClass = 'flex w-full max-w-[800px] flex-col gap-4'
const bandClass = 'flex flex-col items-center px-4'
const labelClass = 'text-body leading-5 text-muted-foreground'

function ShiftMark() {
  return (
    <svg className="size-7.5 shrink-0 text-foreground" width="30" height="30" viewBox="0 -38 30 30" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M13.309-37.917C13.506-38.027 13.749-38.027 13.946-37.917L21.936-33.49C22.24-33.321 22.344-32.949 22.169-32.657 21.992-32.366 21.604-32.267 21.3-32.436L13.627-36.688 6.272-32.611V-24.459L13.946-20.206C14.25-20.037 14.354-19.665 14.178-19.374 14.002-19.082 13.613-18.984 13.309-19.152L5.317-23.58C5.121-23.689 5-23.89 5-24.108V-32.962C5-33.18 5.121-33.381 5.317-33.49L13.309-37.917Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M5.085-33.269C5.261-33.56 5.65-33.659 5.955-33.49L13.946-29.064C14.25-28.895 14.354-28.523 14.178-28.231 14.001-27.94 13.613-27.841 13.309-28.009L5.317-32.436C5.014-32.605 4.91-32.977 5.085-33.269Z" />
      <path d="M13.627-28.535V-19.68L21.617-32.962 13.627-28.535Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M22.067-33.394C22.271-33.199 22.313-32.896 22.169-32.657L14.179-19.376C14.035-19.137 13.741-19.02 13.464-19.091 13.185-19.163 12.991-19.404 12.991-19.68V-28.535C12.991-28.752 13.113-28.954 13.309-29.063L21.299-33.49C21.549-33.628 21.864-33.589 22.067-33.394ZM14.264-28.184V-21.956L19.883-31.297 14.264-28.184Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M13.627-20.289C13.979-20.289 14.264-20.016 14.264-19.68 14.264-19.556 14.225-19.441 14.16-19.345L10.183-12.734C10.008-12.442 9.617-12.341 9.314-12.51 9.01-12.678 8.905-13.05 9.08-13.341L13.075-19.982C13.105-20.031 13.14-20.075 13.181-20.113 13.295-20.221 13.454-20.289 13.627-20.289Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.072-26.626C17.249-26.918 17.637-27.016 17.941-26.847L25.932-22.42C26.236-22.251 26.34-21.879 26.164-21.588 25.989-21.296 25.6-21.197 25.295-21.366L17.304-25.794C17-25.962 16.896-26.335 17.072-26.626Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M9.08-13.341C9.256-13.633 9.646-13.732 9.95-13.564L17.941-9.136C18.245-8.967 18.349-8.595 18.172-8.304 17.997-8.012 17.608-7.914 17.304-8.082L9.314-12.51C9.01-12.678 8.905-13.05 9.08-13.341Z" />
      <path d="M17.623-8.61L25.614-13.038V-21.894L17.623-8.61Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M25.779-22.481C26.056-22.41 26.25-22.169 26.25-21.894V-13.038C26.25-12.82 26.129-12.62 25.932-12.511L17.941-8.082C17.692-7.945 17.377-7.984 17.174-8.179 16.97-8.374 16.927-8.675 17.071-8.914L25.063-22.198C25.206-22.436 25.5-22.553 25.779-22.481ZM19.359-10.275L24.979-13.389V-19.616L19.359-10.275Z" />
    </svg>
  )
}

function useAllowMotion() {
  const [allow, setAllow] = useState(true)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAllow(!query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return allow
}

/* Canvas colours can't read custom properties, so resolve the token from
   the root. The body renders client-side only, so the document is there. */
function useTokenColor(token: string) {
  const [color] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim() || 'transparent',
  )
  return color
}

type Push = 'up' | 'down' | 'right'

const rotation: Record<string, string[]> = homeCopy.headlineRotation
const pushFor: Record<string, Push> = { Senior: 'up', Product: 'down', Designer: 'right' }
/* Stagger order: top word, then left, then right. */
const orderFor: Record<string, number> = { Senior: 0, Product: 1, Designer: 2 }

/* One pulse moves the words on one after another (STAGGER_MS apart). Each
   word pushes and resizes its slot together over PUSH_MS, then everything
   holds for HOLD_MS. */
const PUSH_MS = 700
const STAGGER_MS = 700
const HOLD_MS = 3000
const PUSH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/* Clip each slot only along its push axis, so a width change never cuts a
   vertically pushed word at the sides. */
const clipFor: Record<Push, string> = { up: 'inset(0 -100vw)', down: 'inset(0 -100vw)', right: 'inset(-100vh 0)' }

function usePulse(enabled: boolean) {
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const id = window.setInterval(() => setPulse((p) => p + 1), PUSH_MS + 2 * STAGGER_MS + HOLD_MS)
    return () => window.clearInterval(id)
  }, [enabled])
  return enabled ? pulse : 0
}

/* A word slot that pushes the old word out and the new one in while its
   width eases to the new word. The pushed layers span the whole slot, so a
   word always travels clear of it. */
function RotatingWord({ words, index, push, order }: { words: string[]; index: number; push: Push; order: number }) {
  const current = index % words.length
  const previous = index > 0 ? (index - 1) % words.length : null
  const sizers = useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = useState<number[]>([])

  // Every word's width, kept current as the type scale or font changes.
  useLayoutEffect(() => {
    const measure = () => setWidths(sizers.current.map((el) => el?.getBoundingClientRect().width ?? 0))
    measure()
    const observer = new ResizeObserver(measure)
    sizers.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [words])

  const delay = `${order * STAGGER_MS}ms`
  const motion = { animationDuration: `${PUSH_MS}ms`, animationDelay: delay, animationTimingFunction: PUSH_EASE }
  const layer = 'absolute inset-0 flex justify-center'

  return (
    <span
      className="hero-word relative inline-block whitespace-nowrap align-top transition-[width]"
      style={{
        width: widths[current] || undefined,
        clipPath: clipFor[push],
        ['--push-x' as string]: widths.length ? `${Math.max(...widths)}px` : undefined,
        transitionDuration: `${PUSH_MS}ms`,
        transitionDelay: delay,
        transitionTimingFunction: PUSH_EASE,
      }}
    >
      {/* Invisible copies: the current one gives the slot its height, the
          absolute ones are measured for widths. */}
      <span className="invisible inline-block">{words[current]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          ref={(el) => {
            sizers.current[i] = el
          }}
          aria-hidden="true"
          className="invisible absolute top-0 left-0 inline-block"
        >
          {word}
        </span>
      ))}
      {previous !== null && (
        <span key={`out-${index}`} className={`${layer} push-out-${push}`} style={motion}>
          {words[previous]}
        </span>
      )}
      <span key={`in-${index}`} className={index > 0 ? `${layer} push-in-${push}` : layer} style={index > 0 ? motion : undefined}>
        {words[current]}
      </span>
    </span>
  )
}

function Hero() {
  const pulse = usePulse(useAllowMotion())
  const starColor = useTokenColor('--primary')

  return (
    <section className="flex flex-col items-center px-6 py-20 text-center">
      <Reveal>
        {/* React Bits Star Border (Ember trail and glow): one star lapping the pill outline. */}
        <StarBorder
          as="div"
          color={starColor}
          duration={4.8}
          trailLength={0.45}
          glow={0.8}
          hover="brighten"
          radius={9999}
          backgroundColor="transparent"
          textColor="inherit"
          borderColor="var(--copy-border)"
          className="gap-4! px-6! py-2.25! font-normal! leading-normal!"
        >
          <span className="text-meta text-foreground">{homeCopy.availability}</span>
        </StarBorder>
      </Reveal>
      <Reveal as="h1" delay={0.08} className="mt-10 font-heading text-hero font-medium text-foreground">
        {/* Screen readers and search get the plain title; the rotating
            words are decoration. */}
        <span className="sr-only">{homeCopy.headlineLines.join(' ')}</span>
        {homeCopy.headlineLines.map((line) => (
          <span key={line} aria-hidden="true" className="block">
            {line.split(' ').map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <RotatingWord
                  words={rotation[word] ?? [word]}
                  index={pulse}
                  push={pushFor[word] ?? 'up'}
                  order={orderFor[word] ?? 0}
                />
              </Fragment>
            ))}
          </span>
        ))}
      </Reveal>
      <Reveal as="p" delay={0.16} className="mt-6 w-full max-w-[568px] text-stmt text-muted-foreground">
        {homeCopy.supportingCopy}
      </Reveal>
    </section>
  )
}

/* The Shift capture sits whole inside the frame with an even 1% border
   (percentage padding is relative to width on every side), and the frame
   takes the capture's own ~2:1 shape instead of cropping it to 16:9. */
const featuredMedia = 'block h-auto w-full rounded-item'

function Featured() {
  const { featured } = homeCopy
  const allowMotion = useAllowMotion()
  return (
    <section className={`${bandClass} py-10`}>
      <div className={innerClass}>
        <Reveal as="h2" className="text-body leading-5 text-primary">
          {featured.label}
        </Reveal>
        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-container bg-dim p-[1%]">
              {allowMotion ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  width={2144}
                  height={1080}
                  poster="/featured-shift.webp"
                  aria-hidden="true"
                  className={featuredMedia}
                >
                  <source src="/shift-walk.mp4" type="video/mp4" />
                </video>
              ) : (
                <img src="/featured-shift.webp" alt="" width={2880} height={1453} className={featuredMedia} />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 py-4">
              <div className="flex flex-col gap-2">
                {/* Name and what it is read as one title line; the tagline
                    wraps under the name on narrow screens. */}
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stmt">
                  <span className="flex items-center gap-2 text-foreground">
                    <ShiftMark />
                    Shift
                  </span>
                  <span className="text-copy">{featured.tagline}</span>
                </p>
                <p className="flex items-center gap-2 text-body leading-5 text-copy">
                  <span>{featured.role}</span>
                  <span aria-hidden="true" className="text-dim">/</span>
                  <span>{featured.years}</span>
                </p>
              </div>
              {/* The one way into the case study: Glaze's RevealButton as a link,
                  which opens to show its label on hover or keyboard focus. */}
              <RevealButton
                render={<Link to={`/work/${featured.slug}`} />}
                nativeButton={false}
                role="link"
                aria-label={`View the Shift case study: ${featured.tagline}`}
                label="View"
                iconSide="end"
                className={revealPill}
              >
                <svg className="size-5.5" viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6.875 16.5h19.25" />
                  <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
                </svg>
              </RevealButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function RecentWork({ works }: { works: Work[] }) {
  const { recentWork } = homeCopy
  const outcomes = recentWork.outcomes as Record<string, string>
  /* Border glow spots per company: the logo's brightest hues plus a light
     tint (darker logo colours would not show on the dark tile). */
  const glow = recentWork.glow as Record<string, string[]>
  const tiles = works.filter((work) => outcomes[work.slug])
  const tilt = useTilt()
  return (
    <section className={`${bandClass} py-20`}>
      <div className={innerClass}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {recentWork.label}
        </Reveal>
        <Reveal className="grid grid-cols-2 gap-4 md:flex md:h-45">
          {tiles.map((work) => {
            const company = work.company.replace(/ Software$/, '')
            const logo = logoFor(work.slug)
            return (
              <Link
                key={work.slug}
                to={`/work/${work.slug}`}
                aria-label={`${company} case study: ${outcomes[work.slug]}`}
                {...tilt}
                style={
                  glow[work.slug]
                    ? ({
                        '--spot-1': glow[work.slug][0],
                        '--spot-2': glow[work.slug][1],
                        '--spot-3': glow[work.slug][2],
                      } as CSSProperties)
                    : undefined
                }
                className="tilt group relative flex h-30 items-center justify-center rounded-container border border-border bg-background md:h-auto md:flex-1"
              >
                {/* Logo and name sit as one group: at rest it is offset so
                    the logo alone is centred; on hover the logo rises, the
                    name drops in below, and the pair ends up centred. */}
                <span className="tilt-content tilt-reveal flex flex-col items-center gap-4">
                  {logo && <img src={logo} alt="" width={40} height={40} className="size-10" />}
                  <span aria-hidden="true" className="tilt-reveal-label text-body leading-5 text-foreground">
                    {company}
                  </span>
                </span>
                <span aria-hidden="true" className="tilt-glare" />
                {/* Light spots orbiting the border on hover, with a pulsing glow. */}
                <span aria-hidden="true" className="pulse-border">
                  <span className="pulse-glow">
                    <span className="pulse-ring" />
                  </span>
                  <span className="pulse-ring" />
                </span>
              </Link>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

function Problem() {
  const { problem } = homeCopy
  // The second sentence of the headline takes the foreground colour.
  const breakAt = problem.headline.indexOf('. ') + 2
  const problemLead = problem.headline.slice(0, breakAt)
  const problemPayoff = problem.headline.slice(breakAt)
  return (
    <section className={`${bandClass} pt-20`}>
      <div className={innerClass}>
        <div className="flex flex-col gap-4">
          <Reveal as="h2" className={`${labelClass} text-center`}>
            {problem.label}
          </Reveal>
          {/* Two lines on desktop: the lead (816px at 46px) runs a little past
              the 800px column, so the headline reaches 32px out on each side. */}
          <Reveal as="p" delay={0.08} className="text-center font-heading text-feature text-primary md:-mx-8">
            {problemLead.trim()}
            <span className="block text-primary-foreground">{problemPayoff}</span>
          </Reveal>
        </div>
        <Reveal as="ol" className="grid grid-cols-1 items-start gap-8 pt-4 md:grid-cols-2 md:gap-15">
          {problem.items.map((item, index) => (
            <li
              key={index}
              data-flow="problem"
              className="flex flex-col items-start gap-4 rounded-container border border-border p-6"
            >
              <span className="self-stretch text-meta text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="self-stretch font-heading text-stmt text-foreground">{item.title}</h3>
              <p className="self-stretch text-body leading-5 text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* dot - line - dot. Overlaps the neighbouring card borders by 3px (the dots'
   radius), exactly as in Paper. */
function Connector({ className = 'h-10' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex shrink-0 flex-col items-center gap-0.5 ${className}`}>
      <span className="size-1.5 shrink-0 rounded-pill bg-border" />
      <span className="w-0.5 flex-1 bg-border" />
      <span className="size-1.5 shrink-0 rounded-pill bg-border" />
    </div>
  )
}

const stepIcons = [
  // Diagnose
  <>
    <path d="M14.666 2.666v2.668" />
    <path d="M6.666 2.666v2.668" />
    <path d="M6.666 4H5.334a2.666 2.666 90 0 0-2.668 2.666v5.334a8 8 0 0 0 16 0V6.666a2.666 2.666 90 0 0-2.666-2.666h-1.334" />
    <path d="M235 27H233.668a2.666 2.666 0 0 0-2.668 2.666v5.334a8 8 0 0 0 16 0V29.666a2.666 2.666 0 0 0-2.666-2.666h-1.334" />
    <path d="M10.666 20a8 8 0 0 0 16 0v-4" />
    <circle cx="26.666" cy="13.334" r="1.28" />
  </>,
  // Plan
  <>
    <path d="M17.333 6.667h10.667" />
    <path d="M17.333 16h10.667" />
    <path d="M17.333 25.333h10.667" />
    <path d="M4 22.667l2.667 2.666 5.333-5.333" />
    <rect x="4" y="5.333" width="8" height="8" rx="1" />
  </>,
  // Build
  <>
    <path d="M13.333 24v-9.333" />
    <path d="M14.825 2.94a2.667 2.667 0 0 1 2.35 0l10.453 5.128A0.667 0.667 0 0 1 27.333 9.333h-22.666a0.667 0.667 0 0 1-0.294-1.265z" />
    <path d="M18.667 24v-9.333" />
    <path d="M24 24v-9.333" />
    <path d="M4 29.333h24" />
    <path d="M8 24v-9.333" />
  </>,
]

const stepCardClass = 'flex flex-col items-center gap-4 border border-border p-6'

function Solution() {
  const { solution } = homeCopy
  return (
    /* 78px top: with the label (20px) and its gap (16px), the problem cards sit
       114px above Diagnose, the same as Build to the final circle. */
    <section className="flex flex-col items-center px-4 pt-19.5 md:px-[57px]">
      <div className={innerClass}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {solution.label}
        </Reveal>
        <Reveal as="ol" className="flex flex-col items-stretch">
          {solution.steps.map((step, index) => (
            <li key={step.title} className="contents">
              {index > 0 && <Connector className="-mt-[3px] h-20" />}
              <div data-flow="step" className={`${stepCardClass} rounded-container ${index > 0 ? '-mt-[3px]' : ''}`}>
                <svg className="size-8 shrink-0 text-primary" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {stepIcons[index]}
                </svg>
                <h3 className="font-heading text-stmt font-medium text-foreground">{step.title}</h3>
                <p className="text-body leading-5 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
        <div className="-mt-4 flex flex-col items-center">
          {/* Runs through the (hidden) halo to the solid circle, which sits 114px below Build. */}
          <Connector className="relative z-10 -mt-[3px] -mb-6 h-[120px]" />
          {/* The package sits half over the footer: its 160px box (112px circle
              plus 24px padding) hangs 80px below the section, so the circle's
              centre is on the footer's top edge; z-10 keeps it above the
              footer, which comes later. */}
          <Reveal className="relative z-10 -mt-[3px] -mb-20 flex w-full flex-col items-center">
            <div data-flow="final" className="relative flex items-center rounded-pill p-6">
              <div className="relative z-[1] flex items-center rounded-pill bg-primary p-8 ring-6 ring-background">
                {/* Lucide "package": the finished product. Drawn on a 24 grid at
                    48px, so a 1 stroke matches the 2px strokes of the step icons. */}
                <svg className="size-12 shrink-0 text-primary-foreground" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                  <path d="M12 22V12" />
                  <polyline points="3.29 7 12 12 20.71 7" />
                  <path d="m7.5 4.27 9 5.15" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const works = getAllWorks()
  const allowMotion = useAllowMotion()

  return (
    <main>
      <Seo
        title="Amit Kaplinsky | Senior Product Designer"
        description="Senior product designer for founders building complex B2B, AI, or dev tools. More than a decade designing cybersecurity products, from product direction and design systems to AI-assisted builds that ship."
        path="/"
      />
      <Hero />
      <Featured />
      <RecentWork works={works} />
      <div className="relative">
        <Problem />
        <Solution />
        <FlowOverlay animate={allowMotion} />
      </div>
    </main>
  )
}
