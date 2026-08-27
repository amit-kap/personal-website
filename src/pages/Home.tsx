import { Link } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks, getWorkBySlug } from '@/lib/content'
import { imageFor } from '@/lib/workImages'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import RollingText from '@/components/RollingText'

/* Per-project presentation: plain-caps meta line, outcome title, and the
   dark→luminous gradient behind the product media. Copy is the approved
   Story-Cards art direction; facts come from cv.md / work.md. */
const projectCards: Record<string, { meta: string; title: string; image: string; g: [string, string, string] }> = {
  shift: {
    meta: 'Third-Party Risk · Founding Designer · 2024 — Now · TLV',
    title: "Designing Shift's vendor-security platform from zero — now out of stealth",
    image: '01-shift-dashboard',
    g: ['#191040', '#4630b8', '#8a76f0'],
  },
  'onyxia-cyber': {
    meta: 'CISO Data · Product Design Team Lead · 2024 · TLV',
    title: 'Connecting executive intent to owners, tasks, and progress at Onyxia',
    image: '01-SSM-1',
    g: ['#0c1f4a', '#1d4ed8', '#60a5fa'],
  },
  veriti: {
    meta: 'Security Controls · Founding Designer · 2021 — 2024 · TLV',
    title: 'Closing the gap between a found weakness and a safe fix at Veriti',
    image: '02',
    g: ['#06302b', '#0f766e', '#2dd4bf'],
  },
  semperis: {
    meta: 'Identity Security · UX Team Lead · 2020 — 2021 · TLV',
    title: 'Moving Semperis from AD recovery to continuous prevention — while building the UX team',
    image: '01-semperis',
    g: ['#37200a', '#b45309', '#fbbf24'],
  },
  checkpoint: {
    meta: 'Enterprise Security · UX Expert · 2014 — 2020 · TLV',
    title: 'Turning twenty management tabs into one coherent system at Check Point',
    image: '05-dashboard',
    g: ['#380a1e', '#be185d', '#f472b6'],
  },
}

const skillset = [
  { title: 'Product design', copy: 'The complex flows, dashboards, and decision surfaces security teams actually enjoy using.' },
  { title: 'Design systems', copy: 'Components and style guides, built from zero at Shift and Veriti, that engineers ship with.' },
  { title: '0 → 1 founding design', copy: 'Blank slate to shipped product, twice — the design function, onboarding, and core surfaces.' },
  { title: 'AI-native product builds', copy: 'AI as a build collaborator — Claude, Cursor, and Codex — taking design through to working code.' },
]

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" />
    </svg>
  )
}

export default function Home() {
  const works = getAllWorks()
  const essays = getAllCaseStudies()

  return (
    <main>
      {/* Hero — drifts at 0.3× scroll so the projects section slides over it */}
      <section className="relative overflow-hidden">
        <Parallax ratio={0.4} className="inner-col flex flex-col items-center gap-[22px] pb-32 pt-28 text-center">
          <Reveal as="p" className="eyebrow" delay={0.1}>
            Amit Kaplinsky · Product Designer
          </Reveal>
          <Reveal as="h1" className="max-w-[900px] font-heading text-hero font-medium tracking-[-0.02em]" delay={0.2}>
            Making complex security products<br className="hidden sm:block" /> clear enough to act on.
          </Reveal>
          <Reveal as="p" className="max-w-[600px] text-[18px] font-light leading-[1.55] text-muted-foreground" delay={0.3}>
            Twelve years designing security products and design systems — from enterprise management at Check Point to founding design at Shift.
          </Reveal>
          <Reveal delay={0.4}>
            <a href="mailto:amitka111@gmail.com" className="pill-cta roll-host px-[30px] py-3.5 text-[15px]">
              <RollingText text="Let's Talk" />
              <ArrowIcon />
            </a>
          </Reveal>
        </Parallax>
      </section>

      {/* Everything below the hero rides over it, so it needs its own opaque
          ground — and its own grid lines, which draw above that ground. */}
      <div className="grid-lines relative z-10 bg-background">
      {/* Projects header */}
      <section className="relative border-t border-border">
        <div className="inner-col flex flex-col items-center gap-2 pb-2 pt-14 text-center">
          <Reveal as="p" className="eyebrow">Projects</Reveal>
          <Reveal as="h2" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.08}>
            Recent work simplifying security products
          </Reveal>
        </div>
      </section>

      {/* Project cards — reverse timeline */}
      {works.map((work, index) => {
        const card = projectCards[work.slug]
        if (!card) return null
        const image = imageFor(work, card.image)
        return (
          <section key={work.slug} className={`relative ${index > 0 ? 'border-t border-border' : ''}`}>
            <div className="inner-col flex flex-col gap-[18px] pb-14 pt-10">
              <Reveal>
                <Link to={`/work/${work.slug}`} aria-label={`${work.company} case study`} className="block">
                  <div
                    className="backdrop h-[clamp(240px,40vw,580px)]"
                    style={{ '--g1': card.g[0], '--g2': card.g[1], '--g3': card.g[2] } as React.CSSProperties}
                  >
                    {image && (
                      <img
                        src={image.src}
                        alt={`${work.company} product interface`}
                        width={image.width}
                        height={image.height}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="backdrop-media"
                      />
                    )}
                  </div>
                </Link>
              </Reveal>
              <Reveal as="p" className="meta-line pt-1.5">{card.meta}</Reveal>
              <Reveal className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
                <h3 className="max-w-[720px] font-heading text-title-sm font-medium tracking-[-0.015em]">
                  {card.title}
                </h3>
                <Link to={`/work/${work.slug}`} className="pill-cta roll-host flex-none px-6 py-3 text-meta">
                  <RollingText text="Check Case Study" />
                  <ArrowIcon />
                </Link>
              </Reveal>
            </div>
          </section>
        )
      })}

      {/* Skillset */}
      <section className="relative border-t border-border">
        <div className="inner-col flex flex-col gap-10 py-14">
          <div className="flex flex-col items-center gap-2 text-center">
            <Reveal as="p" className="eyebrow">Skillset</Reveal>
            <Reveal as="h2" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.08}>
              End-to-end product and systems design
            </Reveal>
          </div>
          <Reveal className="grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
            {skillset.map((skill, i) => (
              <div
                key={skill.title}
                className={`flex flex-col gap-2 px-0 py-1 sm:px-7 ${i > 0 ? 'lg:border-l lg:border-border' : 'sm:pl-0'} ${i % 2 === 1 ? 'sm:border-l sm:border-border' : ''}`}
              >
                <h3 className="font-heading text-[16.5px] font-medium">{skill.title}</h3>
                <p className="text-meta leading-normal text-muted-foreground">{skill.copy}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Blog */}
      <section className="relative border-t border-border">
        <div className="inner-col flex flex-col gap-8 py-14">
          <div className="flex flex-col items-center gap-2 text-center">
            <Reveal as="p" className="eyebrow">Blog</Reveal>
            <Reveal as="h2" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.08}>
              Notes from the work
            </Reveal>
          </div>
          <Reveal className="grid gap-8 sm:grid-cols-3 sm:gap-5">
            {essays.map((essay) => {
              const company = (getWorkBySlug(essay.workSlug)?.company ?? 'Security').replace(/ Software$/, '')
              return (
                <Link key={essay.slug} to={`/case-studies/${essay.slug}`} className="group flex flex-col gap-3">
                  {essay.coverImage && (
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={essay.coverImage.src}
                        alt=""
                        width={essay.coverImage.width}
                        height={essay.coverImage.height}
                        loading="lazy"
                        className="block aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-[17px] font-medium transition-colors group-hover:text-accent">{essay.title}</h3>
                    <p className="text-caption uppercase tracking-[0.1em] text-muted-foreground">
                      {company}
                      {essay.featured ? ' · Featured' : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative border-t border-border">
        <div className="inner-col flex flex-col items-center gap-[18px] py-[88px] text-center">
          <Reveal as="p" className="eyebrow">Have an idea?</Reveal>
          <Reveal as="h2" className="max-w-[700px] font-heading text-feature font-medium tracking-[-0.015em]" delay={0.08}>
            Building a security product? Let's see if it's a fit.
          </Reveal>
          <Reveal delay={0.16}>
            <a href="mailto:amitka111@gmail.com" className="pill-cta roll-host px-[30px] py-3.5 text-[15px]">
              <RollingText text="Let's Talk" />
              <ArrowIcon />
            </a>
          </Reveal>
        </div>
      </section>
      </div>
    </main>
  )
}
