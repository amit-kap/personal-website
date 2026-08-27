import { Link } from 'react-router-dom'
import { getAllCaseStudies, getWorkBySlug, type CaseStudy } from '@/lib/content'
import Reveal from '@/components/Reveal'
import RollingText from '@/components/RollingText'
import Seo from '@/components/Seo'

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" />
    </svg>
  )
}

function metaFor(study: CaseStudy): string {
  // Display name only — "Check Point Software" reads as "Check Point" on cards.
  const company = (getWorkBySlug(study.workSlug)?.company ?? 'Security').replace(/ Software$/, '')
  return study.featured ? `${company}  ·  Featured` : company
}

export default function Blog() {
  const studies = getAllCaseStudies()
  const featured = studies.find((study) => study.featured)
  const remaining = studies.filter((study) => !study.featured)

  return (
    <main>
      <Seo
        title="Blog"
        description="Notes from the work: designing for a supervisor, making tens of thousands of security indicators workable, and shipping a consumer app inside an enterprise."
        path="/blog"
      />
      {/* Title block */}
      <section className="relative">
        <div className="inner-col flex flex-col items-center gap-4 pb-14 pt-16 text-center">
          <Reveal as="p" className="eyebrow" delay={0.1}>Blog</Reveal>
          <Reveal as="h1" className="font-heading text-feature font-medium tracking-[-0.02em]" delay={0.18}>
            Notes from the work
          </Reveal>
        </div>
      </section>

      {/* Featured post — dominant, full-column cover */}
      {featured && (
        <section className="relative border-t border-border">
          <div className="inner-col flex flex-col gap-[18px] pb-14 pt-10">
            <Reveal>
              <Link to={`/case-studies/${featured.slug}`} className="group block overflow-hidden rounded-lg border border-border">
                {featured.coverImage && (
                  <img
                    src={featured.coverImage.src}
                    alt={`${featured.title} cover`}
                    width={featured.coverImage.width}
                    height={featured.coverImage.height}
                    className="block aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                )}
              </Link>
            </Reveal>
            <Reveal as="p" className="meta-line pt-1.5">{metaFor(featured)}</Reveal>
            <Reveal className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
              <div className="flex max-w-[720px] flex-col gap-2.5">
                <h2 className="font-heading text-section font-medium tracking-[-0.02em]">{featured.title}</h2>
                <p className="body-copy max-w-[640px]">{featured.excerpt}</p>
              </div>
              <Link to={`/case-studies/${featured.slug}`} className="pill-cta roll-host flex-none px-6 py-3 text-meta">
                <RollingText text="Read Article" />
                <ArrowIcon />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Secondary posts */}
      {remaining.length > 0 && (
        <section className="relative border-t border-border">
          <div className="inner-col grid gap-10 pb-16 pt-12 sm:grid-cols-2 sm:gap-14">
            {remaining.map((study) => (
              <Reveal key={study.slug} className="flex flex-col gap-3">
                <Link to={`/case-studies/${study.slug}`} className="group block overflow-hidden rounded-lg border border-border">
                  {study.coverImage && (
                    <img
                      src={study.coverImage.src}
                      alt={`${study.title} cover`}
                      width={study.coverImage.width}
                      height={study.coverImage.height}
                      loading="lazy"
                      className="block aspect-video w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  )}
                </Link>
                <p className="meta-line pt-1.5">{metaFor(study)}</p>
                <h2 className="font-heading text-[22px] font-medium leading-tight tracking-[-0.015em]">{study.title}</h2>
                <p className="body-copy text-[15px]">{study.excerpt}</p>
                <Link to={`/case-studies/${study.slug}`} className="text-link roll-host mt-1 self-start text-[14.5px]">
                  <RollingText text="Read Article" />
                  <ArrowIcon />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
