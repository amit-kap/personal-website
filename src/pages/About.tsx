import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'
import { ClaudeMark, CodexMark, CursorMark, FigmaMark } from '@/components/BrandLogos'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'

/* The software group shows tool marks instead of its cv.md list. Matched on the
   heading so renaming "Softwares" to "Software" in cv.md doesn't break it.
   Rows are 32px to match the leading of the Languages column beside it. */
function isSoftware(category: string) {
  return category.trim().toLowerCase().startsWith('software')
}

const tools = [
  { Mark: FigmaMark, name: 'Figma' },
  { Mark: ClaudeMark, name: 'Claude Code' },
  { Mark: CodexMark, name: 'Codex' },
  { Mark: CursorMark, name: 'Cursor' },
]

/* cv.md writes periods as "10/2024 to now" — the page renders "10/2024–Now". */
function formatPeriod(period: string): string {
  return period.replace(' to ', '–').replace(/now$/i, 'Now')
}

function telAvivTime(): string {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
  const offset =
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+3'
  return `${time} · ${offset}`
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 2 V11 M4.5 8 L8 11.5 L11.5 8 M3 13.5 H13" />
    </svg>
  )
}

export default function About() {
  const cv = getCV()
  const [localTime, setLocalTime] = useState(telAvivTime)

  useEffect(() => {
    const tick = setInterval(() => setLocalTime(telAvivTime()), 30_000)
    return () => clearInterval(tick)
  }, [])

  return (
    <main>
      {/* Portrait hero — the photo dissolves into the page through a mask fade */}
      <section className="relative overflow-hidden">
        {/* Centered with auto margins, not a transform, so the drift owns it. */}
        <Parallax ratio={0.4} className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-[min(500px,64vw)]">
          <Reveal scale>
          <img
            src={`${import.meta.env.BASE_URL}portrait-hero.png`}
            alt="Amit Kaplinsky"
            width={847}
            height={1270}
            className="block w-full"
            style={{
              WebkitMaskImage: 'linear-gradient(180deg, #000 34%, rgba(0,0,0,0.38) 58%, transparent 86%)',
              maskImage: 'linear-gradient(180deg, #000 34%, rgba(0,0,0,0.38) 58%, transparent 86%)',
            }}
          />
          </Reveal>
        </Parallax>
        <div className="inner-col relative grid items-end gap-10 pb-16 pt-[clamp(260px,29vw,420px)] lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <Reveal as="p" className="eyebrow" delay={0.15}>About</Reveal>
            <Reveal as="h1" className="font-heading text-feature font-medium tracking-[-0.02em]" delay={0.22}>
              From UX expert at Check Point to founding designer at Shift.
            </Reveal>
            <Reveal as="p" className="body-copy max-w-[460px]" delay={0.3}>
              Twelve years designing security products. Based in Tel Aviv, working in Hebrew and English.
            </Reveal>
          </div>
          <Reveal className="flex flex-col gap-[18px] pb-1 text-meta lg:items-end" delay={0.35}>
            <p className="flex items-baseline gap-2">
              <span className="text-muted-foreground">Local time:</span>
              <span className="font-medium">{localTime}</span>
            </p>
            <div className="flex gap-6 font-medium">
              <a href="mailto:amitka111@gmail.com" className="text-accent transition-colors hover:text-foreground">Email</a>
              <a
                href="https://www.linkedin.com/in/amitka/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition-colors hover:text-foreground"
              >
                LinkedIn
              </a>
              <Link
                to="/cv"
                className="inline-flex items-center gap-[7px] text-accent transition-colors hover:text-foreground"
              >
                Download CV
                <DownloadIcon />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experience — compact hairline grid */}
      <section className="relative border-t border-border">
        <div className="inner-col pb-14 pt-12">
          <Reveal as="p" className="eyebrow pb-2.5">Experience</Reveal>
          {cv.experience.map((entry, i) => (
            <Reveal
              key={entry.slug}
              className={`grid items-baseline gap-x-8 gap-y-2 py-[26px] sm:grid-cols-[170px_330px_minmax(0,1fr)] ${i > 0 ? 'border-t border-border' : ''} ${i === cv.experience.length - 1 ? 'pb-1' : ''}`}
            >
              <p className="text-[13px] text-muted-foreground">{formatPeriod(entry.period)}</p>
              <h2 className="font-heading text-[17px] font-medium tracking-[-0.01em]">
                <Link to={`/work/${entry.slug}`} className="transition-colors hover:text-accent">{entry.company}</Link>
                {' · '}
                {entry.role}
              </h2>
              <p className="text-[14.5px] leading-[1.6] text-copy">{entry.summary}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section className="relative border-t border-border">
        <Reveal className="inner-col grid gap-6 py-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
          <p className="eyebrow">Certificates</p>
          <div className="flex flex-col gap-5">
            {cv.certificates.map((entry) => (
              <div key={entry.title} className="flex items-baseline justify-between gap-6">
                <h2 className="min-w-0 font-heading text-body font-medium tracking-[-0.01em]">{entry.title}</h2>
                <p className="flex-none text-[13px] text-muted-foreground">{entry.meta.replace(' to ', '–')}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Education */}
      <section className="relative border-t border-border">
        <Reveal className="inner-col grid gap-6 py-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
          <p className="eyebrow">Education</p>
          <div className="flex flex-col gap-5">
            {cv.education.map((entry) => (
              <div key={entry.title} className="flex items-baseline justify-between gap-6">
                <h2 className="min-w-0 font-heading text-body font-medium tracking-[-0.01em]">{entry.title}</h2>
                <p className="flex-none text-[13px] text-muted-foreground">{entry.meta.replace(' to ', '–')}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Skills */}
      <section className="relative border-t border-border">
        <Reveal className="inner-col grid gap-6 pb-16 pt-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
          <p className="eyebrow">Skills</p>
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-0">
            {cv.skills.map((group, i) => (
              <div key={group.category} className={`flex flex-col gap-3 ${i > 0 ? 'sm:border-l sm:border-border sm:pl-10' : 'sm:pr-10'}`}>
                <h2 className="font-heading text-body font-medium tracking-[-0.01em]">{group.category}</h2>
                {isSoftware(group.category) ? (
                  <div className="flex flex-col text-[14.5px] text-copy">
                    {tools.map(({ Mark, name }) => (
                      <span key={name} className="flex h-8 items-center gap-2.5">
                        <Mark size={20} />
                        {name}
                      </span>
                    ))}
                    <span className="flex h-8 items-center text-muted-foreground">More tools…</span>
                  </div>
                ) : (
                  <p className="text-[14.5px] leading-8 text-copy">
                    {group.items.map((item) => (
                      <span key={item} className="block">{item}</span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  )
}
