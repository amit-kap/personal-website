import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getCaseStudyBySlug, getWorkBySlug } from '@/lib/content'
import Reveal from '@/components/Reveal'
import Seo from '@/components/Seo'
import SkeletonImage from '@/components/SkeletonImage'
import { markdownComponents } from '@/components/caseStudy/markdownComponents'
import { ClosingActions } from '@/components/work/ClosingActions'

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined

  if (!caseStudy) {
    return (
      <main className="inner-col py-24">
        <p className="text-meta text-muted-foreground">Article not found.</p>
      </main>
    )
  }

  const work = getWorkBySlug(caseStudy.workSlug)
  const company = work?.company ?? 'Security'
  const meta = caseStudy.featured ? `${company}  ·  Featured` : company

  return (
    <main>
      <Seo
        title={caseStudy.title}
        description={caseStudy.excerpt}
        path={`/case-studies/${caseStudy.slug}`}
        type="article"
      />
      {/* Title block */}
      <section className="relative">
        <div className="inner-col flex flex-col items-center gap-4.5 pb-12 pt-16 text-center">
          <Reveal as="p" className="meta-line" delay={0.08}>{meta}</Reveal>
          <Reveal as="h1" className="max-w-[820px] font-heading text-feature font-medium" delay={0.16}>
            {caseStudy.title}
          </Reveal>
          {caseStudy.excerpt && (
            <Reveal as="p" className="max-w-[640px] text-title text-muted-foreground" delay={0.24}>
              {caseStudy.excerpt}
            </Reveal>
          )}
        </div>
      </section>

      {/* Cover */}
      {caseStudy.coverImage && (
        <section className="relative">
          <div className="inner-col pb-14">
            <Reveal>
              <div className="overflow-hidden rounded-lg border border-border">
                <SkeletonImage
                  src={caseStudy.coverImage.src}
                  alt={`${caseStudy.title} cover`}
                  width={caseStudy.coverImage.width}
                  height={caseStudy.coverImage.height}
                  loading="eager"
                  wrapperClassName="aspect-video w-full"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="relative border-t border-border">
        <div className="inner-col pb-16 pt-14">
          <article className="prose-col flex flex-col gap-5.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(caseStudy.bodyImages)}>
              {caseStudy.body}
            </ReactMarkdown>
          </article>
        </div>
      </section>

      {/* Back to the work page this article belongs to. */}
      <ClosingActions back={work ? { to: `/work/${work.slug}`, label: `Back to ${company.replace(/ Software$/, '')}` } : undefined} />
    </main>
  )
}
