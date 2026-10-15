import type { Work } from '@/lib/content'
import { ClosingActions } from '@/components/work/ClosingActions'
import { HeroMedia } from '@/components/work/HeroMedia'
import { JobGrid } from '@/components/work/JobGrid'
import { SplitSection } from '@/components/work/SplitSection'
import { SurfacesGrid } from '@/components/work/SurfacesGrid'
import { TitleBlock } from '@/components/work/TitleBlock'
import { compactStories } from '@/components/work/compactStories'
import { imageFor } from '@/lib/workImages'

/* The shorter work-page template used by every work except Shift, which has
   its own page (ShiftWorkPage). Copy and image keys come from compactStories. */
export default function CompactWorkPage({ work }: { work: Work }) {
  const story = compactStories[work.slug]
  if (!story) return null

  return (
    <main>
      <TitleBlock meta={story.meta} title={story.title} intro={story.intro} />
      <HeroMedia image={imageFor(work, story.heroImage)} alt={story.heroAlt} />

      <SplitSection eyebrow="The Starting Point" stmt={story.startingPoint.stmt}>
        {story.startingPoint.paras.map((para) => (
          <p key={para.slice(0, 24)} className="body-copy">{para}</p>
        ))}
      </SplitSection>

      <JobGrid jobs={story.jobs} />

      {story.surfaces && (
        <SurfacesGrid
          heading={story.surfaces.heading}
          items={story.surfaces.items.map((item) => ({ ...item, image: imageFor(work, item.image) }))}
        />
      )}

      {story.related ? (
        <section className="relative">
          <div className="inner-col grid gap-10 py-14 sm:grid-cols-2 sm:gap-0">
            <div className="flex flex-col gap-3 sm:pr-12">
              <p className="eyebrow">Results</p>
              <h2 className="stmt">{story.results.stmt}</h2>
              {story.results.paras.map((para) => (
                <p key={para.slice(0, 24)} className="body-copy">{para}</p>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:pl-12">
              <p className="eyebrow">From the Work</p>
              <h2 className="stmt">{story.related.stmt}</h2>
              <p className="body-copy">{story.related.copy}</p>
            </div>
          </div>
        </section>
      ) : (
        <SplitSection eyebrow="Results" stmt={story.results.stmt}>
          {story.results.paras.map((para) => (
            <p key={para.slice(0, 24)} className="body-copy">{para}</p>
          ))}
        </SplitSection>
      )}

      <ClosingActions read={story.related && { to: story.related.to, label: story.related.label }} />
    </main>
  )
}
