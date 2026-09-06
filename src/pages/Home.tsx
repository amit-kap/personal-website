import { Link } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks, getWorkBySlug } from '@/lib/content'
import homeCopy from '@/content/home.json'
import { imageFor } from '@/lib/workImages'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import Seo from '@/components/Seo'
import RollingText from '@/components/RollingText'

/* Per-project presentation: plain-caps meta line, outcome title, and the
   dark→luminous gradient behind the product media. Copy is the approved
   Story-Cards art direction; facts come from cv.md / work.md. */
const projectCards: Record<string, { meta: string; title: string; image: string; g: [string, string, string] }> = {
  shift: {
    meta: 'Third-Party Risk · Founding Designer · 2024–Now · TLV',
    title: "Designing Shift's agent-led third-party security platform from product model to shipped system",
    image: '01-shift-dashboard',
    g: ['#191040', '#4630b8', '#8a76f0'],
  },
  'onyxia-cyber': {
    meta: 'CISO Data · Product Design Team Lead · 2024 · TLV',
    title: 'Turning CISO goals into owners, tasks, and measurable follow-through at Onyxia',
    image: '01-SSM-1',
    g: ['#0c1f4a', '#1d4ed8', '#60a5fa'],
  },
  veriti: {
    meta: 'Security Controls · Founding Designer · 2021–2024 · TLV',
    title: 'Turning a known exposure into an explained, approved security change at Veriti',
    image: '02',
    g: ['#06302b', '#0f766e', '#2dd4bf'],
  },
  semperis: {
    meta: 'Identity Security · UX Team Lead · 2020–2021 · TLV',
    title: "Building the product language for Semperis's move from recovery to prevention",
    image: '01-semperis',
    g: ['#37200a', '#b45309', '#fbbf24'],
  },
  checkpoint: {
    meta: 'Enterprise Security · UX Expert · 2014–2020 · TLV',
    title: 'Reworking twenty management tabs into one enterprise security system at Check Point',
    image: '05-dashboard',
    g: ['#380a1e', '#be185d', '#f472b6'],
  },
}

const skillset = [
  { title: 'Product direction', copy: 'Frame the problem, define the operating model, align the team, and turn product bets into testable slices.' },
  { title: 'Complex product design', copy: 'Workflows and decision surfaces for teams dealing with risk, uncertainty, and high-volume data.' },
  { title: 'Systems and delivery', copy: 'Design systems, component behavior, and close engineering collaboration from prototype to shipped product.' },
  { title: 'AI products and prototyping', copy: 'Design human-agent workflows, then use Claude Code, Cursor, and Codex to test them in working software.' },
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
      <Seo
        title="Amit Kaplinsky | Product Designer"
        description="Product designer with twelve years in cybersecurity, working across product direction, interaction design, systems, and AI-assisted builds."
        path="/"
      />
      {/* Hero drifts at 0.3× scroll so the projects section slides over it. */}
      <section className="relative overflow-hidden">
        <Parallax ratio={0.4} className="inner-col flex flex-col items-center gap-[22px] pb-32 pt-28 text-center">
          <Reveal as="p" className="eyebrow" delay={0.1}>
            Amit Kaplinsky · Product Designer
          </Reveal>
          <Reveal as="h1" className="font-heading text-hero font-medium tracking-[-0.02em]" delay={0.2}>
            {homeCopy.headlineLines.map((line, index) => (
              <span key={line}>
                {index > 0 && <br className="hidden sm:block" />}
                {line}
              </span>
            ))}
          </Reveal>
          <Reveal as="p" className="max-w-[600px] text-[18px] font-light leading-[1.55] text-muted-foreground" delay={0.3}>
            {homeCopy.supportingCopy}
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
          ground and grid lines drawn above that ground. */}
      <div className="grid-lines relative z-10 bg-background">
      {/* Projects header */}
      <section className="relative border-t border-border">
        <div className="inner-col flex flex-col items-center gap-2 pb-2 pt-14 text-center">
          <Reveal as="p" className="eyebrow">Projects</Reveal>
          <Reveal as="h2" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.08}>
            Security products from strategy to shipped systems
          </Reveal>
        </div>
      </section>

      {/* Project cards in reverse timeline order. */}
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
                  <RollingText text="View Case Study" />
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
              Product direction, design, and delivery
            </Reveal>
          </div>
          <Reveal className="grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
            {skillset.map((skill, i) => (
              <div
                key={skill.title}
                className={`group flex flex-col gap-2 px-0 py-1 sm:px-7 ${i > 0 ? 'lg:border-l lg:border-border' : ''} ${i % 2 === 1 ? 'sm:border-l sm:border-border' : ''}`}
              >
                <h3 className="font-heading text-[16.5px] font-medium transition-colors group-hover:text-accent">{skill.title}</h3>
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
          <Reveal as="p" className="eyebrow availability-shimmer">Open to fractional roles / select projects</Reveal>
          <Reveal as="h2" className="max-w-[700px] font-heading text-feature font-medium tracking-[-0.015em]" delay={0.08}>
            Building a security product?<br className="hidden sm:block" /> Let's see if it's a fit.
          </Reveal>
          <Reveal delay={0.16}>
            <a href="mailto:amitka111@gmail.com?subject=Fractional%20or%20freelance%20project" className="pill-cta availability-cta roll-host px-[30px] py-3.5 text-[15px]">
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
