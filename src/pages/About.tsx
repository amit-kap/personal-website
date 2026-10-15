import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'
import { buttonVariants } from '@amit-kap/glaze/components/button'
import { logoFor } from '@/lib/workLogos'
import { ClaudeMark, CodexMark, CursorMark, FigmaMark } from '@/components/BrandLogos'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import Seo from '@/components/Seo'

/* The tools group shows brand marks instead of its cv.md list. Matched on the
   heading so small changes to the "Tools" label in cv.md do not break it.
   Rows are 32px to match the leading of the Languages column beside it. */
function isTools(category: string) {
  const label = category.trim().toLowerCase()
  return label.startsWith('tool') || label.startsWith('software')
}

const tools = [
  { Mark: FigmaMark, name: 'Figma' },
  { Mark: ClaudeMark, name: 'Claude Code' },
  { Mark: CodexMark, name: 'Codex' },
  { Mark: CursorMark, name: 'Cursor' },
]

/* cv.md writes periods as "10/2024 to now"; the page renders "10/2024–Now". */
function formatPeriod(period: string): string {
  return period.replace(' to ', '–').replace(/now$/i, 'Now')
}

/* Certificates and education store "Institution · dates" in one meta line;
   split it so the date sits in the left column like an experience period. */
function splitMeta(meta: string): { place: string; date: string } {
  const parts = meta.split(' · ')
  const date = parts.length > 1 ? parts.pop()! : ''
  return { place: parts.join(' · '), date: date.replace(' to ', '–') }
}

export default function About() {
  const cv = getCV()

  return (
    <main>
      <Seo
        title="About"
        description="Product designer with more than a decade of cybersecurity products, making complex products clear and trustworthy in any domain."
        path="/about"
      />
      {/* Portrait hero; the photo dissolves into the page through a mask fade. */}
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
        <div className="inner-col relative grid items-end gap-10 pb-16 pt-[clamp(260px,29vw,420px)]">
          {/* Centred under the centred portrait, like the home section heads;
              the headline balances its two lines so no word hangs alone. */}
          <div className="flex flex-col items-center gap-5 text-center">
            <Reveal as="p" className="eyebrow" delay={0.15}>About</Reveal>
            <Reveal as="h1" className="text-balance font-heading text-feature font-medium" delay={0.22}>
              I like figuring things out and seeing where they can go.
            </Reveal>
            <Reveal className="flex max-w-[640px] flex-col gap-3" delay={0.3}>
              <p className="body-copy text-pretty">
                {cv.header.intro}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Experience in a compact hairline grid. */}
      <section className="relative">
        <div className="inner-col pb-14 pt-12">
          <Reveal as="p" className="eyebrow pb-2.5">Experience</Reveal>
          {cv.experience.map((entry, i) => (
            <Reveal
              key={entry.slug}
              className={`grid items-start gap-x-8 gap-y-2 py-6.5 sm:grid-cols-[140px_260px_minmax(0,1fr)] ${i > 0 ? 'border-t border-border' : ''} ${i === cv.experience.length - 1 ? 'pb-1' : ''}`}
            >
              <p className="text-body text-muted-foreground">{formatPeriod(entry.period)}</p>
              <div className="flex flex-col items-start gap-2">
                <h2 className="font-heading text-stmt font-medium">
                  {/* The mark sits centred on the company line. */}
                  <span className="flex items-center gap-2.5">
                    {logoFor(entry.slug) && (
                      <img src={logoFor(entry.slug)} alt="" width={24} height={24} className="size-6 shrink-0" />
                    )}
                    {entry.company}
                  </span>
                  {/* The role on its own line; founding roles shimmer. */}
                  <span className={`mt-1 block text-body font-normal text-copy ${/founding designer/i.test(entry.role) ? 'shimmer-text' : ''}`}>
                    {entry.role}
                  </span>
                </h2>
                {/* Glaze's ghost button, nudged left by its own padding so its
                    label lines up with the text above. */}
                <Link
                  to={`/work/${entry.slug}`}
                  aria-label={`View the ${entry.company} work`}
                  className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ms-2.5 text-muted-foreground' })}
                >
                  View
                  <svg viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6.875 16.5h19.25" />
                    <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
                  </svg>
                </Link>
              </div>
              <ul className="flex flex-col gap-2 text-body text-copy">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Certificates: same rows as Experience, date left and institution right. */}
      <section className="relative">
        <div className="inner-col pb-14 pt-12">
          <Reveal as="p" className="eyebrow pb-2.5">Certificates</Reveal>
          {cv.certificates.map((entry, i) => {
            const { place, date } = splitMeta(entry.meta)
            return (
              <Reveal
                key={entry.title}
                className={`grid items-start gap-x-8 gap-y-2 py-6.5 sm:grid-cols-[140px_260px_minmax(0,1fr)] ${i > 0 ? 'border-t border-border' : ''} ${i === cv.certificates.length - 1 ? 'pb-1' : ''}`}
              >
                <p className="text-body text-muted-foreground">{date}</p>
                <h2 className="font-heading text-stmt font-medium">{entry.title}</h2>
                <p className="text-body text-copy">{place}</p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Education: same rows as Experience, date left and institution right. */}
      <section className="relative">
        <div className="inner-col pb-14 pt-12">
          <Reveal as="p" className="eyebrow pb-2.5">Education</Reveal>
          {cv.education.map((entry, i) => {
            const { place, date } = splitMeta(entry.meta)
            return (
              <Reveal
                key={entry.title}
                className={`grid items-start gap-x-8 gap-y-2 py-6.5 sm:grid-cols-[140px_260px_minmax(0,1fr)] ${i > 0 ? 'border-t border-border' : ''} ${i === cv.education.length - 1 ? 'pb-1' : ''}`}
              >
                <p className="text-body text-muted-foreground">{date}</p>
                <h2 className="font-heading text-stmt font-medium">{entry.title}</h2>
                <p className="text-body text-copy">{place}</p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Skills */}
      <section className="relative">
        <Reveal className="inner-col flex flex-col gap-6 pb-16 pt-12">
          <p className="eyebrow">Skills</p>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-0">
            {cv.skills.map((group, i) => (
              <div key={group.category} className={`flex flex-col gap-3 ${i > 0 ? 'sm:border-l sm:border-border sm:pl-8' : 'sm:pr-8'}`}>
                <h2 className="font-heading text-body font-medium">{group.category}</h2>
                {isTools(group.category) ? (
                  <div className="flex flex-col text-body text-copy">
                    {tools.map(({ Mark, name }) => (
                      <span key={name} className="flex h-8 items-center gap-2.5">
                        <Mark size={20} />
                        {name}
                      </span>
                    ))}
                    <span className="flex h-8 items-center text-muted-foreground">More tools…</span>
                  </div>
                ) : (
                  <p className="text-body leading-8 text-copy">
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
